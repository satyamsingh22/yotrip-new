import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Store,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Power,
} from "lucide-react";
import AdminLayout from "../AdminLayout";
import adminApi, { apiError } from "../adminApi";
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

const statusVariant = (s: string): "success" | "warning" | "danger" | "muted" => {
  const map: Record<string, "success" | "warning" | "danger"> = {
    VERIFIED: "success",
    PENDING: "warning",
    REJECTED: "danger",
  };
  return map[s] || "muted";
};

const AdminVendors = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async (p = 1, st = status) => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.get("/vendors", { params: { page: p, limit: 15, status: st || undefined } });
      const d = res.data.data || res.data;
      setItems(d.vendors || []);
      setPages(d.totalPages || Math.ceil((d.total || 0) / 15) || 1);
      setPage(p);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(1); }, []);

  const approve = async (v: any) => {
    setBusy(v._id);
    try { await adminApi.patch(`/vendors/${v._id}/approve`); await load(page); }
    catch (e) { alert(apiError(e)); } finally { setBusy(null); }
  };

  const reject = async (v: any) => {
    const reason = prompt("Rejection reason (min 5 chars):");
    if (!reason || reason.trim().length < 5) return;
    setBusy(v._id);
    try { await adminApi.patch(`/vendors/${v._id}/reject`, { reason }); await load(page); }
    catch (e) { alert(apiError(e)); } finally { setBusy(null); }
  };

  const toggle = async (v: any) => {
    setBusy(v._id);
    try { await adminApi.patch(`/vendors/${v._id}/toggle-active`); await load(page); }
    catch (e) { alert(apiError(e)); } finally { setBusy(null); }
  };

  return (
    <AdminLayout
      title="Vendors"
      crumb="Vendors"
      description="Vendor and partner accounts, their verification status and access."
    >
      <Card>
        <CardHeader className="tw-flex-row tw-items-center tw-justify-between tw-gap-4">
          <div className="tw-flex tw-items-center tw-gap-2">
            <Store className="tw-size-5 tw-text-primary" />
            <CardTitle>Vendors &amp; Partners</CardTitle>
          </div>
          <Select
            value={status || "ALL"}
            onValueChange={(v) => {
              const next = v === "ALL" ? "" : v;
              setStatus(next);
              load(1, next);
            }}
          >
            <SelectTrigger className="tw-w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
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
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="tw-text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="tw-py-10 tw-text-center tw-text-muted-foreground"
                    >
                      No vendors found.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((v) => (
                  <TableRow key={v._id}>
                    <TableCell className="tw-font-semibold tw-text-foreground">
                      {v.companyName}
                    </TableCell>
                    <TableCell>{v.contactPerson || "—"}</TableCell>
                    <TableCell>{v.email}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(v.status)} dot>
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={v.isActive ? "success" : "muted"} dot>
                        {v.isActive ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="tw-flex tw-justify-end tw-gap-2">
                        {v.status !== "VERIFIED" && (
                          <Button
                            variant="success"
                            size="sm"
                            disabled={busy === v._id}
                            onClick={() => approve(v)}
                          >
                            <CheckCircle2 /> Approve
                          </Button>
                        )}
                        {v.status !== "REJECTED" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={busy === v._id}
                            onClick={() => reject(v)}
                          >
                            <XCircle /> Reject
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy === v._id}
                          onClick={() => toggle(v)}
                        >
                          <Power /> {v.isActive ? "Disable" : "Enable"}
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
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminVendors;
