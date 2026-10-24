// Stage A: open a public page in a fresh cloud browser and save a new screenshot.
// Prints only non-sensitive status lines (this repository is public).
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const url = process.env.TARGET_URL || 'https://example.com';
mkdirSync('out', { recursive: true });
const startedAt = new Date().toISOString();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
let status = 'ok';
try {
  const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  const title = await page.title();
  await page.screenshot({ path: 'out/screenshot.png', fullPage: false });
  writeFileSync('out/meta.json', JSON.stringify({ startedAt, capturedAt: new Date().toISOString(), httpStatus: res && res.status(), title }, null, 2));
  console.log('CAPTURE_OK', res && res.status());
} catch (e) {
  status = 'error';
  writeFileSync('out/meta.json', JSON.stringify({ startedAt, error: String(e && e.name) }, null, 2));
  console.log('CAPTURE_FAILED', e && e.name);
  process.exitCode = 1;
} finally {
  await browser.close();
}
