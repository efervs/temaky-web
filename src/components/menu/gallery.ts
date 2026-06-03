// Carrusel horizontal con scroll-snap para galerías de fotos de producto.
// Se usa tanto en las tarjetas del menú como en el hero del detalle (sheet).
//
// Estructura HTML esperada:
//   <div class="gal" data-gallery>
//     <div class="gal-track"> <img/> <img/> ... </div>
//     <button class="gal-arrow" data-dir="prev">…</button>   (opcional)
//     <button class="gal-arrow" data-dir="next">…</button>   (opcional)
//     <div class="gal-dots"><span class="gal-dot is-active"></span> …</div>
//   </div>
//
// Los controles llaman stopPropagation para no disparar el click de la tarjeta
// (que abre el sheet vía delegación en #menu-body).

function setupGallery(gal: HTMLElement): void {
  const track = gal.querySelector<HTMLElement>('.gal-track');
  if (!track) return;
  const dots = Array.from(gal.querySelectorAll<HTMLElement>('.gal-dot'));
  let active = 0;

  function syncTo(idx: number): void {
    if (idx === active) return;
    active = idx;
    dots.forEach((d, di) => d.classList.toggle('is-active', di === active));
  }

  let raf = 0;
  track.addEventListener(
    'scroll',
    () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const w = track.clientWidth || 1;
        syncTo(Math.round(track.scrollLeft / w));
      });
    },
    { passive: true },
  );

  // Flechas (prev/next)
  gal.querySelectorAll<HTMLElement>('.gal-arrow').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      e.preventDefault();
      const dir = btn.dataset.dir === 'prev' ? -1 : 1;
      track.scrollBy({ left: dir * track.clientWidth, behavior: 'smooth' });
    });
  });

  // Puntos (saltar a una foto)
  dots.forEach((dot, di) => {
    dot.addEventListener('click', e => {
      e.stopPropagation();
      e.preventDefault();
      track.scrollTo({ left: di * track.clientWidth, behavior: 'smooth' });
    });
  });
}

/** Inicializa todas las galerías aún no inicializadas dentro de `root`. */
export function initGalleries(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('.gal[data-gallery]:not([data-gal-ready])').forEach(gal => {
    gal.setAttribute('data-gal-ready', '1');
    setupGallery(gal);
  });
}
