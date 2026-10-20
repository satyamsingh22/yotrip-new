import { cn } from "@/lib/utils";
import { CheckCircle2, Save, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import AdminLayout from "../AdminLayout";
import adminApi, { apiError } from "../adminApi";
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
  Switch,
} from "../ui";

type ProductKey = "flights" | "hotels" | "cars" | "cruise";
type MarkupRow = { enabled: boolean; percentage: number };
type MarkupState = Record<ProductKey, MarkupRow>;

const PRODUCTS: { key: ProductKey; label: string }[] = [
  { key: "flights", label: "Flights" },
  { key: "hotels", label: "Hotels" },
  { key: "cars", label: "Cars" },
  { key: "cruise", label: "Cruises" },
];

const emptyRow: MarkupRow = { enabled: false, percentage: 0 };

const AdminPricing = () => {
  const [markup, setMarkup] = useState<MarkupState | null>(null);
  // The percentage inputs are edited as free text so a leading "0" doesn't
  // stick (typing 9 must give "9", not "09") and the field can be cleared.
  const [drafts, setDrafts] = useState<Record<ProductKey, string>>({
    flights: "0",
    hotels: "0",
    cars: "0",
    cruise: "0",
  });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const res = await adminApi.get("/markup");
      const m = res.data.data.markup || {};
      const next: MarkupState = {
        flights: { ...emptyRow, ...m.flights },
        hotels: { ...emptyRow, ...m.hotels },
        cars: { ...emptyRow, ...m.cars },
        cruise: { ...emptyRow, ...m.cruise },
      };
      setMarkup(next);
      setDrafts({
        flights: String(next.flights.percentage),
        hotels: String(next.hotels.percentage),
        cars: String(next.cars.percentage),
        cruise: String(next.cruise.percentage),
      });
    } catch (e) {
      setError(apiError(e));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setRow = (k: ProductKey, patch: Partial<MarkupRow>) =>
    setMarkup((s) => (s ? { ...s, [k]: { ...s[k], ...patch } } : s));

  const onPercentChange = (k: ProductKey, raw: string) => {
    setDrafts((d) => ({ ...d, [k]: raw }));
    setRow(k, { percentage: raw === "" ? 0 : Number(raw) });
  };

  // Normalise on blur: "09" -> "9", "" -> "0" (mirrors the numeric state).
  const onPercentBlur = (k: ProductKey) =>
    setDrafts((d) => ({ ...d, [k]: String(markup ? markup[k].percentage : 0) }));

  const save = async () => {
    if (!markup) return;
    setBusy(true);
    setMsg("");
    setError("");
    try {
      await adminApi.put("/markup", markup);
      setMsg("Markup saved.");
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout
      title="Pricing"
      crumb="Pricing"
      description="Per-product percentage markup added to the price customers see and pay."
      actions={
        markup && (
          <Button onClick={save} disabled={busy}>
            <Save /> {busy ? "Saving…" : "Save Markup"}
          </Button>
        )
      }
    >
      {error && (
        <Alert variant="destructive" className="tw-mb-4">
          <ShieldAlert />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {msg && (
        <Alert variant="success" className="tw-mb-4">
          <CheckCircle2 />
          <AlertDescription>{msg}</AlertDescription>
        </Alert>
      )}

      {!markup ? (
        <div className="tw-space-y-5">
          <Skeleton className="tw-h-64 tw-rounded-2xl" />
        </div>
      ) : (
        <Card>
          <CardHeader className="tw-flex-row tw-items-center tw-gap-2">
            {/* <Percent className="tw-size-5 tw-text-primary" /> */}
            <div>
              <CardTitle>Markup</CardTitle>
              <CardDescription>
                Toggle a product on and set its percentage. Applied to every price
                for that product across the site.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="tw-space-y-3">
            {PRODUCTS.map(({ key, label }) => {
              const row = markup[key];
              const active = row.enabled;
              const example =
                active && row.percentage > 0
                  ? `100 → ${(100 * (1 + row.percentage / 100)).toFixed(2)}`
                  : "no markup";
              return (
                <div
                  key={key}
                  className={cn(
                    "tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-4 tw-rounded-xl tw-border tw-px-4 tw-py-3 tw-transition-colors",
                    active
                      ? "tw-border-primary/40 tw-bg-primary/5"
                      : "tw-border-border tw-bg-muted/40"
                  )}
                >
                  <div className="tw-flex tw-items-center tw-gap-3">
                    <Switch
                      id={`mk-${key}`}
                      checked={row.enabled}
                      onCheckedChange={(c) => setRow(key, { enabled: c })}
                    />
                    <Label
                      htmlFor={`mk-${key}`}
                      className="tw-cursor-pointer tw-font-semibold"
                    >
                      {label}
                    </Label>
                  </div>
                  <div className="tw-flex tw-items-center tw-gap-3">
                    <span
                      className={cn(
                        "tw-text-xs tw-tabular-nums",
                        active && row.percentage > 0
                          ? "tw-text-muted-foreground"
                          : "tw-text-muted-foreground/60"
                      )}
                    >
                      {example}
                    </span>
                    <div
                      className={cn(
                        "tw-flex tw-items-center tw-gap-0.5 tw-rounded-lg tw-border tw-bg-background tw-pr-2.5 tw-transition-opacity",
                        active
                          ? "tw-border-input"
                          : "tw-border-transparent tw-opacity-50"
                      )}
                    >
                      <Input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        max={100}
                        step="0.01"
                        className="tw-w-20 tw-border-0 tw-bg-transparent tw-text-right tw-font-semibold tw-shadow-none focus-visible:tw-ring-0"
                        disabled={!active}
                        value={drafts[key]}
                        onChange={(e) => onPercentChange(key, e.target.value)}
                        onBlur={() => onPercentBlur(key)}
                      />
                      <span className="tw-text-sm tw-font-medium tw-text-muted-foreground">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
};

export default AdminPricing;
