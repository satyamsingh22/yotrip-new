import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FlightFilter from "./flightFilter";
import { createDefaultFiltersFromBounds } from "../../utils/flightFilters";

const priceBounds = { min: 100, max: 900 };
const airlines = [
  { code: "EK", name: "Emirates" },
  { code: "SV", name: "Saudia" },
  { code: "QR", name: "Qatar Airways" },
];
const base = createDefaultFiltersFromBounds(priceBounds);

const renderFilter = (
  overrides = {},
  onChange = vi.fn(),
  onApply = vi.fn(),
) => {
  const filters = { ...base, ...overrides };
  render(
    <FlightFilter
      filters={filters}
      onChange={onChange}
      onApply={onApply}
      onReset={vi.fn()}
      airlines={airlines}
      priceBounds={priceBounds}
      currency="SAR"
    />,
  );
  return { filters, onChange, onApply };
};

describe("FlightFilter applied-state affordances", () => {
  it("stays visually neutral while nothing is applied", () => {
    renderFilter();

    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
    expect(screen.queryByLabelText(/filters applied/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^Remove filter/ }),
    ).not.toBeInTheDocument();
  });

  it("shows the applied count, section badges and a chip per selection", () => {
    renderFilter({ stops: ["0"], airlines: ["EK", "SV"] });

    // The overall "N filters applied" badge lived in the header this
    // component no longer renders — the drawer owns the title now. This
    // component's own count signal is one removable chip per selection.
    expect(
      screen.getAllByRole("button", { name: /^Remove filter/ }),
    ).toHaveLength(3);
    expect(
      screen.getByRole("button", { name: "Reset all" }),
    ).toBeEnabled();

    expect(
      screen.getByRole("button", { name: "Remove filter Non-stop" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove filter Emirates" }),
    ).toBeInTheDocument();

    // Section badge: Airlines carries 2 of the 3.
    const airlinesSection = screen.getByRole("button", { name: /^Airlines/ });
    expect(airlinesSection).toHaveClass("has-active");
    expect(airlinesSection).toHaveTextContent("2");
  });

  it("tints the rows that are actually selected", () => {
    renderFilter({ airlines: ["EK"] });

    const emirates = screen.getByRole("checkbox", { name: /Emirates/ });
    const saudia = screen.getByRole("checkbox", { name: /Saudia/ });

    expect(emirates.closest("label")).toHaveClass("on");
    expect(saudia.closest("label")).not.toHaveClass("on");
  });

  it("still removes a client filter chip (baggage) immediately", async () => {
    const onChange = vi.fn();
    renderFilter({ baggage: "included" }, onChange);

    await userEvent.click(
      screen.getByRole("button", { name: /^Remove filter/ }),
    );

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].baggage).toBe("");
  });

  it("labels the price chip with the formatted range once narrowed", () => {
    renderFilter({ maxPrice: 500 });

    expect(
      screen.getAllByRole("button", { name: /^Remove filter/ }),
    ).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: /^Remove filter .*100.*500/ }),
    ).toBeInTheDocument();
  });
});

