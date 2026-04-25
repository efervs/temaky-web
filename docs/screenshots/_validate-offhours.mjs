// Validate OffHoursModal: two tests
// 1. Direct event dispatch (smoke test)
// 2. Full cart → checkout → submit flow
import puppeteer from 'puppeteer';

const BASE = process.env.URL || 'http://localhost:4325/';
const OUT = 'docs/screenshots';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
    args: ['--no-sandbox'],
  });

  /* ── Test 1: direct event dispatch ── */
  {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });

    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('offhours:open', {
        detail: { pendingUrl: 'https://wa.me/528127474440?text=Test%20pedido' },
      }));
    });
    await sleep(500);

    const visible = await page.evaluate(() => {
      const bd = document.getElementById('offhours-bd');
      return bd && !bd.hidden;
    });
    const hora = await page.evaluate(() =>
      document.getElementById('oh-mty-hora')?.textContent ?? '—');

    console.log(`[Test 1] Modal visible via direct event: ${visible}`);
    console.log(`[Test 1] Monterrey time: ${hora}`);

    await page.screenshot({ path: `${OUT}/F3-offhours-direct.png` });
    console.log('[Test 1] Screenshot: F3-offhours-direct.png');
    if (errors.length) errors.forEach(e => console.error('[pageerror]', e));
    await page.close();
  }

  /* ── Test 2: full cart→checkout flow ── */
  {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => {
      if (m.type() === 'error') errors.push('[console] ' + m.text());
    });
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });

    // Add item to cart
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('temaky:add-cart', {
        detail: {
          product: { id: 'philadelphia', cat: 'clasicos-frios', name: 'Philadelphia',
            desc: '', price: 125, img: '', bundle: 'clasico' },
          qty: 1, sels: {}, notes: '',
        },
      }));
    });
    await sleep(300);

    // Open cart
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('temaky:open-cart')));
    await sleep(500);

    const cartOpen = await page.evaluate(() => {
      const ov = document.getElementById('cart-overlay');
      return ov && ov.classList.contains('open') && !ov.hidden;
    });
    const checkoutBtn = await page.evaluate(() => !!document.getElementById('cart-checkout'));
    console.log(`[Test 2] Cart open: ${cartOpen}, #cart-checkout exists: ${checkoutBtn}`);

    // Click "Enviar pedido"
    if (checkoutBtn) {
      await page.evaluate(() => {
        document.getElementById('cart-checkout')?.click();
      });
      await sleep(400);
    }

    const step2 = await page.evaluate(() => {
      return document.getElementById('cart-overlay')?.classList.contains('step-2');
    });
    console.log(`[Test 2] Cart step-2 active: ${step2}`);

    // Fill name
    const nameVisible = await page.evaluate(() => {
      const el = document.getElementById('ck-name');
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    console.log(`[Test 2] #ck-name visible: ${nameVisible}`);

    await page.evaluate(() => {
      const el = document.getElementById('ck-name');
      if (el) (el).value = 'Test Usuario';
    });

    // Submit the checkout form
    await page.evaluate(() => {
      const form = document.getElementById('checkout-form');
      if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    await sleep(600);

    const modalVisible = await page.evaluate(() => {
      const bd = document.getElementById('offhours-bd');
      return bd && !bd.hidden;
    });
    const hora = await page.evaluate(() =>
      document.getElementById('oh-mty-hora')?.textContent ?? '—');

    console.log(`[Test 2] Modal visible after checkout submit: ${modalVisible}`);
    console.log(`[Test 2] Monterrey time: ${hora}`);

    if (modalVisible) {
      console.log('PASS: OffHoursModal opened via cart checkout flow');
      await page.screenshot({ path: `${OUT}/F3-offhours-modal.png` });
      console.log('Screenshot: F3-offhours-modal.png');
    } else {
      console.error('FAIL: Modal did not open via cart checkout flow');
      await page.screenshot({ path: `${OUT}/F3-offhours-debug.png` });
      console.log('Debug screenshot: F3-offhours-debug.png');
    }

    if (errors.length) errors.forEach(e => console.error(e));
    await page.close();
  }

  await browser.close();
}

main().catch(err => {
  console.error('CAPTURE FAILED:', err);
  process.exit(1);
});
