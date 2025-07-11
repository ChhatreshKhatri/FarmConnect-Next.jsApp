"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { feedService } from "@/services/feed";
import { Feed } from "@/types";
import Link from "next/link";
import ImageDisplay from "@/components/ImageDisplay";

export default function OwnerFeed() {
  const { isAuthenticated, loading: authLoading } = useAuth();
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

  // Show loading while auth is loading
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

  // Show access denied if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in to browse feeds.</p>
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Browse Feeds</h1>
        <div className="text-sm text-gray-500">Available: {feeds.length} feed(s)</div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {feeds.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No feeds available</div>
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
                    Available: {feed.Quantity} {feed.Unit}
                  </div>
                </div>

                <Link href={`/owner/request/feed/${feed.FeedId}`} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-200 text-center block">
                  Request Feed
                </Link>
              </div>{" "}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
