# Recursos pendientes

## Mapa estático (T13)

El componente `LocationSection.astro` muestra un placeholder CSS (gradiente +
grid + pin SVG) hasta que el usuario tappea "Cargar mapa interactivo". Cuando
hace tap, se inyecta el iframe real de Google Maps (~500 KB).

**Si la dirección cambia**, basta con actualizar `data-map-src` en
`src/components/location/LocationSection.astro`. El placeholder es genérico,
no muestra la ubicación literal, así que no requiere regeneración.

**Mejora opcional** (no bloquea T13): reemplazar el placeholder CSS por una
screenshot real del mapa centrado en Plaza Villa Obispado. Pasos:

1. Abrir https://maps.app.goo.gl/gZdvYsTJmWGkcaNL6 en Chrome.
2. Captura de la zona centrada, exportar a `/public/images/map-static.jpg`.
3. Optimizar a 80% quality, target <120 KB.
4. En `LocationSection.astro`, sustituir el bloque `.map-placeholder` por:
   `<img src="/images/map-static.jpg" alt="Ubicación de Temaky Sushi" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />`

Mientras tanto, el placeholder CSS es 0 KB extra y respeta el principio de
"no descargar JS pesado hasta que el usuario lo pida".

## Otros pendientes

- og-image-pendiente.md (T2 SEO) — sigue aplicando.
- fotos-pendientes.md (catalog) — sigue aplicando.
