#!/usr/bin/env node
/**
 * Transparent WebP cut-outs of Yori poses used on the home page (bookings band).
 * Flood-fills the light backdrop from the image edges, so light areas inside
 * Yori (eyes, hoodie logo, ticket) stay opaque.
 *   node scripts/build-yori-pose-cutouts.mjs
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "public/assets/img/yt/yori");
const POSES = ["yori-empty", "yori-thumbs"];

for (const name of POSES) {
  const { data, info } = await sharp(path.join(dir, `${name}.jpg`))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  // backdrop = light and low-saturation (white or pale sky gradient)
  const isBg = (i) => {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    return Math.min(r, g, b) > 196 && Math.max(r, g, b) - Math.min(r, g, b) < 60;
  };
  const seen = new Uint8Array(W * H);
  const stack = [];
  for (let x = 0; x < W; x++) stack.push(x, 0, x, H - 1);
  for (let y = 0; y < H; y++) stack.push(0, y, W - 1, y);
  while (stack.length) {
    const y = stack.pop(), x = stack.pop();
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const k = y * W + x;
    if (seen[k] || !isBg(k * 4)) continue;
    seen[k] = 1;
    data[k * 4 + 3] = 0;
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }
  // soften the cut edge
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const k = y * W + x;
      if (seen[k] || !(seen[k - 1] || seen[k + 1] || seen[k - W] || seen[k + W])) continue;
      data[k * 4 + 3] = 170;
    }
  await sharp(data, { raw: { width: W, height: H, channels: 4 } })
    .trim({ threshold: 0 })
    .resize({ height: 520, withoutEnlargement: true })
    .webp({ quality: 88, alphaQuality: 90 })
    .toFile(path.join(dir, `${name}-cutout.webp`));
  console.log("wrote", `${name}-cutout.webp`);
}
