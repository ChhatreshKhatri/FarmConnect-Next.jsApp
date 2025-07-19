"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { livestockService } from "@/services/livestock";
import { Livestock } from "@/types";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditLivestock() {
  const { userId, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const livestockId = Number(params.id);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [livestock, setLivestock] = useState<Livestock>({
    LivestockId: 0,
    Name: "",
    Species: "",
    Age: 0,
    Breed: "",
    HealthCondition: "",
    Location: "",
    VaccinationStatus: "",
    UserId: "",
  });

  const loadLivestock = useCallback(async () => {
    try {
      setFetchLoading(true);
      const data = await livestockService.getLivestockById(livestockId);

      // Check if the livestock belongs to the current user
      if (data.UserId !== userId) {
        setError("You don't have permission to edit this livestock");
        return;
      }

      setLivestock(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load livestock");
    } finally {
      setFetchLoading(false);
    }
  }, [livestockId, userId]);

  useEffect(() => {
    if (livestockId && !authLoading && userId) {
      loadLivestock();
    }
  }, [livestockId, authLoading, userId, loadLivestock]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLivestock((prev) => ({
      ...prev,
      [name]: name === "Age" ? Number(value) : value,
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

      await livestockService.updateLivestock(livestockId, livestock);
      setSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.push("/owner/livestock");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update livestock");
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

  // Show loading while fetching livestock data
  if (fetchLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading livestock data...</span>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-green-800 mb-2">Livestock Updated Successfully!</h2>
          <p className="text-green-700 mb-4">Your livestock information has been updated.</p>
          <Link href="/owner/livestock" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Back to My Livestock
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Livestock</h1>
          <Link href="/owner/livestock" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            ← Back to Livestock
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
              <label htmlFor="Name" className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input type="text" id="Name" name="Name" value={livestock.Name} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter livestock name" />
            </div>

            <div>
              <label htmlFor="Species" className="block text-sm font-medium text-gray-700 mb-2">
                Species *
              </label>
              <select id="Species" name="Species" value={livestock.Species} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select species</option>
                <option value="Cattle">Cattle</option>
                <option value="Sheep">Sheep</option>
                <option value="Goat">Goat</option>
                <option value="Pig">Pig</option>
                <option value="Chicken">Chicken</option>
                <option value="Duck">Duck</option>
                <option value="Horse">Horse</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="Age" className="block text-sm font-medium text-gray-700 mb-2">
                Age (months) *
              </label>
              <input type="number" id="Age" name="Age" value={livestock.Age} onChange={handleInputChange} required min="0" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Age in months" />
            </div>

            <div>
              <label htmlFor="Breed" className="block text-sm font-medium text-gray-700 mb-2">
                Breed *
              </label>
              <input type="text" id="Breed" name="Breed" value={livestock.Breed} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter breed" />
            </div>

            <div>
              <label htmlFor="Location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input type="text" id="Location" name="Location" value={livestock.Location} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter location" />
            </div>

            <div>
              <label htmlFor="VaccinationStatus" className="block text-sm font-medium text-gray-700 mb-2">
                Vaccination Status
              </label>
              <select id="VaccinationStatus" name="VaccinationStatus" value={livestock.VaccinationStatus || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select status</option>
                <option value="Up to date">Up to date</option>
                <option value="Partially vaccinated">Partially vaccinated</option>
                <option value="Not vaccinated">Not vaccinated</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="HealthCondition" className="block text-sm font-medium text-gray-700 mb-2">
                Health Condition
              </label>
              <textarea
                id="HealthCondition"
                name="HealthCondition"
                value={livestock.HealthCondition || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter current health condition, any medical notes, etc."
              />
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Updating..." : "Update Livestock"}
            </button>
            <button type="button" onClick={() => router.push("/owner/livestock")} className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
