import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, CreditCard, ShieldAlert, RefreshCw } from "lucide-react";
import AdminLayout from "../AdminLayout";
import adminApi, { apiError } from "../adminApi";
import { useAdminAuthContext } from "../AdminAuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  type BadgeProps,
  Button,
  Skeleton,
  Alert,
  AlertDescription,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui";

const ALL = "__all__";

const AdminPayments = () => {
  const { isSuperAdmin } = useAdminAuthContext();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async (p = 1, st = status) => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.get("/payments", {
        params: { page: p, limit: 20, paymentStatus: st || undefined },
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

  useEffect(() => { load(1); }, []);

  const refund = async (s: any) => {
    if (!confirm(`Refund ${s.amount} ${s.currency} for ${s.sessionId} via the payment gateway?`)) return;
    const reason = prompt("Refund reason (optional):", "Admin refund") ?? "Admin refund";
    setBusy(true);
    try {
      await adminApi.post(`/payments/${s.sessionId}/refund`, { reason });
      await load(page);
    } catch (e) {
      // Gateway refused / unavailable — offer to record an offline (manual) refund
      // for refunds settled outside CCAvenue (e.g. Sabre or cruise).
      const msg = apiError(e);
      if (confirm(`${msg}\n\nRecord this as a MANUAL (offline) refund instead?`)) {
        try {
          await adminApi.post(`/payments/${s.sessionId}/refund`, { reason, manual: true });
          await load(page);
        } catch (e2) {
          alert(apiError(e2));
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const badgeVariant = (s: string): BadgeProps["variant"] => {
    const map: Record<string, BadgeProps["variant"]> = {
      SUCCESS: "success",
      PENDING: "warning",
      FAILED: "danger",
      REFUNDED: "info",
      REFUND_PENDING: "warning",
    };
    return map[s] || "secondary";
  };

  const colCount = isSuperAdmin ? 6 : 5;

  return (
    <AdminLayout
      title="Payments"
      crumb="Payments"
      description="Payment sessions and gateway transactions across the platform."
      actions={
        <Button variant="outline" onClick={() => load(page)} disabled={loading}>
          <RefreshCw /> Refresh
        </Button>
      }
    >
      <Card>
        <CardHeader className="tw-flex-row tw-items-center tw-justify-between">
          <div className="tw-flex tw-items-center tw-gap-2">
            <CreditCard className="tw-size-5 tw-text-primary" />
            <CardTitle>Transactions</CardTitle>
          </div>
          <Select
            value={status || ALL}
            onValueChange={(v) => {
              const next = v === ALL ? "" : v;
              setStatus(next);
              load(1, next);
            }}
          >
            <SelectTrigger className="tw-w-auto tw-min-w-[160px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              <SelectItem value="SUCCESS">Success</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="tw-mb-4">
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
                  <TableHead>Session</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  {isSuperAdmin && <TableHead className="tw-text-right">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={colCount}
                      className="tw-py-10 tw-text-center tw-text-muted-foreground"
                    >
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell className="tw-font-mono tw-font-semibold tw-text-foreground">
                      {s.sessionId}
                    </TableCell>
                    <TableCell>{s.type}</TableCell>
                    <TableCell className="tw-whitespace-nowrap tw-font-mono tw-text-[13px]">
                      {s.amount} {s.currency}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant(s.paymentStatus)} dot>
                        {s.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="tw-whitespace-nowrap tw-text-[13px] tw-text-muted-foreground">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        <div className="tw-flex tw-justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy || s.paymentStatus !== "SUCCESS"}
                            onClick={() => refund(s)}
                          >
                            <RefreshCw /> Refund
                          </Button>
                        </div>
                      </TableCell>
                    )}
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
                onClick={() => load(page - 1)}
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
                onClick={() => load(page + 1)}
              >
                Next <ChevronRight />
              </Button>
            </div>
          )}

          {!isSuperAdmin && (
            <p className="tw-mt-3 tw-text-[13px] tw-text-muted-foreground">
              Refunds are available to Super Admins.
            </p>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminPayments;
