import { useState, useEffect } from "react";
import axios from "axios";
import { all_routes } from "../../router/all_routes";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { Link } from "react-router-dom";
import Sidebar from "../../../core/common/sidebar/sidebar";
import UserAvatar from "../../../core/common/userAvatar/UserAvatar";

import CustomSelect from "../../../core/common/commonSelect";
import { City, State } from "../../../core/common/selectOption/json/selectOption";

const ProfileSettings = () => {
  const routes = all_routes;
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const breadcrumbs = [
    { label: "Settings", link: routes.home1, active: false },
    { label: "Profile Settings", active: true },
  ];

  const [Data, setData] = useState({
    first_Name: "",
    last_Name: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    state: "",
    city: "",
    postal_Code: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profileImage, setProfileImage] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        const token = localStorage.getItem("token");

        const res = await axios.post(
          `${BASE_URL}/api/auth/profile`,
          { email },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        const user = res.data;

        setData({
          first_Name: user?.name?.firstName || "",
          last_Name: user?.name?.lastName || "",
          email: user?.email || "",
          phone: user?.phone || "",
          address: user?.address?.address || "",
          country: user?.address?.country || "",
          state: user?.address?.state || "",
          city: user?.address?.city || "",
          postal_Code: user?.address?.postalCode || "",
        });

        setProfileImage(user?.profileImage || "");
      } catch (err) {
        console.log("Profile fetch failed:", err);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!Data.first_Name.trim()) newErrors.first_Name = "First name is required";
    if (!Data.last_Name.trim()) newErrors.last_Name = "Last name is required";
    if (!Data.phone.trim()) newErrors.phone = "Phone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${BASE_URL}/api/auth/update-profile`,
        {
          email: Data.email,
          name: {
            firstName: Data.first_Name,
            lastName: Data.last_Name,
            fullName: `${Data.first_Name} ${Data.last_Name}`,
          },
          phone: Data.phone,
          address: {
            address: Data.address,
            country: Data.country,
            state: Data.state,
            city: Data.city,
            postalCode: Data.postal_Code,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      alert("Profile Updated Successfully");
    } catch (error: any) {
      console.log("Update Failed:", error.response?.data || error.message);
      alert("Update Failed: " + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Breadcrumb
        title="Settings"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-04"
      />

      <div className="content">
        <div className="container">
          <div className="row">
            <div className="col-xl-3 col-lg-4">
              <Sidebar />
            </div>

            <div className="col-xl-9 col-lg-8">
              <div className="card settings mb-0">
                <form onSubmit={handleSave}>
                  <div className="card-header">
                    <h6>Settings</h6>
                  </div>

                  <div className="card-body pb-3">
                    <div className="settings-link d-flex align-items-center flex-wrap">
                      <Link to={routes.profileSettings} className="active ps-3">
                        <i className="isax isax-user-octagon me-2" />
                        Profile Settings
                      </Link>
                      <Link to={routes.securitySettings}>
                        <i className="isax isax-shield-tick me-2" />
                        Security
                      </Link>
                      <Link to={routes.notificationSettings}>
                        <i className="isax isax-notification me-2" />
                        Notifications
                      </Link>
                      <Link to={routes.integrationSettings} className="pe-3">
                        <i className="isax isax-hierarchy me-2" />
                        Integrations
                      </Link>
                    </div>

                    <div className="settings-content mb-3">
                      <h6 className="fs-16 mb-3">Basic Information</h6>

                      <div className="row gy-2">
                        <div className="col-lg-12">
                          <UserAvatar
                            src={
                              profileImage
                                ? `${BASE_URL}${profileImage}`
                                : null
                            }
                            name={`${Data.first_Name} ${Data.last_Name}`.trim()}
                            alt="Profile"
                            className="img-fluid avatar avatar-xxl br-10"
                          />
                        </div>

                        <div className="col-lg-6">
                          <label className="form-label">First Name</label>
                          <input
                            type="text"
                            name="first_Name"
                            value={Data.first_Name}
                            className="form-control"
                            onChange={handleChange}
                          />
                          {errors.first_Name && (
                            <p className="text-danger">{errors.first_Name}</p>
                          )}
                        </div>

                        <div className="col-lg-6">
                          <label className="form-label">Last Name</label>
                          <input
                            type="text"
                            name="last_Name"
                            value={Data.last_Name}
                            className="form-control"
                            onChange={handleChange}
                          />
                          {errors.last_Name && (
                            <p className="text-danger">{errors.last_Name}</p>
                          )}
                        </div>

                        <div className="col-lg-6">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            name="email"
                            disabled
                            value={Data.email}
                            className="form-control"
                          />
                        </div>

                        <div className="col-lg-6">
                          <label className="form-label">Phone</label>
                          <input
                            type="text"
                            name="phone"
                            value={Data.phone}
                            className="form-control"
                            onChange={handleChange}
                          />
                          {errors.phone && (
                            <p className="text-danger">{errors.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="settings-content">
                      <h6 className="fs-16 mb-3">Address Information</h6>

                      <div className="row gy-2">
                        <div className="col-lg-12">
                          <label className="form-label">Address</label>
                          <input
                            type="text"
                            name="address"
                            value={Data.address}
                            className="form-control"
                            onChange={handleChange}
                          />
                        </div>

                        <div className="col-lg-6">
                          <label className="form-label">Country</label>
                          <input
                            type="text"
                            name="country"
                            value={Data.country}
                            className="form-control"
                            onChange={handleChange}
                          />
                        </div>

                        <div className="col-lg-6">
                          <label className="form-label">State</label>
                          <CustomSelect
                            options={State}
                            value={Data.state}
                            placeholder="Select"
                            onChange={(v: any) =>
                              setData({ ...Data, state: v.value })
                            }
                          />
                        </div>

                        <div className="col-lg-6">
                          <label className="form-label">City</label>
                          <CustomSelect
                            options={City}
                            value={Data.city}
                            placeholder="Select"
                            onChange={(v: any) =>
                              setData({ ...Data, city: v.value })
                            }
                          />
                        </div>

                        <div className="col-lg-6">
                          <label className="form-label">Postal Code</label>
                          <input
                            type="text"
                            name="postal_Code"
                            value={Data.postal_Code}
                            className="form-control"
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer text-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
