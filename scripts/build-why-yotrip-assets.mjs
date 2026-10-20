#!/usr/bin/env node
/**
 * Art for the home "Why YoTrip" cards and the "Plan ahead" band, cut from the
 * design mockup ("YoTrip_ Everything for Every Trip.png", 1536×1024).
 * The mockup's baked text, icon tiles and arrow buttons are painted out (the
 * page renders those live, translated); where text overlaps art, only the
 * text-coloured pixels are replaced so the art underneath survives.
 *   node scripts/build-why-yotrip-assets.mjs "<path to mockup png>"
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = process.argv[2];
if (!src) throw new Error("usage: build-why-yotrip-assets.mjs <mockup.png>");
const outDir = path.join(root, "public/assets/img/yt/why");

const { data: base, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const C = info.channels;

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const INK = {
  navy: hex("#141e3c"),
  grey: hex("#4a566c"),
  blue: hex("#1a5cf5"),
  orange: hex("#f26b1d"),
  green: hex("#139a73"),
  pink: hex("#e8306a"),
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Copy a region of the mockup into its own RGB buffer. */
const cut = ([x0, y0, x1, y1]) => {
  const w = x1 - x0;
  const h = y1 - y0;
  const buf = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const s = ((y0 + y) * W + (x0 + x)) * C;
      const d = (y * w + x) * 3;
      buf[d] = base[s];
      buf[d + 1] = base[s + 1];
      buf[d + 2] = base[s + 2];
    }
  return { buf, w, h, x0, y0 };
};

/** Row-wise interpolation over a rect (for text/tiles on plain pastel). */
const fillRect = (img, [x0, y0, x1, y1], prefer = "left") => {
  const { buf, w } = img;
  const L = (x, y) => [0, 1, 2].map((k) => buf[(y * w + x) * 3 + k]);
  for (let y = y0; y <= y1; y++) {
    const avg = (xa, xb) => {
      const c = [0, 0, 0];
      let n = 0;
      for (let yy = Math.max(0, y - 3); yy <= Math.min(img.h - 1, y + 3); yy++)
        for (let x = Math.max(0, xa); x <= Math.min(w - 1, xb); x++, n++) {
          const p = L(x, yy);
          for (let k = 0; k < 3; k++) c[k] += p[k];
        }
      return c.map((v) => v / Math.max(1, n));
    };
    let a = avg(x0 - 14, x0 - 4);
    let b = avg(x1 + 4, x1 + 14);
    // one edge runs into art (building / scenery / phone / hair): use the clean side only
    if (dist(a, b) > 32) {
      if (prefer === "left") b = a;
      else a = b;
    }
    for (let x = x0; x <= x1; x++) {
      const t = (x - x0) / Math.max(1, x1 - x0);
      for (let k = 0; k < 3; k++) buf[(y * w + x) * 3 + k] = Math.round(a[k] * (1 - t) + b[k] * t);
    }
  }
};

/** Replace only text-coloured pixels inside a rect (keeps illustration pixels). */
const eraseInk = (img, [x0, y0, x1, y1], inks, tol = 70) => {
  const { buf, w } = img;
  const px = (x, y) => [0, 1, 2].map((k) => buf[(y * w + x) * 3 + k]);
  const mask = new Uint8Array(w * img.h);
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const p = px(x, y);
      if (inks.some((c) => dist(p, c) < tol)) mask[y * w + x] = 1;
    }
  // dilate by 1px to take the anti-aliased glyph edge too
  const grown = mask.slice();
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++)
      if (mask[y * w + x])
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
          const xx = x + dx, yy = y + dy;
          if (xx >= x0 && xx <= x1 && yy >= y0 && yy <= y1) grown[yy * w + xx] = 1;
        }
  // fill each masked pixel from the nearest unmasked pixels left/right on its row
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      if (!grown[y * w + x]) continue;
      let l = x, r = x;
      while (l > 0 && grown[y * w + l]) l--;
      while (r < w - 1 && grown[y * w + r]) r++;
      const a = px(l, y), b = px(r, y);
      const t = (x - l) / Math.max(1, r - l);
      for (let k = 0; k < 3; k++) buf[(y * w + x) * 3 + k] = Math.round(a[k] * (1 - t) + b[k] * t);
    }
  return grown;
};

