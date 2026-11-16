import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const base = process.env.DIPITT_TEST_URL || 'http://localhost:3000';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('.loading-screen').waitFor({ state: 'detached' });
  for (const [width, height] of [
    [1440, 900],
    [1920, 1080],
    [768, 1024],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `docs/qa/final-home-${width}x${height}.png` });
    assert.ok(await page.evaluate(() => document.body.scrollWidth <= innerWidth + 1));
    console.log(`PASS final home ${width}x${height}`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [path, selector, name] of [
    ['/sauces', '.product-collection', 'collection-scrolled'],
    ['/story', '.story-section', 'story-scrolled'],
    ['/sauces/hot-sauce', '.product-buy-grid', 'product-purchase'],
  ]) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.locator('.loading-screen').waitFor({ state: 'detached' });
    await page.locator(selector).first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `docs/qa/final-${name}.png` });
  }
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'docs/qa/final-footer.png' });
  assert.deepEqual(errors, []);
  console.log('PASS final scrolled-page visual captures and no runtime errors');
} finally {
  await browser.close();
}
