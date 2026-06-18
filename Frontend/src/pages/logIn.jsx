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
        err.response?.data?.message ||
          "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white flex items-center justify-center px-3 sm:px-4 md:px-6">

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

      {/* MAIN CARD */}
      <div
        className="
          relative
          z-10
          w-full
          max-w-[92vw]
          sm:max-w-sm
          md:max-w-md
          bg-white/85
          backdrop-blur-xl
          border
          border-white/40
          rounded-2xl
          md:rounded-3xl
          p-4
          sm:p-5
          md:p-6
          shadow-2xl
        "
      >
        {/* LOGO */}
        <div className="flex justify-center mb-3">
          <Logo />
        </div>

        {/* TITLE */}
        <h1
          className="
            text-xl
            sm:text-2xl
            font-bold
            text-center
            text-blue-600
            bg-gradient-to-r
            from-blue-600
            via-pink-500
            to-cyan-400
            bg-clip-text
            text-transparent
          "
        >
          Welcome Back
        </h1>

        {/* ERROR */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleLogin}
          className="mt-5 space-y-4"
        >
          {/* EMAIL OR USERNAME */}
          <div>
            <label className="block text-sm font-medium text-black md:text-gray-700 mb-2">
              Email or Username
            </label>

            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Enter your email or username"
              className="
                w-full
                px-3 md:px-4
                py-2.5 md:py-3
                border
                border-gray-300
                rounded-xl
                text-sm
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-black md:text-gray-700 mb-2">
              Password
            </label>

            <div className="relative">
              <input
                type={
                  showPassword ? "text" : "password"
                }
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="
                  w-full
                  px-3 md:px-4
                  py-2.5 md:py-3
                  pr-16
                  border
                  border-gray-300
                  rounded-xl
                  text-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-xs
                  md:text-sm
                  text-gray-500
                "
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* FORGOT PASSWORD */}
          <Link
            to="/forgot-password"
            className="
              block
              text-sm
              text-blue-600
              hover:underline
            "
          >
            Forgot password?
          </Link>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="
              w-full
              py-2.5
              md:py-3
              rounded-xl
              bg-blue-600
              bg-gradient-to-r
              from-blue-600
              to-cyan-400
              text-white
              text-sm
              md:text-base
              font-semibold
              hover:opacity-90
              disabled:opacity-50
            "
          >
            {loginMutation.isPending
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        {/* SIGNUP */}
        <p className="text-center text-black md:text-gray-600 mt-4 text-sm">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="
              text-blue-600
              hover:underline
              font-medium
            "
          >
            Sign up here
          </Link>
        </p>
      </div>

      {/* HELP BUTTON */}
      <div
        className="
          fixed
          bottom-4
          md:bottom-6
          right-4
          md:right-6
          z-50
          scale-90
          md:scale-100
        "
      >
        <Help />
      </div>
    </div>
  );
}