import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMe,
  login,
  logout,
  signup,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
} from "../api/auth.api";
import { useAuth as useAuthContext } from "../context/authContext";

const AUTH_QUERY_KEY = ["auth", "me"];

/**
 * Hook to get current authenticated user via /api/auth/me.
 * Renamed internally to avoid colliding with the context's useAuth —
 * import this as `useAuthQuery` if you need the React Query version
 * elsewhere; most components should just use useAuth from authContext.
 */
export const useCurrentUserQuery = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getMe,
    retry: false,
    refetchOnWindowFocus: true,
  });
};

export const useSignup = () => {
  return useMutation({ mutationFn: signup });
};

/**
 * Verifying OTP logs the user in immediately (backend returns accessToken + user).
 * Must push that user into AuthContext so the whole app sees them as logged in.
 */
export const useVerifyOTP = () => {
  const queryClient = useQueryClient();
  const { saveUser } = useAuthContext();
  return useMutation({
    mutationFn: verifyOTP,
    onSuccess: (data) => {
      if (data?.data?.user) saveUser(data.data.user);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
};

export const useResendOTP = () => {
  return useMutation({ mutationFn: resendOTP });
};

/**
 * Login must push the returned user into AuthContext —
 * this was previously missing, leaving context.user stuck at null
 * even though the access token + API calls succeeded.
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { saveUser } = useAuthContext();
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (data?.data?.user) saveUser(data.data.user);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
};

/**
 * Logout clears AuthContext immediately regardless of whether the
 * server call succeeds — if the access token is already invalid/expired,
 * the POST may 401, but the user still needs to be logged out locally.
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthContext();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAuth();
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      queryClient.clear();
    },
    onError: () => {
      // Even if the server rejects (401/expired token), still log out locally
      clearAuth();
      queryClient.clear();
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({ mutationFn: forgotPassword });
};

export const useResetPassword = () => {
  return useMutation({ mutationFn: resetPassword });
};

export const useIsAuthenticated = () => {
  const { user } = useAuthContext();
  return { isAuthenticated: !!user, isLoading: false };
};