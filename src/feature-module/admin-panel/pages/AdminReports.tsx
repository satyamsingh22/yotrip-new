import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Wallet,
  Layers,
  ShieldAlert,
  Play,
  ShieldCheck,
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
  Button,
  Input,
  Label,
  Alert,
  AlertDescription,
} from "../ui";

const today = new Date();
const yearStart = `${today.getFullYear()}-01-01`;
const iso = (d: Date) => d.toISOString().slice(0, 10);

const AdminReports = () => {
  const { isSuperAdmin } = useAdminAuthContext();
  const [from, setFrom] = useState(yearStart);
  const [to, setTo] = useState(iso(today));
  const [bookings, setBookings] = useState<any | null>(null);
  const [revenue, setRevenue] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      const bk = await adminApi.get("/reports/bookings", { params: { from, to } });
      setBookings(bk.data.data);
      if (isSuperAdmin) {
        const rv = await adminApi.get("/reports/revenue", { params: { from, to } });
        setRevenue(rv.data.data);
      }
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { run(); /* eslint-disable-next-line */ }, [isSuperAdmin]);

  const moduleRows = (obj: any) =>
    obj ? Object.entries(obj).map(([mod, rows]: any) => (
      <TableRow key={mod}>
        <TableCell className="tw-font-semibold tw-capitalize tw-text-foreground">{mod}</TableCell>
        <TableCell>
          {(rows as any[]).length === 0
            ? <span className="tw-text-muted-foreground">—</span>
            : (
              <div className="tw-flex tw-flex-wrap tw-gap-1.5">
                {(rows as any[]).map((r) => (
                  <Badge key={String(r._id)} variant="secondary">
                    {String(r._id ?? "n/a")}:{" "}
                    <span className="tw-font-mono tw-font-semibold">{r.count}</span>
                  </Badge>
                ))}
              </div>
            )}
        </TableCell>
      </TableRow>
    )) : null;

  return (
    <AdminLayout
      title="Reports"
      crumb="Reports"
      description="Booking and revenue breakdowns by module for a chosen date range."
    >
      <div className="tw-space-y-5">
        <Card>
          <CardContent className="tw-flex tw-flex-wrap tw-items-end tw-gap-4 tw-p-5">
            <div className="tw-space-y-1.5">
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="tw-w-[170px]"
              />
            </div>
            <div className="tw-space-y-1.5">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="tw-w-[170px]"
              />
            </div>
            <Button disabled={loading} onClick={run}>
              <Play /> {loading ? "Running…" : "Run"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <ShieldAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card>
            <CardHeader className="tw-flex-row tw-items-center tw-gap-2">
              <BarChart3 className="tw-size-5 tw-text-primary" />
              <div>
                <CardTitle>Bookings by status (per module)</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Counts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings ? moduleRows(bookings.byModule) : (
                    <TableRow>
                      <TableCell colSpan={2} className="tw-py-10 tw-text-center tw-text-muted-foreground">
                        No data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {isSuperAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card>
              <CardHeader className="tw-flex-row tw-items-center tw-justify-between">
                <div className="tw-flex tw-items-center tw-gap-2">
                  <Wallet className="tw-size-5 tw-text-primary" />
                  <CardTitle>Revenue</CardTitle>
                </div>
                <Badge variant="danger" dot>
                  <ShieldCheck className="tw-size-3.5" /> Super Admin
                </Badge>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead>Gross (by currency)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenue ? Object.entries(revenue.revenueByModule).map(([mod, rows]: any) => (
                      <TableRow key={mod}>
                        <TableCell className="tw-font-semibold tw-capitalize tw-text-foreground">{mod}</TableCell>
                        <TableCell>
                          {(rows as any[]).length === 0
                            ? <span className="tw-text-muted-foreground">—</span>
                            : (
                              <div className="tw-flex tw-flex-wrap tw-gap-1.5">
                                {(rows as any[]).map((r) => (
                                  <Badge key={String(r._id)} variant="success">
                                    <Layers className="tw-size-3.5" />
                                    <span>{String(r._id ?? "n/a")}</span>:{" "}
                                    <span className="tw-font-mono tw-font-semibold">{Math.round(r.gross)}</span>{" "}
                                    <span className="tw-font-mono tw-text-muted-foreground">({r.count})</span>
                                  </Badge>
                                ))}
                              </div>
                            )}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={2} className="tw-py-10 tw-text-center tw-text-muted-foreground">
                          No data
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
