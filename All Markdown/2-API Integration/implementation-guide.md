# QORE Recruitment Platform - Implementation Guide

This guide provides detailed instructions for implementing the frontend-backend integration for the QORE Recruitment Platform, following the tasks outlined in `tasks.md`.

## Phase 1: Project Setup and Configuration

### 1.1 Backend Preparation

#### 1.1.1 Verify backend structure

The backend is already properly organized in the `backend` folder at the root level of your project. Verify that it contains the following structure:

```bash
# Navigate to the project root and check the backend structure
ls -la backend
```

You should see the following structure:
- `prisma/` - Database schema and migrations
- `src/` - Source code
- `package.json` - Dependencies and scripts
- `.env.example` - Example environment variables

#### 1.1.2 Set up environment variables

1. Create a `.env` file in the backend directory:
```bash
cd backend
cp .env.example .env
```

2. Edit the `.env` file with appropriate values:
```
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/talent_spark?schema=public"

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key
ACCESS_TOKEN_EXPIRY=24h

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=uploads

# Logging Configuration
LOG_LEVEL=info

# CORS Configuration
CORS_ORIGIN=http://localhost:8080
```

#### 1.1.3 Initialize and seed the database

1. Create the PostgreSQL database:
```bash
# Using psql
psql -U postgres -c "CREATE DATABASE talent_spark;"
```

2. Run Prisma migrations and seed the database:
```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
```

### 1.2 Frontend Configuration

#### 1.2.1 Set up environment variables

1. Create a `.env` file in the frontend directory:
```bash
cd "/Users/justrohith/Downloads/Recruit AI/talent-spark-recruit"
touch .env
```

2. Add the API base URL to the `.env` file:
```
VITE_API_BASE_URL=http://localhost:3001/api
```

#### 1.2.2 Configure Vite for API proxy

1. Update the `vite.config.ts` file:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
```

## Phase 2: API Integration Layer

### 2.1 API Client Setup

#### 2.1.1 Create API client service

1. Create the directory structure:
```bash
mkdir -p src/services src/utils
```

2. Create the API client file (`src/services/api.ts`):

```typescript
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { handleApiError } from '../utils/apiErrors';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If error is 401 (Unauthorized) and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token available, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Call token refresh endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken
        });

        // Save new tokens
        const { token, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Token refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    return Promise.reject(handleApiError(error));
  }
);

export default apiClient;
```

#### 2.1.2 Create API error handling utilities

Create the API error handling file (`src/utils/apiErrors.ts`):

```typescript
import { AxiosError } from 'axios';

// Custom API error class
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Function to handle and standardize API errors
export const handleApiError = (error: AxiosError): ApiError => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const status = error.response.status;
    const data = error.response.data;
    const message = data.message || `Error ${status}: ${error.message}`;

    return new ApiError(message, status, data);
  } else if (error.request) {
    // The request was made but no response was received
    return new ApiError('No response received from server', 0);
  } else {
    // Something happened in setting up the request that triggered an Error
    return new ApiError(`Request error: ${error.message}`, 0);
  }
};

// Function to extract validation errors from API response
export const extractValidationErrors = (error: ApiError): Record<string, string> => {
  if (error.status === 400 && error.data && error.data.errors) {
    const validationErrors: Record<string, string> = {};

    // Map API validation errors to form field errors
    error.data.errors.forEach((err: any) => {
      if (err.field && err.message) {
        validationErrors[err.field] = err.message;
      }
    });

    return validationErrors;
  }

  return {};
};
```

### 2.2 Service Modules

#### 2.2.1 Create authentication service

Create the authentication service file (`src/services/authService.ts`):

```typescript
import apiClient from './api';
import { UserRole } from '../context/AuthContext';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  phone?: string;
  departmentId?: number;
  locationId?: number;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string;
    avatarUrl?: string;
    departmentId?: number;
    locationId?: number;
  };
  token: string;
  refreshToken: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  departmentId?: number;
  locationId?: number;
}

// Authentication service
export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

      // Store tokens
      localStorage.setItem('accessToken', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Register new user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);

      // Store tokens
      localStorage.setItem('accessToken', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<{ user: User }>('/auth/me');
      return response.data.user;
    } catch (error) {
      throw error;
    }
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
    try {
      const response = await apiClient.post<{ token: string; refreshToken: string }>('/auth/refresh-token', { refreshToken });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.post('/auth/change-password', { currentPassword, newPassword });
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};
```
