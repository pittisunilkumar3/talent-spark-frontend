import apiClient from './api';
import axios from 'axios';

// Types
export interface PermissionCategory {
  id: number;
  perm_group_id: number;
  name: string;
  short_code: string;
  description: string;
  enable_view: boolean;
  enable_add: boolean;
  enable_edit: boolean;
  enable_delete: boolean;
  is_system: boolean;
  is_active: boolean;
  display_order: number;
}

export interface PermissionGroup {
  id: number;
  name: string;
  short_code: string;
  description: string;
  is_system: boolean;
  is_active: boolean;
  created_by: number;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  CreatedBy: {
    id: number;
    first_name: string;
    last_name: string;
    employee_id: string;
  };
  UpdatedBy: any | null;
  PermissionCategories: PermissionCategory[];
  // For backward compatibility
  categories?: PermissionCategory[];
}

export interface PermissionGroupsResponse {
  success: boolean;
  data: PermissionGroup[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface PermissionGroupQueryParams {
  page?: number;
  limit?: number;
  is_active?: boolean;
  is_system?: boolean;
  search?: string;
}

// Permission service
export const permissionService = {
  // Get all permission groups with categories
  getPermissionGroupsWithCategories: async (params: PermissionGroupQueryParams = {}): Promise<PermissionGroupsResponse> => {
    try {
      console.log('Fetching permission groups with params:', params);
      console.log('API client base URL:', apiClient.defaults.baseURL);

      // Make sure we're using the correct endpoint
      console.log('Calling API endpoint: /permission-groups-with-categories');
      const response = await apiClient.get('/permission-groups-with-categories', { params });
      console.log('Raw API response:', response);

      // Return the raw response data
      return response.data;
    } catch (error) {
      console.error('API error in getPermissionGroupsWithCategories:', error);
      throw error;
    }
  },
};

export default permissionService;
