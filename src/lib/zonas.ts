/**
 * zonas.ts — Tabla colonia → { municipio, estado, cp } para enriquecer ct/st/zp del evento CAPI.
 *
 * ⚠️ EFER / MAFER: COMPLETAR Y VERIFICAR esta tabla con las colonias REALES del reparto (~4 km).
 *    - El `estado` casi siempre es "Nuevo León".
 *    - El `municipio` varía (Monterrey, San Pedro Garza García, San Nicolás, Guadalupe…).
 *    - El `cp` debe ser el código postal REAL de la colonia. Si no estás seguro, déjalo en ""
 *      (vacío) — es mejor omitir el CP que mandar uno incorrecto (un CP malo NO mejora el match).
 *
 * Las claves del objeto son los nombres que se muestran en el desplegable del formulario.
 * Si la colonia capturada no está en la tabla, se usa ZONA_FALLBACK (Monterrey / Nuevo León / "").
 */

export interface Zona {
  municipio: string;
  estado: string;
  cp: string;
}

export const ESTADO_DEFAULT = 'Nuevo León';

/** Fallback cuando la colonia no está en la tabla: CP vacío → se omite `zp` en el evento. */
export const ZONA_FALLBACK: Zona = { municipio: 'Monterrey', estado: ESTADO_DEFAULT, cp: '' };

/**
 * Semilla de ejemplo (VERIFICAR los CP antes de producción). Reemplazar/ampliar con la lista real.
 * Formato: 'Nombre Colonia': { municipio, estado, cp }.
 */
export const ZONAS: Record<string, Zona> = {
  'Obispado': { municipio: 'Monterrey', estado: ESTADO_DEFAULT, cp: '64060' },
  'Nuevo Obispado': { municipio: 'Monterrey', estado: ESTADO_DEFAULT, cp: '64040' },
  'Tecnológico': { municipio: 'Monterrey', estado: ESTADO_DEFAULT, cp: '64700' },
  'Mitras Centro': { municipio: 'Monterrey', estado: ESTADO_DEFAULT, cp: '64460' },
  'Chepevera': { municipio: 'Monterrey', estado: ESTADO_DEFAULT, cp: '64030' },
  'Centro': { municipio: 'Monterrey', estado: ESTADO_DEFAULT, cp: '64000' },
  'Del Valle': { municipio: 'San Pedro Garza García', estado: ESTADO_DEFAULT, cp: '66220' },
  'Contry': { municipio: 'Monterrey', estado: ESTADO_DEFAULT, cp: '64860' },
};

/** Normaliza una clave para comparar (trim + minúsculas). */
function keyOf(colonia: string): string {
  return (colonia ?? '').trim().toLowerCase();
}

const ZONAS_INDEX: Map<string, Zona> = new Map(
  Object.entries(ZONAS).map(([nombre, zona]) => [keyOf(nombre), zona]),
);

/** Devuelve la zona de una colonia (case-insensitive) o el fallback si no existe. */
export function lookupZona(colonia: string): Zona {
  return ZONAS_INDEX.get(keyOf(colonia)) ?? ZONA_FALLBACK;
}

/** Lista de colonias para poblar el desplegable, ordenada alfabéticamente. */
export function listColonias(): string[] {
  return Object.keys(ZONAS).sort((a, b) => a.localeCompare(b, 'es'));
}
