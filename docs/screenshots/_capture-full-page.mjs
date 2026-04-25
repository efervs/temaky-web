// Full-page screenshot of assembled index
import puppeteer from 'puppeteer';

const BASE = process.env.URL || 'http://localhost:4325/';
const OUT = 'docs/screenshots';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(400);

  // Mobile: above the fold
  await page.screenshot({ path: `${OUT}/F3-full-mobile-top.png` });

  // Scroll to StripBar area
  await page.evaluate(() => window.scrollBy(0, window.innerHeight));
  await sleep(200);
  await page.screenshot({ path: `${OUT}/F3-full-mobile-strip.png` });

  // Scroll to SocialProof
  await page.evaluate(() => document.querySelector('section.bg-\\[\\#111\\]')?.scrollIntoView({ behavior: 'instant' }));
  await sleep(200);
  await page.screenshot({ path: `${OUT}/F3-full-mobile-proof.png` });

  // Scroll to Location
  await page.evaluate(() => document.getElementById('ubic')?.scrollIntoView({ behavior: 'instant' }));
  await sleep(300);
  await page.screenshot({ path: `${OUT}/F3-full-mobile-location.png` });

  // Scroll to Footer
  await page.evaluate(() => document.querySelector('footer')?.scrollIntoView({ behavior: 'instant' }));
  await sleep(200);
  await page.screenshot({ path: `${OUT}/F3-full-mobile-footer.png` });

  // Check all sections present
  const checks = await page.evaluate(() => ({
    strip: !!document.querySelector('.strip'),
    process: document.querySelectorAll('.strip').length > 0,
    socialProof: document.querySelectorAll('.pc').length,
    locationSection: !!document.getElementById('ubic'),
    footer: !!document.querySelector('footer'),
    wafab: !!document.querySelector('.waf'),
    reservaSection: !!document.getElementById('reserva'),
    offhoursModal: !!document.getElementById('offhours-bd'),
    menuOverlay: !!document.getElementById('menu-overlay'),
    cartOverlay: !!document.getElementById('cart-overlay'),
  }));

  console.log('Section presence checks:');
  Object.entries(checks).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

  if (errors.length) {
    console.log('\nPage errors:');
    errors.forEach(e => console.error(' ', e));
  }

  await browser.close();
  console.log('\nScreenshots saved to docs/screenshots/');
}

main().catch(err => {
  console.error('FAILED:', err);
  process.exit(1);
});
