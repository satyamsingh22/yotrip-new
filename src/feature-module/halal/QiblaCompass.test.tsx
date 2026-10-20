import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import QiblaCompass from "./QiblaCompass";

describe("QiblaCompass", () => {
  it("states the bearing in degrees and as a compass point", () => {
    render(<QiblaCompass degrees={119} point="ESE" placeLabel="Riyadh" />);

    // Scoped to the readout: the degrees also appear in the sentence below it.
    expect(screen.getByTestId("qibla-reading")).toHaveTextContent("119°");
    expect(screen.getByTestId("qibla-reading")).toHaveTextContent("ESE");
  });

  it("explains the bearing in plain language", () => {
    render(<QiblaCompass degrees={119} point="ESE" placeLabel="Riyadh" />);

    expect(screen.getByText(/Face 119° from north/i)).toBeInTheDocument();
  });

  it("names the place the bearing is for", () => {
    render(<QiblaCompass degrees={119} point="ESE" placeLabel="Riyadh" />);

    expect(screen.getByText(/Riyadh/)).toBeInTheDocument();
  });

  it("points the needle at the qibla bearing", () => {
    render(<QiblaCompass degrees={119} point="ESE" placeLabel="Riyadh" />);

    expect(screen.getByTestId("qibla-needle")).toHaveStyle({ transform: "rotate(119deg)" });
  });

  it("keeps north at the top — the dial never rotates", () => {
    render(<QiblaCompass degrees={119} point="ESE" placeLabel="Riyadh" />);

    expect(screen.getByTestId("qibla-dial")).not.toHaveAttribute("style");
  });

  it("offers no buttons — the bearing is the whole reading", () => {
    render(<QiblaCompass degrees={119} point="ESE" placeLabel="Riyadh" />);

    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
