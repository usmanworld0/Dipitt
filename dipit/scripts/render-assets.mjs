import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import sharp from 'sharp';
const catalogue = JSON.parse(await fs.readFile('data/dipitt-catalogue.json', 'utf8'));
const base = process.env.DIPITT_TEST_URL || 'http://localhost:3000';
const browser = await chromium.launch({
  channel: 'msedge',
  headless: true,
  args: ['--enable-webgl', '--ignore-gpu-blocklist'],
});
await fs.mkdir('public/assets/models', { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 700, height: 900 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const [index, product] of catalogue.entries()) {
    for (const pack of product.variants) {
      await page.goto(base + '/studio?product=' + index + '&size=' + pack.size, {
        waitUntil: 'networkidle',
        timeout: 90000,
      });
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
        undefined,
        { timeout: 60000 },
      );
      await page.waitForTimeout(900);
      const data = await page.locator('canvas').evaluate((c) => c.toDataURL('image/png'));
      const output = 'public' + pack.image.replace('/dipitt/', '/models/');
      await sharp(Buffer.from(data.split(',')[1], 'base64'))
        .trim()
        .resize({ height: 1000 })
        .webp({ quality: 92 })
        .toFile(output);
      console.log('Rendered', product.name, pack.size + pack.unit);
    }
  }
  if (errors.length) throw Error(errors.join('\n'));
} finally {
  await browser.close();
}
