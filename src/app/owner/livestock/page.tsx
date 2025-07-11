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

  console.log("OwnerLivestock render:", { userId, userRole, authLoading, loading });

  const loadLivestock = useCallback(async () => {
    console.log("loadLivestock called with userId:", userId);
    try {
      setLoading(true);
      if (userId) {
        console.log("Fetching livestock for user:", userId);
        const data = await livestockService.getLivestockByUserId(userId);
        console.log("Livestock data received:", data);
        setLivestock(data);
      } else {
        console.log("No userId available, skipping livestock fetch");
      }
    } catch (err) {
      console.error("Error loading livestock:", err);
      setError(err instanceof Error ? err.message : "Failed to load livestock");
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    console.log("useEffect triggered with:", { userId, userRole, authLoading });
    if (!authLoading) {
      if (userId && userRole === "Owner") {
        console.log("Conditions met, calling loadLivestock");
        loadLivestock();
      } else {
        console.log("Conditions not met for loading livestock");
        if (userRole && userRole !== "Owner") {
          console.log("User role is not Owner:", userRole);
        }
        if (!userId) {
          console.log("No userId available");
        }
        // If auth is done loading but conditions aren't met, stop loading
        setLoading(false);
      }
    }
  }, [userId, userRole, authLoading, loadLivestock]);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log("Loading timeout - setting loading to false");
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
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No livestock found.</p>
          <Link href="/owner/livestock/create" className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200">
            Add Your First Livestock
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile Card View (visible on small screens) */}
          <div className="block sm:hidden space-y-4">
            {livestock.map((animal, index) => (
              <div key={animal.LivestockId} className="bg-white shadow-lg rounded-lg p-4 border">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{animal.Name}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">#{index + 1}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Species:</span>
                    <div className="text-gray-900">{animal.Species}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Age:</span>
                    <div className="text-gray-900">{animal.Age}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Breed:</span>
                    <div className="text-gray-900">{animal.Breed}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Health:</span>
                    <div className="text-gray-900">{animal.HealthCondition}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Location:</span>
                    <div className="text-gray-900">{animal.Location}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Vaccination:</span>
                    <div className="text-gray-900">{animal.VaccinationStatus}</div>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <Link href={`/owner/livestock/edit/${animal.LivestockId}`} className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-center hover:bg-green-700 transition duration-200 text-sm">
                    Edit
                  </Link>
                  <button onClick={() => setDeleteId(animal.LivestockId)} className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition duration-200 text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (hidden on small screens, visible on sm and up) */}
          <div className="hidden sm:block bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-600">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">S.No</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Species</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Age</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Breed</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Health</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Location</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Vaccination</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {livestock.map((animal, index) => (
                    <tr key={animal.LivestockId} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{animal.Name}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{animal.Species}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{animal.Age}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{animal.Breed}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{animal.HealthCondition}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{animal.Location}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{animal.VaccinationStatus}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link href={`/owner/livestock/edit/${animal.LivestockId}`} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition duration-200">
                          Edit
                        </Link>
                        <button onClick={() => setDeleteId(animal.LivestockId)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition duration-200">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
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
