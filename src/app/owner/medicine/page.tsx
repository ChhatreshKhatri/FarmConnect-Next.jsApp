"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { medicineService } from "@/services/medicine";
import { Medicine } from "@/types";
import Link from "next/link";
import ImageDisplay from "@/components/ImageDisplay";

export default function OwnerMedicine() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMedicines = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await medicineService.getAllMedicines();
      setMedicines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load medicines");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadMedicines();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, loadMedicines]);

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
          <p className="text-gray-600 mb-4">Please log in to browse medicines.</p>
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
        <h1 className="text-3xl font-bold text-gray-900">Browse Medicines</h1>
        <div className="text-sm text-gray-500">Available: {medicines.length} medicine(s)</div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {medicines.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No medicines available</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicines.map((medicine) => (
            <div key={medicine.MedicineId} className="bg-white rounded-lg shadow-md overflow-hidden">
              <ImageDisplay src={medicine.Image} alt={medicine.MedicineName} className="w-full h-48 object-cover" fallbackText="No medicine image" />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{medicine.MedicineName}</h3>
                <p className="text-gray-600 mb-2">Brand: {medicine.Brand}</p>
                <p className="text-gray-600 mb-2">Category: {medicine.Category}</p>
                <p className="text-gray-600 mb-4">{medicine.Description}</p>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-lg font-bold text-green-600">${medicine.PricePerUnit}</span>
                    <span className="text-gray-500 text-sm">/{medicine.Unit}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Available: {medicine.Quantity} {medicine.Unit}
                  </div>
                </div>

                <Link href={`/owner/request/medicine/${medicine.MedicineId}`} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-200 text-center block">
                  Request Medicine
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
