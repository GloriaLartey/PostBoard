import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../components/logo";
import Help from "../components/help";
import { useResetPassword } from "../hooks/useAuth";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const resetPasswordMutation = useResetPassword();

  const token = searchParams.get("token");

  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const checks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  };

  const passedChecks =
    Object.values(checks).filter(Boolean).length;

  const passwordStrength =
    passedChecks <= 2
      ? "Weak"
      : passedChecks <= 4
      ? "Medium"
      : "Strong";

  const strengthColor =
    passwordStrength === "Weak"
      ? "text-red-500"
      : passwordStrength === "Medium"
      ? "text-yellow-500"
      : "text-green-500";

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!token) {
      return setError(
        "Invalid or expired reset link."
      );
    }

    if (
      !formData.password ||
      !formData.confirmPassword
    ) {
      return setError(
        "Please fill in all required fields."
      );
    }

    if (
      formData.password !== formData.confirmPassword
    ) {
      return setError("Passwords do not match.");
    }

    if (
      !checks.length ||
      !checks.uppercase ||
      !checks.lowercase ||
      !checks.number ||
      !checks.special
    ) {
      return setError(
        "Password does not meet the required criteria."
      );
    }

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        password: formData.password,
      });

      navigate("/login", {
        replace: true,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to reset password."
      );
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage: "url('/side1.avif')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Logo />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
          Reset Your Password
        </h1>

        <p className="text-center text-gray-500 mt-2 text-sm">
          Create a new secure password
        </p>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-100 border border-red-300 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          {/* Password */}
          <div>
            <label className="text-sm text-gray-600">
              New Password
            </label>

            <div className="relative">
              <input
                type={
                  showPassword ? "text" : "password"
                }
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className="w-full mt-1 p-3 border rounded-xl pr-16"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-4 text-sm text-gray-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm text-gray-600">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full mt-1 p-3 border rounded-xl pr-16"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute right-3 top-4 text-sm text-gray-500"
              >
                {showConfirmPassword
                  ? "Hide"
                  : "Show"}
              </button>
            </div>
          </div>

          {/* Password Rules */}
          <div className="text-xs space-y-1">
            <p
              className={
                checks.length
                  ? "text-green-600"
                  : "text-gray-500"
              }
            >
              ✓ At least 8 characters
            </p>

            <p
              className={
                checks.uppercase
                  ? "text-green-600"
                  : "text-gray-500"
              }
            >
              ✓ One uppercase letter
            </p>

            <p
              className={
                checks.lowercase
                  ? "text-green-600"
                  : "text-gray-500"
              }
            >
              ✓ One lowercase letter
            </p>

            <p
              className={
                checks.number
                  ? "text-green-600"
                  : "text-gray-500"
              }
            >
              ✓ One number
            </p>

            <p
              className={
                checks.special
                  ? "text-green-600"
                  : "text-gray-500"
              }
            >
              ✓ One special character
            </p>

            <p
              className={`font-semibold ${strengthColor}`}
            >
              Password Strength: {passwordStrength}
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={
              resetPasswordMutation.isPending
            }
            className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 via-pink-500 to-cyan-400 text-white font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {resetPasswordMutation.isPending
              ? "Resetting Password..."
              : "Reset Password"}
          </button>

          {/* Back to Login */}
          <p className="text-center text-sm text-gray-500">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Login
            </Link>
          </p>
        </form>

        <div className="mt-6 flex justify-center">
          <Help />
        </div>
      </div>
    </div>
  );
}