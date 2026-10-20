import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FlightTimeline from "./FlightTimeline";

const hop = (over: Record<string, any> = {}) => ({
  origin: "DMM",
  destination: "MCT",
  originName: "King Fahd Intl",
  destinationName: "Muscat",
  departure: "18:10",
  arrival: "20:55",
  departureDate: "2026-07-10",
  arrivalDate: "2026-07-10",
  carrier: "OV",
  flightNumber: "214",
  equipment: "7M8",
  duration: "1h 45m",
  ...over,
});

const airline = { code: "OV", name: "SalamAir", logo: "logo.png" };

describe("FlightTimeline", () => {
  it("renders a non-stop hop with no layover pill", () => {
    const legs = [
      {
        origin: "DMM",
        destination: "MCT",
        departureDate: "2026-07-10",
        duration: "1h 45m",
        stops: { text: "Non-stop" },
        segments: [hop()],
      },
    ];
    render(<FlightTimeline legs={legs} cabinClass="Economy" airline={airline} />);
    expect(screen.queryByText(/Layover/i)).toBeNull();
    expect(screen.getByText(/OV214/)).toBeInTheDocument();
    expect(screen.getByText(/Aircraft 7M8/)).toBeInTheDocument();
  });

  it("renders a layover pill and intermediate airport for a 1-stop leg", () => {
    const legs = [
      {
        origin: "DMM",
        destination: "HYD",
        departureDate: "2026-07-10",
        duration: "6h 25m",
        stops: { text: "1 stop · Muscat" },
        segments: [
          hop(),
          hop({
            origin: "MCT",
            destination: "HYD",
            departure: "22:30",
            arrival: "03:05",
            departureDate: "2026-07-10",
            arrivalDate: "2026-07-11",
            flightNumber: "735",
            equipment: "32N",
          }),
        ],
      },
    ];
    render(<FlightTimeline legs={legs} cabinClass="Economy" airline={airline} />);
    expect(screen.getByText(/Layover 1h 35m/i)).toBeInTheDocument();
  });

  it("renders per-leg headers and a separator for multi-leg trips", () => {
    const legs = [
      { origin: "DMM", destination: "HYD", departureDate: "2026-07-10", stops: { text: "Non-stop" }, segments: [hop({ destination: "HYD" })] },
      { origin: "HYD", destination: "DMM", departureDate: "2026-07-20", stops: { text: "Non-stop" }, segments: [hop({ origin: "HYD", destination: "DMM" })] },
    ];
    const { container } = render(<FlightTimeline legs={legs} airline={airline} />);
    expect(screen.getByText("DMM → HYD")).toBeInTheDocument();
    expect(screen.getByText("HYD → DMM")).toBeInTheDocument();
    expect(container.querySelectorAll(".border-top").length).toBeGreaterThan(0);
  });

  it("falls back to a summary row when segments are missing", () => {
    const legs = [
      { origin: "DMM", destination: "HYD", departure: "18:10", arrival: "03:05", departureDate: "2026-07-10", duration: "6h 25m", stops: { text: "1 stop" }, segments: [] },
    ];
    render(<FlightTimeline legs={legs} airline={airline} />);
    expect(screen.getByText("DMM → HYD")).toBeInTheDocument();
    expect(screen.queryByText(/Layover/i)).toBeNull();
  });

  it("renders nothing useful but does not crash for empty legs", () => {
    render(<FlightTimeline legs={[]} />);
    expect(screen.getByText(/unavailable/i)).toBeInTheDocument();
  });
});

describe("FlightTimeline terminals", () => {
  const connectingLeg = (first: Record<string, any>, second: Record<string, any>) => [
    {
      origin: "DMM",
      destination: "HYD",
      departureDate: "2026-07-10",
      duration: "6h 25m",
      stops: { text: "1 stop · Muscat" },
      segments: [
        hop(first),
        hop({
          origin: "MCT",
          destination: "HYD",
          departure: "22:30",
          arrival: "03:05",
          departureDate: "2026-07-10",
          arrivalDate: "2026-07-11",
          flightNumber: "735",
          ...second,
        }),
      ],
    },
  ];

  it("warns about a terminal change and shows the transfer time", () => {
    render(
      <FlightTimeline
        legs={connectingLeg({ arrivalTerminal: "Terminal 2" }, { departureTerminal: "Terminal 1" })}
        cabinClass="Economy"
        airline={airline}
      />,
    );
    expect(screen.getByText(/Terminal change required/i)).toBeInTheDocument();
    expect(screen.getByText(/Transfer time 1h 35m/i)).toBeInTheDocument();
  });

  it("says the terminal is unchanged when both sides match", () => {
    render(
      <FlightTimeline
        legs={connectingLeg({ arrivalTerminal: "Terminal 1" }, { departureTerminal: "T1" })}
        cabinClass="Economy"
        airline={airline}
      />,
    );
    expect(screen.getByText(/Same terminal/i)).toBeInTheDocument();
    expect(screen.queryByText(/Terminal change required/i)).toBeNull();
  });

  // A third of real connections have no terminal on one side. Silence is the
  // only safe output — anything else reads as "no change required".
  it("shows transfer time only and says nothing about terminals when data is missing", () => {
    render(
      <FlightTimeline
        legs={connectingLeg({ arrivalTerminal: "Terminal 2" }, {})}
        cabinClass="Economy"
        airline={airline}
      />,
    );
    expect(screen.getByText(/Layover 1h 35m/i)).toBeInTheDocument();
    expect(screen.queryByText(/Terminal change required/i)).toBeNull();
    expect(screen.queryByText(/Same terminal/i)).toBeNull();
  });

  it("warns about an airport change instead of a terminal change", () => {
    render(
      <FlightTimeline
        legs={connectingLeg(
          { destination: "LHR", arrivalTerminal: "Terminal 2" },
          { origin: "LGW", departureTerminal: "Terminal 1" },
        )}
        cabinClass="Economy"
        airline={airline}
      />,
    );
    expect(screen.getByText(/Airport change required/i)).toBeInTheDocument();
    expect(screen.queryByText(/Terminal change required/i)).toBeNull();
  });

  it("renders the terminal beneath each airport code when known", () => {
    render(
      <FlightTimeline
        legs={connectingLeg({ departureTerminal: "Terminal 3" }, {})}
        cabinClass="Economy"
        airline={airline}
      />,
    );
    expect(screen.getByText("Terminal 3")).toBeInTheDocument();
  });
});
