import { useEffect, useState } from "react";
import { ToggleRight, CreditCard, Save, ShieldAlert, CheckCircle2 } from "lucide-react";
import AdminLayout from "../AdminLayout";
import adminApi, { rootApi, apiError } from "../adminApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Label,
  Switch,
  Button,
  Alert,
  AlertDescription,
  Skeleton,
} from "../ui";

const prettify = (k: string) =>
  k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

const AdminConfig = () => {
  const [config, setConfig] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [gatewayEnv, setGatewayEnv] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await adminApi.get("/config");
      setConfig(res.data.data.config);
    } catch (e) {
      setError(apiError(e));
    }
  };

  const loadPublicConfig = async () => {
    try {
      const res = await rootApi.get("/config");
      setGatewayEnv(res.data?.data?.gatewayEnv ?? null);
    } catch {
      // best-effort: failure must not break the page
    }
  };

  useEffect(() => {
    load();
    loadPublicConfig();
  }, []);

  const flag = (k: string, v: boolean) =>
    setConfig((c: any) => ({ ...c, featureFlags: { ...c.featureFlags, [k]: v } }));

  const save = async () => {
    setBusy(true);
    setMsg("");
    setError("");
    try {
      await adminApi.put("/config", {
        featureFlags: config.featureFlags,
        payment: config.payment,
      });
      setMsg("Configuration saved.");
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout
      title="System Config"
      crumb="System Config"
      description="Platform-wide feature flags and payment settings."
      superOnly
      actions={
        config && (
          <Button onClick={save} disabled={busy}>
            <Save /> {busy ? "Saving…" : "Save Config"}
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

      {!config ? (
        <div className="tw-space-y-5">
          <Skeleton className="tw-h-52 tw-rounded-2xl" />
          <Skeleton className="tw-h-40 tw-rounded-2xl" />
        </div>
      ) : (
        <div className="tw-space-y-5">
          <Card>
            <CardHeader className="tw-flex-row tw-items-center tw-gap-2">
              <ToggleRight className="tw-size-5 tw-text-primary" />
              <div>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>Turn platform capabilities on or off.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="tw-grid tw-gap-3 sm:tw-grid-cols-2">
              {Object.entries(config.featureFlags || {}).map(([k, v]: any) => (
                <label
                  key={k}
                  htmlFor={`flag-${k}`}
                  className="tw-flex tw-cursor-pointer tw-items-center tw-justify-between tw-gap-3 tw-rounded-xl tw-border tw-border-border tw-bg-muted/40 tw-px-4 tw-py-3 tw-transition-colors hover:tw-bg-muted"
                >
                  <span className="tw-text-sm tw-font-semibold tw-text-foreground">
                    {prettify(k)}
                  </span>
                  <Switch
                    id={`flag-${k}`}
                    checked={!!v}
                    onCheckedChange={(checked) => flag(k, checked)}
                  />
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="tw-flex-row tw-items-center tw-gap-2">
              <CreditCard className="tw-size-5 tw-text-primary" />
              <div>
                <CardTitle>Payment</CardTitle>
                {gatewayEnv && (
                  <CardDescription>
                    Gateway: CCAvenue ·{" "}
                    <span
                      className={
                        gatewayEnv === "production"
                          ? "tw-font-semibold tw-text-green-600"
                          : "tw-font-semibold tw-text-amber-600"
                      }
                    >
                      {gatewayEnv}
                    </span>
                  </CardDescription>
                )}
              </div>
            </CardHeader>
            <CardContent className="tw-grid tw-gap-4 sm:tw-grid-cols-2">
              <div className="tw-space-y-1.5">
                <Label htmlFor="cur">Default currency</Label>
                <Input
                  id="cur"
                  value={config.payment?.defaultCurrency ?? ""}
                  onChange={(e) =>
                    setConfig((c: any) => ({
                      ...c,
                      payment: { ...c.payment, defaultCurrency: e.target.value },
                    }))
                  }
                />
              </div>
              <label
                htmlFor="ccavenue"
                className="tw-flex tw-cursor-pointer tw-items-center tw-justify-between tw-gap-3 tw-rounded-xl tw-border tw-border-border tw-bg-muted/40 tw-px-4 sm:tw-mt-6"
              >
                <span className="tw-py-3 tw-text-sm tw-font-semibold">CCAvenue enabled</span>
                <Switch
                  id="ccavenue"
                  checked={config.payment?.ccavenueEnabled !== false}
                  onCheckedChange={(checked) =>
                    setConfig((c: any) => ({
                      ...c,
                      payment: { ...c.payment, ccavenueEnabled: checked },
                    }))
                  }
                />
              </label>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminConfig;
