/**
 * «¿Es la primera vez que pide el cliente?» (D26, 2026-10-28) → columna `primera_vez`.
 *
 * Devuelve "si" | "no", o null si no llegó o no se entiende. El servidor no rechaza una venta
 * por esto: una pestaña vieja abierta en la tablet no manda el campo y la venta se guarda igual.
 */
export function normalizaPrimeraVez(raw: unknown): 'si' | 'no' | null {
  const t = String(raw ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (t === 'si' || t === 'no') return t;
  return null;
}
