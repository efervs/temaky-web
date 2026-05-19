import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';

const URL = process.argv[2] || 'http://localhost:4321';
mkdirSync('_raw_assets/t13', { recursive: true });

const browser = await puppeteer.launch({ headless: 'new' });

// Mobile 375 — hero con poster + botón Ver video
{
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: '_raw_assets/t13/hero-mobile-375.png', fullPage: false });
  console.log('OK hero-mobile-375.png');
  await page.close();
}

// Desktop 1440 — hero con video corriendo
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: '_raw_assets/t13/hero-desktop-1440.png', fullPage: false });
  console.log('OK hero-desktop-1440.png');
  await page.close();
}

// Desktop 1440 — Maps placeholder (scroll a la sección)
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const el = document.getElementById('ubic');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: '_raw_assets/t13/maps-placeholder-1440.png', fullPage: false });
  console.log('OK maps-placeholder-1440.png');
  await page.close();
}

// Mobile 375 — Maps placeholder
{
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const el = document.getElementById('ubic');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: '_raw_assets/t13/maps-placeholder-375.png', fullPage: false });
  console.log('OK maps-placeholder-375.png');
  await page.close();
}

await browser.close();
console.log('Done.');
