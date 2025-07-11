"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function Home() {
  const { isAuthenticated, userRole, username, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to FarmConnect</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">FarmConnect simplifies livestock management for owners and suppliers. It&apos;s a user-friendly platform that streamlines tasks like tracking livestock health, managing medicine and feed inventory, and handling resource requests.</p>
      </div>

      {!isAuthenticated ? (
        <div className="text-center">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Started</h2>
              <p className="text-gray-600 mb-6">Join FarmConnect to manage your livestock and connect with suppliers.</p>
              <div className="space-y-4">
                <Link href="/register" className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200">
                  Register Now
                </Link>
                <Link href="/login" className="block w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition duration-200">
                  Login
                </Link>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
              <ul className="text-left text-gray-600 space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Livestock Management
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Medicine & Feed Inventory
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Resource Requests
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Real-time Communication
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome back, {username || userRole}!</h2>

          {userRole === "Owner" && (
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Link href="/owner/livestock" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">My Livestock</h3>
                <p className="text-gray-600">Manage your livestock records</p>
              </Link>
              <Link href="/owner/medicine" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Browse Medicine</h3>
                <p className="text-gray-600">Find medicines for your livestock</p>
              </Link>
              <Link href="/owner/feed" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Browse Feed</h3>
                <p className="text-gray-600">Find feed for your livestock</p>
              </Link>
            </div>
          )}

          {userRole === "Supplier" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Link href="/supplier/medicine" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">My Medicines</h3>
                <p className="text-gray-600">Manage your medicine inventory</p>
              </Link>
              <Link href="/supplier/feed" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">My Feeds</h3>
                <p className="text-gray-600">Manage your feed inventory</p>
              </Link>
              <Link href="/supplier/requests" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Requests</h3>
                <p className="text-gray-600">View and manage requests</p>
              </Link>
              <Link href="/supplier/feedback" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Feedback</h3>
                <p className="text-gray-600">View feedback from customers</p>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
