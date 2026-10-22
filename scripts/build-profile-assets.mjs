#!/usr/bin/env node
/**
 * Art for the "My Profile" page, cut from the design mockup (1672×941): the
 * airport-window hero strip and the "No saved travelers yet" illustration.
 * The hero's baked "My Profile" title and breadcrumb are painted out — the page
 * renders those live; the "Travel · Explore · Discover" script stays as art.
 *   node scripts/build-profile-assets.mjs "<path to mockup png>"
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = process.argv[2];
if (!src) throw new Error("usage: build-profile-assets.mjs <mockup.png>");
const outDir = path.join(root, "public/assets/img/yt/profile");

const cut = async ([x0, y0, x1, y1]) => {
  const { data, info } = await sharp(src)
    .removeAlpha()
    .extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { buf: data, w: info.width, h: info.height, x0, y0 };
};

/** Row-wise interpolation between the pixels just outside a rect (local coords). */
const fillRect = (img, [x0, y0, x1, y1]) => {
  const { buf, w } = img;
  const px = (x, y) => [0, 1, 2].map((k) => buf[(y * w + x) * 3 + k]);
  for (let y = y0; y <= y1; y++) {
    const a = px(x0 - 3, y);
    const b = px(x1 + 3, y);
    for (let x = x0; x <= x1; x++) {
      const t = (x - x0) / Math.max(1, x1 - x0);
      for (let k = 0; k < 3; k++) buf[(y * w + x) * 3 + k] = Math.round(a[k] * (1 - t) + b[k] * t);
    }
  }
};

const save = async (img, name, { scale = 2, blurRects = [] } = {}) => {
  let buf = img.buf;
  if (blurRects.length) {
    // soften the patched area so the interpolation streaks don't show
    const blurred = await sharp(img.buf, { raw: { width: img.w, height: img.h, channels: 3 } })
      .blur(6)
      .raw()
      .toBuffer();
    buf = Buffer.from(img.buf);
    for (const [x0, y0, x1, y1] of blurRects)
      for (let y = Math.max(0, y0); y <= Math.min(img.h - 1, y1); y++)
        for (let x = Math.max(0, x0); x <= Math.min(img.w - 1, x1); x++)
          for (let k = 0; k < 3; k++) buf[(y * img.w + x) * 3 + k] = blurred[(y * img.w + x) * 3 + k];
  }
  await sharp(buf, { raw: { width: img.w, height: img.h, channels: 3 } })
    .resize(Math.round(img.w * scale), Math.round(img.h * scale), { kernel: "lanczos3" })
    .webp({ quality: 88 })
    .toFile(path.join(outDir, `${name}.webp`));
  console.log("wrote", name);
};

const local = (img, [x0, y0, x1, y1]) => [x0 - img.x0, y0 - img.y0, x1 - img.x0, y1 - img.y0];

// hero strip between the navbar and the page body
{
  const img = await cut([0, 63, 1672, 192]);
  const original = Buffer.from(img.buf);
  // patch a generous box, then blur it and fade it back into the original
  // towards its edges so no rectangle shows (the glyphs sit well inside)
  const box = local(img, [712, 82, 964, 182]);
  const glyphs = local(img, [740, 90, 936, 172]);
  fillRect(img, box);
  const blurred = await sharp(img.buf, { raw: { width: img.w, height: img.h, channels: 3 } })
    .blur(10)
    .raw()
    .toBuffer();
  for (let y = box[1]; y <= box[3]; y++)
    for (let x = box[0]; x <= box[2]; x++) {
      const dx = Math.max(glyphs[0] - x, x - glyphs[2], 0) / (glyphs[0] - box[0]);
      const dy = Math.max(glyphs[1] - y, y - glyphs[3], 0) / Math.max(1, glyphs[1] - box[1]);
      const w = 1 - Math.min(1, Math.max(dx, dy)) ** 2;
      for (let k = 0; k < 3; k++) {
        const i = (y * img.w + x) * 3 + k;
        img.buf[i] = Math.round(blurred[i] * w + original[i] * (1 - w));
      }
    }
  await save(img, "profile-hero", { scale: 1.5 });
}

// "No saved travelers yet" illustration (suitcase, passport, ID card)
{
  const img = await cut([668, 784, 972, 926]);
  await save(img, "profile-travelers");
}
