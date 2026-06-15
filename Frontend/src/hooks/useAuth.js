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

const AUTH_QUERY_KEY = ["auth", "me"];

/**
 * Hook to get current authenticated user
 */
export const useAuth = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getMe,
    retry: false,
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook for signup mutation
 */
export const useSignup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signup,
    onSuccess: () => {
      // Don't auto-fetch user after signup, they need to verify OTP first
    },
  });
};

/**
 * Hook for OTP verification mutation
 */
export const useVerifyOTP = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyOTP,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
};

/**
 * Hook for OTP resend mutation
 */
export const useResendOTP = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resendOTP,
    onSuccess: () => {
      // OTP resent successfully
    },
  });
};

/**
 * Hook for login mutation
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
};

/**
 * Hook for logout mutation
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      localStorage.removeItem("accessToken");
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      queryClient.clear();
    },
  });
};

/**
 * Hook for forgot password mutation
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
  });
};

/**
 * Hook for reset password mutation
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
  });
};

/**
 * Check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const { data: user, isLoading } = useAuth();
  return { isAuthenticated: !!user, isLoading };
};
