import api from "./axios";

// ── Signup ────────────────────────────────────────────────────────────────────
export const signup = async ({ username, email, password }) => {
  const { data } = await api.post("api/auth/signup", {
    username,
    email,
    password,
  });
  return data;
};

// ── Verify OTP ────────────────────────────────────────────────────────────────
export const verifyOTP = async ({ email, otp }) => {
  const { data } = await api.post("api/auth/verify-otp", { email, otp });
  if (data.data?.accessToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
  }
  return data;
};

// ── Resend OTP ────────────────────────────────────────────────────────────────
export const resendOTP = async ({ email }) => {
  const { data } = await api.post("api/auth/resend-otp", { email });
  return data;
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const login = async ({ identifier, password }) => {
  const { data } = await api.post("api/auth/login", { identifier, password });
  if (data.data?.accessToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
  }
  return data;
};

// ── Logout ────────────────────────────────────────────────────────────────────
export const logout = async () => {
  const { data } = await api.post("api/auth/logout");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("pb_user");
  return data;
};

// ── Forgot Password ───────────────────────────────────────────────────────────
export const forgotPassword = async ({ email }) => {
  const { data } = await api.post("api/auth/forgot-password", { email });
  return data;
};

// ── Reset Password ────────────────────────────────────────────────────────────
export const resetPassword = async ({ token, password }) => {
  const { data } = await api.post("api/auth/reset-password", {
    token,
    password,
  });
  return data;
};

// ── Get current user ──────────────────────────────────────────────────────────
export const getMe = async () => {
  const { data } = await api.get("api/auth/me");
  return data.data;
};
