import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ShieldAlert, UserCog, Trash2, UserCheck, UserMinus } from "lucide-react";
import AdminLayout from "../AdminLayout";
import adminApi, { rootApi, apiError } from "../adminApi";
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
  Button,
  Skeleton,
  Alert,
  AlertDescription,
} from "../ui";

const fullName = (u: any) =>
  u.name?.fullName ||
  `${u.name?.firstName || ""} ${u.name?.lastName || ""}`.trim() ||
  "—";

const AdminUsers = () => {
  const { isSuperAdmin } = useAdminAuthContext();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async (p = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await rootApi.get(`/auth/users`, { params: { page: p, limit: 15 } });
      setUsers(res.data.users || []);
      setPages(res.data.totalPages || 1);
      setPage(p);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load(1);
  }, []);

  const setStatus = async (u: any, status: string) => {
    if (!confirm(`Set ${u.email} to "${status}"?`)) return;
    setBusy(u._id);
    try {
      await adminApi.patch(`/users/${u._id}/status`, { status });
      await load(page);
    } catch (e) {
      alert(apiError(e));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (u: any) => {
    if (!confirm(`Delete user ${u.email}? This cannot be undone.`)) return;
    setBusy(u._id);
    try {
      await rootApi.delete(`/auth/users/${u._id}`);
      await load(page);
    } catch (e) {
      alert(apiError(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminLayout
      title="Users"
      crumb="Users"
      description="Registered customer accounts across the platform."
    >
      <Card>
        <CardHeader className="tw-flex-row tw-items-center tw-justify-between">
          <div className="tw-flex tw-items-center tw-gap-2">
            <UserCog className="tw-size-5 tw-text-primary" />
            <CardTitle>Registered Users</CardTitle>
          </div>
          {!loading && (
            <Badge variant="muted">{users.length} on this page</Badge>
          )}
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="tw-text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="tw-py-10 tw-text-center tw-text-muted-foreground"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
                {users.map((u) => {
                  const suspended = u.status === "suspended";
                  return (
                    <TableRow key={u._id}>
                      <TableCell className="tw-font-semibold tw-text-foreground">
                        {fullName(u)}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={suspended ? "danger" : "success"} dot>
                          {u.status || "active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="tw-flex tw-justify-end tw-gap-2">
                          {isSuperAdmin &&
                            (suspended ? (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={busy === u._id}
                                onClick={() => setStatus(u, "active")}
                              >
                                <UserCheck /> Activate
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={busy === u._id}
                                onClick={() => setStatus(u, "suspended")}
                              >
                                <UserMinus /> Suspend
                              </Button>
                            ))}
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={busy === u._id}
                            onClick={() => remove(u)}
                          >
                            <Trash2 /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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

          {!isSuperAdmin && (
            <p className="tw-mt-3 tw-text-[13px] tw-text-muted-foreground">
              Suspend / activate is available to Super Admins.
            </p>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminUsers;
