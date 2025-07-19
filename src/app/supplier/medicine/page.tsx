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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Medicines</h1>
        <Link href="/supplier/medicine/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200">
          + Add New Medicine
        </Link>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {medicines.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">You haven&apos;t added any medicines yet</div>
          <Link href="/supplier/medicine/create" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200">
            Add Your First Medicine
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {medicines.map((medicine) => {
                  const totalSoldAmount = totalSold[medicine.MedicineId || 0] || 0;
                  const isOutOfStock = medicine.Quantity === 0;
                  return (
                    <tr key={medicine.MedicineId} className={isOutOfStock ? "bg-red-50" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ImageDisplay src={medicine.Image} alt={medicine.MedicineName} className="h-12 w-12 rounded-lg object-cover mr-4" fallbackText="No Image" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{medicine.MedicineName}</div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">{medicine.Description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.Brand}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.Category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-bold text-green-600">${medicine.PricePerUnit}</span>
                        <span className="text-gray-500">/{medicine.Unit}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {isOutOfStock ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Out of Stock</span>
                        ) : (
                          <span className="text-gray-900">
                            {medicine.Quantity} {medicine.Unit}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {totalSoldAmount} {medicine.Unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link href={`/supplier/medicine/edit/${medicine.MedicineId}`} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition duration-200">
                          Edit
                        </Link>
                        {isOutOfStock ? (
                          <span className="bg-orange-500 text-white px-3 py-1 rounded text-xs">Refill</span>
                        ) : (
                          <button onClick={() => setDeleteId(medicine.MedicineId || 0)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition duration-200">
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
            {medicines.map((medicine) => {
              const totalSoldAmount = totalSold[medicine.MedicineId || 0] || 0;
              const isOutOfStock = medicine.Quantity === 0;
              return (
                <div key={medicine.MedicineId} className={`bg-white rounded-lg shadow-md overflow-hidden ${isOutOfStock ? "border-l-4 border-red-500" : ""}`}>
                  <ImageDisplay src={medicine.Image} alt={medicine.MedicineName} className="w-full h-48 object-cover" fallbackText="No medicine image" />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{medicine.MedicineName}</h3>
                      {isOutOfStock && <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Out of Stock</span>}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">Brand: {medicine.Brand}</p>
                    <p className="text-gray-600 text-sm mb-2">Category: {medicine.Category}</p>
                    <p className="text-gray-600 text-sm mb-3">{medicine.Description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <div>
                          <span className="font-bold text-green-600">${medicine.PricePerUnit}</span>
                          <span className="text-gray-500">/{medicine.Unit}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Stock:</span>
                        <div className="text-gray-900">{isOutOfStock ? "Out of Stock" : `${medicine.Quantity} ${medicine.Unit}`}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Sold:</span>
                        <div className="text-gray-900">
                          {totalSoldAmount} {medicine.Unit}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Link href={`/supplier/medicine/edit/${medicine.MedicineId}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-center text-sm transition duration-200">
                        Edit
                      </Link>
                      {isOutOfStock ? (
                        <span className="flex-1 bg-orange-500 text-white py-2 px-4 rounded text-center text-sm">Refill</span>
                      ) : (
                        <button onClick={() => setDeleteId(medicine.MedicineId || 0)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm transition duration-200">
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
