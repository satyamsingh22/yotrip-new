import { useState } from "react";
import { KeyRound, ShieldAlert } from "lucide-react";
import adminApi, { apiError } from "../adminApi";
import { useAdminAuthContext } from "../AdminAuthContext";
import { all_routes } from "../../router/all_routes";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Button,
  Alert,
  AlertDescription,
} from "../ui";

const AdminChangePassword = () => {
  const { admin, status } = useAdminAuthContext();
  const forced = !!admin?.mustChangePassword;
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      await adminApi.post("/change-password", { currentPassword, newPassword });
      // Hard reload so /api/admin/me re-reads mustChangePassword=false and the gate clears.
      window.location.assign(all_routes.adminOverview);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  if (status === "loading") return null;

  return (
    <div className="tw-mx-auto tw-max-w-md tw-py-10">
      <Card>
        <CardHeader className="tw-flex-row tw-items-center tw-gap-2">
          <KeyRound className="tw-size-5 tw-text-primary" />
          <CardTitle>{forced ? "Set a new password" : "Change password"}</CardTitle>
        </CardHeader>
        <CardContent>
          {forced && (
            <Alert variant="info" className="tw-mb-4">
              <ShieldAlert />
              <AlertDescription>
                For security, please choose a new password before continuing.
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="tw-mb-4">
              <ShieldAlert />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={submit} className="tw-space-y-4">
            <div className="tw-space-y-1.5">
              <Label htmlFor="current">Current password</Label>
              <Input
                id="current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrent(e.target.value)}
                required
              />
            </div>
            <div className="tw-space-y-1.5">
              <Label htmlFor="new">New password</Label>
              <Input
                id="new"
                type="password"
                value={newPassword}
                onChange={(e) => setNew(e.target.value)}
                required
              />
            </div>
            <div className="tw-space-y-1.5">
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={busy} className="tw-w-full">
              {busy ? "Saving…" : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminChangePassword;
