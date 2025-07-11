import { apiService } from "./api";
import { Livestock } from "@/types";

export class LivestockService {
  async getAllLivestock(): Promise<Livestock[]> {
    return apiService.get<Livestock[]>("/api/livestock");
  }

  async getLivestockById(id: number): Promise<Livestock> {
    return apiService.get<Livestock>(`/api/livestock/${id}`);
  }

  async getLivestockByUserId(userId: number): Promise<Livestock[]> {
    return apiService.get<Livestock[]>(`/api/livestock/user/${userId}`);
  }

  async addLivestock(livestock: Livestock): Promise<string> {
    return apiService.post<string>("/api/livestock", livestock);
  }

  async updateLivestock(id: number, livestock: Livestock): Promise<string> {
    return apiService.put<string>(`/api/livestock/${id}`, livestock);
  }

  async deleteLivestock(id: number): Promise<string> {
    return apiService.delete<string>(`/api/livestock/${id}`);
  }

  async getLivestockRequests(): Promise<Livestock[]> {
    return apiService.get<Livestock[]>("/api/livestock/requests");
  }
}

export const livestockService = new LivestockService();
