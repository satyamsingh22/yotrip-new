import { useEffect, useState } from "react";
import axios from "axios";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import Sidebar from "../../../core/common/sidebar/sidebar";
import { all_routes } from "../../router/all_routes";
import { Link } from "react-router-dom";
import UserAvatar from "../../../core/common/userAvatar/UserAvatar";
import SavedTravelers from "./savedTravelers";

const MyProfile = () => {
  const routes = all_routes;
  const [profile, setProfile] = useState<any>(null);
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
      }
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return (
      <div>
        <Breadcrumb
          title="My Profile"
          breadcrumbs={[]}
          backgroundClass="breadcrumb-bg-01"
        />
        <div
          className="content d-flex align-items-center justify-content-center"
          style={{ minHeight: "60vh" }}
        >
          <p className="text-muted mb-0">Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb
        title="My Profile"
        breadcrumbs={[]}
        backgroundClass="breadcrumb-bg-01"
      />

      <div className="content">
        <div className="container">
          <div className="row">

            <div className="col-xl-3 col-lg-4">
              <Sidebar />
            </div>

            <div className="col-xl-9 col-lg-8">
              <div className="card shadow-none mb-0">

                <div className="card-header d-flex justify-content-between">
                  <h6>My Profile</h6>
                  <Link to={routes.profileSettings} className="btn btn-light p-1">
                    <i className="isax isax-edit-2"></i>
                  </Link>
                </div>

                <div className="card-body">

                  <h6 className="fs-16 mb-3">Basic Information</h6>

                  <div className="d-flex align-items-center mb-3">
                    <UserAvatar
                        src={
                          profile?.profileImage
                            ? `${BASE_URL}${profile.profileImage}`
                            : null
                        }
                        name={profile?.name?.fullName}
                        className="avatar avatar-xl rounded-circle"
                        alt="Profile"
                      />

                    
                  </div>

                  <div className="row border-bottom pb-2 mb-3">

                    <div className="col-md-6 mb-2">
                      <h6>First Name</h6>
                      <p>{profile?.name?.firstName || "N/A"}</p>
                    </div>

                    <div className="col-md-6 mb-2">
                      <h6>Last Name</h6>
                      <p>{profile?.name?.lastName || "N/A"}</p>
                    </div>

                    <div className="col-md-6 mb-2">
                      <h6>Email</h6>
                      <p>{profile?.email || "N/A"}</p>
                    </div>

                    <div className="col-md-6 mb-2">
                      <h6>Phone</h6>
                      <p>{profile?.phone || "N/A"}</p>
                    </div>

                  </div>

                  <h6 className="fs-16 mb-3">Address Information</h6>

                  <div className="row g-2">

                    <div className="col-md-12">
                      <h6>Address</h6>
                      <p>{profile?.address?.address || "N/A"}</p>
                    </div>

                    <div className="col-md-6">
                      <h6>Country</h6>
                      <p>{profile?.address?.country || "N/A"}</p>
                    </div>

                    <div className="col-md-6">
                      <h6>State</h6>
                      <p>{profile?.address?.state || "N/A"}</p>
                    </div>

                    <div className="col-md-6">
                      <h6>City</h6>
                      <p>{profile?.address?.city || "N/A"}</p>
                    </div>

                    <div className="col-md-6">
                      <h6>Postal Code</h6>
                      <p>{profile?.address?.postalCode || "N/A"}</p>
                    </div>

                  </div>

                </div>

              </div>

              <SavedTravelers />
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default MyProfile;
