import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  Ban,
  ShieldAlert,
  Plane,
  Hotel,
  Car,
  Ship,
} from "lucide-react";
import AdminLayout from "../AdminLayout";
import adminApi, { apiError } from "../adminApi";
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  Input,
  Skeleton,
  Alert,
  AlertDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui";
import type { BadgeProps } from "../ui/badge";

const TYPES = ["flight", "hotel", "car", "cruise"] as const;
type BType = (typeof TYPES)[number];

const TAB_ICONS: Record<BType, typeof Plane> = {
  flight: Plane,
  hotel: Hotel,
  car: Car,
  cruise: Ship,
};

const refOf = (b: any) => b.bookingReference || b.sessionId || b._id;
const statusOf = (b: any) => b.status || b.bookingStatus || "-";
const amountOf = (b: any) => b.paidAmount ?? b.price?.total ?? b.amount ?? "-";

const badgeVariant = (s: string): BadgeProps["variant"] => {
  const map: Record<string, BadgeProps["variant"]> = {
    confirmed: "success", ticketed: "success", CONFIRMED: "success",
    pending: "warning", INITIATED: "warning", cancellation_pending: "warning",
    cancelled: "danger", CANCELLED: "danger", failed: "danger", FAILED: "danger",
  };
  return map[s] || "secondary";
};

// ── Booking-detail presentation helpers ───────────────────────────────
// camelCase / snake_case → "Title Case"
const titleCase = (k: string) =>
  k
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

const isIsoDate = (v: any) =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v);

const fmtVal = (v: any): string => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (isIsoDate(v)) return new Date(v).toLocaleString();
  return String(v);
};

const isPrimitive = (v: any) => v === null || v === undefined || typeof v !== "object";
const isPrimitiveArray = (v: any) => Array.isArray(v) && v.every(isPrimitive);

// Noisy / bulky internal keys we don't want in a presentable view.
const HIDE_KEYS = new Set(["__v", "gatewayResponse", "rawResponse", "raw"]);

