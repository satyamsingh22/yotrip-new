import { useEffect, useState } from "react";
import {
  Users2,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Banknote,
  Headset,
  UserPlus,
  KeyRound,
  Trash2,
  Ban,
  CheckCircle2,
} from "lucide-react";
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
  Skeleton,
  Alert,
  AlertDescription,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui";
import { cn } from "@/lib/utils";

type Staff = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "superadmin" | "finance" | "support";
  status?: "active" | "disabled";
  mustChangePassword?: boolean;
};

const ROLE_OPTIONS = [
  { key: "admin", label: "Admin", icon: Shield },
  { key: "superadmin", label: "Super Admin", icon: ShieldCheck },
  { key: "finance", label: "Finance", icon: Banknote },
  { key: "support", label: "Support", icon: Headset },
] as const;

const AdminStaff = () => {
  const { admin: me } = useAdminAuthContext();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "support" });
  const [createErr, setCreateErr] = useState("");
  const [created, setCreated] = useState<null | { email: string; password: string; role: string }>(null);

  // Reset-password dialog state
  const [resetFor, setResetFor] = useState<Staff | null>(null);
  const [resetPw, setResetPw] = useState("");
  const [resetErr, setResetErr] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.get("/staff");
      setStaff(res.data?.data?.staff ?? []);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const changeRole = async (a: Staff, role: string) => {
    if (a.role === role) return;
    if (!confirm(`Change ${a.email} to "${role}"?`)) return;
    setBusy(a._id);
    try {
      await adminApi.patch(`/staff/${a._id}/role`, { role });
      await load();
    } catch (e) {
      alert(apiError(e));
    } finally {
      setBusy(null);
    }
  };

  const toggleStatus = async (a: Staff) => {
    const next = a.status === "disabled" ? "active" : "disabled";
    if (!confirm(`${next === "disabled" ? "Disable" : "Reactivate"} ${a.email}?`)) return;
    setBusy(a._id);
    try {
      await adminApi.patch(`/staff/${a._id}/status`, { status: next });
      await load();
    } catch (e) {
      alert(apiError(e));
    } finally {
      setBusy(null);
    }
  };

  const removeStaff = async (a: Staff) => {
    if (!confirm(`Permanently delete ${a.email}? This cannot be undone.`)) return;
    setBusy(a._id);
    try {
      await adminApi.delete(`/staff/${a._id}`);
      await load();
    } catch (e) {
      alert(apiError(e));
    } finally {
      setBusy(null);
    }
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateErr("");
    if (form.password.length < 6) {
      setCreateErr("Password must be at least 6 characters");
      return;
    }
    setBusy("create");
    try {
      await adminApi.post("/staff", form);
      setCreated({ email: form.email, password: form.password, role: form.role });
      await load();
    } catch (e) {
      setCreateErr(apiError(e));
    } finally {
      setBusy(null);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetFor) return;
    setResetErr("");
    if (resetPw.length < 6) {
      setResetErr("Password must be at least 6 characters");
      return;
    }
    setBusy(resetFor._id);
    try {
      await adminApi.patch(`/staff/${resetFor._id}/password`, { password: resetPw });
      setResetFor(null);
      setResetPw("");
      await load();
    } catch (e) {
      setResetErr(apiError(e));
    } finally {
      setBusy(null);
    }
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setCreated(null);
    setCreateErr("");
    setForm({ name: "", email: "", password: "", role: "support" });
  };

  const RoleToggle = ({ a }: { a: Staff }) => (
    <div className="tw-inline-flex tw-overflow-hidden tw-rounded-lg tw-border tw-border-border tw-shadow-soft">
      {ROLE_OPTIONS.map((opt) => {
        const active = (a.role || "admin") === opt.key;
        const Icon = opt.icon;
        return (
          <button
            key={opt.key}
            disabled={busy === a._id}
            onClick={() => changeRole(a, opt.key)}
            className={cn(
              "tw-inline-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-1.5 tw-text-[13px] tw-font-semibold tw-transition-colors disabled:tw-opacity-50",
              active
                ? "tw-bg-primary tw-text-primary-foreground"
                : "tw-bg-card tw-text-muted-foreground hover:tw-bg-muted"
            )}
          >
            <Icon className="tw-size-3.5" /> {opt.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <AdminLayout
      title="Staff & Roles"
      crumb="Staff & Roles"
      description="Create staff accounts, assign roles, and control access to the admin console."
      superOnly
      actions={
        <Button onClick={() => setCreateOpen(true)}>
          <UserPlus className="tw-size-4" /> Add Staff
        </Button>
      }
    >
      <Card>
        <CardHeader className="tw-flex-row tw-items-center tw-gap-2">
          <Users2 className="tw-size-5 tw-text-primary" />
          <CardTitle>Staff Accounts</CardTitle>
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
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="tw-text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="tw-py-10 tw-text-center tw-text-muted-foreground">
                      No staff accounts found.
                    </TableCell>
                  </TableRow>
                )}
                {staff.map((a) => {
                  const isSelf = me?._id === a._id;
                  const disabled = a.status === "disabled";
                  return (
                    <TableRow key={a._id}>
                      <TableCell className="tw-font-semibold tw-text-foreground">
                        {a.name}
                        {isSelf && (
                          <span className="tw-ml-2 tw-text-[11px] tw-font-medium tw-text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{a.email}</TableCell>
                      <TableCell>
                        <Badge variant={disabled ? "muted" : "success"} dot>
                          {disabled ? "disabled" : "active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <RoleToggle a={a} />
                      </TableCell>
                      <TableCell>
                        <div className="tw-flex tw-justify-end tw-gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy === a._id}
                            onClick={() => {
                              setResetFor(a);
                              setResetPw("");
                              setResetErr("");
                            }}
                          >
                            <KeyRound className="tw-size-3.5" /> Reset
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy === a._id || isSelf}
                            onClick={() => toggleStatus(a)}
                          >
                            {disabled ? (
                              <>
                                <CheckCircle2 className="tw-size-3.5" /> Enable
                              </>
                            ) : (
                              <>
                                <Ban className="tw-size-3.5" /> Disable
                              </>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={busy === a._id || isSelf}
                            onClick={() => removeStaff(a)}
                          >
                            <Trash2 className="tw-size-3.5" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create staff dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => (o ? setCreateOpen(true) : closeCreate())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Account</DialogTitle>
            <DialogDescription>
              Set their login and role. They'll be asked to change this password on first login.
            </DialogDescription>
          </DialogHeader>

          {created ? (
            <div className="tw-space-y-3">
              <Alert variant="info">
                <ShieldCheck />
                <AlertDescription>
                  Account created. Share these credentials securely:
                </AlertDescription>
              </Alert>
              <div className="tw-rounded-lg tw-border tw-border-border tw-bg-muted/40 tw-p-3 tw-text-sm">
                <div><strong>Email:</strong> {created.email}</div>
                <div><strong>Password:</strong> {created.password}</div>
                <div><strong>Role:</strong> {created.role}</div>
              </div>
              <DialogFooter>
                <Button onClick={closeCreate}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={submitCreate} className="tw-space-y-4">
              {createErr && (
                <Alert variant="destructive">
                  <ShieldAlert />
                  <AlertDescription>{createErr}</AlertDescription>
                </Alert>
              )}
              <div className="tw-space-y-1.5">
                <Label htmlFor="s-name">Full name</Label>
                <Input
                  id="s-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="tw-space-y-1.5">
                <Label htmlFor="s-email">Email</Label>
                <Input
                  id="s-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="tw-space-y-1.5">
                <Label htmlFor="s-pw">Temporary password</Label>
                <Input
                  id="s-pw"
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <div className="tw-space-y-1.5">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((o) => (
                      <SelectItem key={o.key} value={o.key}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeCreate}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy === "create"}>
                  {busy === "create" ? "Creating…" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset password dialog */}
      <Dialog
        open={!!resetFor}
        onOpenChange={(o) => {
          if (!o) {
            setResetFor(null);
            setResetPw("");
            setResetErr("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              {resetFor ? `Set a new password for ${resetFor.email}. They'll be asked to change it on next login.` : ""}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitReset} className="tw-space-y-4">
            {resetErr && (
              <Alert variant="destructive">
                <ShieldAlert />
                <AlertDescription>{resetErr}</AlertDescription>
              </Alert>
            )}
            <div className="tw-space-y-1.5">
              <Label htmlFor="r-pw">New password</Label>
              <Input
                id="r-pw"
                type="text"
                value={resetPw}
                onChange={(e) => setResetPw(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResetFor(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!!resetFor && busy === resetFor._id}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminStaff;
