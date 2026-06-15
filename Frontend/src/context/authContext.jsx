import { createContext, useContext, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("pb_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const queryClient = useQueryClient();

  const saveUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("pb_user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("pb_user");
      localStorage.removeItem("accessToken");
    }
  };

  const clearAuth = () => {
    saveUser(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, saveUser, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
