class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  }

  private checkTokenExpiration(): boolean {
    if (typeof window === "undefined") return false;

    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
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

      return true; // Assume expired if no timing info
    } catch {
      return true; // Assume expired if token is malformed
    }
  }

  private handleTokenExpiration(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // Only redirect if not already on login/register/home pages and not in a redirect loop
      const currentPath = window.location.pathname;
      const isPublicPage = currentPath === "/login" || currentPath === "/register" || currentPath === "/";

      if (!isPublicPage && !sessionStorage.getItem("redirecting")) {
        sessionStorage.setItem("redirecting", "true");
        setTimeout(() => {
          sessionStorage.removeItem("redirecting");
          window.location.href = "/login";
        }, 100);
      }
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Check token expiration before making request
    if (this.checkTokenExpiration()) {
      this.handleTokenExpiration();
      throw new Error("Session expired. Please log in again.");
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const fullUrl = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(fullUrl, config);

      if (!response.ok) {
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          this.handleTokenExpiration();
          throw new Error("Session expired. Please log in again.");
        }

        const errorText = await response.text();

        // Handle 404 for "not found" cases - these might be normal empty states
        if (response.status === 404) {
          try {
            const errorData = JSON.parse(errorText);
            // Check if it's a "not found" message that should return empty array
            if (errorData.message && errorData.message.toLowerCase().includes("no") && (errorData.message.toLowerCase().includes("found") || errorData.message.toLowerCase().includes("exist"))) {
              return [] as T; // Return empty array for collection endpoints
            }
          } catch {
            // If parsing fails, treat as regular error
          }
        }

        // Try to parse JSON error response for actual errors
        try {
          const errorData = JSON.parse(errorText);
          const errorMessage = errorData.message || errorData.error || errorData.title || errorText;
          throw new Error(errorMessage);
        } catch {
          // If not valid JSON, use the original error text
          throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return data;
      } else {
        const data = response.text() as T;
        return data;
      }
    } catch (error) {
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiService = new ApiService();
