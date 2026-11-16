import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base = process.env.DIPITT_TEST_URL || 'http://localhost:3000';
const catalogue = JSON.parse(await fs.readFile('data/dipitt-catalogue.json', 'utf8'));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const checks = [];
try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const product of catalogue) {
    const response = await page.goto(base + '/sauces/' + product.id, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(
      (await page.locator('h1').innerText()).replace(/\s+/g, ' ').toLowerCase(),
      product.name.toLowerCase(),
    );
    for (const pack of product.variants) {
      await page
        .locator('.size-options button')
        .filter({ hasText: new RegExp('^' + pack.size + pack.unit + '$') })
        .click();
      await page.locator('.model-poster').waitFor({ state: 'detached', timeout: 60000 });
      assert.ok(
        await page
          .getByRole('img', {
            name: '3D DIPITT ' + product.name + ', ' + pack.size + pack.unit,
            exact: true,
          })
          .isVisible(),
      );
      assert.ok(
        (await page.locator('.purchase-price').innerText()).includes(
          'PKR ' + pack.price.toLocaleString('en-PK'),
        ),
      );
      assert.equal(
        await page.locator('a').filter({ hasText: 'Open the back label' }).getAttribute('href'),
        pack.backImage,
      );
    }
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      product.id + ' overflows',
    );
    checks.push(
      product.id + ': mobile layout, 3D pack selection, original back labels and PKR prices',
    );
    console.log('PASS', checks.at(-1));
    if (product.id === 'worcestershire-sauce') {
      await page.locator('.loading-screen').waitFor({ state: 'detached' });
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: 'docs/qa/dipitt-long-name-mobile.png' });
    }
  }
  assert.deepEqual(errors, []);
  await fs.writeFile(
    'docs/qa/catalogue-results.json',
    JSON.stringify({ base, checks, errors }, null, 2),
  );
} finally {
  await browser.close();
}
