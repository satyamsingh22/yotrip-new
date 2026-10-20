import { useEffect, useState } from "react";
import { RefreshCw, Plus } from "lucide-react";
import AdminLayout from "../AdminLayout";
import adminApi, { apiError } from "../adminApi";
import { useAdminAuthContext } from "../AdminAuthContext";
import {
  Card, CardContent, CardHeader, CardTitle,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, Button,
  Input, Label, Textarea,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Alert, AlertDescription,
} from "../ui";

interface Payout {
  _id: string;
  payeeId: string;
  payeeType: string;
  grossAmount: number;
  commission: number;
  netAmount: number;
  currency: string;
  status: "PENDING" | "APPROVED" | "PAID" | "FAILED";
  period: { from: string; to: string };
  createdAt: string;
}

const STATUS_VARIANT: Record<string, "info" | "success" | "danger" | "warning"> = {
  PENDING: "warning",
  APPROVED: "info",
  PAID: "success",
  FAILED: "danger",
};

const AdminPayouts = () => {
  const { can } = useAdminAuthContext();
  const canAction = can("finance", "superadmin");
  const [items, setItems] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Create-payout dialog state
  const emptyForm = { payeeId: "", from: "", to: "", commissionRate: "0", manualAmount: "", method: "manual", notes: "" };
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [vendors, setVendors] = useState<{ _id: string; companyName?: string; type?: string }[]>([]);
  const setF = (k: keyof typeof emptyForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get("/payouts");
      setItems(res.data?.data?.items ?? []);
      setError("");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    try {
      const res = await adminApi.get("/vendors", { params: { limit: 100 } });
      setVendors(res.data?.data?.vendors ?? []);
    } catch {
      setVendors([]);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setShow(true);
    if (vendors.length === 0) loadVendors();
  };

  const create = async () => {
    if (!form.payeeId) return alert("Select a payee (vendor/operator)");
    if (!form.from || !form.to) return alert("Period from and to dates are required");
    setCreating(true);
    try {
      await adminApi.post("/payouts", {
        payeeId: form.payeeId,
        from: form.from,
        to: form.to,
        commissionRate: Number(form.commissionRate) || 0,
        manualAmount: form.manualAmount.trim() === "" ? undefined : Number(form.manualAmount),
        method: form.method,
        notes: form.notes.trim(),
      });
      setShow(false);
      await load();
    } catch (err) {
      alert(apiError(err));
    } finally {
      setCreating(false);
    }
  };

  const act = async (id: string, action: "approve" | "mark-paid") => {
    if (!confirm(`Really ${action.replace("-", " ")} this payout?`)) return;
    setBusyId(id);
    try {
      await adminApi.patch(`/payouts/${id}/${action}`);
      await load();
    } catch (err) {
      alert(apiError(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout
      title="Payouts"
      crumb="Payouts"
      description="Vendor & cruise-operator payouts."
      actions={
        <div className="tw-flex tw-gap-2">
          <Button variant="outline" onClick={() => load()} disabled={loading}>
            <RefreshCw /> Refresh
          </Button>
          {canAction && (
            <Button onClick={openCreate}>
              <Plus /> New Payout
            </Button>
          )}
        </div>
      }
    >
      <Card>
        <CardHeader><CardTitle>All payouts</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="tw-text-sm tw-text-muted-foreground">Loading…</p>
          ) : error ? (
            <p className="tw-text-sm tw-text-destructive">{error}</p>
          ) : items.length === 0 ? (
            <p className="tw-text-sm tw-text-muted-foreground">No payouts yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payee</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Gross / Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="tw-text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="tw-text-xs">{p.payeeType} · {p.payeeId}</TableCell>
                    <TableCell className="tw-font-semibold">{p.currency} {p.netAmount}</TableCell>
                    <TableCell className="tw-text-xs tw-text-muted-foreground">{p.currency} {p.grossAmount} − {p.commission}</TableCell>
                    <TableCell><Badge variant={STATUS_VARIANT[p.status] ?? "info"}>{p.status}</Badge></TableCell>
                    <TableCell className="tw-text-right">
                      {canAction && p.status === "PENDING" && (
                        <Button size="sm" disabled={busyId === p._id} onClick={() => act(p._id, "approve")}>Approve</Button>
                      )}
                      {canAction && p.status === "APPROVED" && (
                        <Button size="sm" disabled={busyId === p._id} onClick={() => act(p._id, "mark-paid")}>Mark paid</Button>
                      )}
                      {(!canAction || p.status === "PAID" || p.status === "FAILED") && (
                        <span className="tw-text-xs tw-text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Payout</DialogTitle>
            <DialogDescription>
              Create a payout for a vendor/operator over a period. Gross is computed from confirmed cruise payments in the window.
            </DialogDescription>
          </DialogHeader>

          <div className="tw-space-y-4">
            <div className="tw-space-y-1.5">
              <Label htmlFor="po-payee">Payee (vendor / operator)</Label>
              <Select value={form.payeeId} onValueChange={(v) => setF("payeeId", v)}>
                <SelectTrigger id="po-payee">
                  <SelectValue placeholder={vendors.length ? "Select a payee" : "Loading vendors…"} />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => (
                    <SelectItem key={v._id} value={v._id}>
                      {v.companyName || v._id}{v.type ? ` · ${v.type}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="tw-grid tw-gap-4 sm:tw-grid-cols-2">
              <div className="tw-space-y-1.5">
                <Label htmlFor="po-from">Period from</Label>
                <Input id="po-from" type="date" value={form.from} onChange={(e) => setF("from", e.target.value)} />
              </div>
              <div className="tw-space-y-1.5">
                <Label htmlFor="po-to">Period to</Label>
                <Input id="po-to" type="date" value={form.to} onChange={(e) => setF("to", e.target.value)} />
              </div>
            </div>

            <div className="tw-grid tw-gap-4 sm:tw-grid-cols-2">
              <div className="tw-space-y-1.5">
                <Label htmlFor="po-commission">Commission rate (%)</Label>
                <Input id="po-commission" type="number" min={0} max={100} value={form.commissionRate} onChange={(e) => setF("commissionRate", e.target.value)} />
              </div>
              <div className="tw-space-y-1.5">
                <Label htmlFor="po-manual">Manual gross (optional)</Label>
                <Input id="po-manual" type="number" min={0} placeholder="Override computed gross" value={form.manualAmount} onChange={(e) => setF("manualAmount", e.target.value)} />
              </div>
            </div>

            <div className="tw-space-y-1.5">
              <Label htmlFor="po-notes">Notes</Label>
              <Textarea id="po-notes" rows={2} value={form.notes} onChange={(e) => setF("notes", e.target.value)} />
            </div>

            <Alert>
              <AlertDescription className="tw-text-xs">
                Cruise bookings don't yet carry an operator reference, so the auto-computed gross sums <b>all</b> cruise payments in the window. For an accurate per-operator payout, enter a <b>Manual gross</b> above.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShow(false)}>Cancel</Button>
            <Button disabled={creating} onClick={create}>
              {creating ? "Creating…" : "Create Payout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPayouts;
