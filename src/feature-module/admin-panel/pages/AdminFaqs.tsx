import { useEffect, useState } from "react";
import { HelpCircle, Plus, Pencil, Trash2, ShieldAlert } from "lucide-react";
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
  Skeleton,
  Alert,
  AlertDescription,
  Input,
  Textarea,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui";

const AdminFaqs = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<any>({ question: "", answer: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await rootApi.get("/auth/faqs");
      setItems(res.data.data || []);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ question: "", answer: "" }); setEditId(null); setShow(true); };
  const openEdit = (f: any) => { setForm({ question: f.question, answer: f.answer, status: f.status }); setEditId(f._id); setShow(true); };

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) return alert("Question and answer are required");
    setBusy(true);
    try {
      if (editId) await rootApi.put(`/auth/faqs/${editId}`, form);
      else await rootApi.post("/auth/faqs", form);
      setShow(false);
      await load();
    } catch (e) {
      alert(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (f: any) => {
    if (!confirm("Delete this FAQ?")) return;
    try { await rootApi.delete(`/auth/faqs/${f._id}`); await load(); }
    catch (e) { alert(apiError(e)); }
  };

  return (
    <AdminLayout
      title="FAQs"
      crumb="FAQs"
      description="Manage the frequently asked questions shown to customers."
      actions={
        <Button onClick={openCreate}>
          <Plus /> New FAQ
        </Button>
      }
    >
      <Card>
        <CardHeader className="tw-flex-row tw-items-center tw-justify-between">
          <div className="tw-flex tw-items-center tw-gap-2">
            <HelpCircle className="tw-size-5 tw-text-primary" />
            <CardTitle>FAQs</CardTitle>
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
                  <TableHead>Question</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead className="tw-text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="tw-py-10 tw-text-center tw-text-muted-foreground"
                    >
                      No FAQs found.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((f) => (
                  <TableRow key={f._id}>
                    <TableCell className="tw-font-semibold tw-text-foreground">
                      {f.question}
                    </TableCell>
                    <TableCell className="tw-text-muted-foreground">
                      {f.answer}
                    </TableCell>
                    <TableCell>
                      <div className="tw-flex tw-justify-end tw-gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(f)}
                        >
                          <Pencil /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(f)}
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
            <DialogTitle>{editId ? "Edit" : "New"} FAQ</DialogTitle>
            <DialogDescription>
              {editId
                ? "Update this frequently asked question."
                : "Add a new frequently asked question."}
            </DialogDescription>
          </DialogHeader>
          <div className="tw-space-y-4">
            <div className="tw-space-y-1.5">
              <Label htmlFor="faq-question">Question</Label>
              <Input
                id="faq-question"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
              />
            </div>
            <div className="tw-space-y-1.5">
              <Label htmlFor="faq-answer">Answer</Label>
              <Textarea
                id="faq-answer"
                rows={4}
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
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

export default AdminFaqs;
