import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base = process.env.DIPITT_TEST_URL || 'http://localhost:3000';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const checks = [];
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type.includes('webgl')) return null;
      return original.call(this, type, ...args);
    };
  });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('.loading-screen').waitFor({ state: 'detached' });
  assert.equal(await page.locator('.fallback-carousel button').count(), 3);
  assert.ok(
    await page
      .locator('.fallback-carousel img')
      .evaluateAll((images) => images.every((i) => i.complete && i.naturalWidth > 0)),
  );
  checks.push('WebGL-disabled homepage displays DIPITT 3D model renders');
  await page.locator('.fallback-carousel button').nth(1).click();
  await page.waitForURL(base + '/sauces/hot-sauce');
  await page.waitForFunction(
    () => document.querySelector('.page-transition').getBoundingClientRect().top >= innerHeight - 1,
  );
  await page.waitForSelector('.product-canvas > img');
  checks.push('Fallback bottle opens its product page with its model-render poster');
  await page.screenshot({ path: 'docs/qa/webgl-fallback-mobile.png' });
  await page
    .goto(base + '/not-a-sauce', { waitUntil: 'networkidle' })
    .then((r) => assert.equal(r.status(), 404));
  checks.push('Unknown routes return the branded 404 page');
  await fs.writeFile('docs/qa/fallback-results.json', JSON.stringify({ base, checks }, null, 2));
  checks.forEach((c) => console.log('PASS', c));
} finally {
  await browser.close();
}
