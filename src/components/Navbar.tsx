"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const { isAuthenticated, userRole, username, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false); // Close mobile menu
    router.push("/");
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold">
                FarmConnect
              </Link>
            </div>
            <div className="flex items-center">
              <div className="animate-pulse bg-blue-500 h-8 w-20 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              FarmConnect
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <div className="text-sm text-yellow-200 mr-4">Please login to access features</div>
                <Link href="/login" className="hover:bg-blue-700 px-3 py-2 rounded transition duration-200">
                  Login
                </Link>
                <Link href="/register" className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded transition duration-200">
                  Register
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">{username?.charAt(0).toUpperCase() || "U"}</span>
                  </div>
                  <span className="text-sm">
                    Welcome, <span className="font-semibold">{username}</span>
                  </span>
                  <span className="text-xs bg-blue-800 px-2 py-1 rounded-full">{userRole}</span>
                </div>

                {userRole === "Supplier" && (
                  <>
                    <Link href="/supplier/medicine" className="hover:bg-blue-700 px-3 py-2 rounded transition duration-200">
                      💊 Medicines
                    </Link>
                    <Link href="/supplier/feed" className="hover:bg-blue-700 px-3 py-2 rounded transition duration-200">
                      🌾 Feeds
                    </Link>
                    <Link href="/supplier/requests" className="hover:bg-blue-700 px-3 py-2 rounded transition duration-200">
                      📋 Requests
                    </Link>
                    <Link href="/supplier/feedback" className="hover:bg-blue-700 px-3 py-2 rounded transition duration-200">
                      💬 Feedback
                    </Link>
                  </>
                )}

                {userRole === "Owner" && (
                  <>
                    <Link href="/owner/livestock" className="hover:bg-blue-700 px-3 py-2 rounded transition duration-200">
                      🐄 Livestock
                    </Link>
                    <Link href="/owner/medicine" className="hover:bg-blue-700 px-3 py-2 rounded transition duration-200">
                      💊 Medicine
                    </Link>
                    <Link href="/owner/feed" className="hover:bg-blue-700 px-3 py-2 rounded transition duration-200">
                      🌾 Feed
                    </Link>
                    <Link href="/owner/requests" className="hover:bg-blue-700 px-3 py-2 rounded transition duration-200">
                      📋 Requests
                    </Link>
                    <Link href="/owner/feedback" className="hover:bg-blue-700 px-3 py-2 rounded transition duration-200">
                      💬 Feedback
                    </Link>
                  </>
                )}

                <button onClick={handleLogout} className="hover:bg-red-700 bg-red-600 px-3 py-2 rounded transition duration-200 flex items-center space-x-1">
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="hover:bg-blue-700 p-2 rounded">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {!isAuthenticated ? (
                <>
                  <Link href="/login" className="block hover:bg-blue-700 px-3 py-2 rounded">
                    Login
                  </Link>
                  <Link href="/register" className="block hover:bg-blue-700 px-3 py-2 rounded">
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <div className="px-3 py-2 text-sm">Welcome, {username}</div>

                  {userRole === "Supplier" && (
                    <>
                      <Link href="/supplier/medicine" className="block hover:bg-blue-700 px-3 py-2 rounded">
                        My Medicines
                      </Link>
                      <Link href="/supplier/feed" className="block hover:bg-blue-700 px-3 py-2 rounded">
                        My Feeds
                      </Link>
                      <Link href="/supplier/requests" className="block hover:bg-blue-700 px-3 py-2 rounded">
                        Requests
                      </Link>
                      <Link href="/supplier/feedback" className="block hover:bg-blue-700 px-3 py-2 rounded">
                        View Feedback
                      </Link>
                    </>
                  )}

                  {userRole === "Owner" && (
                    <>
                      <Link href="/owner/livestock" className="block hover:bg-blue-700 px-3 py-2 rounded">
                        My Livestock
                      </Link>
                      <Link href="/owner/medicine" className="block hover:bg-blue-700 px-3 py-2 rounded">
                        Browse Medicine
                      </Link>
                      <Link href="/owner/feed" className="block hover:bg-blue-700 px-3 py-2 rounded">
                        Browse Feed
                      </Link>
                      <Link href="/owner/requests" className="block hover:bg-blue-700 px-3 py-2 rounded">
                        My Requests
                      </Link>
                      <Link href="/owner/feedback" className="block hover:bg-blue-700 px-3 py-2 rounded">
                        Feedback
                      </Link>
                    </>
                  )}

                  <button onClick={handleLogout} className="block w-full text-left hover:bg-red-700 bg-red-600 px-3 py-2 rounded">
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