// A chip stands for a filter that is ALREADY applied — the search upstream was
// re-shopped for it — so its × must un-apply it there and then: the same
// immediate contract "Reset all" has, scoped to one selection. Staging the
// removal instead (the old shape) left the chip, the header count and the
// section badge completely unmoved, because all three are derived from the
// committed `filters`; the only feedback was the Apply button waking up at the
// bottom of a long scrolling sidebar, so the click read as dead.
//
// These need a live parent: the point of the change is what the committed
// `filters` prop does next, which a static `renderFilter` can never show.
describe("FlightFilter chip removal applies immediately", () => {
  const renderLive = (overrides = {}) => {
    const onApply = vi.fn();
    const Harness = () => {
      const [filters, setFilters] = useState({ ...base, ...overrides });
      return (
        <FlightFilter
          filters={filters}
          onChange={setFilters}
          onApply={(next) => {
            onApply(next);
            setFilters(next);
          }}
          onReset={() => setFilters(base)}
          airlines={airlines}
          priceBounds={priceBounds}
          currency="SAR"
        />
      );
    };
    render(<Harness />);
    return onApply;
  };

  // The primary button is never disabled and its label now tracks staged vs.
  // rest state rather than a fixed "Apply"/"Filters applied" pair, so it is
  // queried by its stable test id instead of matching on text.
  const applyButton = () => screen.getByTestId("drawer-primary");

  it("drops an airline chip and re-shops on the spot", async () => {
    const onApply = renderLive({ airlines: ["EK", "SV"] });

    await userEvent.click(
      screen.getByRole("button", { name: "Remove filter Emirates" }),
    );

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply.mock.calls[0][0].airlines).toEqual(["SV"]);
    expect(
      screen.queryByRole("button", { name: "Remove filter Emirates" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /Emirates/ })).not.toBeChecked();
    // The "N filters applied" badge moved out with the header; one chip
    // remains (SV) as this component's own applied-count signal.
    expect(
      screen.getAllByRole("button", { name: /^Remove filter/ }),
    ).toHaveLength(1);
    // Nothing is left staged and no result count is known here, so the
    // primary action reads its no-count resting label — never disabled.
    expect(applyButton()).toHaveTextContent("Show results");
  });

  it("drops a stop chip and re-shops on the spot", async () => {
    const onApply = renderLive({ stops: ["0"] });

    await userEvent.click(
      screen.getByRole("button", { name: "Remove filter Non-stop" }),
    );

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply.mock.calls[0][0].stops).toEqual([]);
    expect(
      screen.queryByRole("button", { name: /^Remove filter/ }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("radio")[0]).not.toBeChecked();
  });

  // The chip commits `chip.next` — committed filters minus this one value —
  // never the draft, so an unrelated staged edit is not dragged into the
  // commit and stays pending exactly as the user left it.
  it("does not resurrect an airline already unchecked in the draft", async () => {
    const onApply = renderLive({ airlines: ["EK", "SV", "QR"] });

    // Stage QR off first.
    await userEvent.click(screen.getByRole("checkbox", { name: "Qatar Airways" }));
    expect(screen.getByRole("checkbox", { name: /Qatar Airways/ })).not.toBeChecked();

    await userEvent.click(
      screen.getByRole("button", { name: "Remove filter Saudia" }),
    );

    // Only SV left the committed set; QR was never applied off, so it is still
    // committed — and still staged off, waiting on Apply.
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply.mock.calls[0][0].airlines).toEqual(["EK", "QR"]);
    expect(screen.getByRole("checkbox", { name: /Qatar Airways/ })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Emirates/ })).toBeChecked();
    expect(applyButton()).toBeEnabled();

    await userEvent.click(applyButton());
    expect(onApply).toHaveBeenCalledTimes(2);
    expect(onApply.mock.calls[1][0].airlines).toEqual(["EK"]);
  });

  it("does not wipe an airline just staged on in the draft", async () => {
    const onApply = renderLive({ airlines: ["EK", "SV"] });

    // Stage QR on.
    await userEvent.click(screen.getByRole("checkbox", { name: "Qatar Airways" }));
    expect(screen.getByRole("checkbox", { name: /Qatar Airways/ })).toBeChecked();

    await userEvent.click(
      screen.getByRole("button", { name: "Remove filter Saudia" }),
    );

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply.mock.calls[0][0].airlines).toEqual(["EK"]);
    // The staged QR addition must survive the commit the chip triggered.
    expect(screen.getByRole("checkbox", { name: /Qatar Airways/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Emirates/ })).toBeChecked();
    expect(applyButton()).toBeEnabled();

    await userEvent.click(applyButton());
    expect(onApply).toHaveBeenCalledTimes(2);
    expect(onApply.mock.calls[1][0].airlines).toEqual(["EK", "QR"]);
  });
});

