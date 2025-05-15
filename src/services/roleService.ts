import apiClient from './api';
import axios from 'axios';

// Types
export interface Role {
  id: number;
  name: string;
  slug: string;
  description: string;
  branch_id: number | null;
  is_system: boolean;
  priority: number;
  is_active: boolean;
  created_by: number;
  updated_by: number | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  Branch?: {
    id: number;
    name: string;
  };
}

export interface RolesResponse {
  success: boolean;
  data: Role[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface RoleResponse {
  success: boolean;
  data: Role;
}

export interface RoleCreateResponse {
  success: boolean;
  message: string;
  data: Role;
}

export interface RoleUpdateResponse {
  success: boolean;
  message: string;
  data: Role;
}

export interface RoleDeleteResponse {
  success: boolean;
  message: string;
  result: {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    info: string;
    serverStatus: number;
    warningStatus: number;
  };
}

export interface RoleCreateData {
  name: string;
  slug: string;
  description: string;
  branch_id?: number | null;
  is_system?: boolean;
  priority?: number;
  is_active?: boolean;
  created_by: number;
}

export interface RoleUpdateData {
  name?: string;
  slug?: string;
  description?: string;
  branch_id?: number | null;
  is_system?: boolean;
  priority?: number;
  is_active?: boolean;
  updated_by: number;
}

export interface RoleQueryParams {
  page?: number;
  limit?: number;
  is_active?: boolean;
  is_system?: boolean;
  branch_id?: number;
  search?: string;
}

// Role service
export const roleService = {
  // Get all roles
  getRoles: async (params: RoleQueryParams = {}): Promise<any> => {
    try {
      console.log('Fetching roles with params:', params);
      console.log('API client base URL:', apiClient.defaults.baseURL);

      const response = await apiClient.get('/roles', { params });
      console.log('Raw API response:', response);

      // Return the raw response data
      return response.data;
    } catch (error) {
      console.error('API error in getRoles:', error);
      throw error;
    }
  },

  // Get role by ID
  getRoleById: async (id: number | string): Promise<any> => {
    try {
      const response = await apiClient.get(`/roles/${id}`);
      console.log('Raw API response for single role:', response);

      // Return the raw response data
      return response.data;
    } catch (error) {
      console.error('API error in getRoleById:', error);
      throw error;
    }
  },

  // Create role
  createRole: async (roleData: RoleCreateData): Promise<any> => {
    try {
      // Clean up the data by removing undefined values
      const cleanData = Object.fromEntries(
        Object.entries(roleData).filter(([_, v]) => v !== undefined)
      );

      console.log('Sending role data:', cleanData);
      const response = await apiClient.post('/roles', cleanData);
      console.log('Create role response:', response);

      // Return the raw response data
      return response.data;
    } catch (error) {
      console.error('API error in createRole:', error);
      throw error;
    }
  },

  // Update role
  updateRole: async (id: number | string, roleData: Partial<RoleUpdateData>): Promise<any> => {
    try {
      console.log('Updating role data:', roleData);
      const response = await apiClient.put(`/roles/${id}`, roleData);
      console.log('Update role response:', response);

      // Return the raw response data
      return response.data;
    } catch (error) {
      console.error('API error in updateRole:', error);
      throw error;
    }
  },

  // Delete role
  deleteRole: async (id: number | string): Promise<RoleDeleteResponse> => {
    try {
      console.log('Deleting role with ID:', id);

      // Ensure ID is properly formatted
      const roleId = typeof id === 'string' ? id.trim() : id;

      // Use the configured apiClient which includes auth token and proper error handling
      const response = await apiClient.delete(`/roles/${roleId}`);

      console.log('Delete role response:', response);
      return response.data as RoleDeleteResponse;
    } catch (error) {
      console.error('API error in deleteRole:', error);

      // Provide more specific error messages based on the error response
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message;

        if (statusCode === 403) {
          throw new Error('This role cannot be deleted because it is a system role.');
        } else if (statusCode === 404) {
          throw new Error('The role you are trying to delete could not be found.');
        } else if (statusCode === 401) {
          throw new Error('You are not authorized to delete this role. Please log in again.');
        } else {
          throw new Error(`Failed to delete role: ${errorMessage}`);
        }
      }

      throw error;
    }
  }
};

export default roleService;




