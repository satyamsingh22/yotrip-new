import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/tockenapi/api";
import { all_routes } from "../../router/all_routes";

type FlightDeal = {
  origin?: string;
  destination?: string;
  departureDateTime?: string;
  marketingAirline?: string;
  flightNumber?: string;
  currencyCode?: string;
  totalFare?: number;
};

const formatRouteDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
};

const FlightBestDealsBand = () => {
  const [deals, setDeals] = useState<FlightDeal[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/api/flights/bestDeals", { params: { count: 6 } });
        const list = res.data?.bestFlightDeals;
        if (!cancelled && Array.isArray(list)) {
          setDeals(list.slice(0, 6));
        }
      } catch {
        if (!cancelled) setDeals([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded || deals.length === 0) return null;

  return (
    <section className="section bg-light">
      <div className="container">
        <div className="sec-head mb-4">
          <span className="sec-eyebrow">Featured fares</span>
          <h2 className="mb-1">Flight deals</h2>
          <p className="text-gray-6 mb-0">From HostNSell — search for live availability and price.</p>
        </div>
        <div className="row g-3">
          {deals.map((deal, idx) => {
            const from = deal.origin || "—";
            const to = deal.destination || "—";
            const qs = new URLSearchParams({
              from,
              to,
              ...(deal.departureDateTime
                ? { depart: deal.departureDateTime.slice(0, 10) }
                : {}),
            });
            return (
              <div className="col-md-6 col-lg-4" key={`${from}-${to}-${idx}`}>
                <Link
                  to={`${all_routes.flightList}?${qs.toString()}`}
                  className="card h-100 text-decoration-none"
                >
                  <div className="card-body">
                    <h6 className="text-dark mb-1">
                      {from} → {to}
                    </h6>
                    <p className="fs-14 text-gray-6 mb-2">
                      {formatRouteDate(deal.departureDateTime)}
                      {deal.marketingAirline
                        ? ` · ${deal.marketingAirline}${deal.flightNumber ? ` ${deal.flightNumber}` : ""}`
                        : ""}
                    </p>
                    {deal.totalFare != null && (
                      <span className="fw-semibold text-primary">
                        {deal.currencyCode || "INR"} {deal.totalFare}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FlightBestDealsBand;
