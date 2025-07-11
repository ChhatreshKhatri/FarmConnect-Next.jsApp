import { apiService } from "./api";
import { User, LoginRequest, AuthResponse } from "@/types";

export class AuthService {
  async register(user: User): Promise<AuthResponse> {
    return apiService.post<AuthResponse>("/api/register", user);
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>("/api/login", credentials);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      // Also remove the cookie
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }

  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      // Also set as HTTP-only cookie for middleware access
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
    }
  }

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Check if token is expired
    if (this.isTokenExpired(token)) {
      this.logout(); // Auto-logout if expired
      return false;
    }

    return true;
  }

  isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || this.getToken();
    if (!tokenToCheck) return true;

    try {
      const payload = JSON.parse(atob(tokenToCheck.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      // Check if token has 'exp' field (standard JWT expiration)
      if (payload.exp) {
        return payload.exp < currentTime;
      }

      // Check if token has 'iat' field and calculate 30-minute expiration
      if (payload.iat) {
        const tokenAge = currentTime - payload.iat;
        const thirtyMinutes = 30 * 60; // 30 minutes in seconds
        return tokenAge > thirtyMinutes;
      }

      // If no expiration info, assume expired for security
      return true;
    } catch {
      return true;
    }
  }

  getTokenTimeRemaining(): number {
    const token = this.getToken();
    if (!token) return 0;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      // Check if token has 'exp' field (standard JWT expiration)
      if (payload.exp) {
        return Math.max(0, payload.exp - currentTime);
      }

      // Check if token has 'iat' field and calculate remaining time from 30 minutes
      if (payload.iat) {
        const tokenAge = currentTime - payload.iat;
        const thirtyMinutes = 30 * 60; // 30 minutes in seconds
        return Math.max(0, thirtyMinutes - tokenAge);
      }

      return 0;
    } catch {
      return 0;
    }
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || null;
    } catch {
      return null;
    }
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      // Try different possible field names for user ID
      const candidateFields = [
        "userId", // Primary field from backend
        "UserId",
        "user_id",
        "nameid",
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
        "sub",
        "id",
      ];

      for (const fieldName of candidateFields) {
        const fieldValue = payload[fieldName];
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== "") {
          const numericId = typeof fieldValue === "string" ? parseInt(fieldValue, 10) : fieldValue;
          if (!isNaN(numericId) && numericId > 0) {
            return numericId;
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.unique_name || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || payload.name || payload.sub || payload.email || null;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
