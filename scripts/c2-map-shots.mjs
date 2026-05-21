import puppeteer from 'puppeteer';
import { mkdir } from 'node:fs/promises';

const OUT = '_raw_assets/c2-map-auto';
await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({ headless: 'new' });

async function shoot(width, height, label) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  // Block iframe network on first load to measure initial behavior
  let mapsRequestedBeforeScroll = false;
  let scrolled = false;
  page.on('request', (req) => {
    if (req.url().includes('maps.google.com') && !scrolled) {
      mapsRequestedBeforeScroll = true;
    }
  });
  await page.goto('http://localhost:4321', { waitUntil: 'networkidle0', timeout: 30000 });
  // Screenshot above-the-fold first
  await page.screenshot({ path: `${OUT}/${label}-top.png`, fullPage: false });

  // Scroll to #ubic
  scrolled = true;
  await page.evaluate(() => {
    document.getElementById('ubic')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  // Wait for iframe injection by IntersectionObserver
  await page.waitForFunction(
    () => !!document.querySelector('#map-container iframe'),
    { timeout: 8000 }
  ).catch(() => {});
  // Give iframe a moment to start rendering its placeholder
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${OUT}/${label}-location.png`, fullPage: false });

  const hasIframe = await page.$('#map-container iframe') !== null;
  const hasButton = await page.$('.map-load-btn') !== null;
  console.log(`[${label}] mapsRequestedBeforeScroll=${mapsRequestedBeforeScroll} hasIframe=${hasIframe} hasButton=${hasButton}`);

  await page.close();
}

await shoot(375, 812, 'mobile');
await shoot(768, 1024, 'tablet');
await shoot(1440, 900, 'desktop');

await browser.close();
console.log('done →', OUT);
