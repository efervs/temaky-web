/**
 * global.d.ts — declaraciones de lo que el Google tag deja colgado en `window`.
 *
 * Sin esto, `window.temakyConv?.()` en cart-logic.ts no compila (tsconfig extiende
 * astro/tsconfigs/strict). Es el único punto del diff de medición que puede romper el build,
 * y lo caza `npx astro check`.
 *
 * Quién define cada cosa: el <script is:inline> del <head> de BaseLayout.astro.
 */

interface TemakyAwConfig {
  /** ID de la etiqueta de Google. Cuenta 118-217-4303. */
  id: string;
  /** Etiqueta de la acción de conversión "Clic a WhatsApp". Vacía = la conversión no dispara. */
  label: string;
}

interface Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  TEMAKY_AW?: TemakyAwConfig;
  /** Dispara la conversión de clic a WhatsApp. No-op si falta el tag o la etiqueta. */
  temakyConv?: (params?: Record<string, unknown>) => void;
}
