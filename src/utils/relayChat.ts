// YoTrip AI assistant — Relay chat widget bridge.
// The widget script + Relay(...) queue stub live in index.html; this module is
// the only place the app talks to it. See RelayBridge for when each call runs.
import api from "../tockenapi/api";

export type RelayFactValue = string | number | boolean;
export type RelayFacts = Record<string, RelayFactValue>;

type RelayFn = (command: string, argument?: unknown) => void;

declare global {
  interface Window {
    Relay?: RelayFn;
  }
}

/** Call the widget; a no-op when the stub is missing (tests, blocked script). */
// Debug logging for the chat integration. Never logs tokens or signatures.
export const relayLog = (...args: unknown[]) => console.log("[relay]", ...args);

export const relay = (command: string, argument?: unknown) => {
  try {
    if (!window.Relay) relayLog(`window.Relay missing — widget stub not loaded, "${command}" dropped`);
    window.Relay?.(command, argument);
  } catch {
    // The chat must never break the site.
  }
};

/** Opens the Relay chat panel (same as production yotrip — no local mock UI). */
export const openRelayChat = () => relay("open");
export const closeRelayChat = () => relay("close");
export const toggleRelayChat = () => relay("toggle");

/**
 * Logged-in user → signed identity + YoTrip token for Relay('identify').
 * Any failure (guest, expired token, secret not configured) leaves the chat as
 * a guest. Returns whether identify was called.
 */
export const connectRelayUser = async (): Promise<boolean> => {
  relayLog("fetching identity from /api/relay/identity …", {
    hasLocalToken: Boolean(localStorage.getItem("token")),
  });
  try {
    const { data } = await api.get("/api/relay/identity");
    if (!data?.identity || !data?.accessToken) {
      relayLog("identify skipped: identity endpoint returned no identity/token");
      return false;
    }
    relay("identify", {
      ...data.identity,
      tokens: { accessToken: data.accessToken },
      ...(data.accessTokenExpiresAt ? { tokensExpiresAt: data.accessTokenExpiresAt } : {}),
    });
    relayLog("identify sent", {
      userId: data.identity.userId,
      hasEmail: Boolean(data.identity.email),
      hasName: Boolean(data.identity.name),
      timestamp: data.identity.timestamp,
      hasToken: true,
      tokensExpiresAt: data.accessTokenExpiresAt ?? null,
    });
    const check = data.secretCheck ?? {};
    relayLog("RELAY_IDENTITY_SECRET (backend env, quoted so spaces show)", JSON.stringify(check.RELAY_IDENTITY_SECRET ?? null));
    relayLog("RELAY_IDENTITY_SECRET raw before trim", JSON.stringify(check.RELAY_IDENTITY_SECRET_RAW ?? null));
    relayLog("RELAY_IDENTITY_SECRET check", {
      configured: check.configured ?? Boolean(data.secretFingerprint),
      secretLength: check.secretLength ?? null,
      rawLength: check.rawLength ?? null,
      hadLeadingWhitespace: check.hadLeadingWhitespace ?? null,
      hadTrailingWhitespace: check.hadTrailingWhitespace ?? null,
      hadNewline: check.hadNewline ?? null,
    });
    return true;
  } catch (err) {
    const response = (err as { response?: { status?: number; data?: { code?: string } } })?.response;
    relayLog("identify skipped", {
      status: response?.status ?? "network error",
      code: response?.data?.code ?? null,
    });
    return false;
  }
};

/** The widget speaks English and Arabic only. */
export const relayLocale = (lng: string | undefined): "en" | "ar" =>
  String(lng || "").toLowerCase().startsWith("ar") ? "ar" : "en";

// Relay's page-fact rules: ≤20 keys; key starts with a letter, then letters,
// digits, _ . - (≤40 chars); value is text ≤500 chars, a finite number or a
// boolean. Empty values are dropped so a missing fact is absent, not "".
const KEY_RE = /^[A-Za-z][A-Za-z0-9_.-]{0,39}$/;
const MAX_FACTS = 20;

export const sanitizeFacts = (input: Record<string, unknown>): RelayFacts => {
  const out: RelayFacts = {};
  for (const [key, value] of Object.entries(input)) {
    if (Object.keys(out).length >= MAX_FACTS) break;
    if (!KEY_RE.test(key)) continue;
    if (typeof value === "boolean") out[key] = value;
    else if (typeof value === "number") {
      if (Number.isFinite(value)) out[key] = value;
    } else if (typeof value === "string") {
      const text = value.trim();
      if (text) out[key] = text.slice(0, 500);
    }
  }
  return out;
};
