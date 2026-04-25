// Full-page scroll capture for F4-3
import puppeteer from 'puppeteer';

const BASE = 'http://localhost:4321/';
const OUT = 'docs/screenshots';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

  // Mobile full page
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(800);
    await page.screenshot({ path: `${OUT}/F4-3-full-mobile.png`, fullPage: true });
    await page.close();
    console.log('mobile full page done');
  }

  // Desktop 1440 full page
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(800);
    await page.screenshot({ path: `${OUT}/F4-3-full-desktop.png`, fullPage: true });
    await page.close();
    console.log('desktop full page done');
  }

  await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });
