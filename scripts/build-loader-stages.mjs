#!/usr/bin/env node
/**
 * Splits a 5-panel loader storyboard (two rows separated by white dividers, any
 * 2+3 / 3+2 layout) into one WebP per stage, in reading order. The search
 * loaders show them one by one as their progress bar advances.
 *   node scripts/build-loader-stages.mjs <storyboard.png> <outDir> <prefix>
 *   e.g. … "YoTrip Hotel Search Journey.png" public/assets/img/hotels/loader hotel-stage
 */
import path from "node:path";
import sharp from "sharp";

const [src, outDir, prefix] = process.argv.slice(2);
if (!src || !outDir || !prefix) throw new Error("usage: build-loader-stages.mjs <png> <outDir> <prefix>");

const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const white = (x, y) => {
  const i = (y * W + x) * 3;
  return data[i] > 232 && data[i + 1] > 232 && data[i + 2] > 232;
};
/** runs of indices where `pred` holds → [[start,end],…] */
const runs = (n, pred) => {
  const out = [];
  let s = -1;
  for (let i = 0; i < n; i++) {
    if (pred(i)) { if (s < 0) s = i; } else if (s >= 0) { out.push([s, i - 1]); s = -1; }
  }
  if (s >= 0) out.push([s, n - 1]);
  return out;
};
const frac = (count, total) => count / total;

// horizontal divider: a mostly-white row band away from the edges
const rowWhite = (y) => { let n = 0; for (let x = 0; x < W; x++) if (white(x, y)) n++; return frac(n, W) > 0.85; };
const hDiv = runs(H, rowWhite).filter(([a, b]) => a > H * 0.2 && b < H * 0.8);
if (hDiv.length !== 1) throw new Error(`expected one row divider, found ${hDiv.length}`);
const rows = [[0, hDiv[0][0] - 1], [hDiv[0][1] + 1, H - 1]];

const panels = [];
for (const [y0, y1] of rows) {
  const colWhite = (x) => { let n = 0; for (let y = y0; y <= y1; y++) if (white(x, y)) n++; return frac(n, y1 - y0 + 1) > 0.85; };
  const vDiv = runs(W, colWhite).filter(([a, b]) => a > W * 0.1 && b < W * 0.9);
  let x = 0;
  for (const [a, b] of vDiv) { panels.push([x, y0, a - 1, y1]); x = b + 1; }
  panels.push([x, y0, W - 1, y1]);
}
if (panels.length !== 5) throw new Error(`expected 5 panels, found ${panels.length}`);

for (const [i, [l, t, r, b]] of panels.entries()) {
  const inset = 2;
  const out = path.join(outDir, `${prefix}-${i + 1}.webp`);
  await sharp(src)
    .extract({ left: l + inset, top: t + inset, width: r - l + 1 - 2 * inset, height: b - t + 1 - 2 * inset })
    .webp({ quality: 88 })
    .toFile(out);
  console.log("wrote", path.basename(out), `${r - l + 1}x${b - t + 1}`);
}
