import { apiService } from "./apiService";
import { ApiResponse, User, LoginFormData, RegisterFormData } from "../types";

export const authService = {
  // Login user
  async login(
    credentials: LoginFormData
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const response = await apiService.post<
      ApiResponse<{ user: User; accessToken: string; refreshToken: string }>
    >("/auth/login", credentials);

    if (response.success && response.data) {
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      return response.data;
    }

    throw new Error(response.message || "Login failed");
  },

  // Register new user
  async register(
    userData: RegisterFormData
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const response = await apiService.post<
      ApiResponse<{ user: User; accessToken: string; refreshToken: string }>
    >("/auth/register", userData);

    if (response.success && response.data) {
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      return response.data;
    }

    throw new Error(response.message || "Registration failed");
  },

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<ApiResponse<{ user: User }>>(
      "/auth/me"
    );

    if (response.success && response.data) {
      return response.data.user;
    }

    throw new Error(response.message || "Failed to get user profile");
  },

  // Change password
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const response = await apiService.put<ApiResponse<null>>(
      "/auth/change-password",
      {
        currentPassword,
        newPassword,
      }
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to change password");
    }
  },

  // Logout user
  logout(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem("accessToken");
    return !!token;
  },

  // Get stored user data
  getStoredUser(): User | null {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  },

  // Store user data
  storeUser(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
  },
};
