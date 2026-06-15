import { useState } from "react";
import { Link } from "react-router-dom";
import { FiX, FiMail } from "react-icons/fi";
import Logo from "../components/logo";
import Help from "../components/help";
import { useForgotPassword } from "../hooks/useAuth";

export default function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPassword();

  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      return setError("Please enter your email address.");
    }

    try {
      await forgotPasswordMutation.mutateAsync({
        email,
      });

      setSubmittedEmail(email);
      setEmail("");
      setShowModal(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to send reset link. Please try again."
      );
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 blur-[2px]"
        style={{
          backgroundImage: "url('/side1.avif')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white/85 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-2xl">

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Logo />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
          Forgot Password
        </h1>

        <p className="text-center text-gray-500 mt-2 text-sm">
          Enter your email address and we'll send you a password reset link.
        </p>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={forgotPasswordMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-50"
          >
            {forgotPasswordMutation.isPending
              ? "Sending..."
              : "Send Reset Link"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Login
            </Link>
          </p>

        </form>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="relative bg-white rounded-3xl p-8 w-[90%] max-w-md text-center shadow-2xl">

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <FiX size={22} />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <FiMail
                  size={28}
                  className="text-green-600"
                />
              </div>
            </div>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              Reset Link Sent
            </h2>

            <p className="text-gray-600 mt-4 text-sm">
              If an account exists for
            </p>

            <p className="font-medium text-gray-800 break-all mt-1">
              {submittedEmail}
            </p>

            <p className="text-gray-500 mt-4 text-sm">
              A password reset link has been sent to the email address above.
            </p>

            <p className="text-gray-400 text-xs mt-3">
              Check your spam or junk folder if you don't see it in your inbox.
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="mt-6 px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-medium"
            >
              Close
            </button>

          </div>
        </div>
      )}

      {/* Help */}
      <div className="fixed bottom-6 right-6 z-50">
        <Help />
      </div>

    </div>
  );
}