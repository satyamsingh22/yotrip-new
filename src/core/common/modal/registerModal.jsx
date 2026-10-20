import { useState, useEffect } from "react";
import api from "/src/tockenapi/api";
import toast from "react-hot-toast";
import {
  buildInternationalPhone,
  defaultPhoneCountryCode,
  isValidInternationalPhone,
  phoneCountryCodeOptions,
} from "../../../utils/phoneCountryCodes";

const RegisterModal = ({ closeHandler, setOpenModal }) => {
  const [step, setStep] = useState("details"); // "details" | "otp"

  /* ---------- details step state ---------- */
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: defaultPhoneCountryCode,
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const fullPhone = buildInternationalPhone(formData.countryCode, formData.phone);

  /* ---------- otp step state ---------- */
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  /* decrement cooldown every second */
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  /* ---------- helpers ---------- */
  const togglePassword = () => setIsPasswordVisible((prev) => !prev);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "phone"
          ? value.replace(/\D/g, "")
          : type === "checkbox"
            ? checked
            : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    let valid = true;
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
      valid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      valid = false;
    } else if (!isValidInternationalPhone(fullPhone)) {
      newErrors.phone = "Enter a valid phone number";
      valid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  /* ---------- step 1: send OTP ---------- */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (isSendingOtp) return;
    if (!validate()) return;

    try {
      setIsSendingOtp(true);
      await api.post("/api/auth/register/send-otp", {
        fullname: formData.name,
        email: formData.email,
        phone: fullPhone,
        password: formData.password,
      });
      setStep("otp");
      setCooldown(60);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  /* ---------- step 2: verify OTP ---------- */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (isVerifyingOtp) return;

    if (!emailOtp.trim() || !phoneOtp.trim()) {
      toast.error("Please enter both the email and phone OTP");
      return;
    }

    try {
      setIsVerifyingOtp(true);
      const res = await api.post("/api/auth/register/verify-otp", {
        email: formData.email,
        emailOtp,
        phoneOtp,
      });

      if (res.status >= 200 && res.status < 300) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userEmail", formData.email);
        localStorage.setItem("userId", res.data.user.id);

        toast.success("Registration Successful!");
        closeHandler();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "OTP verification failed");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  /* ---------- resend OTP ---------- */
  const handleResend = async () => {
    if (cooldown > 0 || isResendingOtp) return;

    try {
      setIsResendingOtp(true);
      await api.post("/api/auth/register/send-otp", {
        fullname: formData.name,
        email: formData.email,
        phone: fullPhone,
        password: formData.password,
      });
      setCooldown(60);
      toast.success("OTP resent!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to resend OTP");
    } finally {
      setIsResendingOtp(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div className="modal show d-block">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header d-flex justify-content-end border-0">
              <span onClick={closeHandler} style={{ cursor: "pointer" }}>
                ✕
              </span>
            </div>

            <div className="modal-body p-4 pt-0">
              {/* ---- STEP: details ---- */}
              {step === "details" && (
                <form onSubmit={handleSendOtp}>
                  <div className="text-center mb-3">
                    <h5 className="mb-1">Register</h5>
                    <p>Register your account to use services</p>
                  </div>

                  {/* Name */}
                  <div className="mb-2">
                    <label className="form-label">Full Name</label>
                    <div className="input-icon">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        className="form-control"
                        placeholder="Enter full name"
                        onChange={handleChange}
                      />
                    </div>
                    {errors.name && (
                      <small className="text-danger">{errors.name}</small>
                    )}
                  </div>

                  {/* Email */}
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

                  {/* Phone */}
                  <div className="mb-2">
                    <label className="form-label">Phone Number</label>
                    <div className="d-flex gap-2">
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        className="form-select"
                        style={{ flex: "0 0 118px", maxWidth: "118px" }}
                        onChange={handleChange}
                        aria-label="Country code"
                      >
                        {phoneCountryCodeOptions.map((option) => (
                          <option
                            key={option.alpha2}
                            value={option.value}
                            title={option.name}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        className="form-control"
                        placeholder="9876543210"
                        inputMode="numeric"
                        onChange={handleChange}
                      />
                    </div>
                    {errors.phone && (
                      <small className="text-danger">{errors.phone}</small>
                    )}
                  </div>

                  {/* Password */}
                  <div>
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

                  <button
                    type="submit"
                    className="btn btn-primary w-100 mt-3"
                    disabled={isSendingOtp}
                  >
                    {isSendingOtp ? "Sending..." : "Send OTP"}
                  </button>

                  <p className="text-center mt-3">
                    Already have an account?{" "}
                    <span
                      className="text-primary"
                      style={{ cursor: "pointer" }}
                      onClick={() => setOpenModal("Login")}
                    >
                      Login
                    </span>
                  </p>
                </form>
              )}

              {/* ---- STEP: otp ---- */}
              {step === "otp" && (
                <form onSubmit={handleVerifyOtp}>
                  <div className="text-center mb-3">
                    <h5 className="mb-1">Verify Email &amp; Phone</h5>
                    <p className="mb-0">
                      Enter the 6-digit code sent to your email{" "}
                      <strong>{formData.email}</strong> and the code sent to{" "}
                      <strong>{fullPhone}</strong>
                    </p>
                  </div>

                  {/* Email OTP input */}
                  <div className="mb-3">
                    <label className="form-label">Email OTP</label>
                    <div className="input-icon">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={emailOtp}
                        className="form-control"
                        placeholder="Enter the code from your email"
                        onChange={(e) =>
                          setEmailOtp(e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </div>
                  </div>

                  {/* Phone OTP input */}
                  <div className="mb-3">
                    <label className="form-label">Phone OTP</label>
                    <div className="input-icon">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={phoneOtp}
                        className="form-control"
                        placeholder="Enter the code from your SMS"
                        onChange={(e) =>
                          setPhoneOtp(e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={isVerifyingOtp}
                  >
                    {isVerifyingOtp ? "Verifying..." : "Verify"}
                  </button>

                  {/* Resend */}
                  <div className="text-center mt-3">
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      onClick={handleResend}
                      disabled={cooldown > 0 || isResendingOtp}
                    >
                      {isResendingOtp
                        ? "Resending..."
                        : cooldown > 0
                          ? `Resend code in ${cooldown}s`
                          : "Resend code"}
                    </button>
                  </div>

                  {/* Back */}
                  <p className="text-center mt-2">
                    <span
                      className="text-primary"
                      style={{ cursor: "pointer" }}
                      onClick={() => setStep("details")}
                    >
                      ← Back
                    </span>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterModal;