// Finding 4: the primary control must (a) always be reachable — it now lives
// in a sticky footer pinned to the bottom of the drawer body — and (b) never
// lie about its own state to an accessibility-tree reader, whose accessible
// name must match the text a sighted user sees (WCAG 2.5.3 Label-in-Name).
// It is also never disabled: with nothing staged and no result count known
// (these tests render outside a drawer's `resultCount` prop) it falls back to
// the honest, count-free "Show results" rather than a stale "Filters applied".
describe("FlightFilter Apply control affordances", () => {
  it("is wrapped in the sticky footer (`.ytf-footer`)", () => {
    renderFilter();
    const button = screen.getByTestId("drawer-primary");
    expect(button.parentElement).toHaveClass("ytf-footer");
  });

  it("at rest with nothing staged and no result count known, reads 'Show results'", () => {
    renderFilter();
    const button = screen.getByTestId("drawer-primary");
    expect(button).toHaveTextContent("Show results");
    expect(button).toHaveAccessibleName("Show results");
    expect(button).not.toBeDisabled();
  });

  it("while a change is staged, the visible text and accessible name both read 'Apply filters'", async () => {
    renderFilter();
    await userEvent.click(screen.getByLabelText(/Emirates/i));

    const button = screen.getByRole("button", { name: "Apply filters" });
    expect(button).toHaveTextContent("Apply filters");
    expect(button).toHaveAccessibleName("Apply filters");
    expect(button).toBeEnabled();
  });

  it("once something is genuinely applied and nothing is pending, still reads 'Show results' without a known count", () => {
    renderFilter({ airlines: ["EK"] });

    const button = screen.getByTestId("drawer-primary");
    expect(button).toHaveTextContent("Show results");
    expect(button).toHaveAccessibleName("Show results");
    expect(button).not.toBeDisabled();
  });
});

