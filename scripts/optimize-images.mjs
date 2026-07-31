/**
 * Re-encode the images in public/ to the size they are actually drawn at.
 *
 * The originals were export-quality: 1024 px tool icons rendered into a 20 px
 * box, 1586 px service cards rendered into a 768 px card. The browser paid full
 * price for pixels it then threw away.
 *
 * Every target below is the on-canvas size (design px, from the fixed 1920×919 /
 * 372×832 canvases) multiplied out for a zoomed-up window on a 2× screen, so
 * nothing gets softer than it looks today.
 *
 * Filenames and formats are unchanged — a PNG stays a PNG — so no component has
 * to know this ran. Re-runnable: it skips anything already at or under target.
 *
 *   node scripts/optimize-images.mjs [--dry]
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const DRY = process.argv.includes('--dry');
const ROOT = path.resolve(import.meta.dirname, '..');

/** maxWidth is the longest edge to keep; quality is for lossy re-encodes. */
const RULES = [
  // Drawn at 18–24 design px inside the tools fan, and at h-6 w-6 on the collapsed
  // card spine. 128 px covers a 2× screen on a window zoomed well past 1:1.
  { dir: 'public/icons/tools', maxWidth: 128, quality: 82 },
  { dir: 'public/icons/ecommerce', maxWidth: 160, quality: 82 },
  // Skills rows — full panel width, heavily cropped vertically by object-cover.
  { dir: 'public/skills', maxWidth: 1024, quality: 66 },
  // Service cards cap at max-w-3xl = 768 design px.
  { dir: 'public/services-2026', maxWidth: 1536, quality: 66 },
];

/** One-off files that do not belong to a directory rule. */
const FILES = [
  // Stretched across the whole tools fan, ~1700 design px.
  { file: 'public/tools-panorama-v1.webp', maxWidth: 1600, quality: 64 },
  // The hero portrait. It is the largest thing on the page and the first thing
  // anyone sees, so it keeps its resolution and only loses encoder padding.
  { file: 'public/frank-profile.webp', maxWidth: 1122, quality: 80 },
];

const KB = n => `${(n / 1024).toFixed(1)} kB`;

async function optimize(relPath, { maxWidth, quality }) {
  const abs = path.join(ROOT, relPath);
  const before = (await fs.stat(abs)).size;
  const input = await fs.readFile(abs);

  let meta;
  try {
    meta = await sharp(input).metadata();
  } catch {
    // Some icons are SVGs saved under a .png name. They are already tiny and
    // resolution-independent; leave them exactly as they are.
    console.log(`  –  ${relPath} — not a raster image, skipped (${KB(before)})`);
    return { before, after: before };
  }

  let pipeline = sharp(input, { animated: false });
  if (meta.width > maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
  }

  const ext = path.extname(relPath).toLowerCase();
  if (ext === '.png') {
    // Icons are flat art with few colours; a palette PNG keeps the alpha channel
    // and the exact filename while dropping most of the weight.
    pipeline = pipeline.png({ compressionLevel: 9, palette: true, quality, effort: 10 });
  } else if (ext === '.webp') {
    pipeline = pipeline.webp({ quality, effort: 6 });
  } else {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  }

  const output = await pipeline.toBuffer();

  // Never make a file bigger than it already was.
  if (output.length >= before) {
    console.log(`  =  ${relPath} — already optimal (${KB(before)})`);
    return { before, after: before };
  }

  if (!DRY) await fs.writeFile(abs, output);
  const pct = Math.round((1 - output.length / before) * 100);
  console.log(`  ↓  ${relPath}  ${KB(before)} → ${KB(output.length)}  (-${pct}%)`);
  return { before, after: output.length };
}

const targets = [];
for (const rule of RULES) {
  for (const name of await fs.readdir(path.join(ROOT, rule.dir))) {
    if (/\.(png|jpe?g|webp)$/i.test(name)) targets.push([path.join(rule.dir, name), rule]);
  }
}
for (const { file, ...rule } of FILES) targets.push([file, rule]);

let before = 0;
let after = 0;
for (const [relPath, rule] of targets) {
  const result = await optimize(relPath.split(path.sep).join('/'), rule);
  before += result.before;
  after += result.after;
}

console.log(`\n${targets.length} images: ${KB(before)} → ${KB(after)} (-${Math.round((1 - after / before) * 100)}%)`);
if (DRY) console.log('(dry run — nothing written)');
