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
 *
 * El mismo listener aprovecha para incrustar el click id de Google en el texto prellenado del
 * enlace (ver click-id.ts). Los 3 puntos programáticos lo hacen por su cuenta, porque construyen
 * el mensaje en JavaScript y nunca pasan por un <a>.
 */

import { appendRefToWaHref, captureClickIdFromURL, loadClickId } from './click-id';

/** Los 7 enlaces estáticos. El selector va contra el href real, no contra una clase. */
const WA_LINK_SELECTOR = 'a[href^="https://wa.me/"]';

/**
 * Monta el listener delegado. Se engancha en `document` en fase de captura para que dispare
 * aunque algún componente detenga la propagación del clic más abajo.
 *
 * El href se reescribe dentro del propio listener, no al cargar la página: así toma el click id
 * más reciente y funciona igual con los enlaces que se renderizan después (drawer móvil, modales).
 * Modificar el href durante la propagación es seguro — el navegador resuelve la acción por defecto
 * cuando la propagación termina, así que navega ya con el valor nuevo.
 */
export function initWaTracking(): void {
  captureClickIdFromURL();

  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as Element | null;
      const link = target?.closest?.(WA_LINK_SELECTOR) as HTMLAnchorElement | null;
      if (!link) return;

      link.href = appendRefToWaHref(link.href, loadClickId());
      window.temakyConv?.();
    },
    true,
  );
}
