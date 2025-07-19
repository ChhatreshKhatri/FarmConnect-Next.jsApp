"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { livestockService } from "@/services/livestock";
import { Livestock } from "@/types";
import Link from "next/link";

export default function OwnerLivestock() {
  const { userId, userRole, loading: authLoading } = useAuth();
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadLivestock = useCallback(async () => {
    try {
      setLoading(true);
      if (userId) {
        const data = await livestockService.getLivestockByUserId(userId);
        setLivestock(data);
      }
    } catch (err) {
      console.error("Error loading livestock:", err);
      setError(err instanceof Error ? err.message : "Failed to load livestock");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!authLoading) {
      if (userId && userRole === "Owner") {
        loadLivestock();
      } else {
        // If auth is done loading but conditions aren't met, stop loading
        setLoading(false);
      }
    }
  }, [userId, userRole, authLoading, loadLivestock]);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("Loading timeout - please try refreshing the page");
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  const handleDelete = async (id: number) => {
    try {
      await livestockService.deleteLivestock(id);
      setLivestock(livestock.filter((l) => l.LivestockId !== id));
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete livestock");
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

  // Show access denied if not owner
  if (userRole !== "Owner") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to livestock owners.</p>
          <p className="text-sm text-gray-500 mt-2">Current role: {userRole || "Not authenticated"}</p>
          <div className="mt-4 space-x-4">
            <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Login
            </Link>
            <Link href="/register" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Register as Owner
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while fetching livestock data
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading livestock...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Livestock</h1>
        <Link href="/owner/livestock/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-center">
          Add New Livestock
        </Link>
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {livestock.length === 0 ? (
        <div className="text-center py-12 bg-white shadow-lg rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">🐄</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Livestock Yet</h2>
          <p className="text-gray-500 text-lg mb-6">Start managing your livestock by adding your first animal.</p>
          <Link href="/owner/livestock/create" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200">
            Add Your First Livestock
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {livestock.map((animal, index) => (
            <div key={animal.LivestockId} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{animal.Name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-orange-600"> {animal.Species}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">#{index + 1}</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 space-y-4">
                {/* Basic Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Breed:</span>
                      <div className="font-medium text-gray-900">{animal.Breed}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Age:</span>
                      <div className="font-medium text-gray-900">{animal.Age}</div>
                    </div>
                  </div>
                </div>

                {/* Health Info */}
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🏥</span>
                    <span className="text-sm font-medium text-green-700">Health Information</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Condition:</span>
                      <span className="font-medium text-gray-900">{animal.HealthCondition}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Vaccination:</span>
                      <span className="font-medium text-gray-900">{animal.VaccinationStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Location Info */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">📍 Location:</span>
                    <span className="text-sm font-medium text-gray-900">{animal.Location}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <Link href={`/owner/livestock/edit/${animal.LivestockId}`} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-center">
                      ✏️ Edit
                    </Link>
                    <button onClick={() => setDeleteId(animal.LivestockId)} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Livestock</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this livestock? This action cannot be undone.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300">
                  Delete
                </button>
                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
