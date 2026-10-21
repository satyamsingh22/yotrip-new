import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { footerDestinationHref } from "./footer";
import { getCityDisplayName } from "../../../utils/hotelCitySearch";

vi.mock("../../../context/SdfNoticeContext", () => ({
  useSdfNotice: () => ({ openNotice: vi.fn() }),
}));

vi.mock("../imageWithBasePath", () => ({
  default: ({ alt = "" }: { alt?: string }) => <img alt={alt} />,
}));

// Every currently-shipped footer destination is ASCII and alias-free, so
// rendering the real list exercises neither the display-alias path nor the
// percent-encoding one — swapping getCityDisplayName(destination) for
// destination.name in footer.tsx left the whole suite green. These two entries
// are appended (not substituted) so the assertions above, which pin the real
// Riyadh/Dubai links, keep testing the shipped list.
vi.mock("../../../data/popularHotelDestinations", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../data/popularHotelDestinations")
    >();
  return {
    ...actual,
    FOOTER_DESTINATIONS: [
      ...actual.FOOTER_DESTINATIONS,
      // Aliased: catalog spells it "Bengaluru", users read "Bangalore".
      { name: "Bengaluru", country: "IN" },
      // Not aliased, but a curly apostrophe (U+2019) that must survive encoding.
      { name: "Ta’if", country: "SA" },
    ],
  };
});

import Footer from "./footer";

const renderFooter = () =>
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );

const REMOVED = [
  "Our Team",
  "Gallery",
  "Listings",
  "Blog",
  "Affiliate Program",
  "Add Your Listing",
  "Our Partners",
  "Activity Finder",
  "Legal Notice",
  "Refund Policy",
  "Pricing Plans",
];

const KEPT = [
  "Home",
  "Settings",
  "Profile",
  "My Bookings",
  "About Us",
  "Careers",
  "Halal Travel",
  "Contact Us",
  "Privacy Policy",
  "Delete Account",
  "Terms and Conditions",
  "Chat Support",
  "Search Hotels",
  "Search Flights",
  "Car Rentals",
  "Holiday Packages",
];

describe("Footer link inventory", () => {
  it.each(REMOVED)("no longer renders %s", (label) => {
    renderFooter();
    expect(
      screen.queryByRole("link", { name: label }),
    ).not.toBeInTheDocument();
  });

  it.each(KEPT)("still renders %s", (label) => {
    renderFooter();
    // Privacy / Terms / Contact also repeat in the bottom legal bar
    expect(screen.getAllByRole("link", { name: label }).length).toBeGreaterThan(0);
  });

  it("keeps the SDF notice trigger", () => {
    renderFooter();
    expect(
      screen.getByRole("link", { name: "India Travel: SDF Required" }),
    ).toBeInTheDocument();
  });

  it("keeps the four link columns", () => {
    renderFooter();
    ["Pages", "Company", "Popular Destinations", "Support"].forEach(
      (heading) => {
        expect(
          screen.getByRole("heading", { name: heading }),
        ).toBeInTheDocument();
      },
    );
  });
});

describe("Footer service links", () => {
  it("points Search Flights at the live results page, not the placeholder grid", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: "Search Flights" })).toHaveAttribute(
      "href",
      "/flight/flight-list",
    );
  });

  it("points Search Hotels, Car Rentals and Holiday Packages at their grids", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: "Search Hotels" })).toHaveAttribute(
      "href",
      "/hotel/hotel-grid",
    );
    expect(screen.getByRole("link", { name: "Car Rentals" })).toHaveAttribute(
      "href",
      "/car/car-grid",
    );
    expect(screen.getByRole("link", { name: "Holiday Packages" })).toHaveAttribute(
      "href",
      "/package/package-grid",
    );
  });

  it("has no dead links anywhere in the footer (socials and app badges are not links)", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/probe-route"]}>
        <Footer />
      </MemoryRouter>,
    );
    const dead = Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).filter((a) => {
      const href = a.getAttribute("href");
      return href === "#" || href === "/probe-route";
    });
    expect(dead.map((a) => a.textContent)).toEqual(["India Travel: SDF Required"]);
  });
});

