import { apiService } from "./api";
import { Medicine } from "@/types";

export class MedicineService {
  async getAllMedicines(): Promise<Medicine[]> {
    return apiService.get<Medicine[]>("/api/medicine");
  }

  async getMedicineById(id: number): Promise<Medicine> {
    return apiService.get<Medicine>(`/api/medicine/${id}`);
  }

  async getMedicinesByUserId(userId: number): Promise<Medicine[]> {
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
}

export const medicineService = new MedicineService();
