/**
 * click-id.ts — captura el identificador de clic de Google y lo hace viajar hasta la bitácora.
 *
 * POR QUÉ EXISTE
 * El cliente de Temaky hace clic en un anuncio, aterriza en el sitio, toca "pedir por WhatsApp" y
 * se va al chat. Nunca deja su teléfono ni su correo aquí, así que las Conversiones Mejoradas de
 * Google (que hacen match contra datos capturados en el sitio) no tienen contra qué emparejar.
 *
 * El mecanismo que sí cierra el ciclo es el del proyecto google/wci: meter el click id DENTRO del
 * texto prellenado del mensaje. El cliente lo manda sin darse cuenta, Mafer lo ve en el chat días
 * después, lo copia al formulario de /registro-de-compras y de ahí sale el archivo de carga de
 * conversiones offline. Resuelve el problema real: quién registra la venta no es quien hizo clic,
 * y entre una cosa y otra pasan días.
 *
 * Ventana de 90 días porque esa es la de importación offline de Google — contra los 7 días de la
 * CAPI de Meta, que rechaza de plano todo evento más viejo (capi.ts:107-113).
 *
 * Google exige EXACTAMENTE UNO de los tres identificadores por fila del archivo de carga, y cada
 * uno va en su propia columna del CSV. Por eso se guarda el tipo junto al valor.
 */

export type ClickIdType = 'gclid' | 'gbraid' | 'wbraid';

export interface ClickId {
  type: ClickIdType;
  value: string;
}

/** Ventana de importación de conversiones offline de Google Ads. */
export const CLICK_ID_TTL_DAYS = 90;

const STORAGE_KEY = 'temaky-click-id';

/** Orden de preferencia. gclid gana si por error llegan varios: solo uno puede ir por fila. */
const TIPOS: ClickIdType[] = ['gclid', 'gbraid', 'wbraid'];

/** Alfabeto de los identificadores de Google: base64url. Cualquier otra cosa es ruido o inyección. */
const VALOR_VALIDO = /^[A-Za-z0-9_-]{1,512}$/;

const UN_DIA_MS = 24 * 60 * 60 * 1000;

/** Extrae el click id del query string. Devuelve null en tráfico orgánico. */
export function parseClickId(search: string): ClickId | null {
  const params = new URLSearchParams(search);
  for (const type of TIPOS) {
    const value = (params.get(type) ?? '').trim();
    if (value && VALOR_VALIDO.test(value)) return { type, value };
  }
  return null;
}

/** El texto que se incrusta en el mensaje. Lleva el tipo porque el CSV lo necesita. */
export function formatRef(click: ClickId | null): string {
  return click ? `[ref: ${click.type}:${click.value}]` : '';
}

/**
 * Anexa el ref al final del mensaje prellenado.
 *
 * Sin click id devuelve el texto intacto: el tráfico orgánico NO se marca. Marcarlo metería una
 * línea rara en el chat de la mayoría de los clientes a cambio de nada — las filas sin click id
 * no se pueden subir a Google de todos modos, así que la ausencia del ref ya es la señal.
 */
export function appendRef(text: string, click: ClickId | null): string {
  const ref = formatRef(click);
  if (!ref || text.includes(ref)) return text;
  return `${text}\n\n${ref}`;
}

/**
 * Misma idea, pero sobre el href de los enlaces estáticos wa.me, que traen el texto ya codificado
 * en el parámetro `text` y se renderizan en tiempo de build.
 */
export function appendRefToWaHref(href: string, click: ClickId | null): string {
  const ref = formatRef(click);
  if (!ref) return href;

  try {
    const url = new URL(href);
    const actual = url.searchParams.get('text') ?? '';
    if (actual.includes(ref)) return href;
    url.searchParams.set('text', actual ? `${actual}\n\n${ref}` : ref);
    /* URLSearchParams codifica el espacio como '+', que WhatsApp muestra literal. */
    return url.toString().replace(/\+/g, '%20');
  } catch {
    return href;
  }
}

/** Guarda el click id con sello de tiempo. Silencioso si localStorage no está disponible. */
export function saveClickId(click: ClickId, now: number = Date.now()): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...click, ts: now }));
  } catch {
    /* modo privado o storage lleno: se pierde la atribución, no la venta */
  }
}

/** Recupera el click id vigente. null si no hay, si caducó o si el contenido no es confiable. */
export function loadClickId(now: number = Date.now()): ClickId | null {
  try {
    const crudo = localStorage.getItem(STORAGE_KEY);
    if (!crudo) return null;

    const dato = JSON.parse(crudo) as Partial<ClickId> & { ts?: number };
    if (!dato || typeof dato.value !== 'string' || typeof dato.ts !== 'number') return null;
    if (!TIPOS.includes(dato.type as ClickIdType)) return null;
    if (!VALOR_VALIDO.test(dato.value)) return null;
    if (now - dato.ts > CLICK_ID_TTL_DAYS * UN_DIA_MS) return null;

    return { type: dato.type as ClickIdType, value: dato.value };
  } catch {
    return null;
  }
}

/** Lee el click id de la URL actual y lo persiste. Se llama una vez al cargar cada página. */
export function captureClickIdFromURL(search: string = location.search): ClickId | null {
  const click = parseClickId(search);
  if (click) saveClickId(click);
  return click ?? loadClickId();
}
