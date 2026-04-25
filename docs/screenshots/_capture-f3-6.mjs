// Puppeteer capture for F3-6: ReservationForm mobile 375×812
import puppeteer from 'puppeteer';

const URL = process.env.URL || 'http://localhost:4321/';
const OUT = 'docs/screenshots';

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 375, height: 812, isMobile: true, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();
  page.on('pageerror', err => console.error('[pageerror]', err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') console.error('[console.error]', msg.text());
  });

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });

  // Scroll to #reserva
  await page.evaluate(() => {
    document.getElementById('reserva')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 400));

  await page.screenshot({ path: `${OUT}/F3-6-reserva.png`, fullPage: false });
  console.log('Screenshot saved: F3-6-reserva.png');

  // Verify form elements exist
  const checks = await page.evaluate(() => {
    return {
      section: !!document.getElementById('reserva'),
      form: !!document.getElementById('resForm'),
      nombre: !!document.getElementById('rNombre'),
      correo: !!document.getElementById('rCorreo'),
      wa: !!document.getElementById('rWA'),
      fecha: !!document.getElementById('rFecha'),
      hora: document.getElementById('rHora')?.options.length,
      personas: !!document.getElementById('rPersonas'),
      btn: !!document.getElementById('resBtn')?.disabled,
      sundayWarn: document.getElementById('sundayWarn')?.hidden,
    };
  });
  console.log('Form checks:', JSON.stringify(checks, null, 2));
  console.log(`Time slots: ${checks.hora} options (expected 21 — 1 placeholder + 20 slots)`);

  await browser.close();
}

main().catch(err => {
  console.error('CAPTURE FAILED:', err);
  process.exit(1);
});
