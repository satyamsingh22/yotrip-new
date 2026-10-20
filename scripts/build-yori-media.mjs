#!/usr/bin/env node
/**
 * Builds Yori WebM loops + Lottie JSON from frame JPEGs in public/assets/img/yt/yori/.
 * Re-run after designers drop new frames (same filenames) or when adding clips.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const imgDir = path.join(root, "public/assets/img/yt/yori");
const webmDir = path.join(root, "public/assets/media/yori");
const lottieDir = path.join(root, "public/assets/lottie/yori");

const ensure = (p) => fs.mkdirSync(p, { recursive: true });

/** @param {string[]} frames @param {string} outName @param {number} fps */
function buildWebm(frames, outName, fps = 8) {
  const tmp = path.join(webmDir, `.tmp-${outName}`);
  ensure(tmp);
  frames.forEach((name, i) => {
    const src = path.join(imgDir, name);
    if (!fs.existsSync(src)) {
      throw new Error(`Missing frame: ${src}`);
    }
    fs.copyFileSync(src, path.join(tmp, `f-${String(i + 1).padStart(3, "0")}.jpg`));
  });
  const out = path.join(webmDir, `${outName}.webm`);
  const inputPattern = path.join(tmp, "f-%03d.jpg");
  execSync(
    `ffmpeg -y -framerate ${fps} -i "${inputPattern}" -c:v libvpx-vp9 -pix_fmt yuv420p -an -loop 0 "${out}"`,
    { stdio: "inherit" },
  );
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log("webm:", out);
}

/**
 * Image-sequence Lottie (Bodymovin 5.7): one layer, opacity steps per frame.
 * Images live beside JSON under public/assets/lottie/yori/frames/
 */
function buildLottie(clipId, frameFiles, fps = 8) {
  const framesDir = path.join(lottieDir, "frames", clipId);
  ensure(framesDir);
  const assets = [];
  const layers = [];
  const totalFrames = frameFiles.length;
  const duration = Math.round((totalFrames / fps) * 1000) / 1000;
  const op = Math.ceil(duration * fps);

  frameFiles.forEach((file, i) => {
    const destName = `${String(i).padStart(2, "0")}-${file}`;
    fs.copyFileSync(path.join(imgDir, file), path.join(framesDir, destName));
    const id = `img_${i}`;
    assets.push({
      id,
      w: 768,
      h: 1024,
      u: `frames/${clipId}/`,
      p: destName,
      e: 0,
    });
    const start = i;
    const end = i + 1;
    layers.push({
      ddd: 0,
      ind: i + 1,
      ty: 2,
      nm: file,
      refId: id,
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [384, 512, 0] },
        a: { a: 0, k: [384, 512, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      ip: i,
      op: i + 1,
      st: 0,
      bm: 0,
    });
  });

  const lottie = {
    v: "5.7.0",
    fr: fps,
    ip: 0,
    op,
    w: 768,
    h: 1024,
    nm: clipId,
    ddd: 0,
    assets,
    layers: layers.reverse(),
  };

  ensure(lottieDir);
  const outJson = path.join(lottieDir, `${clipId}.json`);
  fs.writeFileSync(outJson, JSON.stringify(lottie));
  console.log("lottie:", outJson);
}

ensure(webmDir);
ensure(lottieDir);

const clips = {
  "yori-lipsync": ["yori-talk-a.jpg", "yori-talk-b.jpg", "yori-talk-c.jpg", "yori-talk-d.jpg"],
  "yori-laptop": ["yori-searching.jpg", "yori-searching-b.jpg"],
  "yori-suitcase-walk": [
    "yori-walk-1.jpg",
    "yori-walk-2.jpg",
    "yori-walk-3.jpg",
    "yori-walk-4.jpg",
  ],
  "yori-welcome": ["yori-welcome.jpg", "yori-welcome.jpg"],
  "yori-success": ["yori-success.jpg", "yori-thumbs.jpg"],
};

for (const [id, frames] of Object.entries(clips)) {
  const fps = id.includes("walk") ? 6 : id.includes("lipsync") ? 10 : 4;
  buildWebm(frames, id, fps);
  buildLottie(id, frames, fps);
}

console.log("Done — Yori WebM + Lottie clips ready.");
