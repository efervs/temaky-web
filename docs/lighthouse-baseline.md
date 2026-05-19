# Lighthouse Baseline — Temaky Sushi

Audit reference for tracking performance over time. Versioned reports are
under `reports/lighthouse-baseline.{html,json}`. Daily runs go to
`reports/lighthouse-YYYY-MM-DD.{html,json}` (gitignored).

## Cómo correr

```bash
npm run build && npm run preview       # arranca preview en :4321 (o el que esté libre)
npm run audit                          # audita localhost (default :4321)
# o:
npm run audit:prod                     # audita https://temakysushi.mx
```

El script `scripts/lighthouse.mjs` corre lighthouse en modo mobile con
throttling devtools y dispara chrome headless. Genera HTML + JSON con la
fecha del día.

## Baseline — 2026-05-19 (post-T13)

**Antes de T13** (estimado, sin medición previa archivada):
- Hero video `.webm` de 708 KB descargado en mobile antes de cualquier
  interacción + iframe Google Maps inyectando ~500 KB de JS de tercera parte
  en LocationSection. Esos dos costos pegaban LCP y TBT en mobile.

**Después de T13** (localhost preview, throttling devtools, mobile 375×812):

| Categoría        | Score |
|------------------|-------|
| Performance      | 59    |
| Accessibility    | 96    |
| Best Practices   | 96    |
| SEO              | 100   |

**Core Web Vitals (mobile, simulated)**:

| Métrica | Valor   |
|---------|---------|
| LCP     | 3.6 s   |
| CLS     | 0.095   |
| TBT     | 1,470 ms |
| FCP     | 2.2 s   |
| SI      | 3.4 s   |
| TTI     | 6.9 s   |

### Lectura

- ✅ **No descargas mobile innecesarias**: hero video y Maps iframe ya no se
  cargan en mobile sin interacción del usuario. Verificado en `network-requests`
  del reporte — no aparece `hero-720.webm` ni `maps.google.com/maps`.
- ⚠️ **Performance 59 (<80 target)**: dominado por `Style & Layout` (3.0 s) +
  `Rendering` (2.7 s) en CPU throttled. Esto **no es JS** (Script Evaluation
  = 111 ms). Es costo intrínseco de Tailwind utility-first + las animaciones
  CSS del hero (rise, cue-bounce). Cloudflare prod sin throttling va a
  rendir mejor que el preview local.
- ⚠️ **CLS 0.095 (target <0.05)**: probablemente el shift que mete el hero
  poster cuando entra. Pendiente para una iteración futura — agregar
  `width/height` explícitos o `aspect-ratio` al `.hero-video` y poster.
- ✅ **Server latency 580 ms**: artefacto de `astro preview` local, no
  representativo de Cloudflare Pages prod.

### Comparar contra prod

Una vez deployado, correr `npm run audit:prod` para tener la lectura real
sobre Cloudflare CDN (probablemente +15-25 puntos de Performance vs preview).

## Próximas optimizaciones candidatas

- Preload del `hero-poster.jpg` (LCP candidate, 296 KB).
- Convertir hero-poster a AVIF (~60% más liviano que JPG).
- Reducir el peso del hero CSS (varias capas: video + poster + overlay +
  grain + grid). Considerar mergear poster + overlay.
- Fijar `aspect-ratio` en `.hero-video` para eliminar CLS.
- Self-host de Open Sauce Sans + DM Sans para evitar el hop a `fonts.gstatic.com`.

## Histórico

| Fecha       | Performance | LCP   | CLS    | TBT      | Notas                          |
|-------------|-------------|-------|--------|----------|--------------------------------|
| 2026-05-19  | 59          | 3.6 s | 0.095  | 1,470 ms | Baseline post-T13 (localhost)  |
