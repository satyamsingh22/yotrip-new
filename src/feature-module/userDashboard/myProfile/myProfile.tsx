import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../../core/common/sidebar/sidebar";
import { all_routes } from "../../router/all_routes";
import { Link } from "react-router-dom";
import SavedTravelers from "./savedTravelers";
import "./my-profile.scss";

type Profile = {
  name?: { firstName?: string; lastName?: string; fullName?: string };
  email?: string;
  phone?: string;
  profileImage?: string;
  address?: {
    address?: string;
    country?: string;
    state?: string;
    city?: string;
    postalCode?: string;
  };
};

/** Read-only value in a grey pill with a leading icon (mock field style). */
const Field = ({ icon, value, label }: { icon: string; value?: string; label: string }) => (
  <div className="ypf-field" title={label}>
    <i className={`isax ${icon}`} aria-hidden />
    <span aria-label={label}>{value?.trim() || "N/A"}</span>
  </div>
);

const SectionHead = ({
  icon,
  title,
  sub,
  action,
}: {
  icon: string;
  title: string;
  sub: string;
  action?: React.ReactNode;
}) => (
  <header className="ypf-card__head">
    <span className="ypf-card__icon" aria-hidden>
      <i className={`isax ${icon}`} />
    </span>
    <div className="ypf-card__title">
      <h2>{title}</h2>
      <p>{sub}</p>
    </div>
    {action}
  </header>
);

const MyProfile = () => {
  const routes = all_routes;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [failed, setFailed] = useState(false);
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProfile = async () => {
      try {
        // Login stores the address under "userEmail"; the old "email" lookup
        // always came back null, so this bailed out and the page sat on
        // "Loading..." forever. /api/auth/profile resolves the user from the
        // bearer token anyway — the body is only a legacy field.
        const email = localStorage.getItem("userEmail");
        const token = localStorage.getItem("token");

        const res = await axios.post(
          `${BASE_URL}/api/auth/profile`,
          { email },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        localStorage.setItem("name", res.data.name?.fullName || "");
        setProfile(res.data);
      } catch (err) {
        console.error("Profile fetch failed:", err);
        setFailed(true);
      }
    };

    fetchProfile();
  }, []);

  const address = profile?.address || {};
  const editLink = (label: string, hash = "") => (
    <Link to={`${routes.profileSettings}${hash}`} className="ypf-btn ypf-btn--outline">
      <i className="isax isax-edit-2" aria-hidden />
      {label}
    </Link>
  );

  return (
    <div className="ypf">
      <section className="ypf-hero">
        <div className="ypf-hero__copy">
          <h1>My Profile</h1>
          <nav aria-label="breadcrumb">
            <ol>
              <li>
                <Link to={routes.home1}>
                  <i className="isax isax-home-2" aria-hidden />
                  Home
                </Link>
              </li>
              <li aria-current="page">My Profile</li>
            </ol>
          </nav>
        </div>
      </section>

      <div className="ypf-body">
        <div className="ypf-layout">
          <Sidebar />

          <div className="ypf-main">
            {!profile ? (
              <section className="ypf-card ypf-card--status">
                <p>{failed ? "Could not load your profile. Please refresh or log in again." : "Loading profile…"}</p>
              </section>
            ) : (
              <>
                <section className="ypf-card" aria-label="Personal Information">
                  <SectionHead
                    icon="isax-user-edit"
                    title="Personal Information"
                    sub="Manage your personal details. This information will be used for your bookings."
                    action={editLink("Edit Profile")}
                  />
                  <div className="ypf-grid">
                    <div>
                      <span className="ypf-label">First Name</span>
                      <Field icon="isax-user" label="First name" value={profile.name?.firstName} />
                    </div>
                    <div>
                      <span className="ypf-label">Last Name</span>
                      <Field icon="isax-user" label="Last name" value={profile.name?.lastName} />
                    </div>
                    <div>
                      <span className="ypf-label">Email</span>
                      <Field icon="isax-sms" label="Email" value={profile.email} />
                    </div>
                    <div>
                      <span className="ypf-label">Phone</span>
                      <Field icon="isax-call" label="Phone" value={profile.phone} />
                    </div>
                  </div>
                </section>

                <section className="ypf-card" aria-label="Address Information">
                  <SectionHead
                    icon="isax-location-tick"
                    title="Address Information"
                    sub="Your address details will be used for booking confirmations and communication."
                    action={editLink("Edit Address")}
                  />
                  <div className="ypf-addr">
                    <span className="ypf-addr__label">Address</span>
                    <Field icon="isax-home-2" label="Address" value={address.address} />
                    <Field icon="isax-map" label="State" value={address.state} />

                    <span className="ypf-addr__label">Country</span>
                    <Field icon="isax-global" label="Country" value={address.country} />
                    <Field icon="isax-location" label="Postal code" value={address.postalCode} />

                    <span className="ypf-addr__label">City</span>
                    <Field icon="isax-buildings" label="City" value={address.city} />
                  </div>
                </section>

                <SavedTravelers />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
