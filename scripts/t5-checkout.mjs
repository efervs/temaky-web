import puppeteer from 'puppeteer';
import { mkdir, writeFile } from 'fs/promises';
import { resolve } from 'path';

const OUT = resolve('_raw_assets/t5-checkout');
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
      { cartId: 'a-1', id: 'dragon', name: 'Dragon Roll', price: 135,
        modsTotal: 0, mods: [], notes: '',
        qty: 2, lineTotal: 270, bundle: 'signature' },
      { cartId: 'b-2', id: 'philadelphia', name: 'Philadelphia', price: 125,
        modsTotal: 0, mods: [], notes: '',
        qty: 1, lineTotal: 125, bundle: 'clasico' },
    ];
    localStorage.setItem('temaky-v6-cart', JSON.stringify(cart));
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
}

async function openCheckout(page) {
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('temaky:open-cart'));
  });
  await new Promise(r => setTimeout(r, 400));
  await page.click('#cart-checkout');
  await new Promise(r => setTimeout(r, 500));
}

// 1) Default checkout view (no validation, banner state depends on system clock)
for (const s of SIZES) {
  const page = await makePage(s);
  await seedCart(page);
  await openCheckout(page);
  await page.screenshot({ path: `${OUT}/checkout-default-${s.name}.png` });
  console.log(`✓ checkout-default-${s.name}.png`);
  await page.close();
}

// 2) Validation state: blur name without filling -> red border + msg + disabled submit
for (const s of SIZES) {
  const page = await makePage(s);
  await seedCart(page);
  await openCheckout(page);
  // ensure focus then blur to trigger validation
  await page.evaluate(() => {
    const el = document.getElementById('ck-name');
    el.focus(); el.blur();
  });
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: `${OUT}/checkout-validation-${s.name}.png` });
  console.log(`✓ checkout-validation-${s.name}.png`);
  await page.close();
}

// 3) Off-hours banner (forced via simulating closed state by toggling banner)
for (const s of SIZES) {
  const page = await makePage(s);
  await seedCart(page);
  await openCheckout(page);
  // Force banner visible to capture the off-hours state regardless of system clock.
  await page.evaluate(() => {
    const b = document.getElementById('ck-off-banner');
    if (b) b.hidden = false;
  });
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: `${OUT}/checkout-offhours-${s.name}.png` });
  console.log(`✓ checkout-offhours-${s.name}.png`);
  await page.close();
}

// 4) Expanded summary details
for (const s of SIZES) {
  const page = await makePage(s);
  await seedCart(page);
  await openCheckout(page);
  await page.evaluate(() => {
    const d = document.getElementById('ck-summary');
    if (d) d.setAttribute('open', '');
  });
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: `${OUT}/checkout-expanded-${s.name}.png` });
  console.log(`✓ checkout-expanded-${s.name}.png`);
  await page.close();
}

// 5) wa.me URL with delivery + maps + timestamp (capture the generated URL as text)
const urlPage = await makePage(SIZES[0]);
await seedCart(urlPage);
const generatedUrl = await urlPage.evaluate(async () => {
  const mod = await import('/src/lib/whatsapp.ts');
  const cart = JSON.parse(localStorage.getItem('temaky-v6-cart'));
  const calc = { subtotal: 395, bundleSaving: 0, total: 395, cPairs: 0, sPairs: 0 };
  const customer = {
    name: 'Juan Pérez',
    delivery: 'delivery',
    address: 'Av Constitución 123',
  };
  const fixed = new Date('2026-05-18T18:00:00.000Z');
  const text = mod.buildOrderMessage(cart, customer, calc, { now: fixed, isOpen: true });
  return mod.buildWhatsAppUrl(text);
});
await writeFile(`${OUT}/wame-url.txt`, generatedUrl);
console.log('✓ wame-url.txt');
await urlPage.close();

await browser.close();
console.log('done');
