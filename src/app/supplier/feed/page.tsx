"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { feedService } from "@/services/feed";
import { Feed } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import ImageDisplay from "@/components/ImageDisplay";

export default function SupplierFeed() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feeds.map((feed) => (
            <div key={feed.FeedId} className="bg-white rounded-lg shadow-md overflow-hidden">
              <ImageDisplay src={feed.Image} alt={feed.FeedName} className="w-full h-48 object-cover" fallbackText="No feed image" />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feed.FeedName}</h3>
                <p className="text-gray-600 mb-2">Type: {feed.Type}</p>
                <p className="text-gray-600 mb-4">{feed.Description}</p>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-lg font-bold text-green-600">${feed.PricePerUnit}</span>
                    <span className="text-gray-500 text-sm">/{feed.Unit}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Stock: {feed.Quantity} {feed.Unit}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/supplier/feed/edit/${feed.FeedId}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-center transition duration-200">
                    Edit
                  </Link>
                  <button
                    onClick={() => {
                      /* TODO: Add delete functionality */
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition duration-200">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
