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
  const { userId } = useAuth();

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
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">You haven&apos;t made any requests yet</div>
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
        <div className="grid gap-4 sm:gap-6">
          {requests.map((request) => (
            <div key={request.RequestId} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Request #{request.RequestId}</h3>
                  <p className="text-sm text-gray-600">Type: {request.RequestType}</p>
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
                </div>
                <div>{request.LivestockId && <p className="text-sm text-gray-600">Livestock ID: {request.LivestockId}</p>}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
