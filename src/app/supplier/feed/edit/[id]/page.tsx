"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { feedService } from "@/services/feed";
import { Feed } from "@/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";

interface EditFeedProps {
  params: Promise<{ id: string }>;
}

export default function EditFeed({ params }: EditFeedProps) {
  const { userId, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [feedId, setFeedId] = useState<string>("");

  const [feed, setFeed] = useState<Feed>({
    FeedId: 0,
    FeedName: "",
    Type: "",
    Description: "",
    Quantity: 0,
    Unit: "",
    PricePerUnit: 0,
    Image: "",
    UserId: userId || 0,
  });

  // Get the feed ID from params
  useEffect(() => {
    params.then(({ id }) => {
      setFeedId(id);
    });
  }, [params]);

  // Load feed data
  useEffect(() => {
    const loadFeed = async () => {
      try {
        if (feedId && userId) {
          const data = await feedService.getFeedById(Number(feedId));
          setFeed(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load feed");
      } finally {
        setLoading(false);
      }
    };

    if (feedId && userId && userRole === "Supplier") {
      loadFeed();
    } else if (userRole && userRole !== "Supplier") {
      setLoading(false);
    }
  }, [feedId, userId, userRole]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFeed((prev) => ({
      ...prev,
      [name]: name === "Quantity" || name === "PricePerUnit" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (!userId || !feed.FeedId) {
        throw new Error("Invalid feed or user data");
      }

      await feedService.updateFeed(feed.FeedId, feed);
      setSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.push("/supplier/feed");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update feed");
    } finally {
      setSaving(false);
    }
  };

  // Show loading while auth is loading
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Show access denied if not supplier
  if (userRole !== "Supplier") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to suppliers.</p>
          <Link href="/" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-green-800 mb-2">Feed Updated Successfully!</h2>
          <p className="text-green-700 mb-4">Your feed has been updated in the inventory.</p>
          <Link href="/supplier/feed" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            View My Feeds
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Feed</h1>
          <Link href="/supplier/feed" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            ← Back to Feeds
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="FeedName" className="block text-sm font-medium text-gray-700 mb-2">
                Feed Name *
              </label>
              <input type="text" id="FeedName" name="FeedName" value={feed.FeedName} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter feed name" />
            </div>

            <div>
              <label htmlFor="Type" className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select id="Type" name="Type" value={feed.Type} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select feed type</option>
                <option value="Grain">Grain</option>
                <option value="Hay">Hay</option>
                <option value="Pellets">Pellets</option>
                <option value="Supplement">Supplement</option>
                <option value="Concentrate">Concentrate</option>
                <option value="Forage">Forage</option>
                <option value="Mineral">Mineral</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="Quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input type="number" id="Quantity" name="Quantity" value={feed.Quantity} onChange={handleInputChange} required min="0" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
            </div>

            <div>
              <label htmlFor="Unit" className="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <select id="Unit" name="Unit" value={feed.Unit} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select unit</option>
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
                <option value="tons">tons</option>
                <option value="bags">bags</option>
                <option value="bales">bales</option>
                <option value="liters">liters</option>
                <option value="gallons">gallons</option>
              </select>
            </div>

            <div>
              <label htmlFor="PricePerUnit" className="block text-sm font-medium text-gray-700 mb-2">
                Price Per Unit ($) *
              </label>
              <input type="number" id="PricePerUnit" name="PricePerUnit" value={feed.PricePerUnit} onChange={handleInputChange} required min="0" step="0.01" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="Description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea id="Description" name="Description" value={feed.Description} onChange={handleInputChange} required rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter feed description" />
            </div>

            <div className="md:col-span-2">
              <ImageUpload label="Feed Image" value={feed.Image} onChange={(base64) => setFeed((prev) => ({ ...prev, Image: base64 }))} placeholder="Upload feed image" />
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Updating..." : "Update Feed"}
            </button>
            <button type="button" onClick={() => router.push("/supplier/feed")} className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