// The whole row is a <label> wrapping its own control, so a click can land on
// the circle/box, on the text, or (for airlines) on the logo. All three must
// register exactly one toggle — a label that re-fires its own control would
// toggle twice and silently no-op.
describe("FlightFilter click targets", () => {
  // Airline/stop/cabin are server filters (Task 9): a click only stages a
  // draft — the radio/checkbox reflects it instantly, but onChange does not
  // fire until Apply is pressed. See the "FlightFilter Apply button" describe
  // block below for the staging contract itself; these tests keep covering
  // that every click target (circle/text/checkbox/name/logo) still reaches
  // the same draft correctly under the new gate.
  it("selects a stop from the radio circle (stages, applies on demand)", async () => {
    const onChange = vi.fn();
    const onApply = vi.fn();
    renderFilter({}, onChange, onApply);

    const radio = screen.getAllByRole("radio")[0];
    await userEvent.click(radio);

    expect(onChange).not.toHaveBeenCalled();
    expect(radio).toBeChecked();

    await userEvent.click(screen.getByRole("button", { name: /apply/i }));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply.mock.calls[0][0].stops).toEqual(["0"]);
  });

  it("selects the same stop from the label text", async () => {
    const onChange = vi.fn();
    const onApply = vi.fn();
    renderFilter({}, onChange, onApply);

    await userEvent.click(screen.getByText("Non-stop"));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getAllByRole("radio")[0]).toBeChecked();

    await userEvent.click(screen.getByRole("button", { name: /apply/i }));
    expect(onApply.mock.calls[0][0].stops).toEqual(["0"]);
  });

  it("clears an already-selected stop when clicked again", async () => {
    const onChange = vi.fn();
    const onApply = vi.fn();
    renderFilter({}, onChange, onApply);

    const nonStop = screen.getByText("Non-stop");
    await userEvent.click(nonStop);
    expect(screen.getAllByRole("radio")[0]).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.click(nonStop);
    expect(screen.getAllByRole("radio")[0]).not.toBeChecked();
    // The draft round-tripped back to the committed value, so update()
    // short-circuits straight to onChange instead of waiting on Apply.
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].stops).toEqual([]);
  });

  it("toggles an airline from the checkbox, the name and the logo alike", async () => {
    for (const target of ["checkbox", "name", "logo"] as const) {
      const onChange = vi.fn();
      const onApply = vi.fn();
      const { unmount } = render(
        <FlightFilter
          filters={base}
          onChange={onChange}
          onApply={onApply}
          onReset={vi.fn()}
          airlines={airlines}
          priceBounds={priceBounds}
          currency="SAR"
        />,
      );

      const row = screen.getByText("Emirates").closest("label")!;
      const node =
        target === "checkbox"
          ? row.querySelector("input")!
          : target === "name"
            ? screen.getByText("Emirates")
            : row.querySelector("img")!;
      await userEvent.click(node);

      expect(onChange, `clicking the ${target}`).not.toHaveBeenCalled();
      expect(row.querySelector("input"), `clicking the ${target}`).toBeChecked();

      await userEvent.click(screen.getByRole("button", { name: /apply/i }));
      expect(onApply.mock.calls[0][0].airlines, `clicking the ${target}`).toEqual([
        "EK",
      ]);
      unmount();
    }
  });

  it("toggles a cabin from the checkbox and from its text", async () => {
    const onChange = vi.fn();
    const onApply = vi.fn();
    const { rerender } = render(
      <FlightFilter
        filters={base}
        onChange={onChange}
        onApply={onApply}
        onReset={vi.fn()}
        airlines={airlines}
        priceBounds={priceBounds}
        currency="SAR"
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /^Cabin class/ }));
    await userEvent.click(screen.getByText("Economy"));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("checkbox", { name: "Economy" })).toBeChecked();

    await userEvent.click(screen.getByRole("button", { name: /apply/i }));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply.mock.calls[0][0].cabins).toEqual(["Economy"]);

    onApply.mockClear();
    rerender(
      <FlightFilter
        filters={{ ...base, cabins: ["Economy"] }}
        onChange={onChange}
        onApply={onApply}
        onReset={vi.fn()}
        airlines={airlines}
        priceBounds={priceBounds}
        currency="SAR"
      />,
    );
    await userEvent.click(screen.getByRole("checkbox", { name: "Economy" }));
    expect(screen.getByRole("checkbox", { name: "Economy" })).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("collapsing a section never touches the filters, badge included", async () => {
    const onChange = vi.fn();
    renderFilter({ stops: ["0"] }, onChange);

    const header = screen.getByRole("button", { name: /^Stops/ });
    expect(header).toHaveAttribute("aria-expanded", "true");

    // Click the count badge itself — it sits inside the header button.
    await userEvent.click(screen.getByLabelText("1 applied"));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /^Stops/ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    // The badge survives collapsing — that is the point of it.
    expect(screen.getByLabelText("1 applied")).toBeInTheDocument();
  });
});

