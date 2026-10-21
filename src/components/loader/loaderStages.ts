/**
 * Progress-driven storyboard for the search loaders (flight / hotel / car).
 * With N scenes, 0–(100/N)% shows scene 1, the next band scene 2 … The bar only
 * moves forward, so every scene shows exactly once and none repeats.
 * Scenes are the full 16:9 design frames (1672×941), one webp per step.
 */
export const stageForPercent = (pct: number, count: number) =>
  Math.min(count - 1, Math.floor(Math.max(0, pct) / (100 / count)));

// bump when the scene files are replaced — same file names, so browsers would
// otherwise keep showing the cached old frames
const STAGES_VERSION = 2;

export const loaderStages = (dir: string, prefix: string, count = 5) =>
  Array.from({ length: count }, (_, i) => `${dir}/${prefix}-${i + 1}.webp?v=${STAGES_VERSION}`);
