import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';

const URL = process.argv[2] || 'http://localhost:4321';
const OUT = '_raw_assets/c1-hero';
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ headless: 'new' });

async function shoot(width, height, label, mobile = false, reducedMotion = 'no-preference') {
  const page = await browser.newPage();
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: reducedMotion },
  ]);
  await page.setViewport({
    width, height,
    deviceScaleFactor: 1,
    isMobile: mobile,
    hasTouch: mobile,
  });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  // Give video element time to attempt autoplay
  await new Promise(r => setTimeout(r, 1500));

  // Probe state of the video + assert no .hero-play-btn in DOM
  const state = await page.evaluate(() => {
    const v = document.querySelector('.hero-video');
    const btn = document.querySelector('.hero-play-btn, [data-hero-play]');
    return {
      hasButton: !!btn,
      videoExists: !!v,
      paused: v ? v.paused : null,
      readyState: v ? v.readyState : null,
      currentSrc: v ? v.currentSrc : null,
      autoplayAttr: v ? v.hasAttribute('autoplay') : null,
    };
  });
  console.log(label, JSON.stringify(state));

  await page.screenshot({ path: `${OUT}/${label}.png`, fullPage: false });
  await page.close();
}

await shoot(375, 812, 'after-mobile-375', true, 'no-preference');
await shoot(1440, 900, 'after-desktop-1440', false, 'no-preference');
await shoot(1440, 900, 'after-desktop-1440-reduced', false, 'reduce');

await browser.close();
console.log('done');