// Regression: the radio circle is DOM state, the wash and the badge are React
// state. They must never disagree — a highlighted row whose circle is empty
// (or vice versa) makes the panel look like it ignored the click.
describe("FlightFilter stop selection stays in sync", () => {
  const Harness = () => {
    const [filters, setFilters] = useState(base);
    return (
      <FlightFilter
        filters={filters}
        onChange={setFilters}
        onApply={setFilters}
        onReset={() => setFilters(base)}
        airlines={airlines}
        priceBounds={priceBounds}
        currency="SAR"
      />
    );
  };

  const checkedRadios = () =>
    screen.getAllByRole("radio").filter((r) => (r as HTMLInputElement).checked);

  const clickStop = (label: string) => {
    const row = screen
      .getAllByRole("radio")
      .map((r) => r.closest("label")!)
      .find((l) => within(l).queryByText(label))!;
    return userEvent.click(within(row).getByText(label));
  };

  it("moves the circle, the wash and the badge together", async () => {
    render(<Harness />);

    await clickStop("2 stops or less");
    expect(checkedRadios()).toHaveLength(1);
    expect(checkedRadios()[0].closest("label")).toHaveTextContent(
      "2 stops or less",
    );

    await clickStop("1 stop or less");

    const checked = checkedRadios();
    expect(checked).toHaveLength(1);
    expect(checked[0].closest("label")).toHaveTextContent("1 stop or less");
    // The wash must be on that same row, and on no other.
    expect(checked[0].closest("label")).toHaveClass("on");
    expect(document.querySelectorAll(".ytf-radio.on")).toHaveLength(1);

    // The badge reflects the committed count, so it lags one step behind the
    // circle/wash — it only shows once Apply commits the staged selection.
    expect(screen.queryByLabelText(/applied/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /apply/i }));
    expect(screen.getByLabelText("1 applied")).toBeInTheDocument();
  });

  const clickStopCircle = (label: string) => {
    const row = screen
      .getAllByRole("radio")
      .map((r) => r.closest("label")!)
      .find((l) => within(l).queryByText(label))!;
    return userEvent.click(row.querySelector("input")!);
  };

  it("switches selection when the circle itself is clicked", async () => {
    render(<Harness />);

    await clickStopCircle("Non-stop");
    expect(checkedRadios()).toHaveLength(1);
    expect(checkedRadios()[0].closest("label")).toHaveTextContent("Non-stop");

    // The reported bug: with one row already on, aiming at another row's circle
    // washed the row teal but left the filter (and the circle) unchanged.
    await clickStopCircle("1 stop or less");

    const checked = checkedRadios();
    expect(checked).toHaveLength(1);
    expect(checked[0].closest("label")).toHaveTextContent("1 stop or less");
    expect(checked[0].closest("label")).toHaveClass("on");
    expect(document.querySelectorAll(".ytf-radio.on")).toHaveLength(1);

    await userEvent.click(screen.getByRole("button", { name: /apply/i }));
    expect(
      screen.getByRole("button", { name: "Remove filter 1 stop or less" }),
    ).toBeInTheDocument();

    // And the circle can clear its own row again.
    await clickStopCircle("1 stop or less");
    expect(checkedRadios()).toHaveLength(0);
    expect(document.querySelectorAll(".ytf-radio.on")).toHaveLength(0);
  });

  it("empties the circle when the selected stop is clicked off", async () => {
    render(<Harness />);

    await clickStop("Non-stop");
    expect(checkedRadios()).toHaveLength(1);

    await clickStop("Non-stop");
    expect(checkedRadios()).toHaveLength(0);
    expect(document.querySelectorAll(".ytf-radio.on")).toHaveLength(0);
    expect(screen.queryByLabelText(/filters applied/)).not.toBeInTheDocument();
  });
});

describe("FlightFilter keyboard", () => {
  it("selects a stop with the keyboard without double-toggling", async () => {
    const onChange = vi.fn();
    const onApply = vi.fn();
    renderFilter({}, onChange, onApply);

    const nonStop = screen.getAllByRole("radio")[0];
    nonStop.focus();
    await userEvent.keyboard(" ");

    expect(onChange).not.toHaveBeenCalled();
    expect(nonStop).toBeChecked();

    await userEvent.click(screen.getByRole("button", { name: /apply/i }));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply.mock.calls[0][0].stops).toEqual(["0"]);
  });
});

