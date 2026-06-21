/**
 * zonas.ts — Constantes de ubicación para el evento CAPI.
 *
 * Decisión 2026-06-21: NO se mantiene una tabla colonia→CP. El reparto es solo en el área
 * metropolitana de Monterrey, así que:
 *   - El `estado` es fijo (siempre Nuevo León) → se envía como `st` en TODOS los eventos.
 *   - El `cp` se captura DIRECTO en el formulario (campo opcional) → se envía como `zp` cuando viene.
 *   - La `colonia` se guarda como texto libre en la bitácora (Meta no tiene parámetro de "colonia",
 *     así que nunca se hashea ni se envía).
 *   - La ciudad/municipio NO se captura: mejor omitir `ct` que mandar uno equivocado.
 */

/** Estado de toda la zona de reparto. Se envía como `st` (hasheado) en todos los eventos. */
export const ESTADO_DEFAULT = 'Nuevo León';
