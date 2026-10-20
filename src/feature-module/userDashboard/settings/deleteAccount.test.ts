import { describe, it, expect, vi, beforeEach } from "vitest";
import { clearDeletedAccountLocalKeys, requestAccountDeletion } from "./deleteAccount";

describe("requestAccountDeletion", () => {
  it("calls DELETE /api/auth/account with credentials and no userId", async () => {
    const del = vi.fn().mockResolvedValue({ data: { message: "Account deleted successfully" } });
    await requestAccountDeletion({ delete: del } as any);
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith("/api/auth/account", { withCredentials: true });
    const [url, config] = del.mock.calls[0];
    expect(url).toBe("/api/auth/account");
    expect(config).not.toHaveProperty("data");
    expect(config).not.toHaveProperty("params");
  });

  it("propagates API errors so the UI can show them", async () => {
    const del = vi.fn().mockRejectedValue({
      response: { data: { error: "Delete failed" } },
    });
    await expect(requestAccountDeletion({ delete: del } as any)).rejects.toMatchObject({
      response: { data: { error: "Delete failed" } },
    });
  });
});

describe("clearDeletedAccountLocalKeys", () => {
  beforeEach(() => {
    localStorage.setItem("token", "t");
    localStorage.setItem("userEmail", "a@b.com");
    localStorage.setItem("userId", "u1");
    localStorage.setItem("name", "Ada");
  });

  it("clears userId and name without touching the session keys logout owns", () => {
    clearDeletedAccountLocalKeys();
    expect(localStorage.getItem("userId")).toBeNull();
    expect(localStorage.getItem("name")).toBeNull();
    expect(localStorage.getItem("token")).toBe("t");
    expect(localStorage.getItem("userEmail")).toBe("a@b.com");
  });
});
