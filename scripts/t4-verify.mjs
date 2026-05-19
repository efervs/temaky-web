import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = 'http://localhost:4321';
const OUT = '_raw_assets/t4';
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ headless: 'new' });

async function makePage() {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await page.reload({ waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(800);
  return page;
}

function buildCartItem(prodId, qty, name, price, bundle) {
  return {
    cartId: `${prodId}-${Date.now()}-x`,
    id: prodId,
    name,
    price,
    modsTotal: 0,
    mods: [],
    notes: '',
    qty,
    lineTotal: price * qty,
    bundle,
  };
}

async function seedCart(page, items) {
  await page.evaluate(arr => {
    localStorage.setItem('temaky-v6-cart', JSON.stringify(arr));
  }, items);
  await page.reload({ waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(700);
  await page.evaluate(() => {
    document.getElementById('cart-fab')?.click();
  });
  await sleep(900);
}

// 1. Empty cart — open cart manually via window event
{
  const page = await makePage();
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('temaky:open-cart'));
  });
  await sleep(900);
  await page.screenshot({ path: `${OUT}/cart-empty-top3.png`, fullPage: false });
  console.log('✓ empty top-3');
  await page.close();
}

// 2. Cart with 1 Philadelphia → expect hint "Agrega 1 Clásico más"
{
  const page = await makePage();
  await seedCart(page, [buildCartItem('philadelphia', 1, 'Philadelphia', 125, 'clasico')]);
  await page.screenshot({ path: `${OUT}/cart-1-philly.png`, fullPage: false });
  const hint = await page.evaluate(() => document.querySelector('.bh-txt')?.textContent);
  console.log(`hint @ 1 Philly: ${hint}`);
  await page.close();
}

// 3. Cart with 2 Philadelphia → expect bundle-tip with SVG, no emoji
{
  const page = await makePage();
  await seedCart(page, [buildCartItem('philadelphia', 2, 'Philadelphia', 125, 'clasico')]);
  await page.screenshot({ path: `${OUT}/cart-2-philly.png`, fullPage: false });
  const bt = await page.evaluate(() => document.querySelector('.bt-lbl')?.textContent);
  const hintBt = await page.evaluate(() => document.querySelector('.bh-txt')?.textContent);
  console.log(`bundle-tip @ 2 Philly: ${bt}`);
  console.log(`hint @ 2 Philly: ${hintBt}`);
  await page.close();
}

// 4. Cart with 3 Philadelphia → expect hint "Lleva 1 Clásico más"
{
  const page = await makePage();
  await seedCart(page, [buildCartItem('philadelphia', 3, 'Philadelphia', 125, 'clasico')]);
  await page.screenshot({ path: `${OUT}/cart-3-philly.png`, fullPage: false });
  const hint = await page.evaluate(() => document.querySelector('.bh-txt')?.textContent);
  console.log(`hint @ 3 Philly: ${hint}`);
  await page.close();
}

// 5. Verify clicking a pick opens the ProductSheet
{
  const page = await makePage();
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('temaky:open-cart'));
  });
  await sleep(800);
  await page.evaluate(() => {
    const pick = document.querySelector('[data-pick="philadelphia"]');
    pick?.click();
  });
  await sleep(1200);
  const sheetOpen = await page.evaluate(() => document.getElementById('psheet')?.classList.contains('open'));
  console.log(`sheet open after pick: ${sheetOpen}`);
  await page.screenshot({ path: `${OUT}/sheet-after-pick.png`, fullPage: false });
  await page.close();
}

await browser.close();
console.log('done');
