"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { feedService } from "@/services/feed";
import { Feed } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import ImageDisplay from "@/components/ImageDisplay";

export default function SupplierFeed() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [totalSoldData, setTotalSoldData] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { userId, userRole, loading: authLoading } = useAuth();

  const loadFeeds = useCallback(async () => {
    if (!userId) {
      setFeeds([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await feedService.getFeedsByUserId(userId);
      setFeeds(data);

      // Load total sold data for each feed
      const totalSoldPromises = data.map(async (feed) => {
        if (!feed.FeedId) return { feedId: 0, totalSold: 0 };
        const totalSold = await feedService.getTotalSoldByFeedId(feed.FeedId);
        return { feedId: feed.FeedId, totalSold };
      });

      const totalSoldResults = await Promise.all(totalSoldPromises);
      const totalSoldMap = totalSoldResults.reduce((acc, { feedId, totalSold }) => {
        if (feedId > 0) {
          acc[feedId] = totalSold;
        }
        return acc;
      }, {} as { [key: number]: number });

      setTotalSoldData(totalSoldMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feeds");
      setFeeds([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!authLoading) {
      if (userRole === "Supplier") {
        if (userId) {
          loadFeeds();
        } else {
          setLoading(false);
          setFeeds([]);
          setError("Unable to load your user ID. You can still add feeds.");
        }
      } else {
        setLoading(false);
      }
    }
  }, [userId, userRole, authLoading, loadFeeds]);

  // Emergency fallback - if we're authenticated as Supplier but still loading after auth completes
  useEffect(() => {
    if (!authLoading && userRole === "Supplier" && userId && loading) {
      const emergencyTimeout = setTimeout(() => {
        setLoading(false);
        setFeeds([]);
      }, 3000);

      return () => clearTimeout(emergencyTimeout);
    }
  }, [authLoading, userRole, userId, loading]);

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

  // Show loading while fetching feeds
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Feeds</h1>
          <Link href="/supplier/feed/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200">
            + Add New Feed
          </Link>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading feeds...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Feeds</h1>
        <Link href="/supplier/feed/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200">
          + Add New Feed
        </Link>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {feeds.length === 0 ? (
        <div className="text-center py-12 bg-white shadow-lg rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">🌾</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Feeds Yet</h2>
          <p className="text-gray-500 text-lg mb-6">Start adding your feed products to reach customers.</p>
          <Link href="/supplier/feed/create" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200">
            Add Your First Feed
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {feeds.map((feed) => {
            const totalSold = totalSoldData[feed.FeedId || 0] || 0;
            const isOutOfStock = feed.Quantity === 0;

            return (
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
                    {isOutOfStock ? <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">Out of Stock</span> : <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">In Stock</span>}
                  </div>
                </div>

                {/* Image Section */}
                <div className="relative">
                  <ImageDisplay src={feed.Image} alt={feed.FeedName} className="w-full h-48 object-cover" fallbackText="No feed image" />
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-4">
                  {/* Description */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{feed.Description}</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-blue-600">${feed.PricePerUnit}</div>
                      <div className="text-xs text-gray-600">per {feed.Unit}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-purple-600">{totalSold}</div>
                      <div className="text-xs text-gray-600">Total Sold</div>
                    </div>
                  </div>

                  {/* Stock Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Stock:</span>
                      <span className={`text-sm font-medium ${isOutOfStock ? "text-red-600" : "text-gray-900"}`}>
                        {isOutOfStock ? "0" : feed.Quantity} {feed.Unit}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t">
                    <div className="flex gap-2">
                      <Link href={`/supplier/feed/edit/${feed.FeedId}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-center">
                        ✏️ Edit
                      </Link>
                      {isOutOfStock ? (
                        <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">📦 Restock</button>
                      ) : (
                        <button
                          onClick={() => {
                            /* TODO: Add delete functionality */
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
