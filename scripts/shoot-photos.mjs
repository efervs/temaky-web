import puppeteer from 'puppeteer';
import fs from 'node:fs';

const OUT = '_raw_assets/photos-feature';
fs.mkdirSync(OUT, { recursive: true });
const URL = 'http://localhost:4321/';

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

async function shoot(name, width, height, fn) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await fn(page);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  await page.close();
  console.log(`  ✓ ${name}.png (${width}x${height})`);
}

const openMenu = async (page) => {
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('temaky:open-menu')));
  await page.waitForSelector('#menu-overlay.open .pcard', { visible: true });
  await new Promise(r => setTimeout(r, 600));
};

const openSheet = async (page, id) => {
  await openMenu(page);
  await page.evaluate((pid) => window.dispatchEvent(new CustomEvent('temaky:open-sheet', { detail: pid })), id);
  await page.waitForSelector('#psheet.open .gal-track', { visible: true });
  await new Promise(r => setTimeout(r, 600));
};

// Grid (combos primero → se ven las promo cards) + carruseles en tarjetas
await shoot('menu-grid-375', 375, 812, openMenu);
await shoot('menu-grid-768', 768, 1024, openMenu);
await shoot('menu-grid-1440', 1440, 900, openMenu);

// Detalle con carrusel
await shoot('sheet-arjona-375', 375, 812, (p) => openSheet(p, 'arjona'));
await shoot('sheet-arjona-1440', 1440, 900, (p) => openSheet(p, 'arjona'));
await shoot('sheet-promo-clasico-375', 375, 812, (p) => openSheet(p, 'promo-clasico'));
await shoot('sheet-combo-clasico-1440', 1440, 900, (p) => openSheet(p, 'combo-clasico'));

// Detalle avanzando el carrusel (segunda foto) para confirmar scroll-snap
await shoot('sheet-arjona-slide2-1440', 1440, 900, async (p) => {
  await openSheet(p, 'arjona');
  await p.click('#psheet .gal-next');
  await new Promise(r => setTimeout(r, 700));
});

await browser.close();
console.log('Listo.');
