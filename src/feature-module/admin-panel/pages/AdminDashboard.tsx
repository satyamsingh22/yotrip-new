import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Store,
  Ticket,
  Wallet,
  Plane,
  Building2,
  Car,
  Ship,
  ShieldAlert,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";
import AdminLayout from "../AdminLayout";
import adminApi, { apiError } from "../adminApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Alert,
  AlertDescription,
  Badge,
} from "../ui";
import { cn } from "@/lib/utils";

interface Stats {
  users: { total: number; suspended: number };
  vendors: { total: number; pending: number; verified: number };
  cruises: { active: number };
  bookings: { flight: number; hotel: number; car: number; cruise: number; total: number };
  revenue: { flight: number; hotel: number; car: number; cruise: number; total: number };
}

const money = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n || 0);

const TONES: Record<string, { chip: string; icon: string; ring: string }> = {
  primary: {
    chip: "tw-from-primary/15 tw-to-primary/5",
    icon: "tw-text-primary",
    ring: "tw-ring-primary/10",
  },
  warning: {
    chip: "tw-from-warning/25 tw-to-warning/5",
    icon: "tw-text-warning",
    ring: "tw-ring-warning/15",
  },
  info: {
    chip: "tw-from-info/15 tw-to-info/5",
    icon: "tw-text-info",
    ring: "tw-ring-info/10",
  },
  success: {
    chip: "tw-from-success/15 tw-to-success/5",
    icon: "tw-text-success",
    ring: "tw-ring-success/10",
  },
};

