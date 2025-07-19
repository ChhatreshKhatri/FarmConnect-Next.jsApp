"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { medicineService } from "@/services/medicine";
import { Medicine } from "@/types";
import Link from "next/link";
import ImageDisplay from "@/components/ImageDisplay";

export default function SupplierMedicine() {
  const { userId, userRole, loading: authLoading } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [totalSold, setTotalSold] = useState<{ [key: number]: number }>({});

  const loadMedicines = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      if (userId) {
        const data = await medicineService.getMedicinesByUserId(userId);
        setMedicines(data);

        // Fetch total sold for each medicine
        const soldData: { [key: number]: number } = {};
        await Promise.all(
          data.map(async (medicine) => {
            if (medicine.MedicineId) {
              try {
                const sold = await medicineService.getTotalSoldByMedicineId(medicine.MedicineId);
                soldData[medicine.MedicineId] = sold;
              } catch {
                soldData[medicine.MedicineId] = 0;
              }
            }
          })
        );
        setTotalSold(soldData);
      } else {
        setMedicines([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load medicines");
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!authLoading) {
      if (userId && userRole === "Supplier") {
        loadMedicines();
      } else {
        setLoading(false);
      }
    }
  }, [userId, userRole, authLoading, loadMedicines]);

  // Emergency fallback - if we're authenticated as Supplier but still loading after auth completes
  useEffect(() => {
    if (!authLoading && userRole === "Supplier" && userId && loading) {
      const emergencyTimeout = setTimeout(() => {
        setLoading(false);
        setMedicines([]);
      }, 3000);

      return () => clearTimeout(emergencyTimeout);
    }
  }, [authLoading, userRole, userId, loading]);

  const handleDelete = async (id: number) => {
    try {
      await medicineService.deleteMedicine(id);
      setMedicines(medicines.filter((m) => m.MedicineId !== id));
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete medicine");
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

  // Show loading while fetching medicines
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Medicines</h1>
          <Link href="/supplier/medicine/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
            Add New Medicine
          </Link>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading medicines...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Medicines</h1>
        <Link href="/supplier/medicine/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200">
          + Add New Medicine
        </Link>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {medicines.length === 0 ? (
        <div className="text-center py-12 bg-white shadow-lg rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">💊</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Medicines Yet</h2>
          <p className="text-gray-500 text-lg mb-6">Start adding your medicine products to reach customers.</p>
          <Link href="/supplier/medicine/create" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200">
            Add Your First Medicine
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {medicines.map((medicine) => {
            const totalSoldAmount = totalSold[medicine.MedicineId || 0] || 0;
            const isOutOfStock = medicine.Quantity === 0;

            return (
              <div key={medicine.MedicineId} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{medicine.MedicineName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-blue-600">💊 {medicine.Brand}</span>
                      </div>
                    </div>
                    {isOutOfStock ? <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">Out of Stock</span> : <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">In Stock</span>}
                  </div>
                </div>

                {/* Image Section */}
                <div className="relative">
                  <ImageDisplay src={medicine.Image} alt={medicine.MedicineName} className="w-full h-48 object-cover" fallbackText="No medicine image" />
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-4">
                  {/* Category Info */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-700">📋 Category:</span>
                      <span className="text-sm font-semibold text-gray-900">{medicine.Category}</span>
                    </div>
                    <p className="text-sm text-gray-700">{medicine.Description}</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-blue-600">${medicine.PricePerUnit}</div>
                      <div className="text-xs text-gray-600">per {medicine.Unit}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-purple-600">{totalSoldAmount}</div>
                      <div className="text-xs text-gray-600">Total Sold</div>
                    </div>
                  </div>

                  {/* Stock Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Stock:</span>
                      <span className={`text-sm font-medium ${isOutOfStock ? "text-red-600" : "text-gray-900"}`}>
                        {isOutOfStock ? "0" : medicine.Quantity} {medicine.Unit}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t">
                    <div className="flex gap-2">
                      <Link href={`/supplier/medicine/edit/${medicine.MedicineId}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-center">
                        ✏️ Edit
                      </Link>
                      {isOutOfStock ? (
                        <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">📦 Restock</button>
                      ) : (
                        <button onClick={() => setDeleteId(medicine.MedicineId || 0)} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
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

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Medicine</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this medicine? This action cannot be undone.</p>
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
