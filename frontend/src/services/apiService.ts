import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// API Base URL - Updated to port 5001
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
              const response = await axios.post(
                `${API_BASE_URL}/auth/refresh`,
                {
                  refreshToken,
                }
              );

              const { accessToken, refreshToken: newRefreshToken } =
                response.data.data;

              localStorage.setItem("accessToken", accessToken);
              localStorage.setItem("refreshToken", newRefreshToken);

              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api(config);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // HTTP Methods
  async get<T>(url: string, params?: any): Promise<T> {
    return this.request<T>({ method: "GET", url, params });
  }

  async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: "POST", url, data });
  }

  async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: "PUT", url, data });
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>({ method: "DELETE", url });
  }

  // File upload method
  async uploadFile<T>(
    url: string,
    file: File,
    additionalData?: any
  ): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.request<T>({
      method: "POST",
      url,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || "An error occurred";
      const newError = new Error(message);
      (newError as any).status = error.response.status;
      (newError as any).errors = error.response.data?.errors;
      return newError;
    } else if (error.request) {
      // Request was made but no response received
      return new Error("Network error - please check your connection");
    } else {
      // Something else happened
      return new Error(error.message || "An unexpected error occurred");
    }
  }

  // Utility methods
  setAuthToken(token: string): void {
    localStorage.setItem("accessToken", token);
  }

  removeAuthToken(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  getAuthToken(): string | null {
    return localStorage.getItem("accessToken");
  }
}

export const apiService = new ApiService();
export default apiService;
