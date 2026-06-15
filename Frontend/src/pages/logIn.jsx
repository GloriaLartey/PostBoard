import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/logo";
import Help from "../components/help";
import { useLogin } from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.identifier || !formData.password) {
      return setError("Please fill in all fields");
    }

    try {
      await loginMutation.mutateAsync(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    }
  };

  return (
    <div className="relative h-screen overflow-hidden bg-white flex items-center justify-center px-4">
      {/* BACKGROUND IMAGE */}
      <div
        className="
          absolute
          inset-0
          bg-cover
          bg-center
          blur-[2px]
          scale-105
        "
        style={{
          backgroundImage: "url('/side1.avif')",
        }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" />

      {/* MAIN CONTAINER */}
      <div
        className="
          relative
          z-10
          w-full
          max-w-md
          bg-white/80
          backdrop-blur-xl
          border
          border-white/40
          rounded-3xl
          p-6
          shadow-2xl
        ">
        {/* LOGO */}
        <div className="flex justify-center mb-3">
          <Logo />
        </div>

        {/* TITLE */}
        <h1
          className="
            text-2xl
            font-bold
            text-center
            bg-gradient-to-r
            from-blue-600
            via-pink-500
            to-cyan-400
            bg-clip-text
            text-transparent
          ">
          Welcome Back
        </h1>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          {/* EMAIL OR USERNAME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email or Username
            </label>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Enter your email or username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500">
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* FORGOT PASSWORD LINK */}
          <Link
            to="/forgot-password"
            className="block text-sm text-blue-600 hover:underline">
            Forgot password?
          </Link>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-semibold py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* SIGNUP LINK */}
        <p className="text-center text-gray-600 mt-4 text-sm">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 hover:underline font-medium">
            Sign up here
          </Link>
        </p>
      </div>
      {/* HELP BUTTON */}
      <div className="fixed bottom-6 right-6 z-50">
        <Help />
      </div>
    </div>
  );
}
