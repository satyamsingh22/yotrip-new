import { useState } from 'react'
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import { useAuth } from '../../../../context/AuthContext';
import { clearDeletedAccountLocalKeys, requestAccountDeletion } from '../deleteAccount';
type PasswordField = "password" | "confirmPassword" | "currentPassword";



const SecuritySettingsModal = () => {
    const { logout } = useAuth();
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const [passwordVisibility, setPasswordVisibility] = useState({
        password: false,
        confirmPassword: false,
        currentPassword: false,
    });
    

    const togglePasswordVisibility = (field: PasswordField) => {
        setPasswordVisibility((prevState) => ({
            ...prevState,
            [field]: !prevState[field],
        }));
    };
    const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

    const [value, setValue] = useState<string | undefined>(undefined);
    const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleSave = async (e: any) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const token = localStorage.getItem("token");

            await axios.post(
                `${BASE_URL}/api/auth/changepassword`,
                {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Password Updated Successfully");
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            setErrors((prev) => ({
                ...prev,
                currentPassword: error.response?.data?.error || "Update failed",
            }));
        }
    };
  const validate = () => {
    let valid = true;
    let newErrors: any = {};

    // Current password
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
      valid = false;
    }

    // New password
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
      valid = false;
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
      valid = false;
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm your new password";
      valid = false;
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleDeleteAccount = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await requestAccountDeletion();
      clearDeletedAccountLocalKeys();
      toast.success("Your account has been deleted.");
      await logout();
    } catch (error: any) {
      setDeleteError(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Could not delete your account. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

    return (
        <>
            {/* Change password */}
            <div
                className="modal fade"
                id="changePassword"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex={-1}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5>Change Password</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            />
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body pb-0">
                                <div className="mb-3">
                                    <label className="form-label">
                                        Current Password <span className="text-primary">*</span>{" "}
                                    </label>
                                    <div className="input-icon">
                                        <span className="input-icon-addon">
                                            <i className="isax isax-lock" />
                                        </span>
                                        <input
                                            type={
                                                passwordVisibility.currentPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="currentPassword"
                                            className="pass-input form-control"
                                            placeholder='Enter Password'
                                            onChange={handleChange}
                                        />
                                        <span
                                            className={`isax toggle-passwords ${passwordVisibility.currentPassword
                                                ? "isax-eye"
                                                : "isax-eye-slash"
                                                }`}
                                            onClick={() =>
                                                togglePasswordVisibility("currentPassword")
                                            }
                                        ></span>
                                        {errors.currentPassword && (
                    <p className="text-danger">{errors.currentPassword}</p>
                  )}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">
                                        New Password <span className="text-primary">*</span>{" "}
                                    </label>
                                    <div className="input-icon">
                                        <span className="input-icon-addon">
                                            <i className="isax isax-lock" />
                                        </span>
                                        <input
                                            type={
                                                passwordVisibility.password
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="newPassword"
                                            className="pass-input form-control"
                                            placeholder='Enter Password'
                                            onChange={handleChange}
                                        />
                                        <span
                                            className={`isax toggle-passwords ${passwordVisibility.password
                                                ? "isax-eye"
                                                : "isax-eye-slash"
                                                }`}
                                            onClick={() =>
                                                togglePasswordVisibility("password")
                                            }
                                        ></span>
                                        {errors.newPassword && (
                    <p className="text-danger">{errors.newPassword}</p>
                  )}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">
                                        Confirm Password <span className="text-primary">*</span>{" "}
                                    </label>
                                    <div className="input-icon">
                                        <span className="input-icon-addon">
                                            <i className="isax isax-lock" />
                                        </span>
                                        <input
                                            type={
                                                passwordVisibility.confirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="confirmPassword"
                                            className="pass-input form-control"
                                            placeholder='Enter Password'
                                            onChange={handleChange}
                                        />
                                        <span
                                            className={`isax toggle-passwords ${passwordVisibility.confirmPassword
                                                ? "isax-eye"
                                                : "isax-eye-slash"
                                                }`}
                                            onClick={() =>
                                                togglePasswordVisibility("confirmPassword")
                                            }
                                        ></span>
                                        {errors.confirmPassword && (
                    <p className="text-danger">{errors.confirmPassword}</p>
                  )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-light btn-md"
                                    data-bs-dismiss="modal"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary btn-md">
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* Change password */}
            {/* Change Email */}
            <div
                className="modal fade"
                id="change-email"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex={-1}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5>Change Email</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            />
                        </div>
                        <form>
                            <div className="modal-body pb-0">
                                <div className="mb-3">
                                    <label className="form-label">
                                        Current Email Address <span className="text-primary">*</span>{" "}
                                    </label>
                                    <input type="email" className="form-control" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">
                                        New Email Address <span className="text-primary">*</span>{" "}
                                    </label>
                                    <input type="email" className="form-control" />
                                </div>
                                <div className="mb-3">
                                    <p className="d-flex align-items-center fs-14">
                                        <i className="isax isax-info-circle me-1" />
                                        New email address only updated once you verified{" "}
                                    </p>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">
                                        Current Password <span className="text-primary">*</span>{" "}
                                    </label>
                                    <div className="input-icon">
                                        <span className="input-icon-addon">
                                            <i className="isax isax-lock" />
                                        </span>
                                        <input
                                            type={
                                                passwordVisibility.currentPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            className="pass-input form-control"
                                            placeholder='Enter Password'
                                        />
                                        <span
                                            className={`isax toggle-passwords ${passwordVisibility.currentPassword
                                                ? "isax-eye"
                                                : "isax-eye-slash"
                                                }`}
                                            onClick={() =>
                                                togglePasswordVisibility("currentPassword")
                                            }
                                        ></span>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-light btn-md"
                                    data-bs-dismiss="modal"
                                >
                                    Cancel
                                </button>
                                <Link to="#" data-bs-dismiss="modal" className="btn btn-primary btn-md">
                                    Save Changes
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Change Email */}
            {/* Change Phone */}
            <div
                className="modal fade"
                id="change-phone"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex={-1}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5>Change Phone Number</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            />
                        </div>
                        <form>
                            <div className="modal-body pb-0">
                                <div className="mb-3">
                                    <label className="form-label">
                                        Current Phone Number <span className="text-primary">*</span>{" "}
                                    </label>
                                    <PhoneInput
                                        placeholder="(201) 555-0123"
                                        value={value}
                                        defaultCountry="US"
                                        onChange={setValue} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">
                                        New Phone Number <span className="text-primary">*</span>{" "}
                                    </label>
                                    <PhoneInput
                                        placeholder="(201) 555-0123"
                                        value={value}
                                        defaultCountry="US"
                                        onChange={setValue} />
                                </div>
                                <div className="mb-3">
                                    <p className="d-flex align-items-center fs-14">
                                        <i className="isax isax-info-circle me-1" />
                                        New Phone Number only updated once you verified{" "}
                                    </p>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">
                                        Current Password <span className="text-primary">*</span>{" "}
                                    </label>
                                    <div className="input-icon">
                                        <span className="input-icon-addon">
                                            <i className="isax isax-lock" />
                                        </span>
                                        <input
                                            type={
                                                passwordVisibility.currentPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            className="pass-input form-control"
                                            placeholder='Enter Password'
                                        />
                                        <span
                                            className={`isax toggle-passwords ${passwordVisibility.currentPassword
                                                ? "isax-eye"
                                                : "isax-eye-slash"
                                                }`}
                                            onClick={() =>
                                                togglePasswordVisibility("currentPassword")
                                            }
                                        ></span>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-light btn-md"
                                    data-bs-dismiss="modal"
                                >
                                    Cancel
                                </button>
                                <Link to="#" data-bs-dismiss="modal" className="btn btn-primary btn-md">
                                    Save Changes
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Change Phone */}
            {/* Account Activity */}
            <div
                className="modal fade"
                id="acc-activity"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex={-1}
            >
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5>Account Activity</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            />
                        </div>
                        <div className="modal-body">
                            <div className="table-responsive">
                                <table className="table border">
                                    <thead className="thead-light">
                                        <tr>
                                            <th>Date</th>
                                            <th>Device</th>
                                            <th>IP Address</th>
                                            <th>Location </th>
                                            <th />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>15 May 2025, 10:30 AM</td>
                                            <td>Chrome - Windows</td>
                                            <td>232.222.12.72</td>
                                            <td>Newyork / USA</td>
                                            <td>
                                                <span className="badge badge-success badge-xs rounded-pill d-inline-flex align-items-center">
                                                    <i className="ti ti-circle-filled fs-5 me-1" />
                                                    Connect
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>10 Apr 2025, 05:15 PM</td>
                                            <td>Safari Macos</td>
                                            <td>Newyork / USA</td>
                                            <td>224.111.12.75</td>
                                            <td>
                                                <span className="badge badge-success badge-xs rounded-pill d-inline-flex align-items-center">
                                                    <i className="ti ti-circle-filled fs-5 me-1" />
                                                    Connect
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>15 Mar 2025, 02:40 PM</td>
                                            <td>Firefox Windows</td>
                                            <td>111.222.13.28</td>
                                            <td>Newyork / USA</td>
                                            <td>
                                                <span className="badge badge-success badge-xs rounded-pill d-inline-flex align-items-center">
                                                    <i className="ti ti-circle-filled fs-5 me-1" />
                                                    Connect
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>15 Jan 2025, 08:00 AM</td>
                                            <td>Safari Macos</td>
                                            <td>333.555.10.54</td>
                                            <td>Newyork / USA</td>
                                            <td>
                                                <span className="badge badge-success badge-xs rounded-pill d-inline-flex align-items-center">
                                                    <i className="ti ti-circle-filled fs-5 me-1" />
                                                    Connect
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* /Account Activity */}
            {/* Device Management */}
            <div
                className="modal fade"
                id="device-management"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex={-1}
            >
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5>Device Management</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            />
                        </div>
                        <div className="modal-body">
                            <div className="table-responsive">
                                <table className="table border">
                                    <thead className="thead-light">
                                        <tr>
                                            <th>Device</th>
                                            <th>Date</th>
                                            <th>Location </th>
                                            <th>IP Address</th>
                                            <th />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Chrome - Windows</td>
                                            <td>15 May 2025, 10:30 AM</td>
                                            <td>Newyork / USA</td>
                                            <td>232.222.12.72</td>
                                            <td>
                                                <Link to="#" className="link-default">
                                                    <i className="isax isax-trash" />
                                                </Link>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Safari Macos</td>
                                            <td>10 Apr 2025, 05:15 PM</td>
                                            <td>Newyork / USA</td>
                                            <td>224.111.12.75</td>
                                            <td>
                                                <Link to="#" className="link-default">
                                                    <i className="isax isax-trash" />
                                                </Link>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Firefox Windows</td>
                                            <td>15 Mar 2025, 02:40 PM</td>
                                            <td>Newyork / USA</td>
                                            <td>111.222.13.28</td>
                                            <td>
                                                <Link to="#" className="link-default">
                                                    <i className="isax isax-trash" />
                                                </Link>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Safari Macos</td>
                                            <td>15 Jan 2025, 08:00 AM</td>
                                            <td>Newyork / USA</td>
                                            <td>333.555.10.54</td>
                                            <td>
                                                <Link to="#" className="link-default">
                                                    <i className="isax isax-trash" />
                                                </Link>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* /Device Management */}
            {/* Delete Account */}
            <div
                className="modal fade"
                id="delete-account"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex={-1}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5>Delete Account</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            />
                        </div>
                        <div className="modal-body">
                            <h6 className="mb-1">
                                Are you sure you want to delete your account?
                            </h6>
                            <p>
                                Account deletion is permanent. You will be logged out, and this
                                account will no longer be accessible.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-light btn-md"
                                data-bs-dismiss="modal"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary btn-md"
                                data-bs-toggle="modal"
                                data-bs-target="#del-acc"
                                data-bs-dismiss="modal"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* /Delete Account */}
            {/* Delete Account */}
            <div
                className="modal fade"
                id="del-acc"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex={-1}
            >
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5>Delete Account</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            />
                        </div>
                        <form >
                            <div className="modal-body">
                                <h6 className="mb-1">Why Are You Deleting Your Account?</h6>
                                <p className="mb-3">
                                    We're sorry to see you go! To help us improve, please let us know
                                    your reason for deleting your account
                                </p>
                                <div className="form-check d-flex mb-2">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="delete"
                                        id="del-acc1"
                                    />
                                    <label className="form-check-label fs-14 ms-2" htmlFor="del-acc1">
                                        <span className="text-gray-9 fw-medium">
                                            No longer using the service
                                        </span>
                                        <span className="d-block">
                                            I no longer need this service and won’t be using it in the
                                            future.
                                        </span>
                                    </label>
                                </div>
                                <div className="form-check d-flex mb-2">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="delete"
                                        id="del-acc2"
                                    />
                                    <label className="form-check-label fs-14 ms-2" htmlFor="del-acc2">
                                        <span className="text-gray-9 fw-medium">Privacy concerns</span>
                                        <span className="d-block">
                                            I am concerned about how my data is handled and want to remove
                                            my information.
                                        </span>
                                    </label>
                                </div>
                                <div className="form-check d-flex mb-2">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="delete"
                                        id="del-acc3"
                                    />
                                    <label className="form-check-label fs-14 ms-2" htmlFor="del-acc3">
                                        <span className="text-gray-9 fw-medium">
                                            Too many notifications/emails
                                        </span>
                                        <span className="d-block">
                                            I’m overwhelmed by the volume of notifications or emails and
                                            would like to reduce them.
                                        </span>
                                    </label>
                                </div>
                                <div className="form-check d-flex mb-2">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="delete"
                                        id="del-acc4"
                                    />
                                    <label className="form-check-label fs-14 ms-2" htmlFor="del-acc4">
                                        <span className="text-gray-9 fw-medium">
                                            Poor user experience
                                        </span>
                                        <span className="d-block">
                                            I’ve had difficulty using the platform, and it didn’t meet my
                                            expectations.
                                        </span>
                                    </label>
                                </div>
                                <div className="form-check d-flex mb-2">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="delete"
                                        id="del-acc5"
                                        defaultChecked
                                    />
                                    <label className="form-check-label fs-14 ms-2" htmlFor="del-acc5">
                                        <span className="text-gray-9 fw-medium">
                                            Other (Please specify)
                                        </span>
                                    </label>
                                </div>
                                <div className="ms-4">
                                    <textarea className="form-control" rows={3} defaultValue={""} />
                                </div>
                                {deleteError ? (
                                    <p className="text-danger mb-0 mt-3">{deleteError}</p>
                                ) : null}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-light btn-md"
                                    data-bs-dismiss="modal"
                                    disabled={deleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-md"
                                    onClick={handleDeleteAccount}
                                    disabled={deleting}
                                >
                                    {deleting ? "Deleting..." : "Delete Account"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Delete Account */}
        </>

    )
}

export default SecuritySettingsModal
