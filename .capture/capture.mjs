// Open a page in a fresh cloud browser and save a new screenshot.
// This repository is public: never print page titles, text or URLs to the log.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const url = process.env.TARGET_URL || 'https://example.com';
mkdirSync('out', { recursive: true });
const startedAt = new Date().toISOString();
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
try {
  const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  const title = await page.title();
  await page.screenshot({ path: 'out/screenshot.png', fullPage: false });
  // meta.json is encrypted together with the image, so the title stays private.
  writeFileSync('out/meta.json', JSON.stringify({
    startedAt,
    capturedAt: new Date().toISOString(),
    httpStatus: res && res.status(),
    finalUrl: page.url(),
    title,
  }, null, 2));
  console.log('CAPTURE_OK');
} catch (e) {
  writeFileSync('out/meta.json', JSON.stringify({ startedAt, error: String(e && e.name) }, null, 2));
  console.log('::error::CAPTURE_FAILED ' + (e && e.name));
  process.exitCode = 1;
} finally {
  await browser.close();
}
