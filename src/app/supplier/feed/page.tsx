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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Feeds</h1>
        <Link href="/supplier/feed/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200">
          + Add New Feed
        </Link>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {feeds.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">You haven&apos;t added any feeds yet</div>
          <Link href="/supplier/feed/create" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200">
            Add Your First Feed
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feeds.map((feed) => {
                  const totalSold = totalSoldData[feed.FeedId || 0] || 0;
                  const isOutOfStock = feed.Quantity === 0;
                  return (
                    <tr key={feed.FeedId} className={isOutOfStock ? "bg-red-50" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ImageDisplay src={feed.Image} alt={feed.FeedName} className="h-12 w-12 rounded-lg object-cover mr-4" fallbackText="No Image" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{feed.FeedName}</div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">{feed.Description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{feed.Type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-bold text-green-600">${feed.PricePerUnit}</span>
                        <span className="text-gray-500">/{feed.Unit}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {isOutOfStock ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Out of Stock</span>
                        ) : (
                          <span className="text-gray-900">
                            {feed.Quantity} {feed.Unit}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {totalSold} {feed.Unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link href={`/supplier/feed/edit/${feed.FeedId}`} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition duration-200">
                          Edit
                        </Link>
                        {isOutOfStock ? (
                          <span className="bg-orange-500 text-white px-3 py-1 rounded text-xs">Refill</span>
                        ) : (
                          <button
                            onClick={() => {
                              /* TODO: Add delete functionality */
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition duration-200">
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {feeds.map((feed) => {
              const totalSold = totalSoldData[feed.FeedId || 0] || 0;
              const isOutOfStock = feed.Quantity === 0;
              return (
                <div key={feed.FeedId} className={`bg-white rounded-lg shadow-md overflow-hidden ${isOutOfStock ? "border-l-4 border-red-500" : ""}`}>
                  <ImageDisplay src={feed.Image} alt={feed.FeedName} className="w-full h-48 object-cover" fallbackText="No feed image" />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{feed.FeedName}</h3>
                      {isOutOfStock && <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Out of Stock</span>}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">Type: {feed.Type}</p>
                    <p className="text-gray-600 text-sm mb-3">{feed.Description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <div>
                          <span className="font-bold text-green-600">${feed.PricePerUnit}</span>
                          <span className="text-gray-500">/{feed.Unit}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Stock:</span>
                        <div className="text-gray-900">{isOutOfStock ? "Out of Stock" : `${feed.Quantity} ${feed.Unit}`}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Sold:</span>
                        <div className="text-gray-900">
                          {totalSold} {feed.Unit}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Link href={`/supplier/feed/edit/${feed.FeedId}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-center text-sm transition duration-200">
                        Edit
                      </Link>
                      {isOutOfStock ? (
                        <span className="flex-1 bg-orange-500 text-white py-2 px-4 rounded text-center text-sm">Refill</span>
                      ) : (
                        <button
                          onClick={() => {
                            /* TODO: Add delete functionality */
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm transition duration-200">
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
