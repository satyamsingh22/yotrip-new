// Detects when a newer frontend has been deployed while this tab stayed open.
// A single-page app never re-fetches index.html on its own, so an open tab keeps
// running old code (and old booking/price logic) until a reload. We embed the
// build id at build time (__BUILD_ID__) and poll a tiny /version.json that ships
// with each deploy; when they differ we prompt the user to refresh.

export type VersionPayload = { buildId?: string } | null;

// The build id baked into THIS bundle. Defined by vite (see vite.config.ts);
// falls back to "" in tests / dev where it is not injected.
declare const __BUILD_ID__: string;
const CURRENT_BUILD_ID =
  typeof __BUILD_ID__ === "string" ? __BUILD_ID__ : "";

/** True only when we can confidently say a different build is deployed. */
export const isOutdated = (
  currentBuildId: string | undefined,
  remote: VersionPayload,
): boolean => {
  if (!currentBuildId) return false; // unknown local build (dev/tests) -> never reload
  const deployed = remote?.buildId;
  if (!deployed) return false; // fetch failed / no build id -> never reload
  return deployed !== currentBuildId;
};

const versionUrl = () =>
  `/version.json?ts=${Date.now()}`;

const fetchDeployedVersion = async (): Promise<VersionPayload> => {
  try {
    const res = await fetch(versionUrl(), { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as VersionPayload;
  } catch {
    return null;
  }
};

/**
 * Start watching for a newer deploy. Calls `onUpdate()` at most once, when a
 * different build id is detected. Polls on an interval and whenever the tab is
 * refocused (the common "left it open overnight" case). No-op in dev.
 */
export const startVersionWatcher = (
  onUpdate: () => void,
  { intervalMs = 60_000 }: { intervalMs?: number } = {},
): void => {
  if (process.env.NODE_ENV !== "production" || !CURRENT_BUILD_ID) return;

  let notified = false;
  const check = async () => {
    if (notified) return;
    if (isOutdated(CURRENT_BUILD_ID, await fetchDeployedVersion())) {
      notified = true;
      onUpdate();
    }
  };

  setInterval(check, intervalMs);
  window.addEventListener("focus", check);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") check();
  });

  // A stale tab that lazy-loads a chunk removed by the new deploy gets a hard
  // import error — that page is unrecoverable, so reload immediately.
  window.addEventListener("vite:preloadError", () => window.location.reload());
};
