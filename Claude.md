# CLAUDE.md — Contexto de Marca: Temaky Sushi

## Quién es Temaky Sushi

Restaurante japonés en Monterrey, México, fundado en 1999.
Especialidad: sushi fresco, rollos creativos, combo clásico.
Una sola sucursal: Plaza Villa Obispado, Francisco Garza Sada #2940.
Reconocida como uno de los mejores sushis de Monterrey durante 25+ años.

## Oferta Principal (El Gancho de Ventas)

**Combo Clásico: Rollo + ½ Arroz por $139 MXN**
Esta es la propuesta de valor central. Debe aparecer en el Hero y en su
propia sección. No es un descuento — es una oferta de entrada irresistible.

## Plataformas de Delivery

* Rappi ✅
* DiDi Food ✅
* UberEats ✅
(Sin Delantal: NO)

## Paleta de Colores EXACTA (extraída del logo)

\--color-black:      #000000   /\* Fondo principal — negro absoluto */
--color-white:      #FFFFFF   /* Texto principal, wordmark */
--color-red:        #B8102E   /* Acento primario — el rojo del "KO" */
--color-red-dark:   #8B0D22   /* Hover de botones rojos */
--color-glass:      rgba(255, 255, 255, 0.07)   /* Tarjetas glassmorphism */
--color-glass-border: rgba(255, 255, 255, 0.12) /* Borde glassmorphism */
--color-subtle:     #1A1A1A   /* Superficies secundarias \*/

## Tipografía

* Display (H1, H2, logo-text): MADEC — archivo local en /public/fonts/MADEC\_\_\_.TTF
@font-face { font-family: 'MADEC'; src: url('/fonts/MADEC\_\_\_.TTF'); }
* Cuerpo (párrafos, descripciones): DM Sans, Google Fonts
* Acento (precios, citas): Cormorant Garamond Italic, Google Fonts

## Menú — Rollos Principales

FRÍOS: Philadelphia, California, Pepino, Aguacate
EMPANIZADOS: Kiko, Popito, Garfield, Alitas Roll
CAPEADOS: Dragon Roll, Colorado, Obispado
ESPECIALES: Regional, Rainbow, Spicy Tuna
EXTRAS: Arroz Frito (completo / medio), Gyozas, Teppanyaki de pollo

## Contacto y Ubicación

* Dirección: Francisco Garza Sada #2940, Piso 2, Local 204, Plaza Villa Obispado
* Teléfono: +52 81 8346-2758
* Whatsapp: +52 81 2747-4440
* Instagram: @temakysushimty
* Horario: Lunes a Sábado, 12:00–22:00

## Principios de Diseño (NO NEGOCIABLES)

1. Fondo negro ABSOLUTO #000000 — no gris, no charcoal, NEGRO
2. La fuente MADEC va en TODOS los títulos H1 y H2
3. El rojo #B8102E solo en CTAs, precios destacados y detalles — no en bloques grandes
4. Imágenes de sushi siempre protagonistas — mínimo 60% del espacio visual
5. Mobile-first: diseñar primero para 375px, luego escalar a desktop
6. Glassmorphism SOLO en tarjetas de menú y modales — no en toda la UI

## Lo que NUNCA hacer

* No usar fondo gris oscuro en lugar de negro
* No aplicar fuentes genéricas (Inter, Roboto, Arial)
* No mostrar el menú como lista de texto
* No usar paletas de colores que no sean las anteriores
* No mencionar "Sin Delantal" en ningún lado del sitio



\## Proyecto

Sitio web oficial de Temaky Sushi, restaurante japonés en Monterrey desde 1999. 

Stack: Astro 5 + Tailwind + TypeScript. Dominio: https://temakysushi.mx 

Hosting: Cloudflare Pages. Repo: github.com/<owner>/temaky-web.



\## Canal de conversión primario

WhatsApp con mensaje prellenado al \*\*+52 81 2747-4440\*\*.

URL base: https://wa.me/528127474440

\- Pedidos del carrito → WhatsApp con detalle + nombre + entrega.

\- Reservaciones → WhatsApp con datos del formulario.



\## Números de contacto

\- WhatsApp (chat, pedidos, reservas): +52 81 2747-4440 → SOLO este va en wa.me.

\- Teléfono de llamadas: +52 81 8346-2758 → SOLO va en `tel:` links o texto.



\## Instagram

Usuario: @temakysushimty → https://www.instagram.com/temakysushimty/

(No usar @temakyens — ese handle está mal en docs antiguos.)



\## Horario

Lunes a Sábado 12:00–22:00 hora Monterrey (America/Monterrey, GMT-6).

Domingo: cerrado.

Fuera de ese horario, cualquier checkout muestra OffHoursModal antes de abrir 

WhatsApp.



\## Ubicación

Plaza Villa Obispado · Francisco Garza Sada #2940, Piso 2 Local 204 · 

Nuevo Obispado · Monterrey, N.L., México.

Google Maps: https://maps.app.goo.gl/gZdvYsTJmWGkcaNL6



\## Delivery (secundario)

\- Rappi: https://www.rappi.com.mx/restaurantes/1923215355-temaky-sushi

\- UberEats: https://www.ubereats.com/mx/store/temaky-sushi/OqwiFbwtQea62BGRTsG1Ag (url completa con pl=… confirmada)

