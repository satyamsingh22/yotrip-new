#!/usr/bin/env node
/**
 * Art for the "Your Bookings" page, cut from the design mockup (1186×1326):
 * the hero scene (Yori with his ticket + the departing plane) and the
 * luggage/passport illustration of the "Need help?" card.
 * The hero's baked speech-bubble text is painted out — the page renders it live.
 *   node scripts/build-bookings-assets.mjs "<path to mockup png>"
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = process.argv[2];
if (!src) throw new Error("usage: build-bookings-assets.mjs <mockup.png>");
const outDir = path.join(root, "public/assets/img/yt/bookings");

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

const save = (img, name, scale = 2) =>
  sharp(img.buf, { raw: { width: img.w, height: img.h, channels: 3 } })
    .resize(img.w * scale, img.h * scale, { kernel: "lanczos3" })
    .webp({ quality: 90 })
    .toFile(path.join(outDir, `${name}.webp`))
    .then(() => console.log("wrote", name));

// hero: everything right of the headline, down to the top of the white panel
{
  const img = await cut([566, 62, 1186, 232]);
  fillRect(img, [855 - img.x0, 113 - img.y0, 978 - img.x0, 160 - img.y0]);
  // the navbar's "Your Bookings" pill dips into the top-right corner: repeat the sky below it
  for (let y = 0; y < 9; y++)
    for (let x = 900 - img.x0; x < img.w; x++)
      for (let k = 0; k < 3; k++) img.buf[(y * img.w + x) * 3 + k] = img.buf[(9 * img.w + x) * 3 + k];
  await save(img, "bookings-hero");
}

// "Need help?" card illustration (luggage, passport, boarding pass, plane)
{
  const img = await cut([606, 1004, 812, 1146]);
  await save(img, "bookings-help");
}
