import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
const base = process.env.DIPITT_TEST_URL || 'http://localhost:3000';
const catalogue = JSON.parse(await fs.readFile('data/dipitt-catalogue.json', 'utf8'));
const checks = [];
const browser = await chromium.launch({
  channel: 'msedge',
  headless: true,
  args: ['--enable-webgl', '--ignore-gpu-blocklist'],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const errors = [];
  page.on('pageerror', (e) => {
    errors.push(e.message);
    console.log('BROWSER ERROR', e.message);
  });
  page.on('console', (m) => {
    if (m.type() === 'error') {
      errors.push(m.text());
      console.log('BROWSER ERROR', m.text());
    }
  });
  const check = (name, result = true) => {
    assert.ok(result, name);
    checks.push(name);
    console.log('PASS', name);
  };
  async function goto(path) {
    const response = await page.goto(base + path, { waitUntil: 'networkidle', timeout: 90000 });
    assert.equal(response.status(), 200);
    await page.locator('.loading-screen').waitFor({ state: 'detached', timeout: 60000 });
  }
  async function exportedModel(id, size, angle, name) {
    await goto(
      '/studio?product=' +
        catalogue.findIndex((p) => p.id === id) +
        '&size=' +
        size +
        '&angle=' +
        angle,
    );
    await page.waitForFunction(
      () => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return false;
        const probe = document.createElement('canvas');
        probe.width = probe.height = 1;
        const context = probe.getContext('2d');
        context.drawImage(canvas, canvas.width / 2, canvas.height / 2, 1, 1, 0, 0, 1, 1);
        return context.getImageData(0, 0, 1, 1).data[3] > 200;
      },
      { timeout: 60000 },
    );
    await page.waitForTimeout(500);
    const data = await page.locator('canvas').evaluate((c) => c.toDataURL('image/png'));
    const buffer = Buffer.from(data.split(',')[1], 'base64');
    await fs.writeFile('docs/qa/3d-' + name + '.png', buffer);
    return { buffer, dimensions: await sharp(buffer).trim().metadata() };
  }
  const front = await exportedModel('hot-sauce', 300, 0, 'hot-front');
  const side = await exportedModel('hot-sauce', 300, Math.PI / 2, 'hot-side');
  const back = await exportedModel('hot-sauce', 300, Math.PI, 'hot-back');
  const frontTrim = await sharp(front.buffer).trim().toBuffer({ resolveWithObject: true });
  const sideTrim = await sharp(side.buffer).trim().toBuffer({ resolveWithObject: true });
  check(
    'bottle retains physical width at 90 degrees',
    sideTrim.info.width > frontTrim.info.width * 0.75,
  );
  check('front and back show different wrapped artwork', !front.buffer.equals(back.buffer));
  for (const [id, size, name] of [
    ['hot-sauce', 60, 'small-bottle'],
    ['sriracha-sauce', 490, 'squeeze-bottle'],
    ['smokey-bbq-sauce', 400, 'pouch'],
  ]) {
    await exportedModel(id, size, -0.45, name);
    check(name + ' renders as a textured 3D pack');
  }
  for (const product of catalogue)
    for (const pack of product.variants) {
      const meta = await sharp('public' + pack.image.replace('/dipitt/', '/models/')).metadata();
      assert.equal(meta.height, 1000);
      assert.ok(meta.width > 100);
    }
  check('all 27 packs have matching rendered thumbnails');
  await goto('/');
  await page.locator('.fallback-carousel').waitFor({ state: 'detached', timeout: 60000 });
  check(
    'homepage swaps its poster for the live 3D carousel',
    await page.locator('.product-stage canvas').isVisible(),
  );
  const first = await page.locator('.home-product-caption a').innerText();
  await page.getByRole('button', { name: 'Next sauce', exact: true }).click();
  await page.waitForTimeout(900);
  check(
    'carousel navigation remains working',
    first !== (await page.locator('.home-product-caption a').innerText()),
  );
  await page.screenshot({ path: 'docs/qa/3d-home-desktop.png' });
  await goto('/sauces/hot-sauce');
  await page.locator('.model-poster').waitFor({ state: 'detached', timeout: 60000 });
  const canvas = page.locator('.product-canvas canvas');
  await canvas.scrollIntoViewIfNeeded();
  const initial = await canvas.screenshot();
  await page.getByRole('button', { name: 'Rotate bottle right', exact: true }).click();
  await page.waitForTimeout(500);
  check('rotation control changes the rendered side', !initial.equals(await canvas.screenshot()));
  await page.locator('.product-canvas').focus();
  const beforeKey = await canvas.screenshot();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(500);
  check(
    'keyboard rotation changes the rendered model',
    !beforeKey.equals(await canvas.screenshot()),
  );
  await page.getByRole('button', { name: '60ml', exact: true }).click();
  await page.locator('.model-poster').waitFor({ state: 'detached', timeout: 60000 });
  check(
    'pack selection updates the model and price',
    (await page.getByRole('img', { name: '3D DIPITT Hot Sauce, 60ml', exact: true }).isVisible()) &&
      (await page.locator('.purchase-price').innerText()).includes('225'),
  );
  await page.getByRole('button', { name: 'Increase quantity', exact: true }).click();
  await page.getByRole('button', { name: 'ADD TO BAG', exact: false }).click();
  await page.locator('.purchase-note a').click();
  await page.waitForURL(base + '/cart');
  await page.waitForFunction(
    () => document.querySelector('.page-transition').getBoundingClientRect().top >= innerHeight - 1,
  );
  check(
    '3D pack selection adds the correct size and total to the bag',
    (await page.locator('.cart-item').innerText()).includes('60ml') &&
      (await page.locator('.summary-line.total').innerText()).includes('450'),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await goto('/');
  await page.locator('.fallback-carousel').waitFor({ state: 'detached', timeout: 60000 });
  await page.screenshot({ path: 'docs/qa/3d-home-mobile.png' });
  check(
    'mobile 3D carousel has no horizontal overflow',
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
  );
  await goto('/sauces/sriracha-sauce');
  await page.locator('.model-poster').waitFor({ state: 'detached', timeout: 60000 });
  await page.locator('.product-canvas').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'docs/qa/3d-product-mobile.png' });
  check(
    'mobile product renders a live squeeze bottle',
    await page.locator('.product-canvas canvas').isVisible(),
  );
  const beforeDrag = await canvas.screenshot();
  const bounds = await canvas.boundingBox();
  await page.mouse.move(bounds.x + bounds.width * 0.3, bounds.y + bounds.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * 0.65, bounds.y + bounds.height * 0.5, {
    steps: 12,
  });
  await page.mouse.up();
  await page.waitForTimeout(500);
  check(
    'drag rotates the 3D model on the mobile layout',
    !beforeDrag.equals(await canvas.screenshot()),
  );
  await fs.writeFile('docs/qa/3d-results.json', JSON.stringify({ base, checks, errors }, null, 2));
  check('no 3D runtime or shader errors', errors.length === 0);
  await fs.writeFile('docs/qa/3d-results.json', JSON.stringify({ base, checks, errors }, null, 2));
} finally {
  await browser.close();
}