describe("Footer destinations", () => {
  it("links each destination to a prefilled hotel search", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: "Riyadh" })).toHaveAttribute(
      "href",
      "/hotel/hotel-grid?city=Riyadh&country=SA",
    );
    expect(screen.getByRole("link", { name: "Dubai" })).toHaveAttribute(
      "href",
      "/hotel/hotel-grid?city=Dubai&country=AE",
    );
  });

  it("labels an aliased destination with its display name while the URL keeps the catalog spelling", () => {
    renderFooter();

    // The label/URL split is the whole point: resolveHotelCityByName matches on
    // the catalog spelling, so the param must carry "Bengaluru" even though no
    // user would recognise it.
    const link = screen.getByRole("link", { name: "Bangalore" });
    expect(link).toHaveAttribute(
      "href",
      "/hotel/hotel-grid?city=Bengaluru&country=IN",
    );
    expect(
      screen.queryByRole("link", { name: "Bengaluru" }),
    ).not.toBeInTheDocument();
  });

  it("renders an un-aliased destination verbatim and percent-encodes it", () => {
    renderFooter();

    expect(screen.getByRole("link", { name: "Ta’if" })).toHaveAttribute(
      "href",
      "/hotel/hotel-grid?city=Ta%E2%80%99if&country=SA",
    );
  });

  it("drops the placeholder cities", () => {
    renderFooter();
    ["Hawai", "San Diego", "Belgium", "Los Angeles", "Newyork"].forEach(
      (city) => {
        expect(
          screen.queryByRole("link", { name: city }),
        ).not.toBeInTheDocument();
      },
    );
  });

  it("leaves no dead links in the footer navigation", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/probe-route"]}>
        <Footer />
      </MemoryRouter>,
    );

    // A `<Link to="#">` renders as the CURRENT path under react-router v7, so a
    // dead link is one whose href goes nowhere: either a literal "#" or straight
    // back to the page we are already on.
    const dead = Array.from(
      container.querySelectorAll<HTMLAnchorElement>(".footer-menu a"),
    ).filter((a) => {
      const href = a.getAttribute("href");
      return href === "#" || href === "/probe-route";
    });

    // Only the SDF notice trigger, which opens a modal instead of navigating.
    expect(dead.map((a) => a.textContent)).toEqual(["India Travel: SDF Required"]);
  });
});

describe("footerDestinationHref", () => {
  it("percent-encodes a name containing punctuation", () => {
    expect(footerDestinationHref({ name: "Ta’if", country: "SA" })).toBe(
      "/hotel/hotel-grid?city=Ta%E2%80%99if&country=SA",
    );
  });

  it("keeps the catalog spelling in the URL even when the label is aliased", () => {
    // The label says "Bangalore"; the query param must stay "Bengaluru", which is
    // what cities500.json and resolveHotelCityByName actually match on.
    expect(getCityDisplayName({ name: "Bengaluru" })).toBe("Bangalore");
    expect(footerDestinationHref({ name: "Bengaluru", country: "IN" })).toBe(
      "/hotel/hotel-grid?city=Bengaluru&country=IN",
    );
  });

  it("round-trips through URLSearchParams", () => {
    const href = footerDestinationHref({ name: "Ta’if", country: "SA" });
    const params = new URLSearchParams(href.split("?")[1]);
    expect(params.get("city")).toBe("Ta’if");
    expect(params.get("country")).toBe("SA");
  });
});

describe("Footer account CTA", () => {
  it("opens the register modal (deals come with a free account — there is no newsletter API)", async () => {
    const { ModalProvider, useModal } = await import("../../../context/ModalContext");
    const userEvent = (await import("@testing-library/user-event")).default;
    const Probe = () => {
      const { registerOpen } = useModal();
      return <div data-testid="register-open">{registerOpen ? "open" : "closed"}</div>;
    };
    render(
      <MemoryRouter>
        <ModalProvider>
          <Footer />
          <Probe />
        </ModalProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId("register-open")).toHaveTextContent("closed");
    // an empty / invalid email does not open sign-up
    await userEvent.click(screen.getByRole("button", { name: /subscribe/i }));
    expect(screen.getByTestId("register-open")).toHaveTextContent("closed");
    await userEvent.type(screen.getByRole("textbox", { name: /email/i }), "traveller@example.com");
    await userEvent.click(screen.getByRole("button", { name: /subscribe/i }));
    expect(screen.getByTestId("register-open")).toHaveTextContent("open");
  });
});
