Set-Location 'C:\Users\Eferi\Code\temaky-web'

git add src/components/location/LocationSection.astro scripts/c2-map-shots.mjs _raw_assets/c2-map-auto/

$msg = 'fix(location): autocargar mapa con IntersectionObserver'
$body = 'Elimina boton rojo "Cargar mapa interactivo" y dispara el iframe automaticamente cuando #map-container entra al viewport (rootMargin 300px). Conserva placeholder visual y lazy-load real: no se descarga maps.google.com en la carga inicial.'

git commit -m $msg -m $body

git push origin master
