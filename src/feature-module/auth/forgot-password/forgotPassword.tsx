import { Link } from "react-router-dom";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [formData, setFormData] = useState({
    email: "",
  });

  const [errors, setErrors] = useState({
    email: "",
  });

  const [msg, setMsg] = useState("");

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    let valid = true;
    let newErrors: any = {
      email: "",
    };

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validate()) return;
    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/adminforgotpassword`,
        { email: formData.email },
      );

      setMsg(res.data.message);
    } catch (err: any) {
      setMsg(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="w-100 overflow-hidden vh-100">
      <div className="row justify-content-center align-items-center vh-100">
        <div className="col-xxl-4 col-lg-6 col-md-6 col-11 mx-auto">
          <div className="p-4 text-center">
            <ImageWithBasePath
              src="/assets/img/logo-dark.svg"
              alt="logo"
              className="img-fluid logo-height"
            />
          </div>

          <div className="card authentication-card">
            <div className="card-header text-center">
              <h5>Forgot Password</h5>
              <p>Reset Your Yotrip Password</p>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {msg && <p className="text-success">{msg}</p>}

                <div className="mb-3">
                  <label className="form-label">Email</label>

                  <div className="input-icon">
                    <span className="input-icon-addon">
                      <i className="isax isax-message" />
                    </span>

                    <input
                      type="email"
                      name="email"
                      className="form-control form-control-lg"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  {errors.email && (
                    <p className="text-danger">{errors.email}</p>
                  )}
                </div>

                <button type="submit" className="btn btn-xl btn-primary w-100">
                  Reset Password
                </button>

                <div className="text-center mt-3">
                  <p className="fs-14">
                    Remember Password?
                    <Link to={all_routes.login} className="link-primary">
                      {" "}
                      Sign In
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
export default ForgotPassword;