\- DiDi Food: https://web.didiglobal.com/mx/food/monterrey-nle/temaky-sushi/5764607773783097417/



\## Oferta gancho

\*\*Combo Clásico $139 MXN\*\*: Rollo Clásico a elegir + ½ Arroz de Pollo o Verduras.

Aparece en Hero y en Menu Overlay como combo-clasico.



Bundles automáticos (lógica en cart):

\- 2× Clásicos ($125 c/u) = $199 (ahorro $51 por par).

\- 2× Signatures ($135 c/u) = $229 (ahorro $41 por par).



\## Paleta (tokens CSS)

\--negro:#000000           /\* fondo principal ABSOLUTO \*/

\--blanco:#FFFFFF

\--rojo:#B8102E            /\* acento primario \*/

\--rojo-dark:#8B0D22       /\* hover botones rojos \*/

\--amarillo:#FFB90E        /\* badges de promo/bundle \*/

\--verde-wa:#25D366        /\* solo ícono/boton WhatsApp \*/

\--s1:#111111 --s2:#141414 --s3:#1c1c1c  /\* superficies \*/

\--g04:rgba(255,255,255,0.04)

\--g06:rgba(255,255,255,0.06)

\--g10:rgba(255,255,255,0.10)

\--g15:rgba(255,255,255,0.15)

\--g40:rgba(255,255,255,0.40)

\--g55:rgba(255,255,255,0.55)

\--g70:rgba(255,255,255,0.70)

\--g85:rgba(255,255,255,0.85)



\## Tipografía

\- Display (H1, H2, logo): \*\*MADEC\*\* — /public/fonts/MADEC\_\_\_.TTF

&#x20; @font-face { font-family: 'MADEC'; src: url('/fonts/MADEC\_\_\_.TTF'); 

&#x20;              font-weight: 700; font-display: swap; }

\- Cuerpo: \*\*DM Sans\*\* (400, 500, 600) — Google Fonts.

\- Precios y acentos: \*\*Cormorant Garamond\*\* italic (400, 600) — Google Fonts.



\## Reglas no negociables

1\. Fondo negro absoluto #000000. No gris, no charcoal.

2\. MADEC en TODOS los H1 y H2.

3\. Rojo #B8102E solo en CTAs, precios destacados, detalles — NO en bloques 

&#x20;  grandes de fondo.

4\. Fotos de platillo son protagonistas — mínimo 60% del espacio de una card.

5\. Mobile-first literal: diseñar a 375×812 primero, luego 768, luego 1440.

6\. Glassmorphism solo en cards de menú, nav scrolled, modales. No en toda 

&#x20;  la UI.



\## Reglas anti-genérico (guardrails)

\- Nunca uses colores default de Tailwind como primarios (azul-600, gray-\*). 

&#x20; Siempre los tokens.

\- Nunca uses transition-all. Lista propiedades explícitas.

\- Nunca uses fuentes Inter, Roboto, Arial — solo las tres tipografías 

&#x20; aprobadas.

\- Siempre define hover + focus-visible + active en cada botón.

\- Nunca muestres listas de texto largas para el menú — cards con foto.



\## Flujo agente (frontend-design skill)

Para cualquier cambio UI:

1\. Arranca dev server en localhost:4321 (`npm run dev`).

2\. Toma screenshot con puppeteer en los breakpoints 375, 768, 1440.

3\. Compara contra el bundle de Claude Design relevante 

&#x20;  (`\_raw\_assets/design-bundles/\*.html`) o contra `\_raw\_assets/spec-v3.html`.

4\. Lista diferencias concretas (px, color, falta elemento).

5\. Arregla, re-screenshot, re-compara. Mínimo 2 pasadas.



\## Rutas de assets clave

\- Logo: /images/logo/logo-temaky.webp

\- Video hero: /video/hero.webm

\- Fotos de productos: /images/products/{slug}.webp (88 archivos)

\- Mapa slug→producto: src/data/image-map.ts

\- Menú completo typed: src/data/menu.ts

\- Tipos: src/types/menu.ts

\- Lógica: src/lib/hours.ts, src/lib/whatsapp.ts

\- Tests: src/lib/\_\_tests\_\_/\*.test.ts (vitest)



\## Git workflow

\- Rama única `main` durante este sprint.

\- Un commit por paso completado del plan v6 (convención Conventional Commits).

\- Push después de cada fase (F3-X). Cloudflare redeploya automáticamente 

&#x20; una vez configurado.



\## Comandos útiles

\- `npm run dev` — dev server en :4321.

\- `npm run build` — compila a dist/.

\- `npm run preview` — sirve dist/ en :4321.

\- `npm test` — corre vitest.

\- `npx lighthouse http://localhost:4321 --output=json` — audit perf.



\## Qué NO hacer

\- No usar Sin Delantal.

\- No instalar librerías de UI tipo shadcn/ui en este sprint (reinventaría 

&#x20; las cards). Tailwind puro + nuestros componentes Astro.

\- No agregar backend/DB — el checkout es puro WhatsApp.

\- No agregar OpenTable, Square, Toast, etc. — solo WhatsApp.

\- No usar emojis inventados en copy crítico.

\- No modificar la lógica del menú/cart que portamos de v3 — solo el look.

