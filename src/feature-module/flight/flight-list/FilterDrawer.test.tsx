import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterDrawer from "./FilterDrawer";

/** Trigger + drawer, the way flightList wires them, so focus restore is real. */
const Harness = ({ startOpen = false }: { startOpen?: boolean }) => {
  const [open, setOpen] = useState(startOpen);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        open-filters
      </button>
      <FilterDrawer open={open} onClose={() => setOpen(false)} title="Filters">
        <button type="button">inside-first</button>
        <button type="button">inside-last</button>
      </FilterDrawer>
    </>
  );
};

describe("FilterDrawer", () => {
  // The load-bearing one. The filter panel stages airline/stop/cabin edits in
  // its own state, so a drawer that unmounts its children throws away a staged
  // selection every time the user dismisses it.
  it("keeps its children mounted while closed", () => {
    render(
      <FilterDrawer open={false} onClose={vi.fn()} title="Filters">
        <button type="button">inside</button>
      </FilterDrawer>,
    );

    // `hidden: true` is not strictly required now that the panel relies on
    // `inert` alone (see the component and the test below) rather than also
    // setting `aria-hidden` — `getByRole` only excludes `aria-hidden`
    // subtrees, not `inert` ones. Kept anyway: it costs nothing, and it
    // keeps this assertion about presence robust to either mechanism if the
    // component's hiding strategy ever changes again.
    expect(
      screen.getByRole("button", { name: "inside", hidden: true }),
    ).toBeInTheDocument();
  });

  it("marks the closed panel inert", () => {
    const { rerender } = render(
      <FilterDrawer open={false} onClose={vi.fn()} title="Filters">
        <span>body</span>
      </FilterDrawer>,
    );

    const panel = screen.getByTestId("filter-drawer-panel");
    // `aria-hidden` is deliberately NOT set alongside `inert`: `inert` alone
    // already removes an element from the accessibility tree per the HTML
    // spec, in every browser this app supports, so the two together are
    // redundant — and the redundant `aria-hidden` broke `getByRole` queries
    // (which exclude `aria-hidden` subtrees but not `inert` ones) in five
    // pre-existing flightList page-test suites that interact with the filter
    // panel by role without opening the drawer first. See the component.
    expect(panel).not.toHaveAttribute("aria-hidden");
    expect(panel).toHaveAttribute("inert");

    rerender(
      <FilterDrawer open onClose={vi.fn()} title="Filters">
        <span>body</span>
      </FilterDrawer>,
    );

    expect(panel).not.toHaveAttribute("aria-hidden");
    expect(panel).not.toHaveAttribute("inert");
  });

  it("exposes an open drawer as a modal dialog named by its title", () => {
    render(
      <FilterDrawer open onClose={vi.fn()} title="Filters">
        <span>body</span>
      </FilterDrawer>,
    );

    const dialog = screen.getByRole("dialog", { name: "Filters" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("flags the root open so CSS can slide the panel in", () => {
    const { rerender } = render(
      <FilterDrawer open={false} onClose={vi.fn()} title="Filters">
        <span>body</span>
      </FilterDrawer>,
    );

    expect(screen.getByTestId("filter-drawer")).not.toHaveClass("is-open");

    rerender(
      <FilterDrawer open onClose={vi.fn()} title="Filters">
        <span>body</span>
      </FilterDrawer>,
    );

    expect(screen.getByTestId("filter-drawer")).toHaveClass("is-open");
  });

  it("closes on the close button", async () => {
    const onClose = vi.fn();
    render(
      <FilterDrawer open onClose={onClose} title="Filters">
        <span>body</span>
      </FilterDrawer>,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Close filters" }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on a backdrop click", async () => {
    const onClose = vi.fn();
    render(
      <FilterDrawer open onClose={onClose} title="Filters">
        <span>body</span>
      </FilterDrawer>,
    );

    await userEvent.click(screen.getByTestId("filter-drawer-backdrop"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    render(
      <FilterDrawer open onClose={onClose} title="Filters">
        <span>body</span>
      </FilterDrawer>,
    );

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ignores Escape while closed", async () => {
    const onClose = vi.fn();
    render(
      <FilterDrawer open={false} onClose={onClose} title="Filters">
        <span>body</span>
      </FilterDrawer>,
    );

    await userEvent.keyboard("{Escape}");

    expect(onClose).not.toHaveBeenCalled();
  });

  it("moves focus into the drawer on open and back to the trigger on close", async () => {
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "open-filters" });

    await userEvent.click(trigger);
    expect(screen.getByRole("button", { name: "Close filters" })).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });

  // `filtersLoading` can flip true while the drawer is open, disabling the
  // Filters button that opened it. `.focus()` on a disabled control silently
  // no-ops, so the restore has to notice and fall back rather than leave
  // focus wherever it happened to land.
  it("falls back to <body> when the trigger has gone disabled by the time the drawer closes", async () => {
    const DisablingHarness = () => {
      const [open, setOpen] = useState(false);
      const [disabled, setDisabled] = useState(false);
      return (
        <>
          <button type="button" disabled={disabled} onClick={() => setOpen(true)}>
            open-filters
          </button>
          <FilterDrawer open={open} onClose={() => setOpen(false)} title="Filters">
            <button type="button" onClick={() => setDisabled(true)}>
              disable-trigger
            </button>
          </FilterDrawer>
        </>
      );
    };
    render(<DisablingHarness />);

    await userEvent.click(screen.getByRole("button", { name: "open-filters" }));
    await userEvent.click(
      screen.getByRole("button", { name: "disable-trigger" }),
    );
    await userEvent.keyboard("{Escape}");

    expect(document.body).toHaveFocus();
  });

  it("locks body scroll while open and restores it on close", () => {
    const { rerender } = render(
      <FilterDrawer open onClose={vi.fn()} title="Filters">
        <span>body</span>
      </FilterDrawer>,
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <FilterDrawer open={false} onClose={vi.fn()} title="Filters">
        <span>body</span>
      </FilterDrawer>,
    );

    expect(document.body.style.overflow).toBe("");
  });
});
