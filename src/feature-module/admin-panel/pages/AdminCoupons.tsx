import { useEffect, useState } from "react";
import { TicketPercent, Plus, Pencil, Ban, ShieldAlert } from "lucide-react";
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
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Switch,
} from "../ui";

const APPLIES_OPTIONS = [
  { v: "ALL", l: "Site-wide" },
  { v: "FLIGHT", l: "Flights" },
  { v: "HOTEL", l: "Hotels" },
  { v: "CAR", l: "Cars" },
  { v: "CRUISE", l: "Cruises" },
];

const empty = {
  code: "",
  description: "",
  discountType: "PERCENT",
  discountValue: 10,
  maxDiscount: "",
  minBookingAmount: 0,
  appliesTo: ["ALL"],
  usageLimit: 0,
  perUserLimit: 0,
  validFrom: "",
  validTo: "",
  isActive: true,
};

const AdminCoupons = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<any>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get("/coupons", { params: { limit: 50 } });
      setItems(res.data.data.items || []);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setEditId(null); setShow(true); };
  const openEdit = (c: any) => {
    setForm({
      ...c,
      validTo: c.validTo ? c.validTo.slice(0, 10) : "",
      validFrom: c.validFrom ? c.validFrom.slice(0, 10) : "",
      maxDiscount: c.maxDiscount ?? "",
      appliesTo: c.appliesTo?.length ? c.appliesTo : ["ALL"],
      usageLimit: c.usageLimit ?? 0,
      perUserLimit: c.perUserLimit ?? 0,
      isActive: c.isActive !== false,
    });
    setEditId(c._id);
    setShow(true);
  };

  const save = async () => {
    setBusy(true);
    try {
      const payload = {
        ...form,
        discountType: "PERCENT",
        discountValue: Number(form.discountValue),
        minBookingAmount: Number(form.minBookingAmount) || 0,
        maxDiscount: form.maxDiscount === "" ? undefined : Number(form.maxDiscount),
        usageLimit: Number(form.usageLimit) || 0,
        perUserLimit: Number(form.perUserLimit) || 0,
        appliesTo: form.appliesTo?.length ? form.appliesTo : ["ALL"],
        isActive: !!form.isActive,
        validTo: new Date(form.validTo).toISOString(),
        ...(form.validFrom ? { validFrom: new Date(form.validFrom).toISOString() } : {}),
      };
      if (editId) await adminApi.put(`/coupons/${editId}`, payload);
      else await adminApi.post("/coupons", payload);
      setShow(false);
      await load();
    } catch (e) {
      alert(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c: any) => {
    if (!confirm(`Deactivate coupon ${c.code}?`)) return;
    try { await adminApi.delete(`/coupons/${c._id}`); await load(); }
    catch (e) { alert(apiError(e)); }
  };

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <AdminLayout
      title="Coupons"
      crumb="Coupons"
      description="Create and manage promotional discount codes."
      actions={
        <Button onClick={openCreate}>
          <Plus /> New Coupon
        </Button>
      }
    >
      <Card>
        <CardHeader className="tw-flex-row tw-items-center tw-justify-between">
          <div className="tw-flex tw-items-center tw-gap-2">
            <TicketPercent className="tw-size-5 tw-text-primary" />
            <CardTitle>Coupons</CardTitle>
          </div>
          {!loading && <Badge variant="muted">{items.length} total</Badge>}
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
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Applies to</TableHead>
                  <TableHead>Min</TableHead>
                  <TableHead>Valid To</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="tw-text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="tw-py-10 tw-text-center tw-text-muted-foreground"
                    >
                      No coupons found.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="tw-font-mono tw-font-semibold tw-text-foreground">
                      {c.code}
                    </TableCell>
                    <TableCell className="tw-font-mono">
                      {c.discountType === "PERCENT" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    </TableCell>
                    <TableCell className="tw-text-muted-foreground">
                      {(c.appliesTo?.length ? c.appliesTo : ["ALL"]).join(", ")}
                    </TableCell>
                    <TableCell className="tw-font-mono">{c.minBookingAmount || "-"}</TableCell>
                    <TableCell className="tw-whitespace-nowrap tw-text-muted-foreground">
                      {c.validTo ? new Date(c.validTo).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.isActive ? "success" : "secondary"} dot>
                        {c.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="tw-flex tw-justify-end tw-gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                          <Pencil /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => remove(c)}>
                          <Ban /> Deactivate
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

      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit" : "New"} Coupon</DialogTitle>
            <DialogDescription>
              {editId
                ? "Update the details for this discount code."
                : "Configure a new promotional discount code."}
            </DialogDescription>
          </DialogHeader>

          <div className="tw-space-y-4">
            <div className="tw-space-y-1.5">
              <Label htmlFor="coupon-code">Code</Label>
              <Input
                id="coupon-code"
                value={form.code}
                disabled={!!editId}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
              />
            </div>

            <div className="tw-space-y-1.5">
              <Label htmlFor="coupon-description">Description</Label>
              <Input
                id="coupon-description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>

            <div className="tw-grid tw-gap-4 sm:tw-grid-cols-2">
              <div className="tw-space-y-1.5">
                <Label htmlFor="coupon-type">Type</Label>
                <Select value="PERCENT" disabled onValueChange={() => {}}>
                  <SelectTrigger id="coupon-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="tw-space-y-1.5">
                <Label htmlFor="coupon-value">Value (%)</Label>
                <Input
                  id="coupon-value"
                  type="number"
                  min={1}
                  max={100}
                  value={form.discountValue}
                  onChange={(e) => set("discountValue", e.target.value)}
                />
              </div>

              <div className="tw-space-y-1.5">
                <Label htmlFor="coupon-max">Max Discount</Label>
                <Input
                  id="coupon-max"
                  type="number"
                  value={form.maxDiscount}
                  onChange={(e) => set("maxDiscount", e.target.value)}
                />
              </div>

              <div className="tw-space-y-1.5">
                <Label htmlFor="coupon-min">Min Booking</Label>
                <Input
                  id="coupon-min"
                  type="number"
                  value={form.minBookingAmount}
                  onChange={(e) => set("minBookingAmount", e.target.value)}
                />
              </div>

              <div className="tw-space-y-1.5">
                <Label htmlFor="coupon-valid-from">Valid From</Label>
                <Input
                  id="coupon-valid-from"
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => set("validFrom", e.target.value)}
                />
              </div>

              <div className="tw-space-y-1.5">
                <Label htmlFor="coupon-valid">Valid To</Label>
                <Input
                  id="coupon-valid"
                  type="date"
                  value={form.validTo}
                  onChange={(e) => set("validTo", e.target.value)}
                />
              </div>

              <div className="tw-space-y-1.5 sm:tw-col-span-2">
                <Label>Applies to</Label>
                <div className="tw-flex tw-flex-wrap tw-gap-2">
                  {APPLIES_OPTIONS.map(({ v, l }) => {
                    const on = form.appliesTo?.includes(v);
                    const toggle = () => {
                      if (v === "ALL") return set("appliesTo", ["ALL"]);
                      const next = new Set<string>(
                        (form.appliesTo || []).filter((x: string) => x !== "ALL")
                      );
                      on ? next.delete(v) : next.add(v);
                      set("appliesTo", next.size ? Array.from(next) : ["ALL"]);
                    };
                    return (
                      <button
                        type="button"
                        key={v}
                        onClick={toggle}
                        className={
                          "tw-rounded-lg tw-border tw-px-3 tw-py-1.5 tw-text-sm tw-font-semibold tw-transition-colors " +
                          (on
                            ? "tw-border-primary tw-bg-primary/10 tw-text-primary"
                            : "tw-border-border tw-text-muted-foreground hover:tw-bg-muted")
                        }
                      >
                        {l}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="tw-space-y-1.5">
                <Label htmlFor="coupon-usage">Total usage limit (0 = ∞)</Label>
                <Input
                  id="coupon-usage"
                  type="number"
                  min={0}
                  value={form.usageLimit}
                  onChange={(e) => set("usageLimit", e.target.value)}
                />
              </div>

              <div className="tw-space-y-1.5">
                <Label htmlFor="coupon-peruser">Per-user limit (0 = ∞)</Label>
                <Input
                  id="coupon-peruser"
                  type="number"
                  min={0}
                  value={form.perUserLimit}
                  onChange={(e) => set("perUserLimit", e.target.value)}
                />
              </div>

              <label
                htmlFor="coupon-active"
                className="tw-flex tw-items-center tw-justify-between tw-gap-3 tw-rounded-xl tw-border tw-border-border tw-bg-muted/40 tw-px-4 sm:tw-col-span-2"
              >
                <span className="tw-py-3 tw-text-sm tw-font-semibold">Active</span>
                <Switch
                  id="coupon-active"
                  checked={!!form.isActive}
                  onCheckedChange={(c) => set("isActive", c)}
                />
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShow(false)}>
              Cancel
            </Button>
            <Button disabled={busy} onClick={save}>
              {busy ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCoupons;
