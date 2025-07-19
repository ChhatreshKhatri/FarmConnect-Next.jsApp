"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
      <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg border-b border-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 text-xl font-bold hover:text-blue-200 transition-colors">
                <Image src="https://cdn.chhatreshkhatri.com/icons/FarmConnect.svg" alt="FarmConnect" width={32} height={32} className="w-8 h-8" />
                <span>FarmConnect</span>
              </Link>
            </div>
            <div className="flex items-center">
              <div className="animate-pulse bg-blue-500 h-8 w-20 rounded-lg"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg border-b border-blue-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 text-xl font-bold hover:text-blue-200 transition-colors group">
              <Image src="https://cdn.chhatreshkhatri.com/icons/FarmConnect.svg" alt="FarmConnect" width={32} height={32} className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span>FarmConnect</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {!isAuthenticated ? (
              <>
                <div className="text-sm text-blue-200 mr-3 px-3 py-2 bg-blue-800/50 rounded-lg">🔐 Please login to access features</div>
                <Link href="/login" className="hover:bg-blue-800 px-3 py-2 rounded-lg transition-all duration-200 font-medium">
                  🔑 Login
                </Link>
                <Link href="/register" className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
                  ✨ Register
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2 bg-blue-800/50 p-2 rounded-lg mr-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-white">{username}</span>
                    <span className="text-xs bg-blue-700 px-2 py-1 rounded-full text-blue-200">{userRole}</span>
                  </div>
                </div>

                {userRole === "Supplier" && (
                  <>
                    <Link href="/supplier/medicine" className="hover:bg-blue-800 p-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center space-x-1">
                      <span>💊</span>
                      <span>Medicines</span>
                    </Link>
                    <Link href="/supplier/feed" className="hover:bg-blue-800 p-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center space-x-1">
                      <span>🌾</span>
                      <span>Feeds</span>
                    </Link>
                    <Link href="/supplier/requests" className="hover:bg-blue-800 p-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center space-x-1">
                      <span>📋</span>
                      <span>Requests</span>
                    </Link>
                    <Link href="/supplier/feedback" className="hover:bg-blue-800 p-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center space-x-1">
                      <span>💬</span>
                      <span>Feedback</span>
                    </Link>
                  </>
                )}

                {userRole === "Owner" && (
                  <>
                    <Link href="/owner/livestock" className="hover:bg-blue-800 p-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center space-x-1">
                      <span>🐄</span>
                      <span>Livestock</span>
                    </Link>
                    <Link href="/owner/medicine" className="hover:bg-blue-800 p-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center space-x-1">
                      <span>💊</span>
                      <span>Medicine</span>
                    </Link>
                    <Link href="/owner/feed" className="hover:bg-blue-800 p-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center space-x-1">
                      <span>🌾</span>
                      <span>Feed</span>
                    </Link>
                    <Link href="/owner/requests" className="hover:bg-blue-800 p-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center space-x-1">
                      <span>📋</span>
                      <span>Requests</span>
                    </Link>
                    <Link href="/owner/feedback" className="hover:bg-blue-800 p-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center space-x-1">
                      <span>💬</span>
                      <span>Feedback</span>
                    </Link>
                  </>
                )}

                <button onClick={handleLogout} className="hover:bg-red-700 bg-red-600 px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl text-sm">
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="hover:bg-blue-800 p-2 rounded-lg transition-all duration-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-blue-500">
            <div className="px-2 pt-4 pb-3 space-y-2">
              {!isAuthenticated ? (
                <div className="flex flex-col space-y-2">
                  <div className="text-sm text-blue-200 mr-3 px-3 py-2 bg-blue-800/50 rounded-lg">🔐 Please login to access features</div>
                  <Link href="/login" className="hover:bg-blue-800 px-3 py-2 rounded-lg transition-all duration-200 font-medium">
                    🔑 Login
                  </Link>
                  <Link href="/register" className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
                    ✨ Register
                  </Link>
                </div>
              ) : (
                <>
                  <div className="px-4 py-3 bg-blue-700/50 rounded-lg mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-semibold text-white">{username}</div>
                      <div className="text-xs bg-blue-600 px-2 py-1 rounded-full text-blue-200 inline-block">{userRole}</div>
                    </div>
                  </div>

                  {userRole === "Supplier" && (
                    <>
                      <Link href="/supplier/medicine" className="hover:bg-blue-700 px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2">
                        <span>💊</span>
                        <span>My Medicines</span>
                      </Link>
                      <Link href="/supplier/feed" className="hover:bg-blue-700 px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2">
                        <span>🌾</span>
                        <span>My Feeds</span>
                      </Link>
                      <Link href="/supplier/requests" className="hover:bg-blue-700 px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2">
                        <span>📋</span>
                        <span>Requests</span>
                      </Link>
                      <Link href="/supplier/feedback" className="hover:bg-blue-700 px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2">
                        <span>💬</span>
                        <span>View Feedback</span>
                      </Link>
                    </>
                  )}

                  {userRole === "Owner" && (
                    <>
                      <Link href="/owner/livestock" className="hover:bg-blue-700 px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2">
                        <span>🐄</span>
                        <span>My Livestock</span>
                      </Link>
                      <Link href="/owner/medicine" className="hover:bg-blue-700 px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2">
                        <span>💊</span>
                        <span>Browse Medicine</span>
                      </Link>
                      <Link href="/owner/feed" className="hover:bg-blue-700 px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2">
                        <span>🌾</span>
                        <span>Browse Feed</span>
                      </Link>
                      <Link href="/owner/requests" className="hover:bg-blue-700 px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2">
                        <span>📋</span>
                        <span>My Requests</span>
                      </Link>
                      <Link href="/owner/feedback" className="hover:bg-blue-700 px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2">
                        <span>💬</span>
                        <span>Feedback</span>
                      </Link>
                    </>
                  )}

                  <button onClick={handleLogout} className="w-full hover:bg-red-700 bg-red-600 px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium mt-4">
                    <span>🚪</span>
                    <span>Logout</span>
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
