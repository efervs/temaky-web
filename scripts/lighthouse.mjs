#!/usr/bin/env node
/**
 * Lighthouse audit script — T13.
 *
 * Uso:
 *   node scripts/lighthouse.mjs                 # audita http://localhost:4321
 *   node scripts/lighthouse.mjs https://temakysushi.mx
 *
 * Genera reports/lighthouse-YYYY-MM-DD.{html,json} (mobile, devtools throttling).
 * Imprime scores y sugiere si actualizar docs/lighthouse-baseline.md.
 *
 * Reusa puppeteer (ya está en devDependencies) y lighthouse para evitar
 * dependencias nuevas pesadas. Si lighthouse no está instalado, instalarlo:
 *   npm i -D lighthouse chrome-launcher
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const targetUrl = process.argv[2] || 'http://localhost:4321';
const today = new Date().toISOString().slice(0, 10);
const reportsDir = resolve('reports');
mkdirSync(reportsDir, { recursive: true });

let lighthouse;
let chromeLauncher;
try {
  ({ default: lighthouse } = await import('lighthouse'));
  chromeLauncher = await import('chrome-launcher');
} catch (err) {
  console.error('\n[lighthouse] Falta instalar dependencias. Corre:');
  console.error('  npm i -D lighthouse chrome-launcher\n');
  process.exit(1);
}

const chrome = await chromeLauncher.launch({
  chromeFlags: ['--headless=new', '--no-sandbox'],
});

const options = {
  logLevel: 'error',
  output: ['html', 'json'],
  onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  port: chrome.port,
  formFactor: 'mobile',
  throttlingMethod: 'devtools',
  screenEmulation: {
    mobile: true,
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    disabled: false,
  },
};

console.log(`[lighthouse] Auditando ${targetUrl} (mobile)...`);
const runnerResult = await lighthouse(targetUrl, options);

const [htmlReport, jsonReport] = runnerResult.report;
const htmlPath = resolve(reportsDir, `lighthouse-${today}.html`);
const jsonPath = resolve(reportsDir, `lighthouse-${today}.json`);

writeFileSync(htmlPath, htmlReport);
writeFileSync(jsonPath, jsonReport);

const lhr = runnerResult.lhr;
const scores = {
  performance: Math.round(lhr.categories.performance.score * 100),
  accessibility: Math.round(lhr.categories.accessibility.score * 100),
  bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
  seo: Math.round(lhr.categories.seo.score * 100),
};

const metrics = {
  LCP: lhr.audits['largest-contentful-paint']?.displayValue,
  CLS: lhr.audits['cumulative-layout-shift']?.displayValue,
  TBT: lhr.audits['total-blocking-time']?.displayValue,
  FCP: lhr.audits['first-contentful-paint']?.displayValue,
  SI:  lhr.audits['speed-index']?.displayValue,
  TTI: lhr.audits['interactive']?.displayValue,
};

console.log('\n=== Scores (mobile) ===');
console.log(`  Performance:    ${scores.performance}`);
console.log(`  Accessibility:  ${scores.accessibility}`);
console.log(`  Best Practices: ${scores.bestPractices}`);
console.log(`  SEO:            ${scores.seo}`);
console.log('\n=== Core Web Vitals ===');
for (const [k, v] of Object.entries(metrics)) {
  console.log(`  ${k}: ${v ?? 'n/a'}`);
}
console.log(`\n[lighthouse] Reporte HTML: ${htmlPath}`);
console.log(`[lighthouse] Reporte JSON: ${jsonPath}`);

await chrome.kill();

if (scores.performance < 80) {
  console.warn('\n[lighthouse] Performance <80. Revisar bottlenecks en el HTML.');
  process.exitCode = 1;
}