// Task 9: airlines/stops/cabins re-shop the search upstream (~12s), so they
// stage in draft state and only reach the parent when Apply is pressed.
// Price/baggage/amenity/time stay client-side and keep applying instantly —
// covered by the existing describes above, which are unchanged by this task.
describe("FlightFilter Apply button (staged airline/stop/cabin filters)", () => {
  const setup = () => {
    const onChange = vi.fn();
    const onApply = vi.fn();
    render(
      <FlightFilter
        filters={createDefaultFiltersFromBounds({ min: 0, max: 1000 })}
        onChange={onChange}
        onApply={onApply}
        onReset={vi.fn()}
        airlines={[{ code: "EK", name: "Emirates" }]}
        priceBounds={{ min: 0, max: 1000 }}
      />,
    );
    return { onChange, onApply };
  };

  it("does not apply an airline click immediately", async () => {
    const { onChange, onApply } = setup();
    await userEvent.click(screen.getByLabelText(/Emirates/i));
    expect(onChange).not.toHaveBeenCalled();
    expect(onApply).not.toHaveBeenCalled();
  });

  it("commits the pending airline only when Apply is pressed", async () => {
    const { onApply } = setup();
    await userEvent.click(screen.getByLabelText(/Emirates/i));
    await userEvent.click(screen.getByRole("button", { name: /apply/i }));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply.mock.calls[0][0].airlines).toEqual(["EK"]);
  });

  it("reads the no-count resting label until something is pending", () => {
    setup();
    expect(screen.getByTestId("drawer-primary")).toHaveTextContent(
      "Show results",
    );
  });
});

// Review Finding 2: `filters` changes for two different reasons — a genuine
// server-side commit (Apply/Reset/new search) vs. a client-only edit
// (price/baggage/time) that still round-trips through onChange into a brand
// new `filters` object. Only the first should wipe a staged airline/stop/
// cabin selection. These need a live parent (onChange/onApply -> setState)
// so the `filters` prop genuinely changes underneath the component — a
// static `renderFilter` call wouldn't exercise the effect this covers.
describe("FlightFilter keeps a staged selection across unrelated changes", () => {
  const Harness = () => {
    const [filters, setFilters] = useState(base);
    return (
      <FlightFilter
        filters={filters}
        onChange={setFilters}
        onApply={setFilters}
        onReset={() => setFilters(base)}
        airlines={airlines}
        priceBounds={priceBounds}
        currency="SAR"
      />
    );
  };

  it("keeps a staged airline selection when a client filter changes afterwards", async () => {
    render(<Harness />);

    await userEvent.click(screen.getByLabelText(/Emirates/i));
    expect(screen.getByRole("checkbox", { name: /Emirates/ })).toBeChecked();
    expect(screen.getByRole("button", { name: /apply/i })).toBeEnabled();

    // A client filter (baggage) round-trips through onChange -> setFilters ->
    // a genuinely new `filters` prop. That must not silently untick Emirates.
    await userEvent.click(screen.getByText("No checked baggage"));

    expect(screen.getByRole("checkbox", { name: /Emirates/ })).toBeChecked();
    expect(screen.getByRole("button", { name: /apply/i })).toBeEnabled();
  });

  // The trap: judging "did the server keys change" only against the previous
  // `filters` would say "no" here too (they were never committed, so a Reset
  // back to defaults looks like a no-op on those keys) and leave the staged
  // selection alive — Reset must clear it directly, not rely on that diff.
  it("Reset clears a staged-but-unapplied selection, not just the committed one", async () => {
    render(<Harness />);

    // Get a real applied filter on the books first so Reset is enabled.
    await userEvent.click(screen.getByText("No checked baggage"));
    expect(screen.getByRole("button", { name: "Reset all" })).toBeEnabled();

    // Stage an airline selection without ever pressing Apply.
    await userEvent.click(screen.getByLabelText(/Emirates/i));
    expect(screen.getByRole("button", { name: /apply/i })).toBeEnabled();

    await userEvent.click(screen.getByRole("button", { name: "Reset all" }));

    expect(screen.getByRole("checkbox", { name: /Emirates/ })).not.toBeChecked();
    // Nothing left staged and no result count known — the honest resting
    // label, not a disabled control.
    expect(screen.getByTestId("drawer-primary")).toHaveTextContent(
      "Show results",
    );
  });
});

