#!/usr/bin/env node
/**
 * Clean background for the flight-search loader from the design mockup
 * ("YoTrip_ Finding Your Best Flight-3.png", 1536×1024): paints out the baked-in
 * logo, headline, subtitle and progress card (the loader renders those live) by
 * row-wise interpolation from the surrounding sky/clouds, then softens the patch.
 *   node scripts/build-flight-loader-scene.mjs "<path to mockup png>"
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = process.argv[2];
if (!src) throw new Error("usage: build-flight-loader-scene.mjs <mockup.png>");
const outDir = path.join(root, "public/assets/img/flight");

// x0, y0, x1, y1 in mockup pixels, then the soft-edge width (kept small next to Yori / the plane)
const REGIONS = [
  [630, 6, 904, 114, 24], // logo
  [536, 114, 1016, 224, 24], // headline (2 lines)
  [566, 228, 988, 296, 6], // subtitle (stops above Yori's hair)
  [350, 802, 1196, 998, 6], // progress card (just below the engines)
];

const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const at = (x, y) => (y * W + x) * C;
const src0 = Buffer.from(data); // untouched copy to sample from
// average a small block (±4 rows) so per-row sky noise / cloud edges don't turn into stripes
const avg = (x0, x1, y) => {
  const c = [0, 0, 0];
  let n = 0;
  for (let yy = Math.max(0, y - 4); yy <= Math.min(H - 1, y + 4); yy++)
    for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++, n++)
      for (let k = 0; k < 3; k++) c[k] += src0[at(x, yy) + k];
  return c.map((v) => v / Math.max(1, n));
};

for (const [x0, y0, x1, y1] of REGIONS) {
  for (let y = y0; y <= y1; y++) {
    // sample a little away from the box so anti-aliased glyph edges don't bleed in
    const L = avg(x0 - 22, x0 - 8, y);
    const R = avg(x1 + 8, x1 + 22, y);
    for (let x = x0; x <= x1; x++) {
      const t = (x - x0) / (x1 - x0);
      const i = at(x, y);
      for (let k = 0; k < 3; k++) data[i + k] = Math.round(L[k] * (1 - t) + R[k] * t);
    }
  }
}

const filled = sharp(data, { raw: { width: W, height: H, channels: C } });
const filledBuf = await filled.clone().png().toBuffer();
const blurred = await sharp(filledBuf).blur(22).removeAlpha().raw().toBuffer();

// feathered mask over the patched regions
const mask = Buffer.alloc(W * H, 0);
for (const [x0, y0, x1, y1, pad] of REGIONS)
  for (let y = Math.max(0, y0 - pad); y <= Math.min(H - 1, y1 + pad); y++)
    for (let x = Math.max(0, x0 - pad); x <= Math.min(W - 1, x1 + pad); x++) mask[y * W + x] = 255;
const softMask = await sharp(mask, { raw: { width: W, height: H, channels: 1 } }).blur(5).extractChannel(0).raw().toBuffer();

const rgba = Buffer.alloc(W * H * 4);
for (let p = 0; p < W * H; p++) {
  rgba[p * 4] = blurred[p * 3];
  rgba[p * 4 + 1] = blurred[p * 3 + 1];
  rgba[p * 4 + 2] = blurred[p * 3 + 2];
  rgba[p * 4 + 3] = softMask[p];
}
const overlay = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
const out = sharp(filledBuf).composite([{ input: overlay }]);
await out.clone().webp({ quality: 82 }).toFile(path.join(outDir, "flight-loader-scene.webp"));
await out.clone().jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(outDir, "flight-loader-scene.jpg"));
console.log("wrote flight-loader-scene.{webp,jpg}");
