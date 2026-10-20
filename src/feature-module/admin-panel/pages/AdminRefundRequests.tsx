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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "../ui";

interface RefundRequest {
  _id: string;
  sessionId: string;
  bookingType: string;
  amount: number;
  currency: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PROCESSED";
  requesterType: string;
  requestedBy: string;
  createdAt: string;
}

const STATUS_VARIANT: Record<string, "info" | "success" | "danger" | "warning"> = {
  PENDING: "warning",
  PROCESSED: "success",
  APPROVED: "info",
  REJECTED: "danger",
};

const AdminRefundRequests = () => {
  const { can } = useAdminAuthContext();
  const canAction = can("finance", "admin", "superadmin");
  const [items, setItems] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Create-request dialog state
  const emptyForm = { sessionId: "", amount: "", reason: "" };
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const setF = (k: keyof typeof emptyForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get("/refund-requests");
      setItems(res.data?.data?.items ?? []);
      setError("");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.sessionId.trim()) return alert("Session ID is required");
    setCreating(true);
    try {
      await adminApi.post("/refund-requests", {
        sessionId: form.sessionId.trim(),
        amount: form.amount.trim() === "" ? undefined : Number(form.amount),
        reason: form.reason.trim(),
      });
      setShow(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      alert(apiError(err));
    } finally {
      setCreating(false);
    }
  };

  const act = async (id: string, action: "approve" | "reject") => {
    if (!confirm(`Really ${action} this refund request?`)) return;
    setBusyId(id);
    try {
      await adminApi.patch(`/refund-requests/${id}/${action}`);
      await load();
    } catch (err) {
      // On approve, the gateway may refuse (e.g. no CCAvenue tracking id for a
      // Sabre/cruise payment) — offer to approve it as a MANUAL (offline) refund.
      const msg = apiError(err);
      if (action === "approve" && confirm(`${msg}\n\nApprove & record this as a MANUAL (offline) refund instead?`)) {
        try {
          await adminApi.patch(`/refund-requests/${id}/approve`, { manual: true });
          await load();
        } catch (err2) {
          alert(apiError(err2));
        }
      } else {
        alert(msg);
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout
      title="Refund Requests"
      crumb="Refund Requests"
      description="Review and process customer refund requests."
      actions={
        <div className="tw-flex tw-gap-2">
          <Button variant="outline" onClick={() => load()} disabled={loading}>
            <RefreshCw /> Refresh
          </Button>
          <Button onClick={() => { setForm(emptyForm); setShow(true); }}>
            <Plus /> New Request
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader><CardTitle>All requests</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="tw-text-sm tw-text-muted-foreground">Loading…</p>
          ) : error ? (
            <p className="tw-text-sm tw-text-destructive">{error}</p>
          ) : items.length === 0 ? (
            <p className="tw-text-sm tw-text-muted-foreground">No refund requests yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Requested by</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="tw-text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it._id}>
                    <TableCell className="tw-font-mono tw-text-xs">{it.sessionId}</TableCell>
                    <TableCell>{it.bookingType}</TableCell>
                    <TableCell>{it.currency} {it.amount}</TableCell>
                    <TableCell className="tw-text-xs">{it.requestedBy}</TableCell>
                    <TableCell><Badge variant={STATUS_VARIANT[it.status] ?? "info"}>{it.status}</Badge></TableCell>
                    <TableCell className="tw-text-right">
                      {canAction && it.status === "PENDING" ? (
                        <div className="tw-flex tw-justify-end tw-gap-2">
                          <Button size="sm" disabled={busyId === it._id} onClick={() => act(it._id, "approve")}>Approve</Button>
                          <Button size="sm" variant="outline" disabled={busyId === it._id} onClick={() => act(it._id, "reject")}>Reject</Button>
                        </div>
                      ) : (
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
            <DialogTitle>New Refund Request</DialogTitle>
            <DialogDescription>
              Raise a refund request against a successful payment session. Leave the amount blank for a full refund.
            </DialogDescription>
          </DialogHeader>

          <div className="tw-space-y-4">
            <div className="tw-space-y-1.5">
              <Label htmlFor="rr-session">Payment Session ID</Label>
              <Input
                id="rr-session"
                placeholder="e.g. sess_abc123"
                value={form.sessionId}
                onChange={(e) => setF("sessionId", e.target.value)}
              />
            </div>
            <div className="tw-space-y-1.5">
              <Label htmlFor="rr-amount">Amount (optional — blank = full refund)</Label>
              <Input
                id="rr-amount"
                type="number"
                min={0}
                placeholder="Full captured amount"
                value={form.amount}
                onChange={(e) => setF("amount", e.target.value)}
              />
            </div>
            <div className="tw-space-y-1.5">
              <Label htmlFor="rr-reason">Reason</Label>
              <Textarea
                id="rr-reason"
                rows={3}
                placeholder="Why is this refund being requested?"
                value={form.reason}
                onChange={(e) => setF("reason", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShow(false)}>Cancel</Button>
            <Button disabled={creating} onClick={create}>
              {creating ? "Creating…" : "Create Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminRefundRequests;
