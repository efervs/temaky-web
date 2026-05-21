import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { resolve } from 'path';

const OUT = resolve('_raw_assets/c4-checkout-summary');
await mkdir(OUT, { recursive: true });

const URL = 'http://localhost:4321/';
const SIZES = [
  { w: 375,  h: 812, name: '375',  isMobile: true,  dpr: 2 },
  { w: 1440, h: 900, name: '1440', isMobile: false, dpr: 1 },
];

const browser = await puppeteer.launch({ headless: 'new' });

async function makePage(s) {
  const page = await browser.newPage();
  await page.setViewport({
    width: s.w, height: s.h, deviceScaleFactor: s.dpr,
    isMobile: s.isMobile, hasTouch: s.isMobile,
  });
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60_000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await new Promise(r => setTimeout(r, 600));
  return page;
}

async function seedCart(page) {
  await page.evaluate(() => {
    const cart = [
      { cartId: 'a-1', id: 'philadelphia', name: 'Philadelphia', price: 125,
        modsTotal: 0, mods: [], notes: '',
        qty: 2, lineTotal: 199, bundle: 'clasico' },
      { cartId: 'b-2', id: 'dragon', name: 'Dragon Roll', price: 135,
        modsTotal: 0, mods: [], notes: '',
        qty: 1, lineTotal: 135, bundle: 'signature' },
    ];
    localStorage.setItem('temaky-v6-cart', JSON.stringify(cart));
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 700));
}

async function openCheckout(page) {
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('temaky:open-cart'));
  });
  await new Promise(r => setTimeout(r, 400));
  await page.click('#cart-checkout');
  await new Promise(r => setTimeout(r, 500));
}

async function clipSummary(page, file) {
  const box = await page.evaluate(() => {
    const el = document.getElementById('ck-summary');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  });
  if (!box) return;
  await page.screenshot({
    path: file,
    clip: {
      x: Math.max(0, Math.floor(box.x) - 12),
      y: Math.max(0, Math.floor(box.y) - 12),
      width: Math.ceil(box.w) + 24,
      height: Math.ceil(box.h) + 24,
    },
  });
}

const report = [];

for (const s of SIZES) {
  // Collapsed
  let page = await makePage(s);
  await seedCart(page);
  await openCheckout(page);
  const collapsedFile = `${OUT}/summary-collapsed-${s.name}.png`;
  await clipSummary(page, collapsedFile);
  const collapsedState = await page.evaluate(() => {
    const wrap = document.getElementById('ck-summary');
    const list = document.getElementById('ck-sum-list');
    const toggle = document.getElementById('ck-sum-toggle');
    const txt = toggle?.querySelector('.ck-sum-toggle-txt')?.textContent;
    const count = document.getElementById('ck-sum-count')?.textContent;
    const total = document.getElementById('ck-sum-total')?.textContent;
    const saveHidden = document.getElementById('ck-sum-save')?.hidden;
    const saveVal = document.getElementById('ck-sum-save-val')?.textContent;
    const tRect = toggle?.getBoundingClientRect();
    return {
      dataOpen: wrap?.getAttribute('data-open'),
      ariaExpanded: toggle?.getAttribute('aria-expanded'),
      listHidden: list?.hidden,
      toggleText: txt,
      count, total, saveHidden, saveVal,
      toggleHeight: Math.round(tRect?.height ?? 0),
      toggleWidth: Math.round(tRect?.width ?? 0),
    };
  });
  report.push({ size: s.name, state: 'collapsed', ...collapsedState });
  console.log(`[${s.name}] collapsed:`, JSON.stringify(collapsedState));

  // Click toggle to expand
  await page.click('#ck-sum-toggle');
  await new Promise(r => setTimeout(r, 250));
  const expandedFile = `${OUT}/summary-expanded-${s.name}.png`;
  await clipSummary(page, expandedFile);
  const expandedState = await page.evaluate(() => {
    const wrap = document.getElementById('ck-summary');
    const list = document.getElementById('ck-sum-list');
    const toggle = document.getElementById('ck-sum-toggle');
    const txt = toggle?.querySelector('.ck-sum-toggle-txt')?.textContent;
    const items = list?.querySelectorAll('.ck-sum-item')?.length ?? 0;
    return {
      dataOpen: wrap?.getAttribute('data-open'),
      ariaExpanded: toggle?.getAttribute('aria-expanded'),
      listHidden: list?.hidden,
      toggleText: txt,
      items,
    };
  });
  report.push({ size: s.name, state: 'expanded', ...expandedState });
  console.log(`[${s.name}] expanded:`, JSON.stringify(expandedState));

  // Click again to collapse
  await page.click('#ck-sum-toggle');
  await new Promise(r => setTimeout(r, 200));
  const reCollapsed = await page.evaluate(() => ({
    dataOpen: document.getElementById('ck-summary')?.getAttribute('data-open'),
    listHidden: document.getElementById('ck-sum-list')?.hidden,
    toggleText: document.getElementById('ck-sum-toggle')?.querySelector('.ck-sum-toggle-txt')?.textContent,
  }));
  report.push({ size: s.name, state: 're-collapsed', ...reCollapsed });
  console.log(`[${s.name}] re-collapsed:`, JSON.stringify(reCollapsed));

  await page.close();
}

await browser.close();
console.log('\n=== REPORT ===');
console.log(JSON.stringify(report, null, 2));
