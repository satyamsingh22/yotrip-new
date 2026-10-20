import { useState, useEffect } from "react";
import { reactIcons } from "@/utils/reactIcons";
import api from "/src/tockenapi/api";
import toast from "react-hot-toast";

const ForgotPasswordModal = ({ closeHandler, setOpenModal }) => {
  const [step, setStep] = useState("email"); // "email" | "reset"

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [cooldown, setCooldown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

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

  const validateEmail = () => {
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: "Please enter your email address" }));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, email: "" }));
    return true;
  };

  const validateReset = () => {
    const newErrors = { otp: "", newPassword: "", confirmPassword: "" };
    let valid = true;

    if (!otp.trim()) {
      newErrors.otp = "OTP is required";
      valid = false;
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = "Enter a valid 6-digit code";
      valid = false;
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
      valid = false;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
      valid = false;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
      valid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return valid;
  };

  const sendOtp = async () => {
    const res = await api.post("/api/auth/forgotpassword", { email: email.trim() });
    return res;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (isSendingOtp) return;
    if (!validateEmail()) return;

    try {
      setIsSendingOtp(true);
      const res = await sendOtp();
      toast.success(res?.data?.message || "Verification code sent");
      setStep("reset");
      setCooldown(60);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to send verification code");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResendingOtp) return;
    if (!validateEmail()) return;

    try {
      setIsResendingOtp(true);
      const res = await sendOtp();
      setCooldown(60);
      toast.success(res?.data?.message || "Verification code resent");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to resend code");
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (isResettingPassword) return;
    if (!validateReset()) return;

    try {
      setIsResettingPassword(true);
      const res = await api.post("/api/auth/resetpassword", {
        email: email.trim(),
        otp,
        newPassword,
        confirmPassword,
      });

      toast.success(res?.data?.message || "Password reset successful");
      setOpenModal("Login");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Password reset failed");
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div className="modal show d-block">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0 justify-content-end">
              <span onClick={closeHandler} style={{ cursor: "pointer" }}>
                {reactIcons.close}
              </span>
            </div>

            <div className="modal-body p-4 pt-0">
              {step === "email" && (
                <form onSubmit={handleSendOtp} noValidate>
                  <div className="text-center mb-3">
                    <h5 className="mb-1">Forgot Password</h5>
                    <p className="text-muted small">
                      Enter your email to receive a verification code
                    </p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <div className="input-icon">
                      <input
                        type="text"
                        name="email"
                        className="form-control"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrors((prev) => ({ ...prev, email: "" }));
                        }}
                      />
                    </div>
                    {errors.email && (
                      <small className="text-danger">{errors.email}</small>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={isSendingOtp}
                  >
                    {isSendingOtp ? "Sending..." : "Send OTP"}
                  </button>

                  <div className="text-center mt-3">
                    <p className="mb-0">
                      Remember your password?{" "}
                      <span
                        className="text-primary fw-medium"
                        style={{ cursor: "pointer" }}
                        onClick={() => setOpenModal("Login")}
                      >
                        Login
                      </span>
                    </p>
                  </div>
                </form>
              )}

              {step === "reset" && (
                <form onSubmit={handleResetPassword} noValidate>
                  <div className="text-center mb-3">
                    <h5 className="mb-1">Reset Password</h5>
                    <p className="text-muted small">
                      Enter the code sent to <strong>{email}</strong>
                    </p>
                  </div>

                  <div className="mb-2">
                    <label className="form-label">OTP Code</label>
                    <div className="input-icon">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        className="form-control"
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/\D/g, ""));
                          setErrors((prev) => ({ ...prev, otp: "" }));
                        }}
                      />
                    </div>
                    {errors.otp && (
                      <small className="text-danger">{errors.otp}</small>
                    )}
                  </div>

                  <div className="mb-2">
                    <label className="form-label">New Password</label>
                    <div className="input-icon">
                      <input
                        type={isPasswordVisible ? "text" : "password"}
                        className="form-control"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setErrors((prev) => ({ ...prev, newPassword: "" }));
                        }}
                      />
                      <span
                        className="input-icon-addon toggle-password"
                        onClick={() => setIsPasswordVisible((prev) => !prev)}
                        style={{ cursor: "pointer" }}
                      >
                        <i
                          className={`isax ${
                            isPasswordVisible ? "isax-eye" : "isax-eye-slash"
                          }`}
                        />
                      </span>
                    </div>
                    {errors.newPassword && (
                      <small className="text-danger">{errors.newPassword}</small>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <div className="input-icon">
                      <input
                        type={isConfirmPasswordVisible ? "text" : "password"}
                        className="form-control"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                        }}
                      />
                      <span
                        className="input-icon-addon toggle-password"
                        onClick={() =>
                          setIsConfirmPasswordVisible((prev) => !prev)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <i
                          className={`isax ${
                            isConfirmPasswordVisible ? "isax-eye" : "isax-eye-slash"
                          }`}
                        />
                      </span>
                    </div>
                    {errors.confirmPassword && (
                      <small className="text-danger">{errors.confirmPassword}</small>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={isResettingPassword}
                  >
                    {isResettingPassword ? "Updating..." : "Reset Password"}
                  </button>

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

                  <p className="text-center mt-2">
                    <span
                      className="text-primary"
                      style={{ cursor: "pointer" }}
                      onClick={() => setStep("email")}
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

export default ForgotPasswordModal;
