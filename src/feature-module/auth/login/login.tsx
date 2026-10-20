import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import { REGISTER_MODAL_URL } from "../../../core/common/header/authModalParam";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const { markAuthenticated, status } = useAuth();
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "authenticated") {
      navigate(all_routes.home1, { replace: true });
    }
  }, [status, navigate]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    agree: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    agree: "",
    api: "",
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    setErrors({
      ...errors,
      [name]: "",
      api: "",
    });
  };

  const validate = () => {
    let valid = true;
    let newErrors: any = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
      valid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/login`,
        {
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true },
      );

      if (!res.data?.success || !res.data?.token) {
        setErrors((prev) => ({
          ...prev,
          api: res.data?.error || "Invalid email or password",
        }));
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userEmail", res.data.user?.email || formData.email);
      if (res.data.user?.id) {
        localStorage.setItem("userId", res.data.user.id);
      }
      if (res.data.user?.fullname) {
        localStorage.setItem("name", res.data.user.fullname);
      }

      markAuthenticated();
      toast.success("Logged in successfully!");
      window.dispatchEvent(new Event("auth-changed"));

      const returnUrl = sessionStorage.getItem("returnUrl");
      if (returnUrl) {
        sessionStorage.removeItem("returnUrl");
        window.location.href = returnUrl;
        return;
      }

      navigate(routes.home1);
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      setErrors((prev) => ({
        ...prev,
        api:
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          "Invalid email or password",
      }));
    }
  };

  return (
    <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
      <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap ">
        <div className="col-xxl-4 col-lg-6 col-md-6 col-11 mx-auto">
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
                <h5 className="mb-1">Sign In</h5>
                <p>Sign in to Start Manage your Yotrip Account</p>
              </div>
            </div>
            <div className="card-body">
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <div className="input-icon">
                    <span className="input-icon-addon">
                      <i className="isax isax-message" />
                    </span>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="Enter Email"
                      name="email"
                      onChange={handleChange}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-danger">{errors.email}</p>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="input-icon">
                    <span className="input-icon-addon">
                      <i className="isax isax-lock" />
                    </span>
                    <input
                      type={isPasswordVisible ? "text" : "password"}
                      className="pass-input form-control"
                      placeholder="Enter Password"
                      name="password"
                      onChange={handleChange}
                    />
                    <span
                      className={`isax toggle-password ${
                        isPasswordVisible ? "isax-eye" : "isax-eye-slash"
                      }`}
                      onClick={togglePasswordVisibility}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-danger">{errors.password}</p>
                  )}
                </div>

                {errors.api && <p className="text-danger">{errors.api}</p>}

                <div className="mt-3 mb-3">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                    <div className="form-check d-flex align-items-center mb-2">
                      <input
                        className="form-check-input mt-0"
                        type="checkbox"
                        defaultValue=""
                        id="remembers_me"
                        name="agree"
                        checked={formData.agree}
                        onChange={handleChange}
                      />

                      <label
                        className="form-check-label ms-2 text-gray-9 fs-14"
                        htmlFor="remembers_me"
                      >
                        Remember Me
                      </label>
                    </div>

                    <Link
                      to={all_routes.forgotPassword}
                      className="link-primary fw-medium fs-14 mb-2"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  {errors.agree && (
                    <p className="text-danger">{errors.agree}</p>
                  )}
                </div>
                <div className="mb-3">
                  <button
                    type="submit"
                    className="btn btn-xl btn-primary d-flex align-items-center justify-content-center w-100"
                  >
                    Login
                    <i className="isax isax-arrow-right-3 ms-2" />
                  </button>
                </div>
                <div className="login-or mb-3">
                  <span className="span-or">Or</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <Link
                    to="#"
                    className="btn btn-light flex-fill d-flex align-items-center justify-content-center me-2"
                  >
                    <ImageWithBasePath
                      src="/assets/img/icons/google-icon.svg"
                      className="me-2"
                      alt="Img"
                    />
                    Google
                  </Link>
                  <Link
                    to="#"
                    className="btn btn-light flex-fill d-flex align-items-center justify-content-center"
                  >
                    <ImageWithBasePath
                      src="/assets/img/icons/fb-icon.svg"
                      className="me-2"
                      alt="Img"
                    />
                    Facebook
                  </Link>
                </div>
                <div className="d-flex justify-content-center">
                  <p className="fs-14">
                    Don't you have an account?{" "}
                    <Link
                      to={REGISTER_MODAL_URL}
                      className="link-primary fw-medium"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
