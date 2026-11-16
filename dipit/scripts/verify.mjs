import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base = process.env.DIPITT_TEST_URL || 'http://localhost:3000';
const browser = await chromium.launch({
  channel: 'msedge',
  headless: true,
  args: ['--enable-webgl', '--ignore-gpu-blocklist'],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [],
  checks = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('response', (r) => {
  if (r.status() >= 400 && r.url().includes('/assets/')) errors.push(`${r.status()} ${r.url()}`);
});
await fs.mkdir('docs/qa', { recursive: true });
const check = (name, result = true) => {
  assert.ok(result, name);
  checks.push(name);
  console.log('PASS', name);
};
async function goto(path) {
  const r = await page.goto(base + path, { waitUntil: 'networkidle', timeout: 90000 });
  assert.equal(r.status(), 200);
  await page.locator('.loading-screen').waitFor({ state: 'detached', timeout: 30000 });
  await page.waitForTimeout(500);
}
async function capture(name) {
  await page.screenshot({ path: `docs/qa/${name}.png` });
}
async function noOverflow(name) {
  const metrics = await page.evaluate(() => ({
    width: innerWidth,
    body: document.body.scrollWidth,
    doc: document.documentElement.scrollWidth,
  }));
  check(
    name + ' has no horizontal overflow',
    metrics.body <= metrics.width + 1 && metrics.doc <= metrics.width + 1,
  );
}
await goto('/');
await page.waitForSelector('canvas');
await capture('home-desktop');
check('homepage has a live WebGL canvas', (await page.locator('canvas').count()) === 1);
const first = await page.locator('.home-product-caption a').innerText();
await page.mouse.move(720, 450);
await page.mouse.wheel(0, 500);
await page.waitForTimeout(1500);
check(
  'wheel navigates products',
  (await page.locator('.home-product-caption a').innerText()) !== first,
);
check('homepage wheel does not scroll the document', await page.evaluate(() => scrollY === 0));
await capture('home-wheel');
const beforeDrag = await page.locator('.home-product-caption a').innerText();
await page.mouse.move(1000, 450);
await page.mouse.down();
await page.mouse.move(440, 460, { steps: 18 });
await page.mouse.up();
await page.waitForTimeout(1300);
check(
  'drag navigates products',
  (await page.locator('.home-product-caption a').innerText()) !== beforeDrag,
);
await page.getByRole('button', { name: 'Next sauce', exact: true }).click();
await page.waitForTimeout(1100);
check('carousel arrow controls work');
await page.locator('.home-showcase').focus();
const beforeKey = await page.locator('.home-product-caption a').innerText();
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(1100);
check(
  'carousel keyboard navigation works',
  (await page.locator('.home-product-caption a').innerText()) !== beforeKey,
);
await page.mouse.move(720, 450);
await page.waitForTimeout(400);
await capture('home-hover');
await page.getByRole('button', { name: 'MENU', exact: true }).click();
await page.waitForTimeout(1300);
check('menu opens', (await page.locator('#main-menu').getAttribute('inert')) === null);
await capture('menu-desktop');
await page.keyboard.press('Escape');
check(
  'Escape closes menu',
  (await page.getByRole('button', { name: 'MENU', exact: true }).getAttribute('aria-expanded')) ===
    'false',
);
for (const [label, path] of [
  ['Our Sauces', '/sauces'],
  ['Ingredients', '/ingredients'],
  ['Our Story', '/story'],
  ['Experience', '/experience'],
  ['Contact', '/contact'],
  ['Shop', '/shop'],
  ['Home', '/'],
]) {
  await page.getByRole('button', { name: 'MENU', exact: true }).click();
  await page.waitForTimeout(1100);
  await page.locator('#main-menu').getByRole('link', { name: label, exact: true }).click();
  await page.waitForURL(base + path, { timeout: 45000 });
  await page.waitForFunction(
    () => document.querySelector('.page-transition').getBoundingClientRect().top >= innerHeight - 1,
    { timeout: 30000 },
  );
  await page.waitForTimeout(500);
  check('menu navigates to ' + path);
  if (path !== '/') await capture('route-' + path.slice(1));
}
await page.locator('.product-stage canvas').waitFor({ state: 'visible' });
await page.mouse.move(720, 450);
await page.waitForTimeout(500);
await page.mouse.click(720, 450);
await page.waitForURL(/\/sauces\//, { timeout: 30000 });
await page.waitForTimeout(1200);
check('perspective product click opens its product page');
await goto('/ingredients');
await page.locator('.gallery-photo').first().click();
check('photo gallery opens', await page.locator('.lightbox').isVisible());
await page.getByRole('button', { name: 'Next photograph', exact: true }).click();
await capture('gallery-lightbox');
await page.keyboard.press('Escape');
check('photo gallery closes with Escape', (await page.locator('.lightbox').count()) === 0);
await goto('/shop');
check(
  'all DIPITT 3D product renders are referenced',
  await page
    .locator('.product-tile img')
    .evaluateAll(
      (imgs) =>
        imgs.length === 22 &&
        imgs.every((i) => i.getAttribute('src').startsWith('/assets/models/')),
    ),
);
await page.getByRole('button', { name: 'Smoky', exact: false }).click();
check(
  'category filter returns the two smoky sauces',
  (await page.locator('.product-tile').count()) === 2,
);
await page.getByRole('button', { name: 'All', exact: false }).click();
await page.locator('.product-tile[href="/sauces/hot-sauce"]').click();
await page.waitForURL(base + '/sauces/hot-sauce');
await page.waitForTimeout(1300);
check('product tile opens correct product');
await capture('product-desktop');
await page.getByRole('button', { name: 'Rotate bottle right', exact: true }).click();
check('3D bottle rotation control responds');
await page.getByRole('button', { name: '60ml', exact: true }).click();
await page.getByRole('button', { name: 'Increase quantity', exact: true }).click();
await page.getByRole('button', { name: 'ADD TO BAG', exact: false }).click();
check(
  'adding a sized product updates the bag',
  (await page.locator('.bag-link').innerText()).replace(/\s+/g, ' ').trim() === 'BAG (2)',
);
await page.locator('.purchase-note a').click();
await page.waitForURL(base + '/cart');
await page.waitForTimeout(1000);
check(
  'bag calculates sized quantity price',
  (await page.locator('.summary-line.total').innerText()).includes('450'),
);
await page.reload({ waitUntil: 'networkidle' });
await page.locator('.loading-screen').waitFor({ state: 'detached', timeout: 30000 });
check('shopping bag persists across reload', (await page.locator('.cart-item').count()) === 1);
await capture('cart-desktop');
await page.getByRole('button', { name: 'REVIEW ORDER', exact: false }).click();
check(
  'order review explains demo status',
  await page
    .locator('.checkout-notice')
    .innerText()
    .then((s) => s.includes('no order will be placed')),
);
await page.getByRole('button', { name: 'Increase Hot Sauce quantity', exact: true }).click();
check(
  'bag quantity updates total',
  (await page.locator('.summary-line.total').innerText()).includes('675'),
);
await page.getByRole('button', { name: 'Remove', exact: true }).click();
check('removing product shows empty bag', await page.locator('.empty-bag').isVisible());
for (const slug of ['peri-peri-garlic', 'smokey-bbq-sauce', 'chipotle-sauce', 'sriracha-sauce']) {
  await goto('/sauces/' + slug);
  check(slug + ' detail page loads', await page.locator('h1').innerText().then(Boolean));
}
await goto('/contact');
await page.getByLabel('Your name').fill('DIPITT test');
await page.getByLabel('Email address').fill('test@example.com');
await page.getByLabel('Your message').fill('Testing the local contact preview.');
await page.getByRole('button', { name: 'PREVIEW MESSAGE', exact: false }).click();
check(
  'contact form validates and explains delivery state',
  (await page.locator('.form-note').innerText()).includes('has not been sent'),
);
for (const [width, height] of [
  [1440, 900],
  [1920, 1080],
  [768, 1024],
  [390, 844],
]) {
  await page.setViewportSize({ width, height });
  await goto('/');
  await page.waitForTimeout(900);
  await noOverflow(`home ${width}x${height}`);
  await capture(`home-${width}x${height}`);
  await page.getByRole('button', { name: 'MENU', exact: true }).click();
  await page.waitForTimeout(1100);
  await noOverflow(`menu ${width}`);
  await capture(`menu-${width}x${height}`);
  await page.keyboard.press('Escape');
  for (const path of [
    '/sauces',
    '/ingredients',
    '/story',
    '/experience',
    '/contact',
    '/shop',
    '/cart',
    '/sauces/hot-sauce',
    '/privacy',
  ]) {
    await goto(path);
    await noOverflow(`${path} ${width}`);
    if (width === 390 || width === 1440)
      await capture(`${path.slice(1).replaceAll('/', '-')}-${width}`);
  }
}
const mobileContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
const mobile = await mobileContext.newPage();
await mobile.goto(base, { waitUntil: 'networkidle' });
await mobile.locator('.loading-screen').waitFor({ state: 'detached', timeout: 30000 });
await mobile.waitForTimeout(800);
const client = await mobileContext.newCDPSession(mobile);
const beforeTouch = await mobile.locator('.home-product-caption a').innerText();
await client.send('Input.dispatchTouchEvent', {
  type: 'touchStart',
  touchPoints: [{ x: 320, y: 420 }],
});
for (let x = 300; x >= 65; x -= 20)
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x, y: 420 }],
  });
await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await mobile.waitForTimeout(1300);
check(
  'mobile touch swipe changes product',
  (await mobile.locator('.home-product-caption a').innerText()) !== beforeTouch,
);
await mobile.screenshot({ path: 'docs/qa/mobile-touch.png' });
await mobileContext.close();
const reducedContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: 'reduce',
});
const reduced = await reducedContext.newPage();
await reduced.goto(base, { waitUntil: 'networkidle' });
await reduced.locator('.loading-screen').waitFor({ state: 'detached', timeout: 30000 });
check('reduced-motion mode loads');
await reducedContext.close();
check('no browser runtime errors or missing assets', errors.length === 0);
await fs.writeFile(
  'docs/qa/results.json',
  JSON.stringify({ date: '2026-11-16', base, checks, errors }, null, 2),
);
await context.close();
await browser.close();
console.log(`${checks.length} checks passed.`);
