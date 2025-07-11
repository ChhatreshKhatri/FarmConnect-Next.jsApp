"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { requestService } from "@/services/request";
import { livestockService } from "@/services/livestock";
import { medicineService } from "@/services/medicine";
import { feedService } from "@/services/feed";
import { Request, Livestock, Medicine, Feed } from "@/types";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function RequestForm() {
  const { userId, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const type = params.type as string; // "medicine" or "feed"
  const itemId = Number(params.id);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [item, setItem] = useState<Medicine | Feed | null>(null);
  const [myLivestock, setMyLivestock] = useState<Livestock[]>([]);

  const [request, setRequest] = useState<Request>({
    RequestType: type === "medicine" ? "Medicine" : "Feed",
    MedicineId: type === "medicine" ? itemId : null,
    FeedId: type === "feed" ? itemId : null,
    UserId: userId || 0,
    Quantity: 1,
    Status: "Pending",
    LivestockId: 0, // Will be set when livestock loads
    RequestDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD format for input
  });

  const loadData = useCallback(async () => {
    try {
      setFetchLoading(true);

      // Load the item (medicine or feed)
      if (type === "medicine") {
        const medicineData = await medicineService.getMedicineById(itemId);
        setItem(medicineData);
      } else if (type === "feed") {
        const feedData = await feedService.getFeedById(itemId);
        setItem(feedData);
      }

      // Load user's livestock
      if (userId) {
        const livestockData = await livestockService.getLivestockByUserId(userId);
        setMyLivestock(livestockData);

        // Auto-select first livestock if available
        if (livestockData.length > 0) {
          setRequest((prev) => ({
            ...prev,
            LivestockId: livestockData[0].LivestockId,
          }));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setFetchLoading(false);
    }
  }, [type, itemId, userId]);

  useEffect(() => {
    if (!authLoading && userId && (type === "medicine" || type === "feed")) {
      loadData();
    }
  }, [authLoading, userId, type, loadData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRequest((prev) => ({
      ...prev,
      [name]: name === "Quantity" || name === "LivestockId" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!userId) {
        throw new Error("User ID not found");
      }

      if (!request.LivestockId || request.LivestockId === 0) {
        throw new Error("Please select a livestock");
      }

      if (request.Quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
      }

      // Check if requested quantity exceeds available quantity
      if (item && request.Quantity > item.Quantity) {
        throw new Error(`Requested quantity (${request.Quantity}) exceeds available quantity (${item.Quantity})`);
      }

      const requestData = {
        ...request,
        UserId: userId,
        // Set the correct ID field and null the other
        MedicineId: type === "medicine" ? itemId : null,
        FeedId: type === "feed" ? itemId : null,
        // Convert date to ISO format for API (date-time format expected)
        RequestDate: new Date(request.RequestDate + "T00:00:00.000Z").toISOString(),
      };

      await requestService.addRequest(requestData);
      setSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.push("/owner/requests");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show access denied if not owner
  if (userRole !== "Owner") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to livestock owners.</p>
          <Link href="/" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Validate type parameter
  if (type !== "medicine" && type !== "feed") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Request Type</h1>
          <p className="text-gray-600">Request type must be either &quot;medicine&quot; or &quot;feed&quot;.</p>
          <Link href="/" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Show loading while fetching data
  if (fetchLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading request form...</span>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-green-800 mb-2">Request Submitted Successfully!</h2>
          <p className="text-green-700 mb-4">Your {type} request has been submitted and is pending approval.</p>
          <Link href="/owner/requests" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            View My Requests
          </Link>
        </div>
      </div>
    );
  }

  const itemName = item ? (type === "medicine" ? (item as Medicine).MedicineName : (item as Feed).FeedName) : "Unknown";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Request {type === "medicine" ? "Medicine" : "Feed"}</h1>
          <Link href={type === "medicine" ? "/owner/medicine" : "/owner/feed"} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            ← Back to {type === "medicine" ? "Medicine" : "Feed"}
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Item Details Card */}
        {item && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Item Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Name:</strong> {itemName}
              </div>
              <div>
                <strong>{type === "medicine" ? "Brand" : "Type"}:</strong> {type === "medicine" ? (item as Medicine).Brand : (item as Feed).Type}
              </div>
              <div>
                <strong>Available Quantity:</strong> {item.Quantity} {item.Unit}
              </div>
              <div>
                <strong>Price per Unit:</strong> ${item.PricePerUnit}
              </div>
              <div className="md:col-span-2">
                <strong>Description:</strong> {item.Description}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="LivestockId" className="block text-sm font-medium text-gray-700 mb-2">
                Select Livestock *
              </label>
              <select id="LivestockId" name="LivestockId" value={request.LivestockId || ""} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select livestock</option>
                {myLivestock.map((livestock) => (
                  <option key={livestock.LivestockId} value={livestock.LivestockId}>
                    {livestock.Name} - {livestock.Species} ({livestock.Breed})
                  </option>
                ))}
              </select>
              {myLivestock.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  No livestock found.{" "}
                  <Link href="/owner/livestock/create" className="text-blue-600 hover:underline">
                    Add livestock first
                  </Link>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="Quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Requested *
              </label>
              <input
                type="number"
                id="Quantity"
                name="Quantity"
                value={request.Quantity}
                onChange={handleInputChange}
                required
                min="1"
                max={item?.Quantity || 999}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity"
              />
              {item && (
                <p className="text-sm text-gray-600 mt-1">
                  Available: <span className="font-semibold text-green-600">{item.Quantity}</span> {(item as Medicine).Unit || (item as Feed).Unit}
                  {item.Quantity === 0 && <span className="text-red-600 font-semibold ml-2">🚫 Out of Stock</span>}
                </p>
              )}
              {item && (
                <p className="text-sm text-gray-500 mt-1">
                  Available: {item.Quantity} {item.Unit} | Total Cost: ${(request.Quantity * item.PricePerUnit).toFixed(2)}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="RequestDate" className="block text-sm font-medium text-gray-700 mb-2">
                Request Date *
              </label>
              <input type="date" id="RequestDate" name="RequestDate" value={request.RequestDate} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Summary</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Item:</strong> {itemName}
                </p>
                <p>
                  <strong>Type:</strong> {type === "medicine" ? "Medicine" : "Feed"}
                </p>
                <p>
                  <strong>Quantity:</strong> {request.Quantity} {item?.Unit || "units"}
                </p>
                <p>
                  <strong>Estimated Cost:</strong> ${item ? (request.Quantity * item.PricePerUnit).toFixed(2) : "0.00"}
                </p>
                <p>
                  <strong>Status:</strong> Pending
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              type="submit"
              disabled={loading || myLivestock.length === 0 || !item || item.Quantity === 0 || request.Quantity <= 0 || request.Quantity > item.Quantity}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Submitting..." : !item || item.Quantity === 0 ? "Out of Stock" : request.Quantity <= 0 ? "Enter Valid Quantity" : request.Quantity > item.Quantity ? "Exceeds Available" : "Submit Request"}
            </button>
            <button type="button" onClick={() => router.back()} className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
