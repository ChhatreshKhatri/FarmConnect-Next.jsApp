import { apiService } from "./api";
import { Feed } from "@/types";

export class FeedService {
  async getAllFeeds(): Promise<Feed[]> {
    return apiService.get<Feed[]>("/api/feed");
  }

  async getFeedById(id: number): Promise<Feed> {
    return apiService.get<Feed>(`/api/feed/${id}`);
  }

  async getFeedsByUserId(userId: number): Promise<Feed[]> {
    try {
      return await apiService.get<Feed[]>(`/api/feed/user/${userId}`);
    } catch (error) {
      // Handle the case where no feeds are found - this should return empty array, not error
      if (error instanceof Error && error.message.includes("Cannot find any feeds for this user")) {
        return [];
      }
      // Re-throw other actual errors
      throw error;
    }
  }

  async addFeed(feed: Feed): Promise<string> {
    return apiService.post<string>("/api/feed", feed);
  }

  async updateFeed(id: number, feed: Feed): Promise<string> {
    return apiService.put<string>(`/api/feed/${id}`, feed);
  }

  async deleteFeed(id: number): Promise<string> {
    return apiService.delete<string>(`/api/feed/${id}`);
  }
}

export const feedService = new FeedService();
