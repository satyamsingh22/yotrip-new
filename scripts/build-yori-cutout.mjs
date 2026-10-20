#!/usr/bin/env node
/**
 * Builds the transparent home-hero Yori (sitting on the ledge, no speech bubble)
 * from public/assets/img/yt/yori/yori-hero-scene.jpg:
 *   1. paint out the drawn speech bubble (the hero renders its own text bubble)
 *   2. flood-fill the white backdrop from the image edges → transparent
 *      (edge fill only, so whites inside Yori — eyes, hoodie logo — stay)
 *   3. feather the cut edge and trim.
 *   node scripts/build-yori-cutout.mjs
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "public/assets/img/yt/yori/yori-hero-scene.jpg");
const out = path.join(root, "public/assets/img/yt/yori/yori-hero-cutout.png");

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const px = (x, y) => (y * W + x) * 4;

// 1. Speech bubble: top-right, above/right of Yori's hair (source is 864×1152).
const sx = W / 864, sy = H / 1152;
const erase = (x0, y0, x1, y1) => {
  for (let y = Math.round(y0 * sy); y < Math.round(y1 * sy); y++)
    for (let x = Math.round(x0 * sx); x < Math.round(x1 * sx); x++) {
      const i = px(x, y);
      data[i] = data[i + 1] = data[i + 2] = 255;
    }
};
erase(452, 0, 864, 425); // bubble body + tail
erase(360, 0, 864, 285); // bubble's left curve above the hair
// Leftover navy outline next to the hair: bluish strokes only (hair is brown/black).
for (let y = 0; y < Math.round(460 * sy); y++)
  for (let x = Math.round(330 * sx); x < W; x++) {
    const i = px(x, y);
    if (data[i + 2] > data[i] + 30 && data[i + 2] >= data[i + 1]) data[i] = data[i + 1] = data[i + 2] = 255;
  }

// 2. Flood fill near-white from every edge pixel.
const isBg = (i) => data[i] > 228 && data[i + 1] > 228 && data[i + 2] > 228;
const seen = new Uint8Array(W * H);
const stack = [];
for (let x = 0; x < W; x++) stack.push(x, 0, x, H - 1);
for (let y = 0; y < H; y++) stack.push(0, y, W - 1, y);
while (stack.length) {
  const y = stack.pop(), x = stack.pop();
  if (x < 0 || y < 0 || x >= W || y >= H) continue;
  const k = y * W + x;
  if (seen[k]) continue;
  const i = k * 4;
  if (!isBg(i)) continue;
  seen[k] = 1;
  data[i + 3] = 0;
  stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
}

// 3. Feather: pixels touching the removed area fade by how light they are.
for (let y = 1; y < H - 1; y++)
  for (let x = 1; x < W - 1; x++) {
    const k = y * W + x;
    if (seen[k]) continue;
    if (!(seen[k - 1] || seen[k + 1] || seen[k - W] || seen[k + W])) continue;
    const i = k * 4;
    const light = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i + 3] = Math.max(0, Math.min(255, Math.round((255 - light) * 4)));
  }

await sharp(data, { raw: { width: W, height: H, channels: 4 } })
  .trim({ threshold: 0 })
  .png({ compressionLevel: 9 })
  .toFile(out);
console.log("wrote", out);
