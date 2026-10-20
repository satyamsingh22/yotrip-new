import { useState } from "react";
import { reactIcons } from "@/utils/reactIcons";
import { useAuth } from "../../../context/AuthContext";
import { useModal } from "@/context/ModalContext";
import useApi from "@/hooks/useApi";
import api from "/src/tockenapi/api";
import toast from "react-hot-toast";

const LoginModal = ({ closeHandler, setOpenModal }) => {
  const { markAuthenticated } = useAuth();
  const { closeLogin } = useModal();
  /* ---------------- STATE ---------------- */
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { request, loading, error } = useApi({
    method: "post",
    url: "/auth/login",
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    api: "",
  });

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // clear field error on typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
      api: "",
    }));
  };

  const validate = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const res = await api.post(`/api/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      console.log("Login success", res);

      if (res.status >= 200 && res.status < 300) {
        localStorage.setItem("token", res?.data?.token);
        localStorage.setItem("userEmail", res?.data?.user?.email);
        localStorage.setItem("userId", res?.data?.user?.id);
        if (res?.data?.user?.fullname) {
          localStorage.setItem("name", res.data.user.fullname);
        }

        markAuthenticated();
        toast.success("Logged in Successfully!");
        closeLogin();
        closeHandler();

        const returnUrl = sessionStorage.getItem("returnUrl");
        if (returnUrl) {
          sessionStorage.removeItem("returnUrl");
          window.location.href = returnUrl;
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.error);
      console.log("login error", err);
    }
  };

  const togglePassword = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div className="modal show d-block">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            {/* CLOSE */}
            <div className="modal-header d-flex justify-content-end border-0">
              <span onClick={closeHandler} style={{ cursor: "pointer" }}>
                {reactIcons.close}
              </span>
            </div>

            <div className="modal-body p-4 pt-0">
              <form onSubmit={handleSubmit}>
                {/* TITLE */}
                <div className="text-center mb-3">
                  <h5 className="mb-1">Login</h5>
                  <p>Login to your account</p>
                </div>

                {/* API ERROR */}
                {errors.api && (
                  <p className="text-danger text-center">{errors.api}</p>
                )}

                {/* EMAIL */}
                <div className="mb-2">
                  <label className="form-label">Email</label>

                  <div className="input-icon">
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      className="form-control"
                      placeholder="Enter email"
                      onChange={handleChange}
                    />
                  </div>

                  {errors.email && (
                    <small className="text-danger">{errors.email}</small>
                  )}
                </div>

                {/* PASSWORD */}
                <div className="mb-2">
                  <label className="form-label">Password</label>

                  <div className="input-icon">
                    <input
                      type={isPasswordVisible ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      className="form-control"
                      placeholder="Enter password"
                      onChange={handleChange}
                    />

                    <span
                      className="input-icon-addon toggle-password"
                      onClick={togglePassword}
                      style={{ cursor: "pointer" }}
                    >
                      <i
                        className={`isax ${
                          isPasswordVisible ? "isax-eye" : "isax-eye-slash"
                        }`}
                      />
                    </span>
                  </div>

                  {errors.password && (
                    <small className="text-danger">{errors.password}</small>
                  )}
                </div>

                {/* SUBMIT */}
                <div className="mt-3 mb-3">
                  <button
                    type="submit"
                    className="btn btn-primary w-100 d-flex justify-content-center align-items-center"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                    {!loading && <i className="isax isax-arrow-right-3 ms-2" />}
                  </button>
                </div>

                {/* LINKS */}
                <div className="text-center d-flex flex-column gap-2">
                  <p className="mb-0">
                    Don't have an account?{" "}
                    <span
                      className="text-primary"
                      style={{ cursor: "pointer" }}
                      onClick={() => setOpenModal("Register")}
                    >
                      Register
                    </span>
                  </p>

                  <p className="mb-0">
                    <span
                      className="text-primary"
                      style={{ cursor: "pointer" }}
                      onClick={() => setOpenModal("Forgot")}
                    >
                      Forgot Password?
                    </span>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;
