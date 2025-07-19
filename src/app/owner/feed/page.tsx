"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { feedService } from "@/services/feed";
import { Feed } from "@/types";
import Link from "next/link";
import Image from "next/image";

export default function OwnerFeed() {
  const { isAuthenticated, userRole, loading: authLoading } = useAuth();
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFeeds = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await feedService.getAllFeeds();
      setFeeds(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feeds");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadFeeds();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, loadFeeds]);

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading authentication...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || userRole !== "Owner") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mb-4">This page is only accessible to livestock owners.</p>
          <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Go to Login
          </Link>
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Browse Feeds</h1>
        <div className="text-sm text-gray-500">Available: {feeds.length} feed(s)</div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {feeds.length === 0 ? (
        <div className="text-center py-12 bg-white shadow-lg rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">🌾</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Feeds Available</h2>
          <p className="text-gray-500 text-lg">Check back later for available feeds.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {feeds.map((feed) => (
            <div key={feed.FeedId} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{feed.FeedName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-green-600">🌾 {feed.Type}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${feed.Quantity > 0 ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>{feed.Quantity > 0 ? "In Stock" : "Out of Stock"}</span>
                </div>
              </div>

              {/* Image Section */}
              <div className="relative">
                {feed.Image && <Image src={feed.Image} alt={feed.FeedName} width={400} height={192} className="w-full h-48 object-cover" />}
                {!feed.Image && (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-4xl">🌾</span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-6 space-y-4">
                {/* Feed Details */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🏷️</span>
                    <span className="text-sm font-medium text-gray-700">Feed Details</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium text-gray-900">{feed.Type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Supplier:</span>
                      <span className="font-medium text-gray-900">{feed.User?.UserName || feed.User?.Name || "Unknown"}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {feed.Description && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📝</span>
                      <span className="text-sm font-medium text-gray-700">Description</span>
                    </div>
                    <p className="text-sm text-gray-700">{feed.Description}</p>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">${feed.PricePerUnit}</div>
                    <div className="text-xs text-green-700">per {feed.Unit}</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{feed.Quantity}</div>
                    <div className="text-xs text-blue-700">{feed.Unit} available</div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t">
                  {feed.Quantity > 0 ? (
                    <Link href={`/owner/request/feed/${feed.FeedId}`} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition duration-200 text-center block font-medium">
                      🌾 Request Feed
                    </Link>
                  ) : (
                    <button disabled className="w-full bg-gray-400 text-white py-3 px-4 rounded-lg cursor-not-allowed font-medium">
                      🚫 Out of Stock
                    </button>
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
