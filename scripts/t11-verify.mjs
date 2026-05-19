import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new' });

async function shot(viewport, label) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Open the menu overlay
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('temaky:open-menu')));
  await new Promise(r => setTimeout(r, 350));

  // 1) Initial state — autofocus check
  const focusInfo = await page.evaluate(() => {
    const ae = document.activeElement;
    return {
      tag: ae?.tagName,
      id: ae?.id,
      type: ae instanceof HTMLInputElement ? ae.type : null,
    };
  });
  console.log(`[${label}] activeElement after open:`, focusInfo);

  await page.screenshot({ path: `_raw_assets/t11/${label}-01-open.png` });

  // 2) Scroll down inside menu list to test scroll-spy bidirectional behavior
  await page.evaluate(() => {
    const body = document.getElementById('menu-body');
    if (body) body.scrollTop = 1800;
  });
  await new Promise(r => setTimeout(r, 600));

  const chipState = await page.evaluate(() => {
    const scroll = document.getElementById('menu-cats-scroll');
    const active = document.querySelector('.chip.on');
    if (!active || !scroll) return null;
    const cr = active.getBoundingClientRect();
    const sr = scroll.getBoundingClientRect();
    return {
      activeCat: active.dataset.cat,
      scrollLeft: scroll.scrollLeft,
      chipCenter: cr.left + cr.width / 2,
      stripCenter: sr.left + sr.width / 2,
      diff: Math.round((cr.left + cr.width / 2) - (sr.left + sr.width / 2)),
    };
  });
  console.log(`[${label}] scroll-spy chip state:`, chipState);

  await page.screenshot({ path: `_raw_assets/t11/${label}-02-scrollspy.png` });

  // 3) Empty state — type a query that matches nothing
  await page.evaluate(() => {
    const body = document.getElementById('menu-body');
    if (body) body.scrollTop = 0;
  });
  await new Promise(r => setTimeout(r, 200));

  await page.evaluate(() => {
    const inp = document.getElementById('menu-search');
    inp.focus();
    inp.value = 'xyz123';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await new Promise(r => setTimeout(r, 250));

  const emptyState = await page.evaluate(() => {
    const noRes = document.getElementById('menu-no-res');
    const q = document.getElementById('menu-empty-q');
    const tags = Array.from(document.querySelectorAll('.menu-empty-tag')).map(t => t.dataset.suggest);
    return {
      hidden: noRes?.hidden,
      queryEcho: q?.textContent,
      tags,
    };
  });
  console.log(`[${label}] empty state:`, emptyState);

  await page.screenshot({ path: `_raw_assets/t11/${label}-03-empty.png` });

  // 4) Tap "rollo" suggestion -> should filter and show results
  await page.click('.menu-empty-tag[data-suggest="rollo"]');
  await new Promise(r => setTimeout(r, 300));

  const afterSuggest = await page.evaluate(() => {
    const inp = document.getElementById('menu-search');
    const visible = document.querySelectorAll('.pcard:not([hidden])').length;
    const noResHidden = document.getElementById('menu-no-res')?.hidden;
    return { value: inp.value, visibleCards: visible, noResHidden };
  });
  console.log(`[${label}] after rollo suggestion:`, afterSuggest);

  await page.screenshot({ path: `_raw_assets/t11/${label}-04-rollo.png` });

  // 5) Clear input -> grid should restore
  await page.evaluate(() => {
    const inp = document.getElementById('menu-search');
    inp.value = '';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await new Promise(r => setTimeout(r, 250));

  const restored = await page.evaluate(() => {
    const visible = document.querySelectorAll('.pcard:not([hidden])').length;
    const noResHidden = document.getElementById('menu-no-res')?.hidden;
    return { visibleCards: visible, noResHidden };
  });
  console.log(`[${label}] after clearing input:`, restored);

  await page.screenshot({ path: `_raw_assets/t11/${label}-05-restored.png` });

  await page.close();
}

await shot({ width: 375, height: 812, isMobile: true, hasTouch: true }, 'mobile');
await shot({ width: 1440, height: 900 }, 'desktop');

await browser.close();
console.log('Done.');
