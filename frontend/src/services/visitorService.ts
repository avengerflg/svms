import { apiService } from "./apiService";
import {
  ApiResponse,
  Visitor,
  VisitorFormData,
  PaginationData,
} from "../types";

export const visitorService = {
  // Create new visitor
  async createVisitor(visitorData: VisitorFormData): Promise<Visitor> {
    const response = await apiService.post<ApiResponse<{ visitor: Visitor }>>(
      "/visitors",
      visitorData
    );

    if (response.success && response.data) {
      return response.data.visitor;
    }

    throw new Error(response.message || "Failed to create visitor");
  },

  // Get all visitors with pagination
  async getVisitors(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginationData<Visitor>> {
    const response = await apiService.get<
      ApiResponse<{ visitors: Visitor[]; pagination: any }>
    >("/visitors", params);

    if (response.success && response.data) {
      return {
        items: response.data.visitors,
        pagination: response.data.pagination,
      };
    }

    throw new Error(response.message || "Failed to fetch visitors");
  },

  // Get visitor by ID
  async getVisitorById(id: string): Promise<Visitor> {
    const response = await apiService.get<ApiResponse<{ visitor: Visitor }>>(
      `/visitors/${id}`
    );

    if (response.success && response.data) {
      return response.data.visitor;
    }

    throw new Error(response.message || "Failed to fetch visitor");
  },

  // Approve visitor
  async approveVisitor(id: string): Promise<Visitor> {
    const response = await apiService.put<ApiResponse<{ visitor: Visitor }>>(
      `/visitors/${id}/approve`
    );

    if (response.success && response.data) {
      return response.data.visitor;
    }

    throw new Error(response.message || "Failed to approve visitor");
  },

  // Check in visitor
  async checkInVisitor(id: string): Promise<Visitor> {
    const response = await apiService.put<ApiResponse<{ visitor: Visitor }>>(
      `/visitors/${id}/checkin`
    );

    if (response.success && response.data) {
      return response.data.visitor;
    }

    throw new Error(response.message || "Failed to check in visitor");
  },

  // Check out visitor
  async checkOutVisitor(id: string): Promise<Visitor> {
    const response = await apiService.put<ApiResponse<{ visitor: Visitor }>>(
      `/visitors/${id}/checkout`
    );

    if (response.success && response.data) {
      return response.data.visitor;
    }

    throw new Error(response.message || "Failed to check out visitor");
  },

  // Blacklist visitor
  async blacklistVisitor(id: string, reason: string): Promise<Visitor> {
    const response = await apiService.put<ApiResponse<{ visitor: Visitor }>>(
      `/visitors/${id}/blacklist`,
      { reason }
    );

    if (response.success && response.data) {
      return response.data.visitor;
    }

    throw new Error(response.message || "Failed to blacklist visitor");
  },
};
