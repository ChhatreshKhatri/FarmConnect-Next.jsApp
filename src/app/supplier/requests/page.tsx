"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { requestService } from "@/services/request";
import { medicineService } from "@/services/medicine";
import { feedService } from "@/services/feed";
import { Request, Medicine, Feed } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export default function SupplierRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingRequest, setProcessingRequest] = useState<number | null>(null);
  const [itemDetails, setItemDetails] = useState<{ [key: string]: Medicine | Feed }>({});
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

      // Get all requests, then filter for requests related to this supplier's items
      const allRequests = await requestService.getAllRequests();

      // Get supplier's medicines and feeds to filter requests
      const [supplierMedicines, supplierFeeds] = await Promise.all([medicineService.getMedicinesByUserId(userId), feedService.getFeedsByUserId(userId)]);

      // Get IDs of supplier's items
      const supplierMedicineIds = supplierMedicines.map((med) => med.MedicineId);
      const supplierFeedIds = supplierFeeds.map((feed) => feed.FeedId);

      // Filter requests for supplier's items
      const supplierRequests = allRequests.filter((request) => (request.MedicineId && supplierMedicineIds.includes(request.MedicineId)) || (request.FeedId && supplierFeedIds.includes(request.FeedId)));

      // Sort by RequestDate in descending order (latest first)
      const sortedRequests = supplierRequests.sort((a, b) => new Date(b.RequestDate).getTime() - new Date(a.RequestDate).getTime());

      // Fetch item details for each request
      const itemDetailsMap: { [key: string]: Medicine | Feed } = {};
      await Promise.all(
        sortedRequests.map(async (request) => {
          try {
            if (request.MedicineId) {
              const medicine = await medicineService.getMedicineById(request.MedicineId);
              itemDetailsMap[`medicine_${request.MedicineId}`] = medicine;
            } else if (request.FeedId) {
              const feed = await feedService.getFeedById(request.FeedId);
              itemDetailsMap[`feed_${request.FeedId}`] = feed;
            }
          } catch (err) {
            // If item details can't be fetched, continue without them
            console.error("Failed to fetch item details:", err);
          }
        })
      );

      setItemDetails(itemDetailsMap);
      setRequests(sortedRequests);
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

      // Check if request is already approved to prevent double processing
      if (currentRequest.Status === "Approved") {
        throw new Error("Request is already approved");
      }

      // Update inventory quantity based on request type
      if (currentRequest.MedicineId) {
        // Get current medicine data
        const medicine = await medicineService.getMedicineById(currentRequest.MedicineId);

        // Check if there's enough quantity
        if (medicine.Quantity < currentRequest.Quantity) {
          throw new Error(`Insufficient medicine quantity. Available: ${medicine.Quantity}, Requested: ${currentRequest.Quantity}`);
        }

        // Update medicine quantity
        const updatedMedicine = {
          ...medicine,
          Quantity: medicine.Quantity - currentRequest.Quantity,
        };
        await medicineService.updateMedicine(currentRequest.MedicineId, updatedMedicine);
      } else if (currentRequest.FeedId) {
        // Get current feed data
        const feed = await feedService.getFeedById(currentRequest.FeedId);

        // Check if there's enough quantity
        if (feed.Quantity < currentRequest.Quantity) {
          throw new Error(`Insufficient feed quantity. Available: ${feed.Quantity}, Requested: ${currentRequest.Quantity}`);
        }

        // Update feed quantity
        const updatedFeed = {
          ...feed,
          Quantity: feed.Quantity - currentRequest.Quantity,
        };
        await feedService.updateFeed(currentRequest.FeedId, updatedFeed);
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => {
            // Get item details for this request
            const itemKey = request.MedicineId ? `medicine_${request.MedicineId}` : `feed_${request.FeedId}`;
            const itemDetail = itemDetails[itemKey];
            const isOutOfStock = itemDetail && itemDetail.Quantity === 0;

            return (
              <div key={request.RequestId} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Request #{request.RequestId}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-blue-600">{request.RequestType}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{new Date(request.RequestDate).toLocaleDateString()}</span>
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
                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-700">👤 Customer:</span>
                      <span className="text-sm font-semibold text-gray-900">{request.User?.UserName || request.User?.Name || "Unknown User"}</span>
                    </div>
                    <p className="text-xs text-gray-500">ID: {request.UserId}</p>
                  </div>

                  {/* Item Details */}
                  {itemDetail && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{request.RequestType === "Medicine" ? "💊" : "🌾"}</span>
                        <span className="text-sm font-medium text-blue-700">{request.RequestType === "Medicine" ? "Medicine" : "Feed"}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">{request.RequestType === "Medicine" ? (itemDetail as Medicine).MedicineName : (itemDetail as Feed).FeedName}</p>
                      {request.Status === "Pending" && (
                        <p className="text-xs text-green-600 font-medium">
                          📦 Available: {itemDetail.Quantity} {itemDetail.Unit}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Request Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <span className="text-sm font-medium text-gray-900">{request.Quantity}</span>
                    </div>
                    {itemDetail && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Price/Unit:</span>
                          <span className="text-sm font-medium text-gray-900">${itemDetail.PricePerUnit}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-sm font-medium text-gray-700">Total:</span>
                          <span className="text-sm font-bold text-green-600">${(request.Quantity * itemDetail.PricePerUnit).toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {request.Status === "Pending" && request.RequestId && (
                    <div className="pt-4 border-t">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveRequest(request.RequestId!)}
                          disabled={processingRequest === request.RequestId || isOutOfStock || (itemDetail && itemDetail.Quantity < request.Quantity)}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed">
                          {processingRequest === request.RequestId ? "Processing..." : isOutOfStock ? "Out of Stock" : itemDetail && itemDetail.Quantity < request.Quantity ? "Insufficient Stock" : "✅ Approve"}
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.RequestId!)}
                          disabled={processingRequest === request.RequestId}
                          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed">
                          {processingRequest === request.RequestId ? "Processing..." : "❌ Reject"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