const StatTile = ({
  label,
  value,
  icon: Icon,
  tone = "primary",
  sub,
  index,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: keyof typeof TONES | string;
  sub?: string;
  index: number;
}) => {
  const t = TONES[tone] ?? TONES.primary;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card interactive className="tw-group tw-overflow-hidden">
        <CardContent className="tw-flex tw-items-start tw-justify-between tw-gap-3 tw-p-5">
          <div className="tw-min-w-0">
            <p className="tw-text-[13px] tw-font-semibold tw-uppercase tw-tracking-wide tw-text-muted-foreground">
              {label}
            </p>
            <p className="tw-mt-2 tw-font-mono tw-text-2xl tw-font-bold tw-tracking-tight tw-text-foreground">
              {value}
            </p>
            {sub && <p className="tw-mt-1 tw-text-xs tw-text-muted-foreground">{sub}</p>}
          </div>
          <span
            className={cn(
              "tw-grid tw-size-12 tw-shrink-0 tw-place-items-center tw-rounded-xl tw-bg-gradient-to-br tw-ring-1 tw-transition-transform tw-duration-300 group-hover:tw-scale-110",
              t.chip,
              t.ring
            )}
          >
            <Icon className={cn("tw-size-6", t.icon)} />
          </span>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ModuleRow = ({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tint: string;
}) => (
  <div className="tw-flex tw-items-center tw-gap-3 tw-rounded-xl tw-px-3 tw-py-2.5 tw-transition-colors hover:tw-bg-muted/60">
    <span className={cn("tw-grid tw-size-9 tw-place-items-center tw-rounded-lg", tint)}>
      <Icon className="tw-size-[18px]" />
    </span>
    <span className="tw-text-sm tw-font-medium tw-text-foreground">{label}</span>
    <span className="tw-ml-auto tw-font-mono tw-text-sm tw-font-bold tw-text-foreground">
      {value}
    </span>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .get("/dashboard/stats")
      .then((res) => setStats(res.data.data))
      .catch((e) => setError(apiError(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout
      title="Dashboard"
      crumb="Dashboard"
      description="A live snapshot of bookings, revenue and platform health."
    >
      {error && (
        <Alert variant="destructive" className="tw-mb-6">
          <ShieldAlert />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="tw-grid tw-gap-4 sm:tw-grid-cols-2 xl:tw-grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="tw-h-[116px] tw-rounded-2xl" />
          ))}
        </div>
      ) : stats ? (
        <div className="tw-space-y-6">
          <div className="tw-grid tw-gap-4 sm:tw-grid-cols-2 xl:tw-grid-cols-4">
            <StatTile
              index={0}
              label="Total Users"
              value={money(stats.users.total)}
              icon={Users}
              tone="primary"
              sub={`${stats.users.suspended} suspended`}
            />
            <StatTile
              index={1}
              label="Pending Vendors"
              value={money(stats.vendors.pending)}
              icon={Store}
              tone="warning"
              sub={`${stats.vendors.verified} verified`}
            />
            <StatTile
              index={2}
              label="Total Bookings"
              value={money(stats.bookings.total)}
              icon={Ticket}
              tone="info"
            />
            <StatTile
              index={3}
              label="Total Revenue"
              value={money(stats.revenue.total)}
              icon={Wallet}
              tone="success"
            />
          </div>

          <div className="tw-grid tw-gap-5 lg:tw-grid-cols-2">
            <Card>
              <CardHeader className="tw-flex-row tw-items-center tw-justify-between">
                <CardTitle>Bookings by Module</CardTitle>
                <Badge variant="muted">{money(stats.bookings.total)} total</Badge>
              </CardHeader>
              <CardContent className="tw-space-y-1 tw-p-2.5">
                <ModuleRow icon={Plane} label="Flights" value={money(stats.bookings.flight)} tint="tw-bg-info/10 tw-text-info" />
                <ModuleRow icon={Building2} label="Hotels" value={money(stats.bookings.hotel)} tint="tw-bg-primary/10 tw-text-primary" />
                <ModuleRow icon={Car} label="Cars" value={money(stats.bookings.car)} tint="tw-bg-warning/15 tw-text-warning" />
                <ModuleRow icon={Ship} label="Cruise" value={money(stats.bookings.cruise)} tint="tw-bg-success/10 tw-text-success" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="tw-flex-row tw-items-center tw-justify-between">
                <CardTitle>Revenue by Module</CardTitle>
                <Badge variant="success">{money(stats.revenue.total)}</Badge>
              </CardHeader>
              <CardContent className="tw-space-y-1 tw-p-2.5">
                <ModuleRow icon={Plane} label="Flights" value={money(stats.revenue.flight)} tint="tw-bg-info/10 tw-text-info" />
                <ModuleRow icon={Building2} label="Hotels" value={money(stats.revenue.hotel)} tint="tw-bg-primary/10 tw-text-primary" />
                <ModuleRow icon={Car} label="Cars" value={money(stats.revenue.car)} tint="tw-bg-warning/15 tw-text-warning" />
                <ModuleRow icon={Ship} label="Cruise" value={money(stats.revenue.cruise)} tint="tw-bg-success/10 tw-text-success" />
              </CardContent>
            </Card>
          </div>

          <div className="tw-grid tw-gap-4 sm:tw-grid-cols-3">
            {[
              { label: "Verified vendors", value: stats.vendors.verified, icon: BadgeCheck, tone: "success" },
              { label: "Active cruises", value: stats.cruises.active, icon: Ship, tone: "info" },
              { label: "Suspended users", value: stats.users.suspended, icon: ShieldAlert, tone: "warning" },
            ].map((m) => {
              const Icon = m.icon;
              const t = TONES[m.tone] ?? TONES.primary;
              return (
                <Card key={m.label} interactive>
                  <CardContent className="tw-flex tw-items-center tw-gap-3 tw-p-4">
                    <span className={cn("tw-grid tw-size-10 tw-place-items-center tw-rounded-xl tw-bg-gradient-to-br tw-ring-1", t.chip, t.ring)}>
                      <Icon className={cn("tw-size-5", t.icon)} />
                    </span>
                    <div>
                      <p className="tw-text-xs tw-font-medium tw-text-muted-foreground">{m.label}</p>
                      <p className="tw-font-mono tw-text-lg tw-font-bold tw-text-foreground">{money(m.value)}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
};

export default AdminDashboard;
