import { apiService } from "./api";
import { Feedback } from "@/types";

export class FeedbackService {
  async getAllFeedback(): Promise<Feedback[]> {
    return apiService.get<Feedback[]>("/api/feedback");
  }

  async getFeedbackById(id: number): Promise<Feedback> {
    return apiService.get<Feedback>(`/api/feedback/${id}`);
  }

  async getFeedbackByUserId(userId: number): Promise<Feedback[]> {
    try {
      return await apiService.get<Feedback[]>(`/api/feedback/user/${userId}`);
    } catch (error) {
      // Handle the case where no feedback is found - return empty array
      if (error instanceof Error && error.message.includes("no feedback found")) {
        return [];
      }
      throw error;
    }
  }

  async addFeedback(feedback: Feedback): Promise<string> {
    return apiService.post<string>("/api/feedback", feedback);
  }

  async deleteFeedback(id: number): Promise<string> {
    return apiService.delete<string>(`/api/feedback/${id}`);
  }
}

export const feedbackService = new FeedbackService();
