"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { livestockService } from "@/services/livestock";
import { Livestock } from "@/types";
import Link from "next/link";

export default function CreateLivestock() {
  const { userId, userRole } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<Omit<Livestock, "LivestockId">>({
    Name: "",
    Species: "",
    Age: 0,
    Breed: "",
    HealthCondition: "",
    Location: "",
    VaccinationStatus: "",
    UserId: userId || 0,
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "Age" ? parseInt(value) || 0 : value,
    });
  };

  const isFieldInvalid = (field: keyof typeof formData): boolean => {
    if (!formSubmitted) return false;
    const value = formData[field];
    return !value || (typeof value === "string" && value.trim() === "") || (typeof value === "number" && value <= 0);
  };

  const isFormValid = (): boolean => {
    return formData.Name.trim() !== "" && formData.Species.trim() !== "" && formData.Age > 0 && formData.Breed.trim() !== "" && formData.HealthCondition?.trim() !== "" && formData.Location.trim() !== "" && formData.VaccinationStatus?.trim() !== "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (!isFormValid()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const livestockData: Livestock = {
        LivestockId: 0,
        Name: formData.Name,
        Species: formData.Species,
        Age: formData.Age,
        Breed: formData.Breed,
        HealthCondition: formData.HealthCondition,
        Location: formData.Location,
        VaccinationStatus: formData.VaccinationStatus,
        UserId: userId || 0,
      };
      await livestockService.addLivestock(livestockData);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create livestock");
    } finally {
      setLoading(false);
    }
  };

  const handleOk = () => {
    router.push("/owner/livestock");
  };

  if (userRole !== "Owner") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to livestock owners.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Create New Livestock</h1>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Name"
                value={formData.Name}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 font-medium text-base placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isFieldInvalid("Name") ? "border-red-300" : "border-gray-300"}`}
                placeholder="Livestock name"
              />
              {isFieldInvalid("Name") && <p className="mt-1 text-sm font-semibold text-red-600">Name is required</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900">
                Species <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Species"
                value={formData.Species}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${isFieldInvalid("Species") ? "border-red-300" : "border-gray-300"}`}
                placeholder="Species"
              />
              {isFieldInvalid("Species") && <p className="mt-1 text-sm text-red-600">Species is required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="Age"
                value={formData.Age || ""}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${isFieldInvalid("Age") ? "border-red-300" : "border-gray-300"}`}
                placeholder="Age"
                min="1"
              />
              {isFieldInvalid("Age") && <p className="mt-1 text-sm text-red-600">Age is required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Breed <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Breed"
                value={formData.Breed}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${isFieldInvalid("Breed") ? "border-red-300" : "border-gray-300"}`}
                placeholder="Breed"
              />
              {isFieldInvalid("Breed") && <p className="mt-1 text-sm text-red-600">Breed is required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Health Condition <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="HealthCondition"
                value={formData.HealthCondition || ""}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${isFieldInvalid("HealthCondition") ? "border-red-300" : "border-gray-300"}`}
                placeholder="Health condition"
              />
              {isFieldInvalid("HealthCondition") && <p className="mt-1 text-sm text-red-600">Health condition is required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Location"
                value={formData.Location}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${isFieldInvalid("Location") ? "border-red-300" : "border-gray-300"}`}
                placeholder="Location"
              />
              {isFieldInvalid("Location") && <p className="mt-1 text-sm text-red-600">Location is required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Vaccination Status <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="VaccinationStatus"
                value={formData.VaccinationStatus || ""}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${isFieldInvalid("VaccinationStatus") ? "border-red-300" : "border-gray-300"}`}
                placeholder="Vaccination status"
              />
              {isFieldInvalid("VaccinationStatus") && <p className="mt-1 text-sm text-red-600">Vaccination status is required</p>}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : "Create Livestock"}
            </button>

            <div className="text-center">
              <Link href="/owner/livestock" className="text-sm text-blue-600 hover:text-blue-500">
                Back to Livestock List
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Successfully Created!</h3>
            <p className="mt-2 text-sm text-gray-600">Livestock has been created successfully.</p>
            <button onClick={handleOk} className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
