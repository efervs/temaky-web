/**
 * wa-tracking.ts — instrumenta los puntos de salida a WhatsApp para Google Ads.
 *
 * De los 10 puntos de salida del sitio, 7 son enlaces estáticos <a href="https://wa.me/...">
 * repartidos en 6 componentes (Navbar ×2, Hero, WhatsAppFab, LocationSection, Footer y los 3 del
 * aviso de privacidad). Un solo listener delegado los cubre a todos sin editar ninguno.
 *
 * Los otros 3 son salidas programáticas por window.open() y llaman a window.temakyConv() desde su
 * propio código, porque nunca pasan por un <a>: checkout del carrito (cart-logic.ts), "dejar mi
 * pedido para mañana" (OffHoursModal.astro) y submit de reservación (ReservationForm.astro).
 *
 * El helper temakyConv() vive en el <script is:inline> del <head> de BaseLayout.astro, que es
 * donde carga gtag. Aquí solo se consume: si el tag no cargó o todavía no hay etiqueta de
 * conversión, es un no-op silencioso y el clic sigue su camino igual.
 */

/** Los 7 enlaces estáticos. El selector va contra el href real, no contra una clase. */
const WA_LINK_SELECTOR = 'a[href^="https://wa.me/"]';

/**
 * Monta el listener delegado. Se engancha en `document` en fase de captura para que dispare
 * aunque algún componente detenga la propagación del clic más abajo.
 */
export function initWaTracking(): void {
  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as Element | null;
      const link = target?.closest?.(WA_LINK_SELECTOR);
      if (!link) return;

      window.temakyConv?.();
    },
    true,
  );
}
