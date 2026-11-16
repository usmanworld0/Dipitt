import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await fs.mkdir('docs/reference', { recursive: true });
await page.goto('https://www.agrumeafarm.it/en', { waitUntil: 'networkidle', timeout: 90000 });
await page.screenshot({ path: 'docs/reference/home-initial.png' });
await page.waitForTimeout(7000);
await page.screenshot({ path: 'docs/reference/home-desktop.png' });
console.log('HOME', await page.locator('body').innerText());
await page.mouse.wheel(0, 700);
await page.waitForTimeout(1400);
await page.screenshot({ path: 'docs/reference/home-wheel.png' });
console.log(
  'SCROLL',
  await page.evaluate(() => ({
    y: scrollY,
    height: document.body.scrollHeight,
    viewport: innerHeight,
  })),
);
await page.locator('.site-menu-toggle').click();
await page.waitForTimeout(1400);
await page.screenshot({ path: 'docs/reference/menu.png' });
console.log('MENU', await page.locator('body').innerText());
for (const [name, path] of [
  ['sauces', 'dispensa'],
  ['ingredients', 'produzione'],
  ['story', 'chi-siamo'],
  ['experience', 'experience'],
  ['contact', 'contatti'],
  ['product', 'dispensa/smeraldo'],
]) {
  await page.goto('https://www.agrumeafarm.it/en/' + path, {
    waitUntil: 'networkidle',
    timeout: 90000,
  });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `docs/reference/${name}.png` });
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `docs/reference/${name}-scroll.png` });
  console.log(name, (await page.locator('body').innerText()).slice(0, 700));
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('https://www.agrumeafarm.it/en', { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(5000);
await page.screenshot({ path: 'docs/reference/home-mobile.png' });
await page.locator('.site-menu-toggle').click();
await page.waitForTimeout(1200);
await page.screenshot({ path: 'docs/reference/menu-mobile.png' });
await browser.close();
