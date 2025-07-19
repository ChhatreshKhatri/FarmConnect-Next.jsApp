import { apiService } from "./api";
import { Medicine } from "@/types";

interface RequestData {
  MedicineId?: number;
  FeedId?: number;
  Status: string;
  Quantity: number;
}

export class MedicineService {
  async getAllMedicines(): Promise<Medicine[]> {
    return apiService.get<Medicine[]>("/api/medicine");
  }

  async getMedicineById(id: number): Promise<Medicine> {
    return apiService.get<Medicine>(`/api/medicine/${id}`);
  }

  async getMedicinesByUserId(userId: string): Promise<Medicine[]> {
    try {
      return await apiService.get<Medicine[]>(`/api/medicine/user/${userId}`);
    } catch (error) {
      // Handle the case where no medicines are found - this should return empty array, not error
      if (error instanceof Error && error.message.includes("Cannot find any medicines for this user")) {
        return [];
      }
      // Re-throw other actual errors
      throw error;
    }
  }

  async addMedicine(medicine: Medicine): Promise<string> {
    return apiService.post<string>("/api/medicine", medicine);
  }

  async updateMedicine(id: number, medicine: Medicine): Promise<string> {
    return apiService.put<string>(`/api/medicine/${id}`, medicine);
  }

  async deleteMedicine(id: number): Promise<string> {
    return apiService.delete<string>(`/api/medicine/${id}`);
  }

  async getTotalSoldByMedicineId(medicineId: number): Promise<number> {
    try {
      // Get all requests for this medicine that are approved
      const allRequests = await apiService.get<RequestData[]>("/api/request");
      const approvedRequests = allRequests.filter((request) => request.MedicineId === medicineId && request.Status === "Approved");

      // Sum up the quantities
      return approvedRequests.reduce((total, request) => total + request.Quantity, 0);
    } catch (error) {
      console.error("Failed to calculate total sold:", error);
      return 0;
    }
  }
}

export const medicineService = new MedicineService();
