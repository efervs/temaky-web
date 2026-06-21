/**
 * functions/api/registro.ts — Cloudflare Pages Function. Reemplaza a Zapier.
 *
 * Recibe un POST del formulario /registro-de-compras, valida el PIN, normaliza y hashea los datos
 * del cliente, registra la venta en D1 (bitácora + idempotencia) y envía el evento Purchase a la
 * Conversions API (CAPI) de Meta con action_source = physical_store.
 *
 * El Access Token de Meta vive SOLO aquí (variable de entorno cifrada). La página es estática y
 * nunca lo ve.
 */

import {
  buildEventId,
  buildUserData,
  digitsOnly,
  eventTimeFromLocal,
  isWithinCapiWindow,
} from '../../src/lib/capi';
import { ESTADO_DEFAULT } from '../../src/lib/zonas';

/* ── Tipos mínimos del runtime (evitan depender de @cloudflare/workers-types en build) ── */
interface D1Result {
  success: boolean;
  meta?: { changes?: number };
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<D1Result>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}
interface Env {
  DB: D1Database;
  META_DATASET_ID: string;
  META_CAPI_TOKEN: string;
  META_GRAPH_VERSION?: string;
  META_TEST_EVENT_CODE?: string;
  REGISTRO_PIN: string;
}
interface PagesContext {
  request: Request;
  env: Env;
}

const CANALES = new Set(['domicilio', 'recoge', 'comedor']);

interface RegistroBody {
  fechaHora?: string; // datetime-local "YYYY-MM-DDTHH:mm"
  nombre?: string;
  whatsapp?: string;
  colonia?: string;
  cp?: string;
  calle?: string;
  monto?: string | number;
  canal?: string;
  comoLlego?: string;
  correo?: string;
  notas?: string;
  folio?: string;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

/** Comparación de tiempo constante para el PIN (evita timing attacks). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  // 1) Auth por PIN
  const pin = request.headers.get('x-registro-pin') ?? '';
  if (!env.REGISTRO_PIN || !safeEqual(pin, env.REGISTRO_PIN)) {
    return json({ ok: false, error: 'PIN incorrecto.' }, 401);
  }

  // 2) Parseo + validación
  let body: RegistroBody;
  try {
    body = (await request.json()) as RegistroBody;
  } catch {
    return json({ ok: false, error: 'Cuerpo inválido.' }, 400);
  }

  const nombre = (body.nombre ?? '').trim();
  const telefono10 = digitsOnly(body.whatsapp ?? '').slice(-10);
  const colonia = (body.colonia ?? '').trim();
  const cp = digitsOnly(body.cp ?? '').slice(0, 5);
  const canal = (body.canal ?? '').trim().toLowerCase();
  const calle = (body.calle ?? '').trim();
  const correo = (body.correo ?? '').trim();
  const notas = (body.notas ?? '').trim();
  const folio = (body.folio ?? '').trim();
  const comoLlego = (body.comoLlego ?? '').trim();
  const value = Number(String(body.monto ?? '').replace(/[^0-9.]/g, ''));

  const errores: string[] = [];
  if (nombre.length < 2) errores.push('nombre');
  if (telefono10.length !== 10) errores.push('whatsapp');
  if (!CANALES.has(canal)) errores.push('canal');
  if (!(value > 0)) errores.push('monto');
  if (canal === 'domicilio' && !calle) errores.push('calle');

  const eventTime = eventTimeFromLocal(body.fechaHora ?? '');
  if (eventTime === null) errores.push('fechaHora');

  if (errores.length) {
    return json({ ok: false, error: 'Campos inválidos.', campos: errores }, 422);
  }

  const nowUnix = Math.floor(Date.now() / 1000);
  const phoneE164 = `52${telefono10}`;
  const eventId = buildEventId({ eventTimeUnix: eventTime!, phoneE164, value, orderId: folio });
  const createdAt = new Date().toISOString();
  const enviadoPor = request.headers.get('CF-Connecting-IP') ?? 'desconocido';

  // 3) D1 primero — no perdemos la venta aunque Meta falle. ON CONFLICT = idempotencia.
  try {
    const insert = await env.DB.prepare(
      `INSERT INTO ventas
         (event_id, created_at, event_time, nombre, telefono, colonia, calle,
          ciudad, estado, cp, canal, como_llego, correo, value, order_id, notas, status, enviado_por)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(event_id) DO NOTHING`,
    )
      .bind(
        eventId, createdAt, eventTime, nombre, phoneE164, colonia || null, calle || null,
        null, ESTADO_DEFAULT, cp || null, canal, comoLlego || null,
        correo || null, value, folio || null, notas || null, 'pending', enviadoPor,
      )
      .run();

    if (insert.meta?.changes === 0) {
      return json({ ok: true, duplicate: true, event_id: eventId, message: 'Esta venta ya estaba registrada.' });
    }
  } catch (e) {
    return json({ ok: false, error: 'No se pudo guardar el registro.', detail: String(e) }, 500);
  }

  // 4) ¿Dentro de la ventana de 7 días de CAPI?
  if (!isWithinCapiWindow(eventTime!, nowUnix)) {
    await updateStatus(env, eventId, 'error', 'fuera_de_ventana_7_dias');
    return json(
      {
        ok: false,
        saved: true,
        event_id: eventId,
        error: 'La fecha es de hace más de 7 días: se guardó en la bitácora pero Meta no la acepta.',
      },
      422,
    );
  }

  // 5) Construir y enviar el evento a Meta
  const userData = await buildUserData({
    email: correo,
    phone: phoneE164,
    name: nombre,
    state: ESTADO_DEFAULT,
    zip: cp,
    country: 'MX',
  });

  const event = {
    event_name: 'Purchase',
    event_time: eventTime,
    event_id: eventId,
    action_source: 'physical_store',
    user_data: userData,
    custom_data: {
      currency: 'MXN',
      value,
      ...(folio ? { order_id: folio } : {}),
    },
  };

  const payload: Record<string, unknown> = { data: [event] };
  if (env.META_TEST_EVENT_CODE) payload.test_event_code = env.META_TEST_EVENT_CODE;

  const ver = env.META_GRAPH_VERSION || 'v21.0';
  const graphUrl = `https://graph.facebook.com/${ver}/${env.META_DATASET_ID}/events?access_token=${encodeURIComponent(
    env.META_CAPI_TOKEN,
  )}`;

  try {
    const res = await fetch(graphUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const respText = (await res.text()).slice(0, 1000);

    if (!res.ok) {
      await updateStatus(env, eventId, 'error', respText);
      return json({ ok: false, saved: true, event_id: eventId, error: 'Meta rechazó el evento.', detail: respText }, 502);
    }

    await updateStatus(env, eventId, 'sent', respText);
    return json({ ok: true, event_id: eventId, message: 'Venta registrada y enviada a Meta.' });
  } catch (e) {
    await updateStatus(env, eventId, 'error', String(e));
    return json({ ok: false, saved: true, event_id: eventId, error: 'No se pudo contactar a Meta. Quedó guardada para reintento.' }, 502);
  }
}

async function updateStatus(env: Env, eventId: string, status: string, metaResponse: string): Promise<void> {
  try {
    await env.DB.prepare('UPDATE ventas SET status = ?, meta_response = ? WHERE event_id = ?')
      .bind(status, metaResponse, eventId)
      .run();
  } catch {
    /* no romper la respuesta al usuario por un fallo de actualización de estado */
  }
}
