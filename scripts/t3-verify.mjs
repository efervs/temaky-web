import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:4321';
const OUT = '_raw_assets/t3-cro';
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ headless: true });

async function shoot(name, w, h, scrollY = 0) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1200));
  if (scrollY > 0) {
    await page.evaluate(y => window.scrollTo(0, y), scrollY);
    await new Promise(r => setTimeout(r, 500));
  }
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(`✔ ${name}.png`);
  await page.close();
}

await shoot('mobile-375-scroll0', 375, 812, 0);
await shoot('mobile-375-scroll400', 375, 812, 400);
await shoot('desktop-1440-scroll0', 1440, 900, 0);
await shoot('desktop-1440-scroll400', 1440, 900, 400);

await browser.close();
console.log('done');
