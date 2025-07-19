import { apiService } from "./api";
import { Request } from "@/types";

export class RequestService {
  async getAllRequests(): Promise<Request[]> {
    return apiService.get<Request[]>("/api/request");
  }

  async getRequestById(id: number): Promise<Request> {
    return apiService.get<Request>(`/api/request/${id}`);
  }

  async getRequestsByUserId(userId: string): Promise<Request[]> {
    try {
      return await apiService.get<Request[]>(`/api/request/user/${userId}`);
    } catch (error) {
      // Handle the case where no requests are found - this should return empty array, not error
      if (error instanceof Error && error.message.includes("Cannot find any requests for this user")) {
        return [];
      }
      // Re-throw other actual errors
      throw error;
    }
  }

  async addRequest(request: Request): Promise<string> {
    return apiService.post<string>("/api/request", request);
  }

  async updateRequest(id: number, request: Request): Promise<string> {
    return apiService.put<string>(`/api/request/${id}`, request);
  }

  async deleteRequest(id: number): Promise<string> {
    return apiService.delete<string>(`/api/request/${id}`);
  }
}

export const requestService = new RequestService();
