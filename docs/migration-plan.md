# Plan de migración → Astro 5 + Tailwind

## 1. Estructura de carpetas

```
temaky-web/
├─ src/
│  ├─ pages/           index.astro, menu.astro, reservaciones.astro, 404.astro
│  ├─ layouts/         BaseLayout.astro  (head, fonts, nav, footer, modales globales)
│  ├─ components/      (ver §2) — .astro para estático, .tsx/.svelte para islands
│  ├─ data/            menu.ts, image-map.ts, hours-config.ts
│  ├─ types/           menu.ts (Product, Category, CartLine, Bundle)
│  ├─ lib/             hours.ts, whatsapp.ts, cart-store.ts, bundles.ts
│  ├─ styles/          globals.css (tokens + @font-face MADEC + Tailwind layers)
│  └─ lib/__tests__/   *.test.ts (vitest)
├─ public/fonts/MADEC___.TTF, /video/hero.webm, /images/products/*.webp, /images/logo/
└─ astro.config.mjs, tailwind.config.ts, tsconfig.json
```

## 2. Componentes (.astro salvo marcado)

- **Nav**: `Nav.astro` + `MobileDrawer.astro` (island JS mínimo para scroll-solid y toggle)
- **Hero**: `Hero.astro` (video bg, combo card, CTAs) — estático
- **MenuOverlay**: `MenuOverlay.tsx` **island** (búsqueda, tabs, grid)
- **ProductCard.astro** (pre-render), **ProductSheet.tsx** **island** (qty, add-to-cart)
- **Cart.tsx** **island** (drawer, bundles, total)
- **ReservationForm.tsx** **island** (validación + deeplink WA)
- **LocationSection.astro** (mapa iframe, horario, teléfono)
- **Footer.astro**, **WhatsAppFab.astro** (estático, `<a href>`)
- **OffHoursModal.tsx** **island** (interceptor checkout)

## 3. Estático vs Island

Pre-renderizado: Nav shell, Hero, cards de menú (HTML+fotos), footer, location, horarios. Islands (`client:load` solo donde hace falta): MenuOverlay, Cart + drawer, ProductSheet modal, ReservationForm, OffHoursModal. Estado cart en **nanostores** persistido a `localStorage`.

## 4. Modelo de catálogo — TS typed array

`src/data/menu.ts` exportando `Product[]` tipado. Razón: 88 productos fijos, cero editorial workflow, imports directos a `image-map`, tipo-seguro en cart. Content Collections solo añaden frontmatter parsing que no aporta aquí.

## 5. Checkout cart → WhatsApp (sin backend)

`src/lib/whatsapp.ts` — función `buildOrderURL(lines, customer, delivery)` genera:
`https://wa.me/528127474440?text=<encodeURIComponent(template)>`. Template: saludo + líneas `- 2× Dragon Roll ($270)` + bundles detectados + total + nombre + tipo (recoger/domicilio) + dirección opcional. Antes del click: `isOpen()` de `hours.ts` → si cerrado, abre `OffHoursModal`. No fetch, no API.

## 6. Dependencias npm

`astro`, `@astrojs/react`, `@astrojs/tailwind`, `@astrojs/sitemap`, `tailwindcss`, `typescript`, `nanostores` + `@nanostores/react`, `vitest`, `@astrojs/check`. Íconos: SVG inline en `components/icons/` (evita peso de lucide). Imágenes: `astro:assets` nativo (WebP ya optimizado → `<Image>` con `loading="lazy"`).

## 7. Orden F3-1 → F3-9

- **F3-1** init Astro + Tailwind + tokens CSS + MADEC @font-face
- **F3-2** BaseLayout + Nav + Footer + WhatsAppFab
- **F3-3** `menu.ts` + `image-map.ts` + types + hours/whatsapp libs + vitest
- **F3-4** Hero + LocationSection (home estática)
- **F3-5** MenuOverlay + ProductCard grid
- **F3-6** ProductSheet + Cart store + bundles
- **F3-7** Checkout → WhatsApp + OffHoursModal
- **F3-8** página `/reservaciones` + form
- **F3-9** sitemap, meta OG, Lighthouse pass, deploy Cloudflare Pages
