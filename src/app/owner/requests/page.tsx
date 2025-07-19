"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { requestService } from "@/services/request";
import { Request } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export default function OwnerRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { userId, userRole, isAuthenticated } = useAuth();

  const loadRequests = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const data = await requestService.getRequestsByUserId(userId);
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Redirect if not authenticated or not an owner
  if (!isAuthenticated || (userRole && userRole !== "Owner")) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Requests</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button onClick={loadRequests} disabled={loading} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-200 disabled:opacity-50 flex items-center justify-center">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Refreshing...
              </>
            ) : (
              <>🔄 Refresh</>
            )}
          </button>
          <Link href="/owner/medicine" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 text-center">
            Request Medicine
          </Link>
          <Link href="/owner/feed" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200 text-center">
            Request Feed
          </Link>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white shadow-lg rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Requests Yet</h2>
          <p className="text-gray-500 text-lg mb-6">You haven&apos;t made any requests yet. Browse our products to get started.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/owner/medicine" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200 text-center">
              Browse Medicine
            </Link>
            <Link href="/owner/feed" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition duration-200 text-center">
              Browse Feed
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <div key={request.RequestId} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Request #{request.RequestId}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-blue-600">📋 {request.RequestType}</span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      request.Status === "Pending" ? "bg-yellow-100 text-yellow-700 border border-yellow-200" : request.Status === "Approved" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"
                    }`}>
                    {request.Status}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 space-y-4">
                {/* Request Details */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{request.RequestType === "Medicine" ? "💊" : "🌾"}</span>
                    <span className="text-sm font-medium text-gray-700">Request Details</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium text-gray-900">{request.Quantity}</span>
                    </div>
                    {request.MedicineId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Medicine ID:</span>
                        <span className="font-medium text-gray-900">{request.MedicineId}</span>
                      </div>
                    )}
                    {request.FeedId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Feed ID:</span>
                        <span className="font-medium text-gray-900">{request.FeedId}</span>
                      </div>
                    )}
                    {request.LivestockId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Livestock ID:</span>
                        <span className="font-medium text-gray-900">{request.LivestockId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date Info */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">📅 Requested Date:</span>
                    <span className="text-sm font-medium text-gray-900">{new Date(request.RequestDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Status Info */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                    {request.Status === "Pending" && (
                      <>
                        <svg className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Waiting for supplier approval
                      </>
                    )}
                    {request.Status === "Approved" && (
                      <>
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Request approved by supplier
                      </>
                    )}
                    {request.Status === "Rejected" && (
                      <>
                        <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Request rejected by supplier
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
