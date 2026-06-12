// Verifica el deep-link del menú contra el server de preview (dist/).
// Casos: /?menu y /#menu auto-abren el overlay y sincronizan la URL a #menu;
// la raíz "/" lo deja cerrado.
import puppeteer from 'puppeteer';

const BASE = 'http://localhost:4321';

async function inspect(page, path) {
  await page.goto(BASE + path, { waitUntil: 'networkidle0' });
  // Da un respiro al rAF/replaceState del overlay.
  await new Promise((r) => setTimeout(r, 400));
  return page.evaluate(() => {
    const o = document.getElementById('menu-overlay');
    return {
      open: !!o && !o.hidden && o.classList.contains('open'),
      ariaHidden: o?.getAttribute('aria-hidden'),
      hash: location.hash,
      search: location.search,
    };
  });
}

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });

const results = {};
results['/?menu'] = await inspect(page, '/?menu');
await page.screenshot({ path: 'docs/screenshots/verify-menu-deeplink.png' });
results['/#menu'] = await inspect(page, '/#menu');
results['/?utm_source=ig&menu'] = await inspect(page, '/?utm_source=ig&menu');
results['/'] = await inspect(page, '/');

console.log(JSON.stringify(results, null, 2));

const pass =
  results['/?menu'].open &&
  results['/?menu'].hash === '#menu' &&
  results['/?menu'].search === '' &&
  results['/#menu'].open &&
  results['/?utm_source=ig&menu'].open &&
  results['/?utm_source=ig&menu'].search === '?utm_source=ig' &&
  !results['/'].open;

console.log(pass ? '\nRESULT: PASS' : '\nRESULT: FAIL');
await browser.close();
process.exit(pass ? 0 : 1);
