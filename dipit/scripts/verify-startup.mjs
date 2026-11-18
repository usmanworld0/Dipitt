import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const phase = process.argv[2] || 'after';
const browser = await chromium.launch({
  channel: 'msedge',
  headless: true,
  args: ['--enable-webgl', '--ignore-gpu-blocklist'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => {
    window.startup = { revealAt: null, canvasAt: null, modelAt: null, tasks: [], gaps: [] };
    new PerformanceObserver((list) => {
      for (const task of list.getEntries())
        window.startup.tasks.push({ at: task.startTime, duration: task.duration });
    }).observe({ type: 'longtask', buffered: true });
    let last = performance.now();
    const sample = (now) => {
      const s = window.startup;
      s.gaps.push({ at: last, duration: now - last });
      last = now;
      if (s.canvasAt === null && document.querySelector('.product-stage canvas')) s.canvasAt = now;
      if (s.revealAt === null && document.querySelector('.home-showcase.is-ready'))
        s.revealAt = now;
      if (
        s.modelAt === null &&
        document.querySelector('.product-stage canvas') &&
        !document.querySelector('.fallback-carousel')
      )
        s.modelAt = now;
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(process.env.DIPITT_TEST_URL || 'http://localhost:3000', {
    waitUntil: 'networkidle',
    timeout: 90000,
  });
  await page.locator('.loading-screen').waitFor({ state: 'detached', timeout: 90000 });
  await page.locator('.fallback-carousel').waitFor({ state: 'detached', timeout: 60000 });
  await page.waitForTimeout(2700);
  const result = await page.evaluate(() => {
    const s = window.startup;
    const tasks = s.tasks.filter((t) => t.at >= s.revealAt && t.at < s.revealAt + 2500);
    const gaps = s.gaps.filter((t) => t.at >= s.revealAt && t.at < s.revealAt + 2500);
    return {
      revealAt: s.revealAt,
      canvasAt: s.canvasAt,
      modelAt: s.modelAt,
      readyBeforeReveal: s.modelAt <= s.revealAt,
      visibleLongTasks: tasks,
      maxVisibleTaskMs: Math.max(0, ...tasks.map((t) => t.duration)),
      maxVisibleFrameGapMs: Math.max(0, ...gaps.map((t) => t.duration)),
    };
  });
  result.errors = errors;
  console.log(JSON.stringify(result));
  await fs.writeFile('docs/qa/startup-' + phase + '.json', JSON.stringify(result, null, 2));
  const before = await page.locator('.home-product-caption a').innerText();
  await page.getByRole('button', { name: 'Next sauce', exact: true }).click();
  await page.waitForTimeout(800);
  if (before === (await page.locator('.home-product-caption a').innerText()))
    throw Error('Carousel failed after reveal');
  if (phase === 'after' && !result.readyBeforeReveal)
    throw Error('Scene was revealed before warmup completed');
  if (errors.length) throw Error(errors.join('\n'));
  console.log('PASS startup ' + phase + ' and immediate carousel interaction');
} finally {
  await browser.close();
}
