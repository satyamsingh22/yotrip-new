import { describe, it, expect, vi } from "vitest";
import { handleUnauthorized } from "./apiRequest";

const makeStorage = (init: Record<string, string> = {}): Storage => {
  const map = new Map(Object.entries(init));
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    get length() {
      return map.size;
    },
  };
};

const err401 = (withToken: boolean) => ({
  response: { status: 401 },
  config: { headers: withToken ? { Authorization: "Bearer abc" } : {} },
});

describe("handleUnauthorized", () => {
  it("logs out only the auth keys and redirects when a tokened request gets 401", () => {
    const storage = makeStorage({ token: "abc", userEmail: "a@b.com", cart: "keep-me" });
    const redirect = vi.fn();
    const dispatch = vi.fn();

    const acted = handleUnauthorized(err401(true), { storage, redirect, dispatch });

    expect(acted).toBe(true);
    expect(storage.getItem("token")).toBeNull();
    expect(storage.getItem("userEmail")).toBeNull();
    expect(storage.getItem("cart")).toBe("keep-me"); // unrelated state preserved
    expect(redirect).toHaveBeenCalledWith("/index");
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it("ignores a 401 on an anonymous request (no token) — no logout, no redirect", () => {
    const storage = makeStorage({ token: "abc", userEmail: "a@b.com" });
    const redirect = vi.fn();

    const acted = handleUnauthorized(err401(false), { storage, redirect, dispatch: vi.fn() });

    expect(acted).toBe(false);
    expect(storage.getItem("token")).toBe("abc"); // session untouched
    expect(redirect).not.toHaveBeenCalled();
  });

  it("ignores non-401 errors", () => {
    const redirect = vi.fn();
    const acted = handleUnauthorized(
      { response: { status: 500 }, config: { headers: { Authorization: "Bearer abc" } } },
      { storage: makeStorage(), redirect, dispatch: vi.fn() }
    );
    expect(acted).toBe(false);
    expect(redirect).not.toHaveBeenCalled();
  });
});
