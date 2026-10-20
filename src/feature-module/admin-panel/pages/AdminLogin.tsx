import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Ship,
  Eye,
  EyeOff,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { all_routes } from "../../router/all_routes";
import useAdminAuth from "../useAdminAuth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const AdminLogin = () => {
  const navigate = useNavigate();
  const { status } = useAdminAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Already signed in → go straight to the console (never flash the login form).
  if (status === "authed") {
    return <Navigate to={all_routes.adminOverview} replace />;
  }

  // Session check still in flight → show a light loader instead of the form,
  // so an authenticated admin who lands on /admin doesn't briefly see "Sign in".
  if (status === "loading") {
    return (
      <div className="tw-grid tw-min-h-screen tw-place-items-center tw-bg-background">
        <div className="tw-flex tw-items-center tw-gap-3 tw-text-muted-foreground">
          <span className="tw-size-5 tw-animate-spin tw-rounded-full tw-border-2 tw-border-current tw-border-t-transparent" />
          <span className="tw-text-sm tw-font-medium">Checking your session…</span>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/\S+@\S+\.\S+/.test(form.email)) return setError("Enter a valid email");
    if (!form.password) return setError("Password is required");

    setBusy(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/adminlogin`,
        { email: form.email, password: form.password },
        { withCredentials: true }
      );
      if (res.data?.error) {
        setError(res.data.error);
        return;
      }
      if (res.data?.token) {
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("adminRole", res.data.admin?.role || "admin");
      }
      navigate(all_routes.adminOverview);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tw-grid tw-min-h-screen tw-bg-background lg:tw-grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="tw-relative tw-hidden tw-overflow-hidden tw-bg-rail-gradient tw-p-12 tw-text-white lg:tw-flex lg:tw-flex-col lg:tw-justify-between">
        <div
          className="tw-pointer-events-none tw-absolute tw-inset-0 tw-opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />
        <div
          className="tw-pointer-events-none tw-absolute -tw-right-24 -tw-top-24 tw-size-[28rem] tw-rounded-full tw-opacity-40 tw-blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, hsl(74 62% 56% / 0.5), transparent)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="tw-relative tw-flex tw-items-center tw-gap-3"
        >
          <span className="tw-grid tw-size-10 tw-place-items-center tw-rounded-xl tw-bg-white/10 tw-ring-1 tw-ring-white/15">
            <Ship className="tw-size-6 tw-text-rail-accent" />
          </span>
          <span className="tw-text-xl tw-font-extrabold tw-tracking-tight">Yotrip</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="tw-relative tw-max-w-md"
        >
          <h2 className="tw-text-3xl tw-font-extrabold tw-leading-tight tw-tracking-tight !tw-text-white">
            Run the whole platform from one console.
          </h2>
          <p className="tw-mt-3 tw-text-rail-foreground/80">
            Bookings, payments, vendors and configuration — managed in a single,
            secure admin workspace.
          </p>
          <div className="tw-mt-8 tw-space-y-3">
            {[
              { icon: ShieldCheck, text: "Role-based access for Admins & Super Admins" },
              { icon: Lock, text: "Session-secured, audit-logged actions" },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.text}
                  className="tw-flex tw-items-center tw-gap-3 tw-text-sm tw-text-rail-foreground/90"
                >
                  <span className="tw-grid tw-size-8 tw-place-items-center tw-rounded-lg tw-bg-white/10">
                    <Icon className="tw-size-4 tw-text-rail-accent" />
                  </span>
                  {f.text}
                </div>
              );
            })}
          </div>
        </motion.div>

        <p className="tw-relative tw-text-xs tw-text-rail-muted">
          © {new Date().getFullYear()} Yotrip. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="tw-flex tw-items-center tw-justify-center tw-p-6 sm:tw-p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="tw-w-full tw-max-w-sm"
        >
          <div className="tw-mb-8 lg:tw-hidden">
            <span className="tw-grid tw-size-11 tw-place-items-center tw-rounded-xl tw-bg-primary/10">
              <Ship className="tw-size-6 tw-text-primary" />
            </span>
          </div>

          <span className="tw-inline-flex tw-items-center tw-gap-1.5 tw-rounded-full tw-bg-primary/10 tw-px-3 tw-py-1 tw-text-xs tw-font-bold tw-uppercase tw-tracking-wide tw-text-primary">
            <ShieldCheck className="tw-size-3.5" /> Admin Access
          </span>
          <h1 className="tw-mt-4 tw-text-2xl tw-font-extrabold tw-tracking-tight tw-text-foreground">
            Welcome back
          </h1>
          <p className="tw-mt-1.5 tw-text-sm tw-text-muted-foreground">
            Sign in to the Yotrip admin console.
          </p>

          {error && (
            <Alert variant="destructive" className="tw-mt-6">
              <AlertCircle />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={submit} className="tw-mt-6 tw-space-y-4">
            <div className="tw-space-y-1.5">
              <Label htmlFor="admin-email">Email address</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>

            <div className="tw-space-y-1.5">
              <Label htmlFor="admin-pwd">Password</Label>
              <div className="tw-relative">
                <Input
                  id="admin-pwd"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  className="tw-pr-11"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  tabIndex={-1}
                  className="tw-absolute tw-right-1.5 tw-top-1/2 tw-grid tw-size-8 -tw-translate-y-1/2 tw-place-items-center tw-rounded-md tw-text-muted-foreground tw-transition-colors hover:tw-bg-muted hover:tw-text-foreground"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff className="tw-size-4" /> : <Eye className="tw-size-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="tw-w-full" disabled={busy}>
              {busy ? (
                "Signing in…"
              ) : (
                <>
                  Sign in <ArrowRight className="tw-size-4" />
                </>
              )}
            </Button>
          </form>

          <p className="tw-mt-6 tw-text-center tw-text-xs tw-text-muted-foreground">
            For Admins &amp; Super Admins only. Access is monitored.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
