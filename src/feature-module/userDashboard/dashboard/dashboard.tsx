import { useEffect, useState } from "react";
import { all_routes } from "../../router/all_routes";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import Sidebar from "../../../core/common/sidebar/sidebar";
import { Link } from "react-router-dom";
import api from "@/tockenapi/api";
import { yourBookingsPath } from "@/utils/yourBookings";

type ProductKey = "flights" | "hotels" | "cars";

const PRODUCTS: {
  key: ProductKey;
  label: string;
  endpoint: string;
  route: string;
  icon: string;
  accent: string;
}[] = [
  {
    key: "flights",
    label: "Flight Bookings",
    endpoint: "/api/flights/my-bookings",
    route: yourBookingsPath("flight"),
    icon: "isax isax-airplane",
    accent: "bg-primary",
  },
  {
    key: "hotels",
    label: "Hotel Bookings",
    endpoint: "/api/hotels/my-bookings",
    route: yourBookingsPath("hotel"),
    icon: "isax isax-buildings-2",
    accent: "bg-secondary",
  },
  {
    key: "cars",
    label: "Car Bookings",
    endpoint: "/api/cars/my-bookings",
    route: yourBookingsPath("car"),
    icon: "isax isax-car",
    accent: "bg-purple",
  },
];

const Dashboard = () => {
  const routes = all_routes;

  //Breadcrumb Data
  const breadcrumbs = [
    {
      label: "Dashboard",
      link: routes.home1,
      active: false,
    },
    {
      label: "Dashboard",
      active: true,
    },
  ];

  // Counts come from the same per-user endpoints the My Bookings pages use.
  // The page previously showed the template's fixed figures (80 bookings,
  // $5.3K transactions, invented "recent bookings" and invoices) to every
  // user, signed in or not.
  const [counts, setCounts] = useState<Record<ProductKey, number | null>>({
    flights: null,
    hotels: null,
    cars: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const results = await Promise.all(
        PRODUCTS.map(async (p) => {
          try {
            const res = await api.get(p.endpoint);
            const rows = res.data?.data;
            return [p.key, Array.isArray(rows) ? rows.length : 0] as const;
          } catch {
            // A failed product shows "—" rather than a wrong zero.
            return [p.key, null] as const;
          }
        })
      );

      if (cancelled) return;
      setCounts(
        results.reduce(
          (acc, [key, value]) => ({ ...acc, [key]: value }),
          {} as Record<ProductKey, number | null>
        )
      );
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const total = PRODUCTS.reduce(
    (sum, p) => sum + (counts[p.key] ?? 0),
    0
  );

  return (
    <div>
      <Breadcrumb
        title="Dashboard"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-01"
      />

      {/* Page Wrapper */}
      <div className="content">
        <div className="container">
          <div className="row">
            {/* Sidebar */}
            <div className="col-xl-3 col-lg-4 ">
              <Sidebar />
            </div>
            {/* /Sidebar */}
            <div className="col-xl-9 col-lg-8">
              <div className="row">
                {PRODUCTS.map((p) => (
                  <div className="col-xl-4" key={p.key}>
                    <div className="card shadow-none">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <span
                            className={`avatar avatar-xl rounded-circle ${p.accent} me-3`}
                          >
                            <i className={`${p.icon} fs-36`} />
                          </span>
                          <div>
                            <h3>
                              {loading ? "—" : counts[p.key] ?? "—"}
                            </h3>
                            <p className="mb-0">{p.label}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card shadow-none mb-0">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6>My Bookings</h6>
                </div>
                <div className="card-body">
                  {loading ? (
                    <p className="p-4 text-center text-gray-6 mb-0">
                      Loading your bookings...
                    </p>
                  ) : total === 0 ? (
                    <p className="p-4 text-center text-gray-6 mb-0">
                      You have no bookings yet.{" "}
                      <Link to={routes.flightList}>Search flights</Link> or{" "}
                      <Link to={routes.hotelGrid}>find a hotel</Link>.
                    </p>
                  ) : (
                    <div className="row gy-2">
                      {PRODUCTS.filter((p) => (counts[p.key] ?? 0) > 0).map(
                        (p) => (
                          <div className="col-md-4" key={p.key}>
                            <Link
                              to={p.route}
                              className="d-flex align-items-center justify-content-between border rounded p-3 text-decoration-none"
                            >
                              <span className="text-gray-9 fw-medium">
                                {p.label}
                              </span>
                              <span className="badge badge-primary rounded-pill">
                                {counts[p.key]}
                              </span>
                            </Link>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Page Wrapper */}
    </div>
  );
};

export default Dashboard;
