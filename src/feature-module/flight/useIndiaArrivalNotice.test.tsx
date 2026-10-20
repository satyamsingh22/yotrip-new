import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import {
  SdfNoticeProvider,
  useSdfNotice,
} from "../../context/SdfNoticeContext";
import { useIndiaArrivalNotice } from "./useIndiaArrivalNotice";

// Exercised through the real SdfNoticeProvider rather than a mocked context:
// what matters is that the notice actually ends up open, not that a spy was
// called.

const TO_INDIA = [{ origin: "RUH", destination: "DEL" }];
const TO_JEDDAH = [{ origin: "RUH", destination: "JED" }];

const Probe = ({ legs }: { legs?: unknown[] }) => {
  const { isOpen, closeNotice } = useSdfNotice();
  useIndiaArrivalNotice(legs as never);
  return (
    <>
      <span data-testid="state">{isOpen ? "open" : "closed"}</span>
      <button onClick={closeNotice}>dismiss</button>
    </>
  );
};

const renderWithLegs = (legs?: unknown[]) =>
  render(
    <SdfNoticeProvider>
      <Probe legs={legs} />
    </SdfNoticeProvider>,
  );

const state = () => screen.getByTestId("state").textContent;

describe("useIndiaArrivalNotice", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("opens the notice for an itinerary arriving in India", () => {
    renderWithLegs(TO_INDIA);

    expect(state()).toBe("open");
  });

  it("stays quiet for an itinerary that never touches India", () => {
    renderWithLegs(TO_JEDDAH);

    expect(state()).toBe("closed");
  });

  it("stays quiet when no itinerary is selected yet", () => {
    renderWithLegs(undefined);

    expect(state()).toBe("closed");
  });

  it("opens once the itinerary arrives asynchronously", () => {
    // selectedFlight comes from context and can be empty on first paint.
    const { rerender } = renderWithLegs([]);
    expect(state()).toBe("closed");

    rerender(
      <SdfNoticeProvider>
        <Probe legs={TO_INDIA} />
      </SdfNoticeProvider>,
    );

    expect(state()).toBe("open");
  });

  it("does not reopen after the traveller dismisses it", async () => {
    const { rerender } = renderWithLegs(TO_INDIA);
    expect(state()).toBe("open");

    await userEvent.click(screen.getByText("dismiss"));
    expect(state()).toBe("closed");

    // A re-render with a fresh legs array (same route) must not nag again.
    rerender(
      <SdfNoticeProvider>
        <Probe legs={[{ origin: "RUH", destination: "DEL" }]} />
      </SdfNoticeProvider>,
    );

    expect(state()).toBe("closed");
  });
});
