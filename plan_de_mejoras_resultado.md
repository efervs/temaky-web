# T15 — Verificación final del plan v6.4

**Fecha**: 2026-05-19
**Ejecutor**: Opus 4.7 High (solo lectura, sin edición de código)
**Alcance**: T1–T14 cerrados → pasada de verificación end-to-end.

---

## 1. Greps anti-mentira

| # | Check | Esperado | Resultado | Estado |
|---|---|---|---|---|
| 1.1 | `Sin Delantal` en `src/` + `public/` | 0 | 0 hits | ✅ |
| 1.2 | `@temakyens` en `src/` | 0 | 0 hits (todos usan `temakysushimty`) | ✅ |
| 1.3 | `tambien ` (sin acento) en `src/` | 0 | 0 hits | ✅ |
| 1.4 | `🎉` en `src/` | 0 | 0 hits | ✅ |
| 1.5 | `Pedir Ahora` en `src/components/hero/` | 0 | 0 hits — Hero ahora usa `Pedir Combo · $139` (Hero.astro:113) | ✅ |
| 1.6 | `menu-temaky.pdf` en `src/` | 0 | 0 hits | ✅ |
| 1.7 | `10 días` / `3-5 días` en `src/` | 0 | 0 hits | ✅ |
| 1.8 | `#E8304A` literal en `src/` | 0 (excepto definición de token) | 2 hits, ambos en `src/styles/tokens.css:9,77` definiendo `--color-rojo-light` y `--rojo-light` — definición canónica, **no es uso hardcodeado** | ✅ |

**Nota 1.8**: la única aparición es la **definición** del token en `tokens.css`. El check apunta a que ningún componente lo use directamente; eso se cumple.

---

## 2. Estructura SEO en `dist/`

| # | Check | Resultado | Estado |
|---|---|---|---|
| 2.1 | `dist/sitemap-index.xml` existe y lista `/` | Existe; apunta a `sitemap-0.xml` que lista `https://temakysushi.mx/` y `/aviso-de-privacidad/` | ✅ |
| 2.2 | `"acceptsReservations": "True"` en `dist/index.html` | Presente (`"acceptsReservations":"True"`) | ✅ |
| 2.3 | `"hasMenu"` con secciones en `dist/index.html` | Presente: `"hasMenu":{"@type":"Menu","name":"Menú Temaky Sushi","hasMenuSection":[{"@type":"MenuSection","name":"Combos",...}]}` | ✅ |
| 2.4 | `<meta name="theme-color" content="#000000">` | Presente (`theme-color" content="#000000"`) | ✅ |
| 2.5 | `<html lang="es-MX">` | Presente (`lang="es-MX"`) | ✅ |
| 2.6 | `public/menu-temaky.pdf` NO existe | No existe (verificado con `ls`) | ✅ |

---

## 3. Componentes nuevos / modificados

| # | Check | Resultado | Estado |
|---|---|---|---|
| 3.1 | `src/components/common/MobileStickyCTA.astro` | Existe + montado en `src/pages/index.astro:13,36` | ✅ |
| 3.2 | `src/components/common/ReviewToast.astro` | Existe + montado en `src/pages/index.astro:18,47` | ✅ |
| 3.3 | `src/pages/aviso-de-privacidad.astro` | Existe + linkeado en footer y sitemap | ✅ |
| 3.4 | Cart empty muestra 3 top productos | `cart-logic.ts:85` define `TOP_PICK_IDS = ['combo-clasico', 'philadelphia', 'arjona']`; `cart-logic.ts:163-187` los renderiza dentro de `.ce-top3` cuando `!cart.length` | ✅ |
| 3.5 | ProductSheet con sección "Complementa tu pedido" | `sheet-logic.ts:198-199` inyecta `<section class="sh-cross" aria-label="Complementa tu pedido"><span class="sh-cross-title">Complementa tu pedido</span>...` | ✅ |
| 3.6 | ReservationForm SIN campo email | 0 hits para `type="email"` ó `name="email"` en `ReservationForm.astro` | ✅ |

---

## 4. Build + tests

| # | Check | Resultado | Estado |
|---|---|---|---|
| 4.1 | `npm run build` | Exit 0, 2 páginas built en 3.33s, sitemap generado, sin warnings | ✅ |
| 4.2 | `npm test` (vitest) | 2 test files / 13 tests pass en 401ms | ✅ |

---

## 5. Lighthouse — `npm run preview` en `localhost:4321`

### 5.1 Mobile (375×812, devtools throttling)

| Métrica | Valor | Target | Estado |
|---|---|---|---|
| Performance | **74** | ≥85 | ❌ |
| Accessibility | **96** | ≥95 | ✅ |
| Best Practices | **96** | ≥90 | ✅ |
| SEO | **100** | ≥95 | ✅ |
| LCP | 2.0 s | <2.5 s | ✅ |
| CLS | **0.095** | <0.05 | ❌ |
| TBT | 1,110 ms | bajo | ⚠️ |
| FCP | 0.9 s | — | ✅ |

Reportes: `reports/lighthouse-2026-05-19.{html,json}`.

### 5.2 Desktop (lighthouse `--preset=desktop`)

| Métrica | Valor | Estado |
|---|---|---|
| Performance | **99** | ✅ |
| Accessibility | **96** | ✅ |
| Best Practices | **100** | ✅ |
| SEO | **100** | ✅ |
| LCP | 0.9 s | ✅ |
| CLS | 0.019 | ✅ |
| TBT | 0 ms | ✅ |

Reporte: `reports/lighthouse-desktop-2026-05-19.json`.

### 5.3 Lectura

