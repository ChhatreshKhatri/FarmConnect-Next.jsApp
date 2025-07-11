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

  console.log("🏥 SupplierMedicine render:", { userId, userRole, authLoading, loading });

  const loadMedicines = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      if (userId) {
        const data = await medicineService.getMedicinesByUserId(userId);
        setMedicines(data);
      } else {
        setMedicines([]);
      }
    } catch (err) {
      // Only log actual unexpected errors, not empty states
      console.log("🏥 Issue loading medicines:", err instanceof Error ? err.message : "Unknown error");
      setError(err instanceof Error ? err.message : "Failed to load medicines");
      // Even if there's an error, we should still show the page with the error message
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
      console.log("🏥 Emergency fallback: Force showing page after 3 seconds");
      const emergencyTimeout = setTimeout(() => {
        console.log("🏥 Emergency: Stopping loading and showing empty state");
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
        <Link href="/supplier/medicine/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-center">
          Add New Medicine
        </Link>
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {medicines.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No medicines found.</p>
          <Link href="/supplier/medicine/create" className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200">
            Add Your First Medicine
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile Card View (visible on small screens) */}
          <div className="block sm:hidden space-y-4">
            {medicines.map((medicine, index) => (
              <div key={medicine.MedicineId} className="bg-white shadow-lg rounded-lg p-4 border">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{medicine.MedicineName}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">#{index + 1}</span>
                </div>

                <div className="flex mb-3">
                  <ImageDisplay src={medicine.Image} alt={medicine.MedicineName} className="w-20 h-20 object-cover rounded-lg mr-4" fallbackText="No image" />
                  <div className="flex-1 grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Brand:</span>
                      <div className="text-gray-900">{medicine.Brand}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Category:</span>
                      <div className="text-gray-900">{medicine.Category}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <span className="font-medium text-gray-700">Quantity:</span>
                    <div className="text-gray-900">{medicine.Quantity}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Unit:</span>
                    <div className="text-gray-900">{medicine.Unit}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Price:</span>
                    <div className="text-gray-900 text-lg font-semibold">${medicine.PricePerUnit}</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/supplier/medicine/edit/${medicine.MedicineId}`} className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-center hover:bg-green-700 transition duration-200 text-sm">
                    Edit
                  </Link>
                  <button onClick={() => setDeleteId(medicine.MedicineId || 0)} className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition duration-200 text-sm">
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
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Image</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Brand</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Category</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Quantity</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Unit</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Price</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {medicines.map((medicine, index) => (
                    <tr key={medicine.MedicineId} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <ImageDisplay src={medicine.Image} alt={medicine.MedicineName} className="w-16 h-16 object-cover rounded-lg" fallbackText="No image" />
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.MedicineName}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.Brand}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.Category}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.Quantity}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.Unit}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">${medicine.PricePerUnit}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link href={`/supplier/medicine/edit/${medicine.MedicineId}`} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition duration-200">
                          Edit
                        </Link>
                        <button onClick={() => setDeleteId(medicine.MedicineId || 0)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition duration-200">
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
