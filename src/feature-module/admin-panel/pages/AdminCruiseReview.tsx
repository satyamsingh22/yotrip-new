import { useEffect, useState } from "react";
import { Ship, ShieldAlert, CheckCircle2, EyeOff, Trash2, Clock } from "lucide-react";
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
  AlertTitle,
  AlertDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui";
import type { BadgeProps } from "../ui";

const statusVariant = (s: string): BadgeProps["variant"] => {
  const map: Record<string, BadgeProps["variant"]> = {
    active: "success",
    draft: "warning",
    inactive: "secondary",
    cancelled: "danger",
  };
  return map[s] || "secondary";
};

const AdminCruiseReview = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("draft");
  const [busy, setBusy] = useState(false);

  const load = async (st = status) => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.get("/cruises", { params: { status: st || undefined, limit: 50 } });
      setItems(res.data.data.items || []);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load("draft"); }, []);

  const review = async (c: any, decision: "approve" | "unpublish") => {
    if (!confirm(`${decision === "approve" ? "Approve & publish" : "Unpublish"} "${c.name}"?`)) return;
    setBusy(true);
    try {
      await adminApi.patch(`/cruises/${c._id}/review`, { decision });
      await load();
    } catch (e) {
      alert(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  const removeCruise = async (c: any) => {
    if (!confirm(`Cancel cruise listing "${c.name}"?`)) return;
    setBusy(true);
    try {
      await adminApi.delete(`/cruises/${c._id}`);
      await load();
    } catch (e) {
      alert(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout
      title="Cruise Review"
      crumb="Cruise Review"
      description="Review, approve and manage vendor cruise listings."
    >
      <Alert variant="info" className="tw-mb-4">
        <Clock />
        <div>
          <AlertTitle>Coming soon</AlertTitle>
          <AlertDescription>
            Cruise review is not fully available yet. This section is a preview and will be enabled soon.
          </AlertDescription>
        </div>
      </Alert>

      <Card>
        <CardHeader className="tw-flex-row tw-items-center tw-justify-between tw-gap-3">
          <div className="tw-flex tw-items-center tw-gap-2">
            <Ship className="tw-size-5 tw-text-primary" />
            <CardTitle>Cruise Listings</CardTitle>
          </div>
          <Select
            value={status || "all"}
            onValueChange={(v) => { const next = v === "all" ? "" : v; setStatus(next); load(next); }}
          >
            <SelectTrigger className="tw-w-auto tw-min-w-[200px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="draft">Draft (pending review)</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
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
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="tw-h-12 tw-w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="tw-text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="tw-py-10 tw-text-center tw-text-muted-foreground">
                      No cruises found.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="tw-font-semibold tw-text-foreground">
                      {c.name}
                    </TableCell>
                    <TableCell>{c.vendor?.companyName || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(c.status)} dot>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="tw-flex tw-justify-end tw-gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          disabled={busy || c.status === "active"}
                          onClick={() => review(c, "approve")}
                        >
                          <CheckCircle2 /> Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy || c.status === "inactive"}
                          onClick={() => review(c, "unpublish")}
                        >
                          <EyeOff /> Unpublish
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={busy || c.status === "cancelled"}
                          onClick={() => removeCruise(c)}
                        >
                          <Trash2 /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminCruiseReview;
