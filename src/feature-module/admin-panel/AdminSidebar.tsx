import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  CalendarCheck,
  Wallet,
  Users,
  Ship,
  HelpCircle,
  BarChart3,
  ShieldCheck,
  Percent,
  TicketPercent,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { all_routes } from "../router/all_routes";
import { useAdminAuthContext } from "./AdminAuthContext";
import { cn } from "@/lib/utils";

type Role = "admin" | "superadmin" | "finance" | "support";

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  allowedRoles?: Role[]; // undefined = visible to all staff
}

interface NavGroup {
  heading: string;
  items: NavItem[];
}

const r = all_routes;

const ROLE_LABELS: Record<Role, string> = {
  superadmin: "Super",
  admin: "Admin",
  finance: "Finance",
  support: "Support",
};

const NAV: NavGroup[] = [
  {
    heading: "Overview",
    items: [
      { to: r.adminOverview, icon: LayoutGrid, label: "Dashboard" },
      { to: r.adminBookings, icon: CalendarCheck, label: "Bookings" },
      { to: r.adminPayments, icon: Wallet, label: "Payments", allowedRoles: ["finance", "admin", "superadmin"] },
      { to: r.adminReports, icon: BarChart3, label: "Reports", allowedRoles: ["finance", "admin", "superadmin"] },
      { to: r.adminPricing, icon: Percent, label: "Pricing", allowedRoles: ["finance", "admin", "superadmin"] },
    ],
  },
  {
    heading: "People",
    items: [
      { to: r.adminUsers, icon: Users, label: "Users" },
      // Hidden for now — Vendors & Cruise Review not launched yet.
      // { to: r.adminVendors, icon: Store, label: "Vendors" },
      // { to: r.adminCruiseReview, icon: Ship, label: "Cruise Review" },
    ],
  },
  {
    heading: "Content",
    items: [
      { to: r.adminCoupons, icon: TicketPercent, label: "Coupons", allowedRoles: ["finance", "admin", "superadmin"] },
      // Hidden for now — Offers, Gallery, Testimonials, Careers coming later.
      // { to: r.adminOffers, icon: Tag, label: "Offers" },
      { to: r.adminFaqs, icon: HelpCircle, label: "FAQs" },
      // { to: r.adminGallery, icon: Images, label: "Gallery" },
      // { to: r.adminTestimonials, icon: Star, label: "Testimonials" },
      // { to: r.adminCareers, icon: Briefcase, label: "Careers" },
    ],
  },
  // Hidden for now — Refund Requests & Payouts to be implemented later.
  // {
  //   heading: "Operations",
  //   items: [
  //     { to: r.adminRefundRequests, icon: ReceiptText, label: "Refund Requests", allowedRoles: ["support", "finance", "admin", "superadmin"] },
  //     { to: r.adminPayouts, icon: Banknote, label: "Payouts", allowedRoles: ["finance", "admin", "superadmin"] },
  //   ],
  // },
  {
    heading: "System",
    items: [
      { to: r.adminStaff, icon: ShieldCheck, label: "Staff & Roles", allowedRoles: ["superadmin"] },
      // Hidden for now — System Config & Audit Logs coming later.
      // { to: r.adminConfig, icon: Settings2, label: "System Config", allowedRoles: ["superadmin"] },
      // { to: r.adminAuditLogs, icon: ScrollText, label: "Audit Logs", allowedRoles: ["superadmin"] },
    ],
  },
];

interface Props {
  mobileOpen: boolean;
  onNavigate: () => void;
}

