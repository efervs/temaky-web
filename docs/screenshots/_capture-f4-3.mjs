// Puppeteer capture for F4-3: visual review across 8 viewports + overlays
import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';

const BASE = process.env.URL || 'http://localhost:4321/';
const OUT = 'docs/screenshots';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const VIEWPORTS = [
  { name: 'F4-3-1-mobile-375',   width: 375,  height: 812  },
  { name: 'F4-3-2-mobile-414',   width: 414,  height: 896  },
  { name: 'F4-3-3-tablet-768',   width: 768,  height: 1024 },
  { name: 'F4-3-4-desktop-1440', width: 1440, height: 900  },
  { name: 'F4-3-5-desktop-1920', width: 1920, height: 1080 },
];

async function launchBrowser() {
  return puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}

async function openPage(browser, viewport) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', err => errors.push(`pageerror: ${err.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 2 });
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(800);
  return { page, errors };
}

async function captureViewport(browser, vp) {
  const { page, errors } = await openPage(browser, vp);
  await page.screenshot({ path: `${OUT}/${vp.name}.png`, fullPage: false });
  const checks = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const hero = document.querySelector('[data-section="hero"], .hero, #hero');
    const nav = document.querySelector('nav, header');
    const comboSection = [...document.querySelectorAll('*')].find(el =>
      el.textContent?.includes('$139') || el.textContent?.includes('Combo Clásico'));
    const fonts = [...document.querySelectorAll('h1,h2')].map(el =>
      window.getComputedStyle(el).fontFamily).filter((v, i, a) => a.indexOf(v) === i);
    const bgColor = window.getComputedStyle(document.body).backgroundColor;
    return {
      hasH1: !!h1,
      h1Text: h1?.textContent?.trim()?.slice(0, 60),
      h1Font: h1 ? window.getComputedStyle(h1).fontFamily : null,
      hasNav: !!nav,
      hasCombo: !!comboSection,
      headingFonts: fonts,
      bodyBg: bgColor,
      heroVisible: hero ? window.getComputedStyle(hero).display !== 'none' : false,
    };
  });
  await page.close();
  return { vp: vp.name, checks, errors };
}

async function captureMenuOverlayMobile(browser) {
  const vp = { width: 375, height: 812 };
  const { page, errors } = await openPage(browser, vp);
  // Open menu overlay
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('temaky:open-menu')));
  await sleep(800);
  const overlayState = await page.evaluate(() => {
    const overlay = document.getElementById('menu-overlay') ||
      document.querySelector('[id*="menu"][id*="overlay"], [data-overlay="menu"], .menu-overlay');
    const cards = document.querySelectorAll('.pcard, [class*="product-card"], [class*="pcard"]');
    const tabs = document.querySelectorAll('[role="tab"], .tab-btn, [class*="tab"]');
    return {
      overlayFound: !!overlay,
      overlayVisible: overlay ? window.getComputedStyle(overlay).display !== 'none' && overlay.style.transform !== 'translateY(100%)' : false,
      cardCount: cards.length,
      tabCount: tabs.length,
      bodyBg: window.getComputedStyle(document.body).backgroundColor,
    };
  });
  await page.screenshot({ path: `${OUT}/F4-3-6-menu-overlay-mobile.png`, fullPage: false });
  await page.close();
  return { vp: 'F4-3-6-menu-overlay', overlayState, errors };
}

async function captureProductSheetMobile(browser) {
  const vp = { width: 375, height: 812 };
  const { page, errors } = await openPage(browser, vp);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('temaky:open-menu')));
  await sleep(400);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('temaky:open-sheet', { detail: 'philadelphia' })));
  await sleep(800);
  const sheetState = await page.evaluate(() => {
    const sheet = document.getElementById('psheet') ||
      document.querySelector('[id*="sheet"], [data-sheet], .product-sheet');
    const img = sheet?.querySelector('img');
    const title = sheet?.querySelector('h2, h3, [class*="title"]');
    const price = sheet?.querySelector('[class*="price"]');
    const addBtn = sheet?.querySelector('button[class*="add"], [class*="add-btn"]');
    return {
      sheetFound: !!sheet,
      sheetOpen: sheet?.classList.contains('open') || sheet?.getAttribute('aria-hidden') === 'false',
      hasImg: !!img,
      imgSrc: img?.src?.split('/').pop(),
      hasTitle: !!title,
      titleText: title?.textContent?.trim()?.slice(0, 40),
      hasPrice: !!price,
      priceText: price?.textContent?.trim(),
      hasAddBtn: !!addBtn,
    };
  });
  await page.screenshot({ path: `${OUT}/F4-3-7-product-sheet-mobile.png`, fullPage: false });
  await page.close();
  return { vp: 'F4-3-7-product-sheet', sheetState, errors };
}