// While one provider is still in flight the panel is live but INCOMPLETE: the
// airline list and the price bounds are unions across the buckets that have
// landed so far, so both still grow. Static sections (stops/baggage/time/cabin)
// never change their options, but every section's OUTCOME does — ticking
// "Business Class" at 2s can match nothing and match plenty at 8s. So the panel
// says so once, plainly, and marks the two sections whose contents actually grow.
describe("FlightFilter incomplete-results notice", () => {
  const renderLoading = (isLoadingMore: boolean) =>
    render(
      <FlightFilter
        filters={base}
        onChange={vi.fn()}
        onApply={vi.fn()}
        onReset={vi.fn()}
        airlines={airlines}
        priceBounds={priceBounds}
        currency="SAR"
        isLoadingMore={isLoadingMore}
      />,
    );

  // The results heading owns the progress narration (spinner + climbing
  // count). The sidebar stays silent until the search finishes rather than
  // competing with it in a narrow column.
  it("withholds its count while the search is still running", () => {
    render(
      <FlightFilter
        filters={base}
        onChange={vi.fn()}
        onApply={vi.fn()}
        onReset={vi.fn()}
        airlines={airlines}
        priceBounds={priceBounds}
        currency="SAR"
        resultCount={33}
        isLoadingMore
      />,
    );
    expect(screen.queryByTestId("filters-count")).not.toBeInTheDocument();
  });

  it("shows the count once every provider has landed", () => {
    render(
      <FlightFilter
        filters={base}
        onChange={vi.fn()}
        onApply={vi.fn()}
        onReset={vi.fn()}
        airlines={airlines}
        priceBounds={priceBounds}
        currency="SAR"
        resultCount={33}
        isLoadingMore={false}
      />,
    );
    expect(screen.getByTestId("filters-count")).toHaveTextContent(
      "33 flights found.",
    );
  });

  // The denominator was the merged bucket size, which shrinks when a provider
  // honours the filter upstream and does not when it ignores it — so it
  // measured provider behaviour, not the route. Nothing may reintroduce it
  // without a stable route total behind it.
  it("states the matched count alone, with no 'out of N' companion", () => {
    render(
      <FlightFilter
        filters={base}
        onChange={vi.fn()}
        onApply={vi.fn()}
        onReset={vi.fn()}
        airlines={airlines}
        priceBounds={priceBounds}
        currency="SAR"
        resultCount={4}
        isLoadingMore={false}
      />,
    );
    expect(screen.getByTestId("filters-count")).toHaveTextContent(
      "4 flights found.",
    );
    expect(screen.queryByText(/out of/i)).not.toBeInTheDocument();
  });

  it("says 'flight' when exactly one matches", () => {
    render(
      <FlightFilter
        filters={base}
        onChange={vi.fn()}
        onApply={vi.fn()}
        onReset={vi.fn()}
        airlines={airlines}
        priceBounds={priceBounds}
        currency="SAR"
        resultCount={1}
        isLoadingMore={false}
      />,
    );
    expect(screen.getByTestId("filters-count")).toHaveTextContent(
      "1 flight found.",
    );
  });

  it("marks the two sections whose contents actually grow", () => {
    renderLoading(true);
    // Airlines and Price are unions across landed providers.
    expect(screen.getByTestId("section-growing-airlines")).toBeInTheDocument();
    expect(screen.getByTestId("section-growing-price")).toBeInTheDocument();
  });

  it("does not mark sections whose options are a fixed list", () => {
    renderLoading(true);
    for (const section of ["stops", "baggage", "time", "cabin"]) {
      expect(
        screen.queryByTestId(`section-growing-${section}`),
      ).not.toBeInTheDocument();
    }
  });

  it("leaves the panel fully interactive — Apply is never blocked by loading", async () => {
    const onApply = vi.fn();
    render(
      <FlightFilter
        filters={base}
        onChange={vi.fn()}
        onApply={onApply}
        onReset={vi.fn()}
        airlines={airlines}
        priceBounds={priceBounds}
        currency="SAR"
        isLoadingMore
      />,
    );
    await userEvent.click(screen.getByLabelText(/Emirates/i));
    const apply = screen.getByRole("button", { name: /apply/i });
    expect(apply).toBeEnabled();
    await userEvent.click(apply);
    expect(onApply).toHaveBeenCalledTimes(1);
  });
});

