import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = 'http://localhost:4321';
const OUT = '_raw_assets/v6.3-after';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { w: 375, h: 812, name: '375' },
  { w: 768, h: 1024, name: '768' },
  { w: 1440, h: 900, name: '1440' },
];

async function clickByText(page, text) {
  return page.evaluate((txt) => {
    const btns = Array.from(document.querySelectorAll('button, a[role="button"], [data-menu-trigger]'));
    const match = btns.find(el => el.textContent?.includes(txt));
    if (match) { match.click(); return true; }
    return false;
  }, text);
}

const browser = await puppeteer.launch({ headless: true });

for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.w, height: vp.h });

  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1500);
  await page.screenshot({ path: `${OUT}/${vp.name}.png`, fullPage: true });
  console.log(`✓ home ${vp.name}`);

  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1000);
  await clickByText(page, 'Ver Menú');
  await sleep(1800);
  await page.screenshot({ path: `${OUT}/menu-${vp.name}.png`, fullPage: true });
  console.log(`✓ menu ${vp.name}`);

  // Scroll menu down to test scroll-spy
  await page.evaluate(() => {
    const body = document.getElementById('menu-body');
    if (body) body.scrollTop = 800;
  });
  await sleep(800);
  await page.screenshot({ path: `${OUT}/menu-scrolled-${vp.name}.png`, fullPage: true });
  console.log(`✓ menu-scrolled ${vp.name}`);

  await page.close();
}

await browser.close();
console.log('All screenshots done.');