const save = async (img, name, { blurRects = [] } = {}) => {
  let pipe = sharp(img.buf, { raw: { width: img.w, height: img.h, channels: 3 } });
  if (blurRects.length) {
    // soften patched areas so interpolation seams don't show
    const blurred = await pipe.clone().blur(5).raw().toBuffer();
    const out = Buffer.from(img.buf);
    for (const [x0, y0, x1, y1] of blurRects)
      for (let y = Math.max(0, y0); y <= Math.min(img.h - 1, y1); y++)
        for (let x = Math.max(0, x0); x <= Math.min(img.w - 1, x1); x++)
          for (let k = 0; k < 3; k++) out[(y * img.w + x) * 3 + k] = blurred[(y * img.w + x) * 3 + k];
    pipe = sharp(out, { raw: { width: img.w, height: img.h, channels: 3 } });
  }
  await pipe.clone().webp({ quality: 88 }).toFile(path.join(outDir, `${name}.webp`));
  console.log("wrote", name);
};

const local = (img, [x0, y0, x1, y1]) => [x0 - img.x0, y0 - img.y0, x1 - img.x0, y1 - img.y0];

// ── four feature cards (whole card, inset a few px from the rounded edge) ──
const CARDS = [
  {
    name: "card-ai",
    box: [68, 200, 410, 530],
    plain: [[90, 210, 155, 268], [334, 214, 390, 266], [90, 275, 262, 305], [90, 307, 334, 400], [90, 403, 202, 441]],
    ink: [],
  },
  {
    name: "card-hotel",
    box: [437, 200, 760, 530],
    plain: [[452, 210, 518, 268], [692, 214, 748, 266], [452, 275, 632, 305], [452, 307, 656, 330], [452, 330, 598, 400], [452, 403, 572, 443]],
    // line ends that run into the hotel building: text-coloured pixels only
    ink: [[[598, 330, 662, 400], ["navy", "grey"]]],
  },
  {
    name: "card-car",
    box: [787, 200, 1110, 530],
    plain: [[802, 210, 868, 268], [1044, 214, 1100, 266], [802, 275, 962, 305], [802, 307, 1016, 400], [802, 403, 918, 443]],
    ink: [],
  },
  {
    name: "card-alerts",
    box: [1138, 200, 1466, 530],
    plain: [[1155, 210, 1222, 268], [1396, 214, 1452, 266], [1155, 275, 1347, 305], [1155, 307, 1394, 330], [1155, 330, 1350, 400], [1155, 403, 1278, 443]],
    // "fares" runs into the phone
    ink: [[[1350, 330, 1396, 352], ["navy", "grey"]]],
  },
];

for (const card of CARDS) {
  const img = cut(card.box);
  const blur = [];
  for (const r of card.plain) {
    const lr = local(img, r);
    fillRect(img, lr);
    blur.push(lr);
  }
  for (const [r, inks] of card.ink) {
    const lr = local(img, r);
    eraseInk(img, lr, inks.map((k) => INK[k]).concat([INK.navy]));
  }
  await save(img, card.name, { blurRects: blur });
}

// ── "Plan ahead" scene: Yori with the map; the baked speech bubble is painted out ──
{
  const img = cut([545, 575, 985, 1024]);
  const bubble = local(img, [722, 578, 902, 694]);
  fillRect(img, bubble, "right"); // left edge touches Yori's hair
  await save(img, "plan-yori-map", { blurRects: [bubble] });
}

// ── top-right decoration: Yori pointing at the planes ──
{
  const img = cut([1062, 0, 1536, 190]);
  await save(img, "why-yori-planes");
}
