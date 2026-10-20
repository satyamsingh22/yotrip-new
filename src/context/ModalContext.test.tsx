import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { ModalProvider, useModal } from "./ModalContext";

const wrapper = ({ children }: { children: ReactNode }) => (
  <ModalProvider>{children}</ModalProvider>
);

const renderModalState = () => renderHook(() => useModal(), { wrapper });

describe("ModalContext", () => {
  it("starts with no auth modal open", () => {
    const { result } = renderModalState();

    expect(result.current.activeModal).toBeNull();
    expect(result.current.loginOpen).toBe(false);
    expect(result.current.registerOpen).toBe(false);
  });

  it("opens one modal at a time so switching cannot leave both flagged open", () => {
    const { result } = renderModalState();

    act(() => result.current.openRegister());
    expect(result.current.registerOpen).toBe(true);

    // The register modal offers a "Login" switch; the register request must
    // not survive it.
    act(() => result.current.openLogin());
    expect(result.current.loginOpen).toBe(true);
    expect(result.current.registerOpen).toBe(false);
  });

  it("reopens the register modal after the user switched to login and closed it", () => {
    const { result } = renderModalState();

    act(() => result.current.openRegister());
    act(() => result.current.openLogin());
    act(() => result.current.closeLogin());

    expect(result.current.activeModal).toBeNull();

    // Regression: with a stuck `registerOpen`, this second request is a no-op
    // and the home-page CTA silently stops opening the modal.
    act(() => result.current.openRegister());
    expect(result.current.registerOpen).toBe(true);
    expect(result.current.activeModal).toBe("Register");
  });

  it("closeLogin leaves a different open modal alone", () => {
    const { result } = renderModalState();

    act(() => result.current.openRegister());
    act(() => result.current.closeLogin());

    expect(result.current.registerOpen).toBe(true);
  });

  it("closeModal dismisses whichever modal is showing", () => {
    const { result } = renderModalState();

    act(() => result.current.openModal("Forgot"));
    expect(result.current.activeModal).toBe("Forgot");

    act(() => result.current.closeModal());
    expect(result.current.activeModal).toBeNull();
  });
});
