import puppeteer from 'puppeteer';

const BASE = 'http://localhost:4321/';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await page.goto(BASE, { waitUntil: 'networkidle2' });

  // Scroll to footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(400);

  // Click "Menú completo"
  await page.evaluate(() => {
    const links = [...document.querySelectorAll('footer a')];
    const menuLink = links.find(a => a.textContent.includes('Menú completo'));
    if (menuLink) menuLink.click();
  });
  await sleep(600);

  const overlayOpen = await page.evaluate(() => {
    const overlay = document.getElementById('menu-overlay');
    return !overlay?.hidden && overlay?.classList.contains('open');
  });

  console.log(`Footer "Menú completo" → overlay open: ${overlayOpen}`);
  console.log(`JS errors: ${errors.length > 0 ? errors.join('; ') : 'none'}`);

  await page.screenshot({ path: 'docs/screenshots/F4-3-footer-menu-verify.png', fullPage: false });
  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
