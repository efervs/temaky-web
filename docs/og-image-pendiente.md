# OG Image — Pendiente de regenerar

**Fecha:** 2026-05-18 (T2 SEO)

## Estado actual

`public/og.jpg` pesa **9.6 KB** (esperado: 50–200 KB para una foto 1200×630
con compresión razonable). Esto sugiere que el archivo actual está sobre-
comprimido o es un placeholder de baja calidad — Facebook/WhatsApp pueden
rechazar previews que se vean borrosos.

## Acción requerida

Regenerar `public/og.jpg` con:

- Resolución: **1200×630 px** exactos.
- Peso objetivo: **80–200 KB** (JPEG calidad 80–85).
- Contenido: una foto del dueño + plato hero (Combo Clásico o Signature
  destacado) + wordmark Temaky sobre fondo negro.
- La foto base existe en `_raw_assets/owner_uploads/` — falta selección y
  composición final.

## Cómo validar

1. Pegar `https://temakysushi.mx/` en
   https://developers.facebook.com/tools/debug/ y revisar preview.
2. Pegar la URL en https://www.opengraph.xyz/ para Twitter Card.

## Notas

- Las meta tags `og:image:width=1200` y `og:image:height=630` ya están
  declaradas en `BaseLayout.astro`, por lo que solo basta con sustituir el
  archivo binario.
- No es bloqueante para indexación de Google ni para el JSON-LD.
