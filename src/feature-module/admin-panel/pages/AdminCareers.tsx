import { useEffect, useState } from "react";
import { Briefcase, FileText, Plus, Pencil, Trash2, ShieldAlert, ExternalLink } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { rootApi, apiError } from "../adminApi";
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
  Skeleton,
  Alert,
  AlertDescription,
  Input,
  Textarea,
  Label,
  Tabs,
  TabsList,
  TabsTrigger,
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

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const fileSrc = (p: string) =>
  !p ? "" : p.startsWith("http") ? p : `${BASE_URL}${p.startsWith("/") ? "" : "/"}${p}`;

const AdminCareers = () => {
  const [tab, setTab] = useState<"jobs" | "applications">("jobs");
  const [jobs, setJobs] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<any>({ title: "", description: "", status: "active" });
  const [editId, setEditId] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadJobs = async () => {
    setLoading(true); setError("");
    try {
      const res = await rootApi.get("/career/admin/jobs");
      setJobs(res.data.data || []);
    } catch (e) { setError(apiError(e)); } finally { setLoading(false); }
  };
  const loadApps = async () => {
    setLoading(true); setError("");
    try {
      const res = await rootApi.get("/careers");
      setApps(res.data.careers || []);
    } catch (e) { setError(apiError(e)); } finally { setLoading(false); }
  };

  useEffect(() => { tab === "jobs" ? loadJobs() : loadApps(); /* eslint-disable-next-line */ }, [tab]);

  const openCreate = () => { setForm({ title: "", description: "", status: "active" }); setEditId(null); setShow(true); };
  const openEdit = (j: any) => { setForm({ title: j.title, description: j.description, status: j.status }); setEditId(j._id); setShow(true); };

  const save = async () => {
    if (!form.title.trim()) return alert("Title is required");
    setBusy(true);
    try {
      if (editId) await rootApi.put(`/career/admin/jobs/${editId}`, form);
      else await rootApi.post("/career/admin/jobs", form);
      setShow(false);
      await loadJobs();
    } catch (e) { alert(apiError(e)); } finally { setBusy(false); }
  };

  const removeJob = async (j: any) => {
    if (!confirm(`Delete job "${j.title}"?`)) return;
    try { await rootApi.delete(`/career/admin/jobs/${j._id}`); await loadJobs(); }
    catch (e) { alert(apiError(e)); }
  };
  const removeApp = async (a: any) => {
    if (!confirm(`Delete application from ${a.name}?`)) return;
    try { await rootApi.delete(`/careers/${a._id}`); await loadApps(); }
    catch (e) { alert(apiError(e)); }
  };

  return (
    <AdminLayout
      title="Careers"
      crumb="Careers"
      description="Manage job postings and review candidate applications."
      actions={
        tab === "jobs" && (
          <Button onClick={openCreate}>
            <Plus /> New Job
          </Button>
        )
      }
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as "jobs" | "applications")}>
        <TabsList>
          <TabsTrigger value="jobs">
            <Briefcase className="tw-size-4" /> Job Postings
          </TabsTrigger>
          <TabsTrigger value="applications">
            <FileText className="tw-size-4" /> Applications
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="tw-mt-4">
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
          ) : tab === "jobs" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="tw-text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="tw-py-10 tw-text-center tw-text-muted-foreground">
                      No job postings found.
                    </TableCell>
                  </TableRow>
                )}
                {jobs.map((j) => (
                  <TableRow key={j._id}>
                    <TableCell className="tw-font-semibold tw-text-foreground">{j.title}</TableCell>
                    <TableCell className="tw-max-w-md tw-text-muted-foreground">{j.description}</TableCell>
                    <TableCell>
                      <Badge variant={j.status === "active" ? "success" : "muted"} dot>
                        {j.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="tw-flex tw-justify-end tw-gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(j)}>
                          <Pencil /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => removeJob(j)}>
                          <Trash2 /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Resume</TableHead>
                  <TableHead className="tw-text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="tw-py-10 tw-text-center tw-text-muted-foreground">
                      No applications found.
                    </TableCell>
                  </TableRow>
                )}
                {apps.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell className="tw-font-semibold tw-text-foreground">{a.name}</TableCell>
                    <TableCell>{a.email}</TableCell>
                    <TableCell>{a.phone || "—"}</TableCell>
                    <TableCell>
                      {a.resume ? (
                        <a
                          href={fileSrc(a.resume)}
                          target="_blank"
                          rel="noreferrer"
                          className="tw-inline-flex tw-items-center tw-gap-1.5 tw-font-medium tw-text-primary tw-transition-colors hover:tw-text-primary/80"
                        >
                          <ExternalLink className="tw-size-3.5" /> View
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="tw-flex tw-justify-end">
                        <Button variant="destructive" size="sm" onClick={() => removeApp(a)}>
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
            <DialogTitle>{editId ? "Edit" : "New"} Job</DialogTitle>
            <DialogDescription>
              {editId ? "Update the details of this job posting." : "Create a new job posting."}
            </DialogDescription>
          </DialogHeader>
          <div className="tw-space-y-4">
            <div className="tw-space-y-1.5">
              <Label htmlFor="job-title">Title</Label>
              <Input
                id="job-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="tw-space-y-1.5">
              <Label htmlFor="job-description">Description</Label>
              <Textarea
                id="job-description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="tw-space-y-1.5">
              <Label htmlFor="job-status">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger id="job-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">active</SelectItem>
                  <SelectItem value="inactive">inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShow(false)}>Cancel</Button>
            <Button disabled={busy} onClick={save}>{busy ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCareers;
