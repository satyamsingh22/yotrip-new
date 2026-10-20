import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import PageMeta from "./PageMeta";

const content = (selector: string) =>
  document.head.querySelector(selector)?.getAttribute("content");

describe("PageMeta", () => {
  afterEach(() => {
    cleanup();
    document.head.querySelectorAll("[data-page-meta]").forEach((node) => node.remove());
    document.title = "";
  });

  it("sets the document title", () => {
    render(<PageMeta title="Halal Travel" description="Prayer times" canonicalPath="/halal" />);

    expect(document.title).toBe("Halal Travel");
  });

  it("writes a description and canonical link", () => {
    render(<PageMeta title="Halal Travel" description="Prayer times" canonicalPath="/halal" />);

    expect(content('meta[name="description"]')).toBe("Prayer times");
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toContain(
      "/halal",
    );
  });

  it("writes Open Graph and Twitter tags so shares render a card", () => {
    render(<PageMeta title="Halal Travel" description="Prayer times" canonicalPath="/halal" />);

    expect(content('meta[property="og:title"]')).toBe("Halal Travel");
    expect(content('meta[property="og:description"]')).toBe("Prayer times");
    expect(content('meta[name="twitter:card"]')).toBe("summary_large_image");
  });

  it("restores the previous title when it unmounts", () => {
    document.title = "Yotrip";
    const view = render(
      <PageMeta title="Halal Travel" description="Prayer times" canonicalPath="/halal" />,
    );
    view.unmount();

    expect(document.title).toBe("Yotrip");
  });

  it("does not stack duplicate tags when the title changes", () => {
    const view = render(<PageMeta title="One" description="First" canonicalPath="/halal" />);
    view.rerender(<PageMeta title="Two" description="Second" canonicalPath="/halal" />);

    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(content('meta[name="description"]')).toBe("Second");
  });
});
