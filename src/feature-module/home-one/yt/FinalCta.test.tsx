import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ModalProvider, useModal } from "@/context/ModalContext";
import FinalCta from "./FinalCta";

// Surfaces the shared modal state so the test asserts on what the CTA actually
// does, rather than on the presence of a link.
function RegisterProbe() {
  const { registerOpen } = useModal();
  return (
    <div data-testid="register-open">{registerOpen ? "open" : "closed"}</div>
  );
}

const renderCta = () =>
  render(
    <MemoryRouter>
      <ModalProvider>
        <FinalCta />
        <RegisterProbe />
      </ModalProvider>
    </MemoryRouter>,
  );

describe("FinalCta", () => {
  it("opens the register modal instead of navigating to the dead /register page", async () => {
    renderCta();

    expect(screen.getByTestId("register-open")).toHaveTextContent("closed");

    await userEvent.click(
      screen.getByRole("button", { name: /create free account/i }),
    );

    expect(screen.getByTestId("register-open")).toHaveTextContent("open");
  });

  it("does not link to /register", () => {
    renderCta();

    const registerLink = screen
      .queryAllByRole("link")
      .find((el) => el.getAttribute("href")?.startsWith("/register"));

    expect(registerLink).toBeUndefined();
  });
});
