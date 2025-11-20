/**
 * API Client Utility for secure frontend-backend communication
 * Handles authentication, error handling, and security best practices
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface FetchOptions extends RequestInit {
  timeout?: number;
  skipAuth?: boolean;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get auth token from localStorage
   * @returns JWT token or null
   */
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("authToken");
  }

  /**
   * Remove auth token (logout)
   */
  private clearAuthToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    // Clear auth cookie
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  }

  /**
   * Make a fetch request with security enhancements
   */
  private async fetchWithTimeout(
    url: string,
    options: FetchOptions = {},
    timeout: number = 30000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Make an API request
   */
  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = new Headers(options.headers || {});

      // Add Content-Type if not present
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      // Add authentication header if token exists and not skipped
      if (!options.skipAuth) {
        const token = this.getAuthToken();
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }

      const timeout = options.timeout || 30000;
      const response = await this.fetchWithTimeout(
        url,
        {
          ...options,
          headers,
        },
        timeout
      );

      // Handle unauthorized - token may have expired
      if (response.status === 401) {
        this.clearAuthToken();
        // You can emit an event or redirect here if needed
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth:logout"));
        }
      }

      // Try to parse response as JSON
      let data;
      try {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          data = await response.json();
        } else {
          data = await response.text();
        }
      } catch {
        data = null;
      }

      return {
        data: response.ok ? data : undefined,
        error: !response.ok ? data?.message || "An error occurred" : undefined,
        message: data?.message,
        statusCode: response.status,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Network error occurred";
      return {
        error: message,
        statusCode: 0,
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "GET",
      ...options,
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: Record<string, unknown>,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: Record<string, unknown>,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      ...options,
    });
  }

  /**
   * Set new base URL
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Get current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

export default apiClient;
