// Puppeteer capture for F3-4: overlay, sheet, cart
import puppeteer from 'puppeteer';

const URL = process.env.URL || 'http://localhost:4322/';
const OUT = 'docs/screenshots';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 820 },
  });

  const report = [];

  async function newPage() {
    const page = await browser.newPage();
    page.on('pageerror', err => report.push(`[pageerror] ${err.message}`));
    page.on('console', msg => {
      if (msg.type() === 'error') report.push(`[console.error] ${msg.text()}`);
    });
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
    return page;
  }

  // 1) Overlay open
  {
    const page = await newPage();
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('temaky:open-menu')));
    await sleep(600);
    await page.screenshot({ path: `${OUT}/F3-4-overlay.png`, fullPage: false });
    const cards = await page.$$eval('.pcard', els => els.length);
    const visibleCards = await page.$$eval('.pcard:not([hidden])', els => els.length);
    report.push(`overlay: ${cards} cards rendered, ${visibleCards} visible (expected all visible on Todo)`);
    await page.close();
  }

  // 2) Sheet open (philadelphia has mods)
  {
    const page = await newPage();
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('temaky:open-menu')));
    await sleep(300);
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('temaky:open-sheet', { detail: 'philadelphia' })));
    await sleep(600);
    const sheetOpen = await page.evaluate(() =>
      document.getElementById('psheet')?.classList.contains('open'));
    report.push(`sheet open state: ${sheetOpen}`);
    await page.screenshot({ path: `${OUT}/F3-4-sheet.png`, fullPage: false });
    await page.close();
  }

  // 3) Cart with 2 classic items → verify bundle saving
  {
    const page = await newPage();

    // Seed cart via the proper event flow: open sheet, add 2 philadelphias + 1 combo
    await page.evaluate(() => {
      // add 2 philadelphias (no mods selected - extras-rollo is optional) as qty=2
      const setA = { sels: {}, notes: '' };
      const prod = { id: 'philadelphia', cat: 'clasicos-frios', name: 'Philadelphia',
        desc: '', price: 125, img: '', bundle: 'clasico' };
      window.dispatchEvent(new CustomEvent('temaky:add-cart', {
        detail: { product: prod, qty: 2, sels: {}, notes: '' },
      }));
      const prod2 = { id: 'california', cat: 'clasicos-frios', name: 'California',
        desc: '', price: 125, img: '', bundle: 'clasico' };
      window.dispatchEvent(new CustomEvent('temaky:add-cart', {
        detail: { product: prod2, qty: 1, sels: {}, notes: '' },
      }));
    });
    await sleep(200);
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('temaky:open-cart')));
    await sleep(500);
    const state = await page.evaluate(() => {
      const total = document.querySelector('.cl.total .cl-val')?.textContent?.trim();
      const saving = document.querySelector('.cl.saving .cl-val')?.textContent?.trim();
      const items = document.querySelectorAll('.ci').length;
      return { total, saving, items };
    });
    report.push(`cart: ${state.items} line items, total=${state.total}, saving=${state.saving}`);
    await page.screenshot({ path: `${OUT}/F3-4-cart.png`, fullPage: false });
    await page.close();
  }

  await browser.close();
  console.log('---REPORT---');
  report.forEach(r => console.log(r));
}

main().catch(err => {
  console.error('CAPTURE FAILED:', err);
  process.exit(1);
});
