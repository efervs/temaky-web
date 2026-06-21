/**
 * capi.ts — Helpers puros para enviar eventos Purchase a la Conversions API (CAPI) de Meta.
 *
 * Toda la lógica de normalización es síncrona y testeable sin red. El hashing usa Web Crypto
 * (`crypto.subtle`), disponible tanto en el runtime de Cloudflare Workers como en Node 20+ (vitest).
 *
 * Reglas de normalización: https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 * Antes de hashear, cada campo se normaliza (minúsculas, sin puntuación, etc.); los campos vacíos
 * se OMITEN (nunca se manda el hash de una cadena vacía, eso baja el Event Match Quality).
 */

/** Código de país por defecto (México). */
export const DEFAULT_COUNTRY_CODE = '52';

/** Quita todo lo que no sea dígito. */
export function digitsOnly(value: string): string {
  return (value ?? '').replace(/\D/g, '');
}

/** Quita acentos/diacríticos manteniendo la letra base (García → garcia). */
export function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

/**
 * Teléfono → E.164 sin `+`. Toma los últimos 10 dígitos y antepone el código de país.
 * "81 2747 4440" → "528127474440". Si ya trae 52 al inicio, no se duplica.
 */
export function toE164(tel: string, countryCode = DEFAULT_COUNTRY_CODE): string {
  const last10 = digitsOnly(tel).slice(-10);
  return `${countryCode}${last10}`;
}

/**
 * Variantes del teléfono para maximizar la coincidencia en Meta (específico de México).
 * Muchos perfiles de Facebook/WhatsApp guardan el móvil con el "1" histórico (52 1 + 10 dígitos)
 * y otros sin él (52 + 10 dígitos). Mandamos AMBAS en `ph` para empatar aunque Meta lo tenga
 * con o sin el "1". El primer elemento es el E.164 estándar (52 + 10). Devuelve [] si no hay 10 dígitos.
 */
export function phoneVariants(tel: string, countryCode = DEFAULT_COUNTRY_CODE): string[] {
  const last10 = digitsOnly(tel).slice(-10);
  if (last10.length !== 10) return [];
  return [`${countryCode}${last10}`, `${countryCode}1${last10}`];
}

/** Divide un nombre completo en { fn, ln }. Si no hay apellido, `ln` queda undefined. */
export function splitName(full: string): { fn: string; ln?: string } {
  const parts = (full ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { fn: '' };
  const [fn, ...rest] = parts;
  return rest.length ? { fn, ln: rest.join(' ') } : { fn };
}

/* ── Normalización por campo (lo que se hashea) ── */

export function normalizeEmail(value: string): string {
  return (value ?? '').trim().toLowerCase();
}

/** Nombre/apellido: minúsculas, sin puntuación, conserva letras acentuadas en UTF-8. */
export function normalizeName(value: string): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Ciudad: minúsculas, sin acentos, solo a-z0-9 (sin espacios ni puntuación). */
export function normalizeCity(value: string): string {
  return stripDiacritics((value ?? '').toLowerCase()).replace(/[^a-z0-9]/g, '');
}

/** Estado (fuera de US): minúsculas, sin acentos, sin espacios ni puntuación. Nuevo León → nuevoleon. */
export function normalizeState(value: string): string {
  return stripDiacritics((value ?? '').toLowerCase()).replace(/[^a-z0-9]/g, '');
}

/** CP: primeros 5 dígitos. */
export function normalizeZip(value: string): string {
  return digitsOnly(value).slice(0, 5);
}

/** País: ISO-2 en minúsculas. */
export function normalizeCountry(value: string): string {
  return (value ?? '').trim().toLowerCase().slice(0, 2);
}

/* ── event_time ── */

/**
 * Convierte un valor `datetime-local` ("2026-06-19T14:30") interpretado como hora de Monterrey
 * (UTC−6 fijo, sin horario de verano desde 2022) a Unix epoch en segundos.
 *
 * La hora local va 6 h por detrás de UTC, así que el epoch real = (componentes como UTC) + 6 h.
 */
export function eventTimeFromLocal(localDateTime: string, offsetHours = -6): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(localDateTime ?? '');
  if (!m) return null;
  const [, y, mo, d, hh, mm] = m.map(Number) as unknown as number[];
  const asUtcMs = Date.UTC(y, mo - 1, d, hh, mm);
  if (Number.isNaN(asUtcMs)) return null;
  return Math.round(asUtcMs / 1000) - offsetHours * 3600;
}

/** Ventana de CAPI: el evento no puede ser futuro ni tener más de 7 días. */
export function isWithinCapiWindow(eventTimeUnix: number, nowUnix: number): boolean {
  const SEVEN_DAYS = 7 * 24 * 3600;
  if (eventTimeUnix > nowUnix + 300) return false; // 5 min de tolerancia hacia el futuro
  if (eventTimeUnix < nowUnix - SEVEN_DAYS) return false;
  return true;
}

/* ── event_id (deduplicación) ── */

export interface EventIdParts {
  eventTimeUnix: number;
  phoneE164: string;
  value: number;
  orderId?: string;
}

/** event_id determinístico: TMK-{unix}-{últimos4tel}-{value}[-{orderId}]. */
export function buildEventId({ eventTimeUnix, phoneE164, value, orderId }: EventIdParts): string {
  const last4 = phoneE164.slice(-4);
  const base = `TMK-${eventTimeUnix}-${last4}-${Math.round(value)}`;
  const folio = (orderId ?? '').trim();
  return folio ? `${base}-${folio.replace(/\s+/g, '')}` : base;
}

/* ── Hashing ── */

/** SHA-256 → hex en minúsculas (Web Crypto). */
export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/* ── user_data ── */

export interface RawUserData {
  email?: string;
  phone: string; // requerido
  name: string; // requerido (se divide en fn/ln)
  city?: string;
  state?: string;
  zip?: string;
  country?: string; // ISO-2; por defecto MX
}

/** Mapa user_data de CAPI: cada valor es un array de un hash. Solo incluye campos con dato. */
export type HashedUserData = Partial<
  Record<'em' | 'ph' | 'fn' | 'ln' | 'ct' | 'st' | 'zp' | 'country' | 'external_id', string[]>
>;

/**
 * Construye el objeto `user_data` hasheado para CAPI a partir de datos en crudo.
 * Normaliza, hashea y OMITE cualquier campo cuyo valor normalizado quede vacío.
 */
export async function buildUserData(raw: RawUserData): Promise<HashedUserData> {
  const out: HashedUserData = {};
  const add = async (key: keyof HashedUserData, normalized: string) => {
    if (normalized) out[key] = [await sha256Hex(normalized)];
  };

  const phoneE164 = toE164(raw.phone);
  const { fn, ln } = splitName(raw.name);

  await add('em', normalizeEmail(raw.email ?? ''));
  // `ph` en ambos formatos MX (52+10 y 52 1+10) para empatar el número aunque Meta lo tenga con/sin el "1".
  const phHashes = await Promise.all(phoneVariants(raw.phone).map((p) => sha256Hex(p)));
  if (phHashes.length) out.ph = phHashes;
  await add('fn', normalizeName(fn));
  if (ln) await add('ln', normalizeName(ln));
  await add('ct', normalizeCity(raw.city ?? ''));
  await add('st', normalizeState(raw.state ?? ''));
  await add('zp', normalizeZip(raw.zip ?? ''));
  await add('country', normalizeCountry(raw.country ?? 'MX'));
  await add('external_id', phoneE164); // une clientes recurrentes

  return out;
}