/** Recursively renders a booking object as readable sections instead of raw JSON. */
const DetailObject = ({ obj }: { obj: Record<string, any> }) => {
  const entries = Object.entries(obj || {}).filter(([k]) => !HIDE_KEYS.has(k));
  const simple = entries.filter(([, v]) => isPrimitive(v) || isPrimitiveArray(v));
  const complex = entries.filter(([, v]) => !(isPrimitive(v) || isPrimitiveArray(v)));

  return (
    <div className="tw-space-y-3">
      {simple.length > 0 && (
        <dl className="tw-grid tw-grid-cols-1 tw-gap-x-6 tw-gap-y-2 sm:tw-grid-cols-2">
          {simple.map(([k, v]) => (
            <div key={k} className="tw-flex tw-flex-col tw-border-b tw-border-border/50 tw-py-1">
              <dt className="tw-text-[11px] tw-font-semibold tw-uppercase tw-tracking-wide tw-text-muted-foreground">
                {titleCase(k)}
              </dt>
              <dd className="tw-break-words tw-text-sm tw-text-foreground">
                {isPrimitiveArray(v) ? (v.length ? v.map(fmtVal).join(", ") : "—") : fmtVal(v)}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {complex.map(([k, v]) => (
        <div key={k} className="tw-rounded-lg tw-border tw-border-border/70 tw-bg-muted/30 tw-p-3">
          <p className="tw-mb-2 tw-text-xs tw-font-bold tw-uppercase tw-tracking-wide tw-text-foreground">
            {titleCase(k)}
            {Array.isArray(v) ? ` (${v.length})` : ""}
          </p>
          {Array.isArray(v) ? (
            v.length === 0 ? (
              <p className="tw-text-sm tw-text-muted-foreground">—</p>
            ) : (
              <div className="tw-space-y-2">
                {v.map((item, i) => (
                  <div key={i} className="tw-rounded-md tw-border tw-border-border/60 tw-bg-background tw-p-2.5">
                    <p className="tw-mb-1.5 tw-text-[11px] tw-font-semibold tw-text-muted-foreground">
                      #{i + 1}
                    </p>
                    {isPrimitive(item) ? (
                      <span className="tw-text-sm tw-text-foreground">{fmtVal(item)}</span>
                    ) : (
                      <DetailObject obj={item} />
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            <DetailObject obj={v} />
          )}
        </div>
      ))}
    </div>
  );
};

const AdminBookings = () => {
  const [type, setType] = useState<BType>("flight");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async (t: BType, p = 1, search = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.get(`/bookings/${t}`, {
        params: { page: p, limit: 20, q: search || undefined },
      });
      setItems(res.data.data.items || []);
      setPages(res.data.data.pagination?.pages || 1);
      setPage(p);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(type, 1, "");
    setQ("");
  }, [type]);

  const cancel = async (b: any) => {
    if (!confirm(`Cancel booking ${refOf(b)}? This triggers the real cancel flow.`)) return;
    setBusy(true);
    try {
      await adminApi.post(`/bookings/${type}/${refOf(b)}/cancel`, {
        cancelType: "FULL",
        reason: "Cancelled by admin",
      });
      await load(type, page, q);
    } catch (e) {
      alert(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  const openDetail = async (b: any) => {
    try {
      const res = await adminApi.get(`/bookings/${type}/${refOf(b)}`);
      setDetail(res.data.data.booking);
    } catch (e) {
      alert(apiError(e));
    }
  };

  return (
    <AdminLayout
      title="Bookings"
      crumb="Bookings"
      description="Browse and manage flight, hotel, car, and cruise bookings across the platform."
    >
      <Tabs value={type} onValueChange={(v) => setType(v as BType)}>
        <TabsList>
          {TYPES.map((t) => {
            const Icon = TAB_ICONS[t];
            return (
              <TabsTrigger key={t} value={t} className="tw-capitalize">
                <Icon className="tw-size-4" /> {t}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <Card className="tw-mt-4">
        <CardContent className="tw-space-y-5">
          <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-end tw-gap-2">
            <div className="tw-relative tw-w-full sm:tw-w-64">
              <Search className="tw-pointer-events-none tw-absolute tw-left-3 tw-top-1/2 tw-size-4 -tw-translate-y-1/2 tw-text-muted-foreground" />
              <Input
                className="tw-pl-9"
                placeholder="Search reference…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load(type, 1, q)}
              />
            </div>
            <Button onClick={() => load(type, 1, q)}>
              <Search /> Search
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <ShieldAlert />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="tw-space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="tw-h-12 tw-w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="tw-text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="tw-py-10 tw-text-center tw-text-muted-foreground">
                      No bookings found.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((b) => (
                  <TableRow key={b._id}>
                    <TableCell className="tw-font-mono tw-font-semibold tw-text-foreground">
                      {refOf(b)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant(statusOf(b))} dot>
                        {statusOf(b)}
                      </Badge>
                    </TableCell>
                    <TableCell className="tw-font-mono">{amountOf(b)}</TableCell>
                    <TableCell className="tw-whitespace-nowrap tw-text-muted-foreground">
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="tw-flex tw-justify-end tw-gap-2">
                        <Button variant="outline" size="sm" onClick={() => openDetail(b)}>
                          <Eye /> View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={() => cancel(b)}
                        >
                          <Ban /> Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {pages > 1 && (
            <div className="tw-mt-4 tw-flex tw-items-center tw-justify-end tw-gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => load(type, page - 1, q)}
              >
                <ChevronLeft /> Prev
              </Button>
              <span className="tw-text-sm tw-font-medium tw-text-muted-foreground">
                Page {page} of {pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pages}
                onClick={() => load(type, page + 1, q)}
              >
                Next <ChevronRight />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="tw-max-w-3xl">
          <DialogHeader>
            <DialogTitle className="tw-flex tw-flex-wrap tw-items-center tw-gap-2.5">
              <span className="tw-font-mono">Booking {detail ? refOf(detail) : ""}</span>
              {detail && (
                <Badge variant={badgeVariant(statusOf(detail))} dot>
                  {statusOf(detail)}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {detail && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="admin-scroll tw-max-h-[68vh] tw-overflow-auto tw-pr-1"
            >
              {/* At-a-glance summary */}
              <div className="tw-mb-4 tw-grid tw-grid-cols-2 tw-gap-3 sm:tw-grid-cols-3">
                {[
                  { label: "Type", value: titleCase(type) },
                  { label: "Amount", value: fmtVal(amountOf(detail)) },
                  {
                    label: "Created",
                    value: detail.createdAt ? new Date(detail.createdAt).toLocaleString() : "—",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="tw-rounded-lg tw-border tw-border-border/70 tw-bg-muted/40 tw-px-3 tw-py-2"
                  >
                    <p className="tw-text-[10px] tw-font-semibold tw-uppercase tw-tracking-wide tw-text-muted-foreground">
                      {s.label}
                    </p>
                    <p className="tw-mt-0.5 tw-text-sm tw-font-semibold tw-text-foreground">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Full structured detail */}
              <DetailObject obj={detail} />

              {/* Raw data for power users */}
              <details className="tw-mt-4 tw-rounded-lg tw-border tw-border-border/60">
                <summary className="tw-cursor-pointer tw-select-none tw-px-3 tw-py-2 tw-text-xs tw-font-semibold tw-text-muted-foreground">
                  Raw data (JSON)
                </summary>
                <pre className="admin-scroll tw-max-h-[40vh] tw-overflow-auto tw-border-t tw-border-border/60 tw-bg-muted tw-p-3 tw-text-[12px] tw-text-foreground tw-whitespace-pre-wrap">
                  {JSON.stringify(detail, null, 2)}
                </pre>
              </details>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminBookings;
