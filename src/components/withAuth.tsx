"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface WithAuthProps {
  requiredRole?: string;
  allowedRoles?: string[];
}

export function withAuth<T extends object>(WrappedComponent: React.ComponentType<T>, options: WithAuthProps = {}) {
  const AuthenticatedComponent = (props: T) => {
    const { isAuthenticated, userRole, loading } = useAuth();
    const router = useRouter();
    const { requiredRole, allowedRoles } = options;

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated) {
          // Use a delay to avoid conflicts with other redirect mechanisms
          const redirectTimer = setTimeout(() => {
            if (!isAuthenticated && typeof window !== "undefined" && window.location.pathname !== "/login") {
              router.push("/login");
            }
          }, 100);
          return () => clearTimeout(redirectTimer);
        }

        if (requiredRole && userRole !== requiredRole) {
          router.push("/");
          return;
        }

        if (allowedRoles && !allowedRoles.includes(userRole || "")) {
          router.push("/");
          return;
        }
      }
    }, [isAuthenticated, userRole, loading, router, requiredRole, allowedRoles]);

    if (loading) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // Will redirect to login
    }

    if (requiredRole && userRole !== requiredRole) {
      return null; // Will redirect to home
    }

    if (allowedRoles && !allowedRoles.includes(userRole || "")) {
      return null; // Will redirect to home
    }

    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AuthenticatedComponent;
}