const initials = (name?: string) =>
  (name || "Admin")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const AdminSidebar = ({ mobileOpen, onNavigate }: Props) => {
  const { pathname } = useLocation();
  const { admin, role, isSuperAdmin, logout } = useAdminAuthContext();

  return (
    <aside
      className={cn(
        "tw-fixed tw-inset-y-0 tw-left-0 tw-z-50 tw-flex tw-w-[17rem] tw-flex-col tw-bg-rail-gradient tw-text-rail-foreground tw-shadow-rail",
        "tw-transition-transform tw-duration-300 tw-ease-out lg:tw-translate-x-0",
        mobileOpen ? "tw-translate-x-0" : "-tw-translate-x-full"
      )}
    >
      {/* subtle texture */}
      <div
        className="tw-pointer-events-none tw-absolute tw-inset-0 tw-opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Brand */}
      <div className="tw-relative tw-flex tw-h-16 tw-items-center tw-gap-3 tw-px-5">
        <span className="tw-grid tw-size-9 tw-place-items-center tw-rounded-xl tw-bg-white/10 tw-ring-1 tw-ring-white/15">
          <Ship className="tw-size-5 tw-text-rail-accent" />
        </span>
        <div className="tw-leading-tight">
          <p className="tw-text-[15px] tw-font-extrabold tw-tracking-tight tw-text-white">
            Yotrip
          </p>
          <p className="tw-text-[10px] tw-font-semibold tw-uppercase tw-tracking-[0.18em] tw-text-rail-muted">
            {isSuperAdmin ? "Super Admin" : "Admin Console"}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="rail-scroll tw-relative tw-flex-1 tw-space-y-5 tw-overflow-y-auto tw-px-3 tw-py-4">
        {NAV.map((group) => {
          const items = group.items.filter(
            (it) => !it.allowedRoles || (role && it.allowedRoles.includes(role))
          );
          if (!items.length) return null;
          return (
            <div key={group.heading}>
              <p className="tw-px-3 tw-pb-2 tw-text-[10px] tw-font-bold tw-uppercase tw-tracking-[0.16em] tw-text-rail-muted/80">
                {group.heading}
              </p>
              <ul className="tw-space-y-0.5">
                {items.map((it) => {
                  const active = pathname === it.to;
                  const Icon = it.icon;
                  return (
                    <li key={it.to}>
                      <Link
                        to={it.to}
                        onClick={onNavigate}
                        className={cn(
                          "tw-group tw-relative tw-flex tw-items-center tw-gap-3 tw-rounded-xl tw-px-3 tw-py-2.5 tw-text-sm tw-font-semibold tw-transition-colors",
                          active
                            ? "tw-text-white"
                            : "tw-text-rail-foreground/80 hover:tw-text-white"
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="rail-active"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 40,
                            }}
                            className="tw-absolute tw-inset-0 tw-z-0 tw-rounded-xl tw-bg-white/[0.12] tw-ring-1 tw-ring-inset tw-ring-white/10"
                          />
                        )}
                        {active && (
                          <span className="tw-absolute tw-left-0 tw-top-1/2 tw-z-10 tw-h-5 tw-w-1 -tw-translate-y-1/2 tw-rounded-r-full tw-bg-rail-accent" />
                        )}
                        <Icon
                          className={cn(
                            "tw-relative tw-z-10 tw-size-[18px] tw-shrink-0 tw-transition-colors",
                            active
                              ? "tw-text-rail-accent"
                              : "tw-text-rail-muted group-hover:tw-text-white"
                          )}
                        />
                        <span className="tw-relative tw-z-10">{it.label}</span>
                        {(() => {
                          const superOnly = it.allowedRoles?.length === 1 && it.allowedRoles[0] === "superadmin";
                          return superOnly ? (
                            <span className="tw-relative tw-z-10 tw-ml-auto tw-rounded-md tw-bg-rail-accent/15 tw-px-1.5 tw-py-0.5 tw-text-[9px] tw-font-bold tw-uppercase tw-tracking-wide tw-text-rail-accent">
                              Super
                            </span>
                          ) : null;
                        })()}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="tw-relative tw-border-t tw-border-white/10 tw-p-3">
        <div className="tw-flex tw-items-center tw-gap-3 tw-rounded-2xl tw-bg-gradient-to-b tw-from-white/[0.08] tw-to-white/[0.03] tw-p-2.5 tw-ring-1 tw-ring-inset tw-ring-white/10">
          <Link
            to={all_routes.adminProfile}
            onClick={onNavigate}
            title="Edit my profile"
            className="tw-flex tw-min-w-0 tw-flex-1 tw-items-center tw-gap-3 tw-rounded-xl tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-rail-accent/60"
          >
            {/* Avatar with presence dot */}
            <span className="tw-relative tw-shrink-0">
              <span className="tw-grid tw-size-10 tw-place-items-center tw-rounded-full tw-bg-gradient-to-br tw-from-rail-accent/35 tw-to-rail-accent/10 tw-text-[12px] tw-font-bold tw-text-rail-accent tw-ring-1 tw-ring-inset tw-ring-rail-accent/25">
                {initials(admin?.name)}
              </span>
              <span
                className="tw-absolute -tw-bottom-0.5 -tw-right-0.5 tw-size-3 tw-rounded-full tw-bg-emerald-400 tw-ring-2 tw-ring-[hsl(var(--rail))]"
                title="Online"
              />
            </span>

            <div className="tw-min-w-0">
              <p className="tw-text-[9px] tw-font-bold tw-uppercase tw-leading-none tw-tracking-[0.14em] tw-text-rail-accent">
                {role ? ROLE_LABELS[role] : "Admin"}
              </p>
              <p className="tw-mt-1 tw-truncate tw-text-[13px] tw-font-bold tw-leading-tight tw-text-white">
                {admin?.name || "Admin"}
              </p>
              <p className="tw-mt-0.5 tw-truncate tw-text-[11px] tw-leading-none tw-text-rail-muted">
                {admin?.email || "—"}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={logout}
            title="Log out"
            aria-label="Log out"
            className="tw-grid tw-size-9 tw-shrink-0 tw-place-items-center tw-rounded-xl tw-bg-white/5 tw-text-rail-muted tw-ring-1 tw-ring-inset tw-ring-white/10 tw-transition-colors hover:tw-bg-red-500/15 hover:tw-text-red-300 hover:tw-ring-red-500/30 focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-rail-accent/60"
          >
            <LogOut className="tw-size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
