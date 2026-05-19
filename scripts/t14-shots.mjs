import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';

const URL = process.argv[2] || 'http://localhost:4321';
mkdirSync('_raw_assets/t14', { recursive: true });

const browser = await puppeteer.launch({ headless: 'new' });

async function newPage(width, height, mobile = false) {
  const page = await browser.newPage();
  await page.setViewport({
    width, height,
    deviceScaleFactor: mobile ? 2 : 1,
    isMobile: mobile,
    hasTouch: mobile,
  });
  return page;
}

// ── Bloque A: ReviewToast (mobile 375 + desktop 1440) ──
async function seedReviewPending(page) {
  // 4 min in the past — exceeds 3 min threshold
  await page.evaluateOnNewDocument(() => {
    const past = Date.now() - 4 * 60 * 1000;
    localStorage.setItem('temaky-last-order-time', String(past));
    localStorage.setItem('temaky-review-pending', '1');
  });
}

{
  const page = await newPage(375, 812, true);
  await seedReviewPending(page);
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 900));
  await page.screenshot({ path: '_raw_assets/t14/review-toast-mobile-375.png', fullPage: false });
  console.log('OK review-toast-mobile-375.png');
  await page.close();
}

{
  const page = await newPage(1440, 900, false);
  await seedReviewPending(page);
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 900));
  await page.screenshot({ path: '_raw_assets/t14/review-toast-desktop-1440.png', fullPage: false });
  console.log('OK review-toast-desktop-1440.png');
  await page.close();
}

// ── Bloque B: CartResumeBanner ──
async function seedAbandonedCart(page) {
  await page.evaluateOnNewDocument(() => {
    const oldTs = Date.now() - 3 * 60 * 60 * 1000; // 3 horas atrás
    const cart = [{
      cartId: 'philadelphia-old',
      id: 'philadelphia',
      name: 'Philadelphia Roll',
      price: 125,
      modsTotal: 0,
      mods: [],
      notes: '',
      qty: 2,
      lineTotal: 250,
      bundle: 'clasico',
    }];
    localStorage.setItem('temaky-v6-cart', JSON.stringify(cart));
    localStorage.setItem('temaky-v6-cart-updated', String(oldTs));
    localStorage.removeItem('temaky-cart-banner-dismissed');
  });
}

{
  const page = await newPage(375, 812, true);
  await seedAbandonedCart(page);
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: '_raw_assets/t14/cart-resume-banner-mobile-375.png', fullPage: false });
  console.log('OK cart-resume-banner-mobile-375.png');
  await page.close();
}

{
  const page = await newPage(1440, 900, false);
  await seedAbandonedCart(page);
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: '_raw_assets/t14/cart-resume-banner-desktop-1440.png', fullPage: false });
  console.log('OK cart-resume-banner-desktop-1440.png');
  await page.close();
}

// ── Bloque C: OffHoursModal con copy nueva ──
{
  const page = await newPage(390, 844, true);
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('offhours:open', {
      detail: { pendingUrl: 'https://wa.me/528127474440?text=hola' },
    }));
  });
  await new Promise(r => setTimeout(r, 800));
  // Forzar copy de "lunes" para verificar el caso domingo/sábado>22
  await page.evaluate(() => {
    const el = document.getElementById('oh-body-copy');
    if (el) el.textContent = 'Te respondemos el lunes a las 12:00 hrs.';
  });
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: '_raw_assets/t14/offhours-modal-sabado-lunes.png', fullPage: false });
  console.log('OK offhours-modal-sabado-lunes.png');
  await page.close();
}

{
  const page = await newPage(390, 844, true);
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('offhours:open', {
      detail: { pendingUrl: 'https://wa.me/528127474440?text=hola' },
    }));
  });
  await new Promise(r => setTimeout(r, 900));
  await page.screenshot({ path: '_raw_assets/t14/offhours-modal-default.png', fullPage: false });
  console.log('OK offhours-modal-default.png');
  await page.close();
}

await browser.close();
console.log('DONE');
