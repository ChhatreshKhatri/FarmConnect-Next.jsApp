"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authService } from "@/services/auth";
import { AuthResponse } from "@/types";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  userId: string | null;
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
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleTokenExpired = useCallback(() => {
    // Clear all auth state
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    setUsername(null);
    setLoading(false);

    // Clear token from storage
    authService.logout();

    // Redirect to login page if not already there
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const isPublicPage = currentPath === "/login" || currentPath === "/register" || currentPath === "/";

      if (!isPublicPage && !sessionStorage.getItem("redirecting")) {
        sessionStorage.setItem("redirecting", "true");

        // Show alert to user
        alert("Your session has expired. You will be redirected to the login page.");

        setTimeout(() => {
          sessionStorage.removeItem("redirecting");
          router.push("/login");
        }, 500);
      }
    }
  }, [router]);

  const checkAuth = useCallback(() => {
    const authenticated = authService.isAuthenticated();

    if (!authenticated) {
      // Token is expired or invalid, handle logout
      handleTokenExpired();
      return;
    }

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
    }

    setLoading(false);
  }, [handleTokenExpired]);

  useEffect(() => {
    checkAuth();

    // Listen for storage changes (when token is added/removed in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        checkAuth();
      }
    };

    // Periodic token expiration check (every 1 minute)
    const tokenCheckInterval = setInterval(() => {
      const token = authService.getToken();
      if (token && authService.isTokenExpired(token)) {
        handleTokenExpired(); // This will trigger logout and redirect
      }
    }, 1 * 60 * 1000); // Check every 1 minute

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
        clearInterval(tokenCheckInterval);
      };
    }

    return () => clearInterval(tokenCheckInterval);
  }, [checkAuth, handleTokenExpired]);

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
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    setUsername(null);

    // Redirect to login page
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const isPublicPage = currentPath === "/login" || currentPath === "/register" || currentPath === "/";

      if (!isPublicPage) {
        router.push("/login");
      }
    }
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
