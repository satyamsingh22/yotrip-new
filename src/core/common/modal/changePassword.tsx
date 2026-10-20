import { useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

type PasswordField = "password" | "confirmPassword";

const ChangePasswordModal = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [visibility, setVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");


  const openLoginBtn = useRef<HTMLButtonElement>(null);

  const togglePasswordVisibility = (field: PasswordField) => {
    setVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validate = () => {
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (!confirmPassword.trim()) {
      setError("Confirm Password is required");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    setError("");
    return true;
  };
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validate()) return;


    const email = localStorage.getItem("resetEmail");

    if (!email) {
      setError("Something went wrong. Please try forgot password again.");
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/changepassword`,
        {
          email,
          password,
        }
      );

      setMsg(res.data.message);
      setError("");

      setTimeout(() => {
        openLoginBtn.current?.click();
      }, 500);

    } catch (err: any) {
      setMsg("");
      setError(err.response?.data?.error || "Something went wrong");
    }
    console.log("Change Password Submitted", { email, password, confirmPassword });
  };

  return (
    <>
   
      <button
        ref={openLoginBtn}
        type="button"
        style={{ display: "none" }}
        data-bs-toggle="modal"
        data-bs-target="#login-modal"
      ></button>

      <div className="modal fade" id="change-password">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header d-flex align-items-center justify-content-end pb-0 border-0">
              <Link to="#" data-bs-dismiss="modal">
                <i className="ti ti-x fs-20" />
              </Link>
            </div>

            <div className="modal-body p-4 pt-0">
              <form onSubmit={handleSubmit}>

           
                {msg && <p className="text-success">{msg}</p>}
                {error && <p className="text-danger">{error}</p>}

                <div className="text-center border-bottom mb-3">
                  <h5 className="mb-1">Change Password</h5>
                  <p className="mb-3">Enter Details to Change Password</p>
                </div>

          
                <div className="mb-2">
                  <label className="form-label">Password</label>
                  <div className="input-icon">
                    <span className="input-icon-addon">
                      <i className="isax isax-lock" />
                    </span>

                    <input
                      type={visibility.password ? "text" : "password"}
                      className="pass-input form-control"
                      placeholder="Enter Password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                    />

                    <span
                      className={`isax toggle-passwords ${
                        visibility.password ? "isax-eye" : "isax-eye-slash"
                      }`}
                      onClick={() => togglePasswordVisibility("password")}
                    ></span>
                  </div>
                </div>

            
                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-icon">
                    <span className="input-icon-addon">
                      <i className="isax isax-lock" />
                    </span>

                    <input
                      type={visibility.confirmPassword ? "text" : "password"}
                      className="pass-input form-control"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                    />

                    <span
                      className={`isax toggle-passwords ${
                        visibility.confirmPassword ? "isax-eye" : "isax-eye-slash"
                      }`}
                      onClick={() => togglePasswordVisibility("confirmPassword")}
                    ></span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-xl btn-primary d-flex align-items-center justify-content-center w-100"
                >
                  Change Password
                  <i className="isax isax-arrow-right-3 ms-2" />
                </button>

              </form>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordModal;
