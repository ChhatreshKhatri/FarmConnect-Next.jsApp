"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { medicineService } from "@/services/medicine";
import { Medicine } from "@/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";

export default function CreateMedicine() {
  const { userId, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [medicine, setMedicine] = useState<Omit<Medicine, "MedicineId">>({
    MedicineName: "",
    Brand: "",
    Category: "",
    Description: "",
    Quantity: 0,
    Unit: "",
    PricePerUnit: 0,
    Image: "",
    UserId: userId || 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMedicine((prev) => ({
      ...prev,
      [name]: name === "Quantity" || name === "PricePerUnit" ? Number(value) : value,
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

      // Validate quantity
      if (medicine.Quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
      }

      // Validate price
      if (medicine.PricePerUnit <= 0) {
        throw new Error("Price must be greater than 0");
      }

      const medicineData = {
        MedicineId: 0, // Will be set by the server
        ...medicine,
        UserId: userId,
      };

      await medicineService.addMedicine(medicineData);
      setSuccess(true);

      // Reset form
      setMedicine({
        MedicineName: "",
        Brand: "",
        Category: "",
        Description: "",
        Quantity: 0,
        Unit: "",
        PricePerUnit: 0,
        Image: "",
        UserId: userId,
      });

      // Redirect after success
      setTimeout(() => {
        router.push("/supplier/medicine");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create medicine");
    } finally {
      setLoading(false);
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
          <p className="text-gray-600">This page is only accessible to suppliers.</p>

          <div className="mt-4 space-x-4">
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

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-green-800 mb-2">Medicine Created Successfully!</h2>
          <p className="text-green-700 mb-4">Your medicine has been added to the inventory.</p>
          <Link href="/supplier/medicine" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            View My Medicines
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add New Medicine</h1>
          <Link href="/supplier/medicine" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            ← Back to Medicines
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
              <label htmlFor="MedicineName" className="block text-sm font-medium text-gray-700 mb-2">
                Medicine Name *
              </label>
              <input type="text" id="MedicineName" name="MedicineName" value={medicine.MedicineName} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter medicine name" />
            </div>

            <div>
              <label htmlFor="Brand" className="block text-sm font-medium text-gray-700 mb-2">
                Brand *
              </label>
              <input type="text" id="Brand" name="Brand" value={medicine.Brand} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter brand name" />
            </div>

            <div>
              <label htmlFor="Category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select id="Category" name="Category" value={medicine.Category} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select category</option>
                <option value="Antibiotic">Antibiotic</option>
                <option value="Vaccine">Vaccine</option>
                <option value="Vitamin">Vitamin</option>
                <option value="Painkiller">Painkiller</option>
                <option value="Antiseptic">Antiseptic</option>
                <option value="Dewormer">Dewormer</option>
                <option value="Hormone">Hormone</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="Quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input type="number" id="Quantity" name="Quantity" value={medicine.Quantity} onChange={handleInputChange} required min="1" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="1" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="Description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea id="Description" name="Description" value={medicine.Description} onChange={handleInputChange} required rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter medicine description" />
            </div>

            <div>
              <label htmlFor="Unit" className="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <select id="Unit" name="Unit" value={medicine.Unit} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select unit</option>
                <option value="ml">ml</option>
                <option value="mg">mg</option>
                <option value="tablets">tablets</option>
                <option value="vials">vials</option>
                <option value="bottles">bottles</option>
                <option value="packets">packets</option>
                <option value="doses">doses</option>
              </select>
            </div>

            <div>
              <label htmlFor="PricePerUnit" className="block text-sm font-medium text-gray-700 mb-2">
                Price Per Unit ($) *
              </label>
              <input type="number" id="PricePerUnit" name="PricePerUnit" value={medicine.PricePerUnit} onChange={handleInputChange} required min="0" step="0.01" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
            </div>

            <div className="md:col-span-2">
              <ImageUpload label="Medicine Image" value={medicine.Image} onChange={(base64) => setMedicine((prev) => ({ ...prev, Image: base64 }))} placeholder="Upload medicine image" />
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button type="submit" disabled={loading || medicine.Quantity <= 0 || medicine.PricePerUnit <= 0} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Creating..." : medicine.Quantity <= 0 ? "Enter Valid Quantity" : medicine.PricePerUnit <= 0 ? "Enter Valid Price" : "Create Medicine"}
            </button>
            <button type="button" onClick={() => router.push("/supplier/medicine")} className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
