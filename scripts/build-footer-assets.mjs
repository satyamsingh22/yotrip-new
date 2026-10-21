#!/usr/bin/env node
/**
 * Art for the home "Your next story starts here" band and the global footer
 * skyline, cut from the design mockup ("YoTrip Mediterranean Travel Showcase.png",
 * 1774×887). The band's baked headline and service tiles are painted out — the
 * page renders those live (translated, clickable).
 *   node scripts/build-footer-assets.mjs "<path to mockup png>"
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = process.argv[2];
if (!src) throw new Error("usage: build-footer-assets.mjs <mockup.png>");
const outDir = path.join(root, "public/assets/img/yt/footer");

// band: the rounded art panel (y starts below a stray progress line in the mock)
const BAND = { left: 18, top: 19, width: 1738, height: 390 };
// in mockup coordinates: headline + subtitle, then the four service tiles
const PATCHES = [
  [560, 80, 1000, 258],
  [396, 296, 1390, 392],
];

const { data, info } = await sharp(src)
  .extract(BAND)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, C = info.channels;
const at = (x, y) => (y * W + x) * C;
const avg = (xa, xb, y) => {
  const c = [0, 0, 0];
  let n = 0;
  for (let yy = Math.max(0, y - 3); yy <= Math.min(H - 1, y + 3); yy++)
    for (let x = Math.max(0, xa); x <= Math.min(W - 1, xb); x++, n++)
      for (let k = 0; k < 3; k++) c[k] += data[at(x, yy) + k];
  return c.map((v) => v / Math.max(1, n));
};
const blurRects = [];
for (const [mx0, my0, mx1, my1] of PATCHES) {
  const x0 = mx0 - BAND.left, x1 = mx1 - BAND.left;
  const y0 = my0 - BAND.top, y1 = Math.min(H - 1, my1 - BAND.top);
  for (let y = y0; y <= y1; y++) {
    const a = avg(x0 - 16, x0 - 5, y);
    const b = avg(x1 + 5, x1 + 16, y);
    for (let x = x0; x <= x1; x++) {
      const t = (x - x0) / (x1 - x0);
      for (let k = 0; k < 3; k++) data[at(x, y) + k] = Math.round(a[k] * (1 - t) + b[k] * t);
    }
  }
  blurRects.push([x0 - 8, y0 - 8, x1 + 8, y1 + 8]);
}
const blurred = await sharp(data, { raw: { width: W, height: H, channels: C } }).blur(9).raw().toBuffer();
for (const [x0, y0, x1, y1] of blurRects)
  for (let y = Math.max(0, y0); y <= Math.min(H - 1, y1); y++)
    for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++)
      for (let k = 0; k < 3; k++) data[at(x, y) + k] = blurred[at(x, y) + k];
await sharp(data, { raw: { width: W, height: H, channels: C } })
  .webp({ quality: 86 })
  .toFile(path.join(outDir, "story-band.webp"));

// skyline strip (landmarks + water) between the link columns and the bottom bar
await sharp(src)
  .extract({ left: 0, top: 688, width: 1774, height: 144 })
  .webp({ quality: 86 })
  .toFile(path.join(outDir, "footer-skyline.webp"));
console.log("wrote story-band.webp, footer-skyline.webp");
