/**
 * Deep-link del menú.
 *
 * El overlay del menú vive dentro del index (no es una ruta propia). Para poder
 * compartir un enlace que lo abra solo —en bio de Instagram, anuncios, QR o
 * WhatsApp— detectamos una "señal" en la URL y, si está presente, abrimos el
 * overlay al cargar.
 *
 * Señales aceptadas (cualquiera sirve, por robustez ante lo que se comparta):
 *   - /?menu   ← destino del redirect /menu (ver public/_redirects)
 *   - /#menu   ← variante con hash
 *
 * La URL canónica para compartir es https://temakysushi.mx/menu
 */

const MENU_PARAM = 'menu';
const MENU_HASH = 'menu';

/** ¿La URL pide abrir el menú automáticamente al cargar? */
export function shouldAutoOpenMenuFromURL(search: string, hash: string): boolean {
  const params = new URLSearchParams(search);
  if (params.has(MENU_PARAM)) return true;
  return normalizeHash(hash) === MENU_HASH;
}

/**
 * URL que refleja "menú abierto": fija el hash #menu y elimina el parámetro
 * `menu` (ya redundante), preservando cualquier otro query param —p. ej. los
 * UTMs de campañas de Meta Ads.
 */
export function urlWithMenuOpen(pathname: string, search: string): string {
  return pathname + cleanSearch(search) + '#' + MENU_HASH;
}

/**
 * URL que refleja "menú cerrado": quita el hash #menu y el parámetro `menu`,
 * preservando el resto del query string.
 */
export function urlWithMenuClosed(pathname: string, search: string): string {
  return pathname + cleanSearch(search);
}

/** Devuelve el query string sin el parámetro `menu` (con el `?` si queda algo). */
function cleanSearch(search: string): string {
  const params = new URLSearchParams(search);
  params.delete(MENU_PARAM);
  const qs = params.toString();
  return qs ? '?' + qs : '';
}

function normalizeHash(hash: string): string {
  return hash.replace(/^#/, '').toLowerCase();
}
