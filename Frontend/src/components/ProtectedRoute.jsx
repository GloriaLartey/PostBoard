import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated.
 *
 * useAuth() here is the CONTEXT hook — it returns { user, saveUser, clearAuth },
 * synced in-memory immediately on login/logout. It does not expose isLoading
 * because there's no async fetch involved; the value is hydrated synchronously
 * from localStorage when AuthProvider mounts.
 */
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
