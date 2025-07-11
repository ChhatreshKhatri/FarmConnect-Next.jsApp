"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { requestService } from "@/services/request";
import { Request } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export default function SupplierRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingRequest, setProcessingRequest] = useState<number | null>(null);
  const { userId, userRole, loading: authLoading } = useAuth();

  const loadRequests = useCallback(async () => {
    if (!userId) {
      setRequests([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      // Get requests related to this supplier's medicines and feeds
      const data = await requestService.getRequestsByUserId(userId);
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!authLoading) {
      if (userId && userRole === "Supplier") {
        loadRequests();
      } else {
        setLoading(false);
      }
    }
  }, [userId, userRole, authLoading, loadRequests]);

  // Emergency fallback - if we're authenticated as Supplier but still loading after auth completes
  useEffect(() => {
    if (!authLoading && userRole === "Supplier" && userId && loading) {
      const emergencyTimeout = setTimeout(() => {
        setLoading(false);
        setRequests([]);
      }, 3000);

      return () => clearTimeout(emergencyTimeout);
    }
  }, [authLoading, userRole, userId, loading]);

  const handleApproveRequest = async (requestId: number) => {
    try {
      setProcessingRequest(requestId);

      // Find the current request to get its data
      const currentRequest = requests.find((req) => req.RequestId === requestId);
      if (!currentRequest) {
        throw new Error("Request not found");
      }

      // Update the request with approved status
      const updatedRequest = { ...currentRequest, Status: "Approved" };
      await requestService.updateRequest(requestId, updatedRequest);

      // Refetch data to ensure consistency with server
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve request");
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      setProcessingRequest(requestId);

      // Find the current request to get its data
      const currentRequest = requests.find((req) => req.RequestId === requestId);
      if (!currentRequest) {
        throw new Error("Request not found");
      }

      // Update the request with rejected status
      const updatedRequest = { ...currentRequest, Status: "Rejected" };
      await requestService.updateRequest(requestId, updatedRequest);

      // Refetch data to ensure consistency with server
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject request");
    } finally {
      setProcessingRequest(null);
    }
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading authentication...</span>
      </div>
    );
  }

  // Show access denied if not supplier
  if (userRole !== "Supplier") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mb-4">This page is only accessible to suppliers.</p>

          <div className="mt-6 space-x-4">
            <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Login as Supplier
            </Link>
            <Link href="/register" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Register as Supplier
            </Link>
            <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while fetching requests
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Requests</h1>
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading requests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Requests</h1>
        <div className="text-sm text-gray-500">Total: {requests.length} request(s)</div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white shadow-lg rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Requests Yet</h2>
          <p className="text-gray-500 text-lg mb-6">No customers have made requests for your products yet.</p>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Make sure you have medicines and feeds listed so customers can request them.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/supplier/medicine" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                📋 View My Medicines
              </Link>
              <Link href="/supplier/feed" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200">
                🌾 View My Feeds
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {requests.map((request) => (
            <div key={request.RequestId} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Request #{request.RequestId}</h3>
                  <p className="text-sm text-gray-600">Type: {request.RequestType}</p>
                  <p className="text-sm text-gray-600">From User ID: {request.UserId}</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${request.Status === "Pending" ? "bg-yellow-100 text-yellow-800" : request.Status === "Approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{request.Status}</span>
                  <p className="text-xs text-gray-500 mt-1">{new Date(request.RequestDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Quantity: {request.Quantity}</p>
                  {request.MedicineId && <p className="text-sm text-gray-600">Medicine ID: {request.MedicineId}</p>}
                  {request.FeedId && <p className="text-sm text-gray-600">Feed ID: {request.FeedId}</p>}
                  {request.LivestockId && <p className="text-sm text-gray-600">Livestock ID: {request.LivestockId}</p>}
                </div>
                <div className="flex flex-col sm:block text-left sm:text-right">
                  {request.Status === "Pending" && request.RequestId && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                      <button onClick={() => handleApproveRequest(request.RequestId!)} disabled={processingRequest === request.RequestId} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition duration-200 disabled:opacity-50">
                        {processingRequest === request.RequestId ? "..." : "✅ Approve"}
                      </button>
                      <button onClick={() => handleRejectRequest(request.RequestId!)} disabled={processingRequest === request.RequestId} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition duration-200 disabled:opacity-50">
                        {processingRequest === request.RequestId ? "..." : "❌ Reject"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
