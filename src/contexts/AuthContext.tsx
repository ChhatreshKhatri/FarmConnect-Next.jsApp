"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authService } from "@/services/auth";
import { AuthResponse } from "@/types";

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  userId: number | null;
  username: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(() => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);

    if (authenticated) {
      const role = authService.getUserRole();
      const id = authService.getUserId();
      const name = authService.getUsername();

      setUserRole(role);
      setUserId(id);
      setUsername(name);
    } else {
      setUserRole(null);
      setUserId(null);
      setUsername(null);

      // If we were previously authenticated but now we're not (token expired), redirect to login
      if (typeof window !== "undefined" && window.location.pathname !== "/login" && window.location.pathname !== "/register" && window.location.pathname !== "/") {
        window.location.href = "/login";
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for storage changes (when token is added/removed in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        checkAuth();
      }
    };

    // Periodic token expiration check (every 2 minutes)
    const tokenCheckInterval = setInterval(() => {
      const token = authService.getToken();
      if (token && authService.isTokenExpired(token)) {
        checkAuth(); // This will trigger logout and redirect
      }
    }, 2 * 60 * 1000); // Check every 2 minutes

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
        clearInterval(tokenCheckInterval);
      };
    }

    return () => clearInterval(tokenCheckInterval);
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ Email: email, Password: password });
      checkAuth();
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    checkAuth();
  };

  const value = {
    isAuthenticated,
    userRole,
    userId,
    username,
    loading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
