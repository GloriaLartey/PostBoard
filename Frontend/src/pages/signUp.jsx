import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";
import Logo from "../components/logo";
import Help from "../components/help";
import { useSignup, useVerifyOTP, useResendOTP } from "../hooks/useAuth";

/**
 * Extracts a clean, user-facing message (or list of messages) from any
 * axios/express-validator error shape. Handles:
 *   { message: "..." }
 *   { errors: [{ field, message }, ...] }
 *   { errors: ["msg1", "msg2"] }
 *   plain string
 */
function extractErrorMessages(err) {
  const data = err?.response?.data;
  if (!data) return [err?.message || "Something went wrong. Please try again."];

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map((e) =>
      typeof e === "string" ? e : e.message || e.msg || JSON.stringify(e),
    );
  }

  if (data.message) return [data.message];

  return ["Something went wrong. Please try again."];
}

export default function SignupPage() {
  const navigate = useNavigate();

  const signupMutation = useSignup();
  const verifyOTPMutation = useVerifyOTP();
  const resendOTPMutation = useResendOTP();

  const [errors, setErrors] = useState([]); // array of messages, shown as a list
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const password = formData.password;

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  // Basic client-side email shape check — mirrors the backend's isEmail(),
  // accepts any domain (gmail, yahoo, org, custom company domains, etc.)
  const isValidEmailFormat = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors([]);

    const clientErrors = [];

    if (!formData.username.trim()) clientErrors.push("Username is required.");
    else if (formData.username.trim().length < 3)
      clientErrors.push("Username must be at least 3 characters.");

    if (!formData.email.trim()) clientErrors.push("Email is required.");
    else if (!isValidEmailFormat(formData.email.trim()))
      clientErrors.push(
        "Please enter a valid email address (e.g. name@example.com).",
      );

    if (!formData.password) clientErrors.push("Password is required.");
    if (!formData.confirmPassword)
      clientErrors.push("Please confirm your password.");

    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      clientErrors.push("Passwords do not match.");
    }

    if (formData.password) {
      if (!checks.length)
        clientErrors.push("Password must be at least 8 characters.");
      if (!checks.uppercase)
        clientErrors.push(
          "Password must contain at least one uppercase letter.",
        );
      if (!checks.lowercase)
        clientErrors.push(
          "Password must contain at least one lowercase letter.",
        );
      if (!checks.number)
        clientErrors.push("Password must contain at least one number.");
      if (!checks.special)
        clientErrors.push(
          "Password must contain at least one special character.",
        );
    }

    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      return;
    }

    try {
      await signupMutation.mutateAsync({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      setShowOtpModal(true);
    } catch (err) {
      setErrors(extractErrorMessages(err));
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const verifyOtp = async () => {
    setErrors([]);
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      setErrors(["Please enter the complete 6-digit OTP."]);
      return;
    }

    try {
      await verifyOTPMutation.mutateAsync({
        email: formData.email,
        otp: enteredOtp,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrors(extractErrorMessages(err));
    }
  };

  const resendOtp = async () => {
    setErrors([]);
    try {
      await resendOTPMutation.mutateAsync({ email: formData.email });
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      setErrors(extractErrorMessages(err));
    }
  };

  // Shared error display block — list when multiple, single line when one
  const ErrorBlock = () =>
    errors.length > 0 ? (
      <div className="mt-4 p-3 rounded-xl bg-red-100 border border-red-300 text-red-600 text-sm">
        {errors.length === 1 ? (
          <p>{errors[0]}</p>
        ) : (
          <ul className="list-disc list-inside space-y-0.5">
            {errors.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        )}
      </div>
    ) : null;

  return (
    <div className="relative min-h-screen flex items-center justify-center px-3 sm:px-4 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: "url('/img1.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[92vw] sm:max-w-md bg-white/90 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 shadow-2xl">
        <div className="flex justify-center mb-4">
          <Logo />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-center text-blue-600 bg-gradient-to-r from-blue-600 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
          Create Your Account
        </h1>

        <p className="text-center text-black md:text-gray-500 mt-2 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline">
            Login
          </Link>
        </p>

        <ErrorBlock />

        <form onSubmit={handleSignup} className="mt-5 space-y-4">
          {/* Username */}
          <div>
            <label className="text-sm text-black md:text-gray-600">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Create a username"
              className="w-full mt-1 px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-black md:text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter a valid email address"
              className="w-full mt-1 px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="text-sm text-black md:text-gray-600">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              className="w-full mt-1 px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-xl pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-xs md:text-sm text-gray-500">
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="text-sm text-black md:text-gray-600">
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className="w-full mt-1 px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-xl pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-xs md:text-sm text-gray-500">
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Password Rules — live feedback */}
          <div className="text-xs space-y-1">
            <p className={checks.length ? "text-green-600" : "text-gray-500"}>
              ✓ At least 8 characters
            </p>
            <p
              className={checks.uppercase ? "text-green-600" : "text-gray-500"}>
              ✓ One uppercase letter
            </p>
            <p
              className={checks.lowercase ? "text-green-600" : "text-gray-500"}>
              ✓ One lowercase letter
            </p>
            <p className={checks.number ? "text-green-600" : "text-gray-500"}>
              ✓ One number
            </p>
            <p className={checks.special ? "text-green-600" : "text-gray-500"}>
              ✓ One special character
            </p>
          </div>

          <button
            type="submit"
            disabled={signupMutation.isPending}
            className="w-full py-2.5 md:py-3 rounded-full bg-blue-600 bg-gradient-to-r from-blue-600 via-pink-500 to-cyan-400 text-white text-sm md:text-base font-semibold hover:opacity-90 disabled:opacity-50">
            {signupMutation.isPending ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>

      {/* OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-sm rounded-3xl p-5">
            <button
              onClick={() => {
                setShowOtpModal(false);
                setOtp(["", "", "", "", "", ""]);
                setErrors([]);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition">
              <FiX size={20} />
            </button>

            <h2 className="text-xl font-bold text-center text-black">
              Verify OTP
            </h2>
            <p className="text-center text-sm text-gray-500 mt-2">
              Enter the 6-digit code sent to
            </p>
            <p className="text-center font-medium text-sm break-all">
              {formData.email}
            </p>

            <ErrorBlock />

            <div className="flex justify-center gap-2 mt-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  className="w-10 h-10 sm:w-12 sm:h-12 border rounded-lg text-center text-lg font-semibold"
                />
              ))}
            </div>

            <button
              onClick={verifyOtp}
              disabled={verifyOTPMutation.isPending}
              className="w-full mt-6 py-3 rounded-full bg-blue-600 text-white font-semibold">
              {verifyOTPMutation.isPending ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              onClick={resendOtp}
              disabled={resendOTPMutation.isPending}
              className="w-full mt-3 text-blue-600 text-sm font-medium">
              {resendOTPMutation.isPending ? "Resending..." : "Resend OTP"}
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50 scale-90 md:scale-100">
        <Help />
      </div>
    </div>
  );
}
