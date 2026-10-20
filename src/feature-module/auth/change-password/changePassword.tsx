import { useState } from "react";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

type PasswordField = "password" | "confirmPassword";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const adminId = searchParams.get("adminId");
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const validate = () => {
    if (!password.trim()) return (setError("Password is required"), false);
    if (!confirmPassword.trim())
      return (setError("Confirm Password is required"), false);
    if (password !== confirmPassword)
      return (setError("Passwords do not match"), false);
    if (password.length < 6)
      return (setError("Password must be at least 6 characters"), false);

    return true;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validate()) return;

    if (!token || !adminId) {
      setError("Invalid or expired reset link. Please request a new one.");
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/adminresetpassword`,
        { token, adminId, newPassword: password },
      );

      setMsg(res.data.message);
      setError("");

      setTimeout(() => {
        navigate(all_routes.login);
      }, 800);
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
      setMsg("");
    }
  };

  return (
    <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
      <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap ">
        <div className="col-xxl-4 col-xl-4 col-lg-6 col-md-6 col-11 mx-auto">
          <div className="p-4 text-center">
            <ImageWithBasePath
              src="/assets/img/logo-dark.svg"
              alt="logo"
              className="img-fluid logo-height"
            />
          </div>

          <div className="card authentication-card">
            <div className="card-header">
              <div className="text-center">
                <h5 className="mb-1">Change Password</h5>
                <p>Enter Details to Change Password</p>
              </div>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {msg && <p className="text-success">{msg}</p>}
                {error && <p className="text-danger">{error}</p>}

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="input-icon">
                    <span className="input-icon-addon">
                      <i className="isax isax-lock" />
                    </span>
                    <input
                      type={passwordVisibility.password ? "text" : "password"}
                      className="pass-input form-control"
                      placeholder="Enter Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      className={`isax toggle-passwords ${passwordVisibility.password ? "isax-eye" : "isax-eye-slash"}`}
                      onClick={() => togglePasswordVisibility("password")}
                    ></span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-icon">
                    <span className="input-icon-addon">
                      <i className="isax isax-lock" />
                    </span>
                    <input
                      type={
                        passwordVisibility.confirmPassword ? "text" : "password"
                      }
                      className="pass-input form-control"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <span
                      className={`isax toggle-passwords ${passwordVisibility.confirmPassword ? "isax-eye" : "isax-eye-slash"}`}
                      onClick={() =>
                        togglePasswordVisibility("confirmPassword")
                      }
                    ></span>
                  </div>
                </div>

                <div className="mb-0">
                  <button
                    type="submit"
                    className="btn btn-xl btn-primary d-flex align-items-center justify-content-center w-100"
                  >
                    Change Password
                    <i className="isax isax-arrow-right-3 ms-2" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
