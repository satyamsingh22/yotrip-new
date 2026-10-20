import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ScrollText, Plane, ShieldAlert } from "lucide-react";
import AdminLayout from "../AdminLayout";
import adminApi, { apiError } from "../adminApi";
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
  Tabs,
  TabsList,
  TabsTrigger,
} from "../ui";

const AdminAuditLogs = () => {
  const [tab, setTab] = useState<"audit" | "sabre">("audit");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = async (which = tab, p = 1) => {
    setLoading(true);
    setError("");
    try {
      const url = which === "audit" ? "/audit-logs" : "/sabre/logs";
      const res = await adminApi.get(url, { params: { page: p, limit: 25 } });
      setItems(res.data.data.items || []);
      setPages(res.data.data.pagination?.pages || 1);
      setPage(p);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(tab, 1); /* eslint-disable-next-line */
  }, [tab]);

  return (
    <AdminLayout
      title="Logs"
      crumb="Logs"
      description="Audit trail of admin actions and Sabre transaction logs."
      superOnly
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as "audit" | "sabre")}>
        <TabsList>
          <TabsTrigger value="audit">
            <ScrollText className="tw-size-4" /> Audit Trail
          </TabsTrigger>
          <TabsTrigger value="sabre">
            <Plane className="tw-size-4" /> Sabre Logs
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
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="tw-h-10 tw-w-full" />
              ))}
            </div>
          ) : tab === "audit" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="tw-py-10 tw-text-center tw-text-muted-foreground">
                      No logs found.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((l) => (
                  <TableRow key={l._id}>
                    <TableCell className="tw-whitespace-nowrap tw-text-[13px] tw-text-muted-foreground">
                      {new Date(l.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="tw-flex tw-items-center tw-gap-2">
                        <span className="tw-font-semibold tw-text-foreground">
                          {l.actor?.name || l.actorEmail || "—"}
                        </span>
                        <Badge variant="muted">{l.actorRole}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">{l.action}</Badge>
                    </TableCell>
                    <TableCell className="tw-text-[13px] tw-text-muted-foreground">
                      {l.targetType} {l.targetId}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="tw-py-10 tw-text-center tw-text-muted-foreground">
                      No logs found.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((l) => (
                  <TableRow key={l._id}>
                    <TableCell className="tw-font-semibold tw-text-foreground">
                      {l.sessionId}
                    </TableCell>
                    <TableCell>{l.type}</TableCell>
                    <TableCell>{l.paymentStatus}</TableCell>
                    <TableCell>{l.bookingStatus}</TableCell>
                    <TableCell className="tw-font-mono tw-text-[13px]">
                      {l.amount} {l.currency}
                    </TableCell>
                    <TableCell className="tw-whitespace-nowrap tw-text-[13px] tw-text-muted-foreground">
                      {new Date(l.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {pages > 1 && (
            <div className="tw-mt-4 tw-flex tw-items-center tw-justify-end tw-gap-3">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => load(tab, page - 1)}>
                <ChevronLeft /> Prev
              </Button>
              <span className="tw-text-sm tw-font-medium tw-text-muted-foreground">
                Page {page} of {pages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => load(tab, page + 1)}>
                Next <ChevronRight />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminAuditLogs;