async function captureCartMobile(browser) {
  const vp = { width: 375, height: 812 };
  const { page, errors } = await openPage(browser, vp);

  // Seed 3 items into cart
  await page.evaluate(() => {
    const items = [
      { id: 'philadelphia', cat: 'clasicos-frios', name: 'Philadelphia', price: 125, img: '', bundle: 'clasico' },
      { id: 'california',   cat: 'clasicos-frios', name: 'California',   price: 125, img: '', bundle: 'clasico' },
      { id: 'dragon-roll',  cat: 'capeados',       name: 'Dragon Roll',  price: 155, img: '', bundle: 'signature' },
    ];
    items.forEach(product => {
      window.dispatchEvent(new CustomEvent('temaky:add-cart', {
        detail: { product, qty: 1, sels: {}, notes: '' },
      }));
    });
  });
  await sleep(300);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('temaky:open-cart')));
  await sleep(800);

  const cartState = await page.evaluate(() => {
    const cart = document.getElementById('cart-panel') ||
      document.querySelector('[id*="cart"], [data-cart], .cart-panel');
    const lineItems = document.querySelectorAll('.ci, [class*="cart-item"], [class*="line-item"]');
    const total = document.querySelector('.cl.total .cl-val, [class*="total"] [class*="val"]');
    const saving = document.querySelector('.cl.saving .cl-val, [class*="saving"]');
    const checkoutBtn = document.querySelector('[class*="checkout"], [class*="whatsapp-btn"]');
    return {
      cartFound: !!cart,
      cartOpen: cart ? window.getComputedStyle(cart).display !== 'none' : false,
      lineItemCount: lineItems.length,
      totalText: total?.textContent?.trim(),
      savingText: saving?.textContent?.trim(),
      hasCheckout: !!checkoutBtn,
    };
  });
  await page.screenshot({ path: `${OUT}/F4-3-8-cart-mobile.png`, fullPage: false });
  await page.close();
  return { vp: 'F4-3-8-cart', cartState, errors };
}

async function main() {
  const browser = await launchBrowser();
  const report = [];

  console.log('=== F4-3 Visual Review ===\n');

  // Capture 5 viewport views
  for (const vp of VIEWPORTS) {
    process.stdout.write(`Capturing ${vp.name}...`);
    const result = await captureViewport(browser, vp);
    report.push(result);
    console.log(' done');
    console.log(`  bodyBg: ${result.checks.bodyBg}`);
    console.log(`  h1Font: ${result.checks.h1Font}`);
    console.log(`  headingFonts: ${result.checks.headingFonts?.join(', ')}`);
    console.log(`  hasCombo: ${result.checks.hasCombo}`);
    if (result.errors.length) console.log(`  ERRORS: ${result.errors.join('; ')}`);
  }

  // Capture overlay
  process.stdout.write('\nCapturing menu overlay mobile...');
  const overlayResult = await captureMenuOverlayMobile(browser);
  console.log(' done');
  console.log(`  overlayFound: ${overlayResult.overlayState.overlayFound}`);
  console.log(`  overlayVisible: ${overlayResult.overlayState.overlayVisible}`);
  console.log(`  cardCount: ${overlayResult.overlayState.cardCount}`);
  if (overlayResult.errors.length) console.log(`  ERRORS: ${overlayResult.errors.join('; ')}`);
  report.push(overlayResult);

  // Capture product sheet
  process.stdout.write('\nCapturing product sheet mobile...');
  const sheetResult = await captureProductSheetMobile(browser);
  console.log(' done');
  console.log(`  sheetFound: ${sheetResult.sheetState.sheetFound}`);
  console.log(`  sheetOpen: ${sheetResult.sheetState.sheetOpen}`);
  console.log(`  hasImg: ${sheetResult.sheetState.hasImg}`);
  console.log(`  titleText: ${sheetResult.sheetState.titleText}`);
  if (sheetResult.errors.length) console.log(`  ERRORS: ${sheetResult.errors.join('; ')}`);
  report.push(sheetResult);

  // Capture cart
  process.stdout.write('\nCapturing cart with 3 items mobile...');
  const cartResult = await captureCartMobile(browser);
  console.log(' done');
  console.log(`  cartFound: ${cartResult.cartState.cartFound}`);
  console.log(`  lineItemCount: ${cartResult.cartState.lineItemCount}`);
  console.log(`  totalText: ${cartResult.cartState.totalText}`);
  console.log(`  savingText: ${cartResult.cartState.savingText}`);
  if (cartResult.errors.length) console.log(`  ERRORS: ${cartResult.errors.join('; ')}`);
  report.push(cartResult);

  await browser.close();

  writeFileSync(`${OUT}/F4-3-report.json`, JSON.stringify(report, null, 2));
  console.log('\n=== Screenshots saved to docs/screenshots/ ===');
}

main().catch(err => {
  console.error('CAPTURE FAILED:', err);
  process.exit(1);
});