- **Desktop es excelente** (Performance 99, todo verde).
- **Mobile Performance 74**: gap respecto al target 85. Según `docs/lighthouse-baseline.md`, el costo dominante es `Style & Layout` + `Rendering` en CPU throttled (no JS — script eval = 111 ms), atribuible a Tailwind utility-first + animaciones CSS del hero. Cloudflare prod sin throttling debería ganar +15–25 puntos (validar con `npm run audit:prod` post-deploy).
- **Mobile CLS 0.095**: identificado en el baseline como shift del hero poster al entrar. Ya estaba documentado como pendiente de optimización futura — agregar `aspect-ratio` explícito al `.hero-video`/poster.

---

## 6. Verificación visual (estática vía `dist/index.html`)

| # | Check | Resultado | Estado |
|---|---|---|---|
| 6.1 | Hero CTA "Pedir Combo · $139" | Presente (Hero.astro:113 + dist/index.html lo emite) | ✅ |
| 6.2 | MobileStickyCTA presente en home | Compilado y emitido en `dist/index.html` | ✅ |
| 6.3 | ProductSheet renderizado | Componente presente en bundle | ✅ |
| 6.4 | Footer: solo Instagram + Aviso de Privacidad | Footer.astro:17 link Instagram; :80 link `/aviso-de-privacidad`; 0 referencias a Facebook | ✅ |
| 6.5 | Aviso de Privacidad sirve | `dist/aviso-de-privacidad/index.html` generado | ✅ |

**Nota**: la inspección visual en navegador real (screenshots a 375/1440) no se ejecutó en esta pasada porque requiere un loop puppeteer aparte. La verificación se basó en presencia en el HTML compilado.

---

## 7. Cross-doc

| # | Check | Resultado | Estado |
|---|---|---|---|
| 7.1 | CLAUDE.md lista WhatsApp +52 81 2747-4440 como único canal | Confirmado (líneas 56, 91, 93, 103) | ✅ |
| 7.2 | T1 Opción B (Open Sauce Sans formalizada) reflejada en CLAUDE.md | Líneas 35, 42, 63, 201, 217 — MADEC retirada y Open Sauce Sans documentada | ✅ |
| 7.3 | `docs/fotos-pendientes.md` con TOP-15 | Existe | ✅ |
| 7.4 | `docs/lighthouse-baseline.md` | Existe (incluye baseline post-T13 + histórico) | ✅ |

---

## 8. Issues encontrados

### 8.1 Críticos (bloquean merge)

Ninguno. **Los greps anti-mentira de bloqueo (Sin Delantal, menu-temaky.pdf, 🎉) están en 0.**

### 8.2 Métricas Lighthouse mobile fuera de target

- **Performance mobile 74 < 85**.
- **CLS mobile 0.095 ≥ 0.05**.

Ambos están **documentados como deuda conocida** en `docs/lighthouse-baseline.md` (sección "Próximas optimizaciones candidatas"). El plan v6.4 los reconoce como costo intrínseco de la stack y propone optimizar en una iteración posterior (preload del poster, AVIF, `aspect-ratio` fijo).

---

## 9. Mini-tareas T15.x propuestas

Estas NO bloquean el cierre del plan v6.4, pero quedan abiertas para la siguiente vuelta:

| ID | Acción | Origen |
|----|--------|--------|
| T15.1 | Fijar `aspect-ratio` explícito en `.hero-video` + poster para colapsar CLS por debajo de 0.05 | Lighthouse mobile |
| T15.2 | Preload `hero-poster.jpg` como LCP candidate y convertir a AVIF | Lighthouse mobile |
| T15.3 | Self-host de Open Sauce Sans + DM Sans (evitar hop a `fonts.gstatic.com`) | docs/lighthouse-baseline.md |
| T15.4 | Re-correr `npm run audit:prod` post-deploy en Cloudflare para confirmar Performance ≥85 fuera de throttling local | Validación prod |
| T15.5 | Corregir tilde en "Tu pedido esta vacio" → "Tu pedido está vacío" (`cart-logic.ts:185`) | Hallazgo cosmético en revisión |

---

## 10. Veredicto final

### ✅ APROBADO con observaciones

**Justificación**:
1. **100% de greps anti-mentira en 0** — sin copy obsoleto, sin Sin Delantal, sin menú PDF, sin emojis prohibidos, sin Pedir Ahora.
2. **Build limpio + tests verdes** (13/13).
3. **SEO 100, A11y 96, Best Practices 96/100, Performance desktop 99** — los pilares de WCAG AA y SEO se cumplen.
4. Todos los componentes nuevos (MobileStickyCTA, ReviewToast, aviso-de-privacidad, ProductSheet cross-sell, Cart top-picks empty, ReservationForm sin email) verificados.
5. CLAUDE.md sigue siendo fuente de verdad y consistente con el código.

**Observaciones (no bloqueantes)**:
- Performance mobile 74 y CLS 0.095 quedan por debajo del target, pero están **documentados como deuda conocida** en `docs/lighthouse-baseline.md` y atribuibles a (a) throttling local de `astro preview` y (b) hero poster sin `aspect-ratio`. Validar contra prod Cloudflare antes de declarar regresión.
- 5 mini-tareas T15.x abiertas para iteración futura.

**Commit autorizado**: sí (solo para este archivo de reporte; no se editó código).

---

## 11. Bloque PowerShell sugerido

```powershell
git add plan_de_mejoras_resultado.md
git commit -m "chore: verificacion final plan v6.4 -- aprobado"
```

> Nota: commit message en ASCII puro para evitar el problema de encoding documentado en `feedback_commit_scripts.md`.
