import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Star,
  Pencil,
  Trash2,
  ShieldAlert,
  MessageSquareQuote,
} from "lucide-react";
import AdminLayout from "../AdminLayout";
import { rootApi, apiError } from "../adminApi";
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
  Textarea,
  Label,
  Skeleton,
  Alert,
  AlertDescription,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const empty = { name: "", heading: "", message: "", rating: 5, address: "" };

const AdminTestimonials = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<any>(empty);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await rootApi.get("/auth/");
      setItems(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setImageFile(null); setEditId(null); setShow(true); };
  const openEdit = (t: any) => {
    setForm({ name: t.name, heading: t.heading, message: t.message, rating: t.rating, address: t.address });
    setImageFile(null); setEditId(t._id); setShow(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.message.trim()) return alert("Name and message are required");
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (imageFile) fd.append("profileImage", imageFile);
      const cfg = { headers: { "Content-Type": "multipart/form-data" } };
      if (editId) await rootApi.put(`/auth/update/${editId}`, fd, cfg);
      else await rootApi.post("/auth/add", fd, cfg);
      setShow(false);
      await load();
    } catch (e) {
      alert(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (t: any) => {
    if (!confirm(`Delete testimonial from ${t.name}?`)) return;
    try { await rootApi.delete(`/auth/delete/${t._id}`); await load(); }
    catch (e) { alert(apiError(e)); }
  };

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const imgSrc = (img: string) =>
    !img ? "" : img.startsWith("http") ? img : `${BASE_URL}/uploads/profile/${img}`;

  return (
    <AdminLayout
      title="Testimonials"
      crumb="Testimonials"
      description="Customer reviews showcased across the public site."
      actions={
        <Button onClick={openCreate}>
          <Plus /> New Testimonial
        </Button>
      }
    >
      <Card>
        <CardHeader className="tw-flex-row tw-items-center tw-justify-between">
          <div className="tw-flex tw-items-center tw-gap-2">
            <MessageSquareQuote className="tw-size-5 tw-text-primary" />
            <CardTitle>Testimonials</CardTitle>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Heading</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="tw-text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="tw-py-10 tw-text-center tw-text-muted-foreground"
                    >
                      No testimonials found.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell className="tw-font-semibold tw-text-foreground">
                      <div className="tw-flex tw-items-center tw-gap-2.5">
                        {t.image ? (
                          <img
                            src={imgSrc(t.image)}
                            alt=""
                            className="tw-size-8 tw-rounded-full tw-object-cover"
                          />
                        ) : (
                          <span className="tw-flex tw-size-8 tw-items-center tw-justify-center tw-rounded-full tw-bg-muted tw-text-xs tw-font-bold tw-text-muted-foreground">
                            {(t.name || "?").charAt(0).toUpperCase()}
                          </span>
                        )}
                        {t.name}
                      </div>
                    </TableCell>
                    <TableCell className="tw-text-muted-foreground">
                      {t.heading || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="warning">
                        <Star className="tw-size-3 tw-fill-current" />
                        {t.rating ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="tw-text-muted-foreground">
                      {t.address || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="tw-flex tw-justify-end tw-gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(t)}
                        >
                          <Pencil /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(t)}
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

      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit" : "New"} Testimonial</DialogTitle>
            <DialogDescription>
              {editId
                ? "Update the details for this testimonial."
                : "Add a new customer testimonial to the site."}
            </DialogDescription>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="tw-space-y-4"
          >
            <div className="tw-space-y-1.5">
              <Label htmlFor="t-name">Name</Label>
              <Input
                id="t-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div className="tw-space-y-1.5">
              <Label htmlFor="t-heading">Heading</Label>
              <Input
                id="t-heading"
                value={form.heading}
                onChange={(e) => set("heading", e.target.value)}
              />
            </div>
            <div className="tw-space-y-1.5">
              <Label htmlFor="t-message">Message</Label>
              <Textarea
                id="t-message"
                rows={3}
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
              />
            </div>
            <div className="tw-grid tw-gap-4 sm:tw-grid-cols-2">
              <div className="tw-space-y-1.5">
                <Label htmlFor="t-rating">Rating</Label>
                <Input
                  id="t-rating"
                  type="number"
                  min={1}
                  max={5}
                  value={form.rating}
                  onChange={(e) => set("rating", e.target.value)}
                />
              </div>
              <div className="tw-space-y-1.5">
                <Label htmlFor="t-address">Address</Label>
                <Input
                  id="t-address"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </div>
            </div>
            <div className="tw-space-y-1.5">
              <Label htmlFor="t-image">
                Image {editId && "(leave empty to keep)"}
              </Label>
              <Input
                id="t-image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>
          </motion.div>

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

export default AdminTestimonials;
