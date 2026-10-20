import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { SdfNoticeProvider, useSdfNotice } from "./SdfNoticeContext";

const DISMISS_KEY = "sdf_notice_dismissed";

let api: ReturnType<typeof useSdfNotice>;

const Probe = () => {
  api = useSdfNotice();
  return <span data-testid="state">{api.isOpen ? "open" : "closed"}</span>;
};

const renderProvider = () =>
  render(
    <SdfNoticeProvider>
      <Probe />
    </SdfNoticeProvider>,
  );

const state = () => screen.getByTestId("state").textContent;

describe("SdfNoticeProvider", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("does not open on mount", () => {
    // Regression guard: the notice used to auto-open on whatever page the
    // visitor landed on, India-bound or not. It is now opened only by the
    // booking page (via openNoticeOnce) or the footer link.
    renderProvider();

    expect(state()).toBe("closed");
  });

  it("does not open on mount even on a fresh session", () => {
    expect(sessionStorage.getItem(DISMISS_KEY)).toBeNull();

    renderProvider();

    expect(state()).toBe("closed");
  });

  it("openNoticeOnce opens the notice when it has not been dismissed", () => {
    renderProvider();

    act(() => api.openNoticeOnce());

    expect(state()).toBe("open");
  });

  it("openNoticeOnce does nothing once the notice has been dismissed", () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    renderProvider();

    act(() => api.openNoticeOnce());

    expect(state()).toBe("closed");
  });

  it("closing marks the session dismissed so openNoticeOnce stays quiet", () => {
    renderProvider();

    act(() => api.openNoticeOnce());
    expect(state()).toBe("open");

    act(() => api.closeNotice());
    expect(state()).toBe("closed");

    act(() => api.openNoticeOnce());
    expect(state()).toBe("closed");
  });

  it("openNotice opens the notice even after dismissal", () => {
    // The footer link must always work — it is an explicit user action.
    sessionStorage.setItem(DISMISS_KEY, "1");
    renderProvider();

    act(() => api.openNotice());

    expect(state()).toBe("open");
  });
});
