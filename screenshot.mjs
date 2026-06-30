// screenshot.mjs — capture a full-page screenshot of a URL with Puppeteer.
// Uses the Chrome already cached at ~/.cache/puppeteer (auto-detected).
//
//   node screenshot.mjs http://localhost:3000
//   node screenshot.mjs http://localhost:3000 hero   # adds a label suffix
//
// Saves to "./temporary screenshots/screenshot-N.png" (auto-incremented, never
// overwritten). With a label: screenshot-N-label.png.
import puppeteer from 'puppeteer';
import { readdir, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const url = process.argv[2];
const label = process.argv[3];

if (!url) {
  console.error('Usage: node screenshot.mjs <url> [label]');
  process.exit(1);
}
if (url.startsWith('file://')) {
  console.error(
    'Refusing to screenshot a file:// URL. Run `node serve.mjs` and use http://localhost:3000.',
  );
  process.exit(1);
}

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const OUT_DIR = join(ROOT, 'temporary screenshots');
await mkdir(OUT_DIR, { recursive: true });

// Next auto-incremented index.
let next = 1;
try {
  const files = await readdir(OUT_DIR);
  const nums = files
    .map((f) => f.match(/^screenshot-(\d+)/))
    .filter(Boolean)
    .map((m) => parseInt(m[1], 10));
  if (nums.length) next = Math.max(...nums) + 1;
} catch {}

const name = label
  ? `screenshot-${next}-${label}.png`
  : `screenshot-${next}.png`;
const outPath = join(OUT_DIR, name);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.screenshot({ path: outPath, fullPage: true });
  console.log(`Saved ${outPath}`);
} finally {
  await browser.close();
}