describe("FlightFilter inside a drawer", () => {
  const renderInDrawer = (overrides = {}, handlers = {}) => {
    const onApply = vi.fn();
    const onClose = vi.fn();
    const onReset = vi.fn();
    const filters = { ...base, ...overrides };
    const { container } = render(
      <FlightFilter
        filters={filters}
        onChange={vi.fn()}
        onApply={onApply}
        onReset={onReset}
        onClose={onClose}
        airlines={airlines}
        priceBounds={priceBounds}
        currency="SAR"
        {...handlers}
      />,
    );
    return { container, onApply, onClose, onReset, filters };
  };

  // The drawer supplies the column and the title now. A panel that still
  // rendered a Bootstrap column would nest a grid column inside a fixed
  // drawer and inherit gutter padding that has nothing to hold it.
  it("no longer renders itself as a grid column", () => {
    const { container } = renderInDrawer();
    expect(container.querySelector(".col-xl-3")).toBeNull();
    expect(container.querySelector(".theiaStickySidebar")).toBeNull();
  });

  it("keeps Reset reachable in the footer", () => {
    const { container } = renderInDrawer({ stops: ["0"] });
    const footer = container.querySelector(".ytf-footer") as HTMLElement;
    expect(within(footer).getByRole("button", { name: "Reset all" })).toBeInTheDocument();
  });

  it("does not close when Reset is pressed", async () => {
    const { onClose, onReset } = renderInDrawer({ stops: ["0"] });
    await userEvent.click(screen.getByRole("button", { name: "Reset all" }));
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("offers the result count as the primary action when nothing is staged", () => {
    renderInDrawer({}, { resultCount: 34 });
    expect(screen.getByTestId("drawer-primary")).toHaveTextContent(
      "Show 34 flights",
    );
  });

  it("uses the singular form for a single result", () => {
    renderInDrawer({}, { resultCount: 1 });
    expect(screen.getByTestId("drawer-primary")).toHaveTextContent(
      "Show 1 flight",
    );
  });

  // A count of zero is stated by the panel's own count line and the results
  // empty state. The button does not need to repeat it back as a promise.
  it("drops the number at zero results", () => {
    renderInDrawer({}, { resultCount: 0 });
    expect(screen.getByTestId("drawer-primary")).toHaveTextContent(
      "Show results",
    );
  });

  // Mid-search the count is a partial. Promising it would be a lie that
  // resolves itself two seconds later.
  it("drops the number while providers are still landing", () => {
    renderInDrawer({}, { resultCount: 12, isLoadingMore: true });
    expect(screen.getByTestId("drawer-primary")).toHaveTextContent(
      "Show results",
    );
  });

  it("closes without applying when nothing is staged", async () => {
    const { onApply, onClose } = renderInDrawer({}, { resultCount: 34 });
    await userEvent.click(screen.getByTestId("drawer-primary"));
    expect(onApply).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // The whole point of the redesign: the only exit that reads as "done" also
  // commits, so a staged filter cannot be silently dropped by dismissing.
  it("applies the staged draft and closes in one click", async () => {
    const { onApply, onClose } = renderInDrawer({}, { resultCount: 34 });

    await userEvent.click(screen.getByRole("radio", { name: /non-stop/i }));
    expect(screen.getByTestId("drawer-primary")).toHaveTextContent(
      "Apply filters",
    );

    await userEvent.click(screen.getByTestId("drawer-primary"));

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply.mock.calls[0][0].stops).toEqual(["0"]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // It used to be disabled at rest. In a drawer, disabling the primary action
  // strands a user whose only other exit is a 34px × in the corner.
  it("is never disabled", () => {
    renderInDrawer({}, { resultCount: 34 });
    expect(screen.getByTestId("drawer-primary")).not.toBeDisabled();
  });

  it("keeps its accessible name identical to its visible text", () => {
    renderInDrawer({}, { resultCount: 34 });
    const button = screen.getByTestId("drawer-primary");
    expect(button).toHaveAccessibleName(button.textContent as string);
  });
});
