import { useEffect, useState } from "react";
import { Plus, Tag, Pencil, Power, ShieldAlert } from "lucide-react";
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
  Input,
  Label,
  Skeleton,
  Alert,
  AlertDescription,
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
} from "../ui";

const empty = {
  title: "",
  subtitle: "",
  type: "BANNER",
  module: "ALL",
  ctaText: "",
  ctaLink: "",
  couponCode: "",
  priority: 0,
  endsAt: "",
};

const AdminOffers = () => {
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
      const res = await adminApi.get("/offers", { params: { limit: 50 } });
      setItems(res.data.data.items || []);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setEditId(null); setShow(true); };
  const openEdit = (o: any) => {
    setForm({ ...o, endsAt: o.endsAt ? o.endsAt.slice(0, 10) : "" });
    setEditId(o._id);
    setShow(true);
  };

  const save = async () => {
    setBusy(true);
    try {
      const payload = {
        ...form,
        priority: Number(form.priority) || 0,
        endsAt: new Date(form.endsAt).toISOString(),
      };
      if (editId) await adminApi.put(`/offers/${editId}`, payload);
      else await adminApi.post("/offers", payload);
      setShow(false);
      await load();
    } catch (e) {
      alert(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (o: any) => {
    if (!confirm(`Deactivate offer "${o.title}"?`)) return;
    try { await adminApi.delete(`/offers/${o._id}`); await load(); }
    catch (e) { alert(apiError(e)); }
  };

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <AdminLayout
      title="Offers"
      crumb="Offers"
      description="Promotional banners and flash deals shown across the platform."
      actions={
        <Button onClick={openCreate}>
          <Plus /> New Offer
        </Button>
      }
    >
      <Card>
        <CardHeader className="tw-flex-row tw-items-center tw-justify-between">
          <div className="tw-flex tw-items-center tw-gap-2">
            <Tag className="tw-size-5 tw-text-primary" />
            <CardTitle>Offers &amp; Flash Deals</CardTitle>
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
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Ends</TableHead>
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
                      No offers found.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((o) => (
                  <TableRow key={o._id}>
                    <TableCell className="tw-font-semibold tw-text-foreground">
                      {o.title}
                    </TableCell>
                    <TableCell>{o.type}</TableCell>
                    <TableCell>{o.module}</TableCell>
                    <TableCell className="tw-font-mono tw-text-[13px]">
                      {o.priority}
                    </TableCell>
                    <TableCell className="tw-whitespace-nowrap tw-text-[13px] tw-text-muted-foreground">
                      {o.endsAt ? new Date(o.endsAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={o.isActive ? "success" : "muted"} dot>
                        {o.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="tw-flex tw-justify-end tw-gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(o)}
                        >
                          <Pencil /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(o)}
                        >
                          <Power /> Deactivate
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
            <DialogTitle>{editId ? "Edit" : "New"} Offer</DialogTitle>
            <DialogDescription>
              {editId
                ? "Update the details of this promotional offer."
                : "Create a new promotional banner or flash deal."}
            </DialogDescription>
          </DialogHeader>

          <div className="tw-grid tw-gap-4 sm:tw-grid-cols-2">
            <div className="tw-space-y-1.5 sm:tw-col-span-2">
              <Label htmlFor="offer-title">Title</Label>
              <Input
                id="offer-title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>
            <div className="tw-space-y-1.5 sm:tw-col-span-2">
              <Label htmlFor="offer-subtitle">Subtitle</Label>
              <Input
                id="offer-subtitle"
                value={form.subtitle}
                onChange={(e) => set("subtitle", e.target.value)}
              />
            </div>
            <div className="tw-space-y-1.5">
              <Label htmlFor="offer-type">Type</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger id="offer-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANNER">BANNER</SelectItem>
                  <SelectItem value="FLASH_DEAL">FLASH_DEAL</SelectItem>
                  <SelectItem value="SEASONAL">SEASONAL</SelectItem>
                  <SelectItem value="FEATURED">FEATURED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="tw-space-y-1.5">
              <Label htmlFor="offer-module">Module</Label>
              <Select value={form.module} onValueChange={(v) => set("module", v)}>
                <SelectTrigger id="offer-module">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">ALL</SelectItem>
                  <SelectItem value="FLIGHT">FLIGHT</SelectItem>
                  <SelectItem value="HOTEL">HOTEL</SelectItem>
                  <SelectItem value="CAR">CAR</SelectItem>
                  <SelectItem value="CRUISE">CRUISE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="tw-space-y-1.5">
              <Label htmlFor="offer-cta-text">CTA Text</Label>
              <Input
                id="offer-cta-text"
                value={form.ctaText}
                onChange={(e) => set("ctaText", e.target.value)}
              />
            </div>
            <div className="tw-space-y-1.5">
              <Label htmlFor="offer-cta-link">CTA Link</Label>
              <Input
                id="offer-cta-link"
                value={form.ctaLink}
                onChange={(e) => set("ctaLink", e.target.value)}
              />
            </div>
            <div className="tw-space-y-1.5">
              <Label htmlFor="offer-coupon">Coupon Code</Label>
              <Input
                id="offer-coupon"
                value={form.couponCode}
                onChange={(e) => set("couponCode", e.target.value.toUpperCase())}
              />
            </div>
            <div className="tw-space-y-1.5">
              <Label htmlFor="offer-priority">Priority</Label>
              <Input
                id="offer-priority"
                type="number"
                value={form.priority}
                onChange={(e) => set("priority", e.target.value)}
              />
            </div>
            <div className="tw-space-y-1.5 sm:tw-col-span-2">
              <Label htmlFor="offer-ends">Ends At</Label>
              <Input
                id="offer-ends"
                type="date"
                value={form.endsAt}
                onChange={(e) => set("endsAt", e.target.value)}
              />
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

export default AdminOffers;
