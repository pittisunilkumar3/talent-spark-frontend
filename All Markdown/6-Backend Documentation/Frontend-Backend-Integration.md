# Frontend-Backend Integration Guide

## Overview

This document outlines how to integrate the Talent Spark Recruit frontend with the backend API. It covers the necessary steps, code examples, and best practices for connecting the React frontend with the Node.js/Express backend.

## Prerequisites

- Frontend running (React/TypeScript)
- Backend running (Node.js/Express)
- PostgreSQL database configured

## API Integration Layer

### 1. Setting up API Client

Create a centralized API client using Axios:

```typescript
// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken
        });
        
        // Save new tokens
        const { token } = response.data;
        localStorage.setItem('accessToken', token);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Token refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2. Creating Service Modules

Organize API calls into service modules:

```typescript
// src/services/authService.ts
import apiClient from './api';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  register: async (userData: any) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data.user;
    } catch (error) {
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// src/services/jobService.ts
import apiClient from './api';

export const jobService = {
  getJobs: async (filters = {}) => {
    try {
      const response = await apiClient.get('/jobs', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getJobById: async (id: number) => {
    try {
      const response = await apiClient.get(`/jobs/${id}`);
      return response.data.job;
    } catch (error) {
      throw error;
    }
  },
  
  createJob: async (jobData: any) => {
    try {
      const response = await apiClient.post('/jobs', jobData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateJob: async (id: number, jobData: any) => {
    try {
      const response = await apiClient.put(`/jobs/${id}`, jobData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  deleteJob: async (id: number) => {
    try {
      const response = await apiClient.delete(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Additional service modules for other resources...
```

## Authentication Integration

### 1. Setting up AuthContext

```typescript
// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  // other user properties
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setIsLoading(false);
        return false;
      }
      
      // Get current user data
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setCurrentUser(null);
      setIsLoading(false);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      
      localStorage.setItem('accessToken', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      
      setCurrentUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      
      localStorage.setItem('accessToken', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      
      setCurrentUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        checkAuthStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 2. Protecting Routes

```typescript
// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './common/LoadingSpinner';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles = [] }) => {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && currentUser && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
```

## Implementing Feature Integration

### 1. Job Management Integration

```typescript
// src/pages/jobs/JobListPage.tsx
import React, { useState, useEffect } from 'react';
import { jobService } from '../../services/jobService';
import JobList from '../../components/jobs/JobList';
import JobFilters from '../../components/jobs/JobFilters';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const JobListPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({
    page: 1,
    limit: 10,
    status: 'OPEN'
  });
  const [pagination, setPagination] = useState<any>({
    totalJobs: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10
  });

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobService.getJobs(filters);
      setJobs(response.jobs);
      setPagination(response.pagination);
      setError(null);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Job Listings</h1>
      
      <JobFilters onFilterChange={handleFilterChange} currentFilters={filters} />
      
      <JobList jobs={jobs} />
      
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default JobListPage;
```

### 2. Application Submission Integration

```typescript
// src/pages/applications/ApplyForm.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { applicationService } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';

const ApplyForm: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [job, setJob] = useState<any>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  React.useEffect(() => {
    if (jobId) {
      fetchJobDetails(parseInt(jobId));
    }
  }, [jobId]);

  const fetchJobDetails = async (id: number) => {
    try {
      setLoading(true);
      const jobData = await jobService.getJobById(id);
      setJob(jobData);
    } catch (error) {
      console.error('Error fetching job details:', error);
      setError('Failed to load job details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: any) => {
    if (!jobId) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Create form data for file upload
      const formData = new FormData();
      
      // Add form fields to formData
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      
      // Add jobId
      formData.append('jobId', jobId);
      
      // Add resume file if selected
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }
      
      // Submit application
      const response = await applicationService.applyForJob(formData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/applications/success/${response.applicationId}`);
      }, 2000);
    } catch (error: any) {
      console.error('Application submission error:', error);
      setError(error.response?.data?.message || 'Failed to submit application. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error && !job) return <ErrorMessage message={error} />;
  if (!job) return <ErrorMessage message="Job not found" />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Apply for {job.title}</h1>
      <p className="text-gray-600 mb-6">
        {job.department?.name} | {job.location?.name}
      </p>
      
      {success && (
        <SuccessMessage message="Application submitted successfully! Redirecting..." />
      )}
      
      {error && <ErrorMessage message={error} />}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              {...register('firstName', { required: 'First name is required' })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName.message as string}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              {...register('lastName', { required: 'Last name is required' })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName.message as string}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            {...register('phone')}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Resume</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeChange}
            className="mt-1 block w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Accepted formats: PDF, DOC, DOCX (Max size: 10MB)
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Cover Letter</label>
          <textarea
            {...register('coverLetter')}
            rows={5}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          ></textarea>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplyForm;
```

## File Upload Integration

### Implementing File Uploads

```typescript
// src/services/fileService.ts
import apiClient from './api';

export const fileService = {
  uploadResume: async (formData: FormData) => {
    try {
      const response = await apiClient.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getResumeUrl: (resumeId: string) => {
    return `${apiClient.defaults.baseURL}/uploads/resumes/${resumeId}`;
  }
};

// src/services/applicationService.ts
import apiClient from './api';

export const applicationService = {
  applyForJob: async (formData: FormData) => {
    try {
      const response = await apiClient.post('/applications/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Other application methods...
};
```

## Error Handling and Notifications

### Implementing Toast Notifications

```typescript
// src/context/NotificationContext.tsx
import React, { createContext, useContext, useState } from 'react';
import Toast from '../components/common/Toast';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (type: NotificationType, message: string) => void;
  hideNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (type: NotificationType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, type, message }]);
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      hideNotification(id);
    }, 5000);
    
    return id;
  };

  const hideNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        hideNotification,
      }}
    >
      {children}
      <div className="fixed top-5 right-5 z-50 space-y-2">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            type={notification.type}
            message={notification.message}
            onClose={() => hideNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
```

### Using Notifications

```typescript
// Example usage in a component
import { useNotification } from '../context/NotificationContext';

const SomeComponent: React.FC = () => {
  const { showNotification } = useNotification();
  
  const handleAction = async () => {
    try {
      // Some API call
      await apiService.doSomething();
      showNotification('success', 'Action completed successfully!');
    } catch (error) {
      showNotification('error', 'Failed to complete action. Please try again.');
    }
  };
  
  // Component rendering...
};
```

## Real-time Features

### Implementing WebSockets for Notifications

```typescript
// src/services/webSocketService.ts
export class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  
  connect(userId: number) {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    
    this.socket = new WebSocket(`ws://localhost:3001/notifications?token=${token}&userId=${userId}`);
    
    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, payload } = data;
        
        // Notify all listeners for this event type
        if (this.listeners.has(type)) {
          this.listeners.get(type)?.forEach((listener) => {
            listener(payload);
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        this.connect(userId);
      }, 5000);
    };
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
  
  addListener(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    this.listeners.get(type)?.add(callback);
  }
  
  removeListener(type: string, callback: (data: any) => void) {
    if (this.listeners.has(type)) {
      this.listeners.get(type)?.delete(callback);
    }
  }
}

export const webSocketService = new WebSocketService();

// src/context/NotificationContext.tsx (updated)
// Add the following to the existing NotificationContext:

useEffect(() => {
  if (currentUser?.id) {
    // Connect WebSocket
    webSocketService.connect(currentUser.id);
    
    // Add listener for notifications
    webSocketService.addListener('notification', (data) => {
      showNotification(data.type, data.message);
    });
    
    return () => {
      // Clean up
      webSocketService.disconnect();
    };
  }
}, [currentUser?.id]);
```

## Connecting with n8n RAG Workflow

To integrate the n8n workflow for resume parsing and job matching:

```typescript
// src/services/ragService.ts
import apiClient from './api';

export const ragService = {
  // Parse resume using n8n workflow
  parseResume: async (resumeId: string) => {
    try {
      const response = await apiClient.post('/resumes/parse', { resumeId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Match job with candidates using n8n workflow
  matchJobWithCandidates: async (jobId: number, jobDescription: string, requiredSkills: string[]) => {
    try {
      const response = await apiClient.post('/jobs/match-candidates', {
        jobId,
        jobDescription,
        requiredSkills
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get processing status for a resume
  getResumeProcessingStatus: async (processingId: string) => {
    try {
      const response = await apiClient.get(`/resumes/processing/${processingId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
```

## Deployment Considerations

1. **API URL Configuration**:
   - Use environment variables for API URLs
   - Configure different URLs for development and production

2. **CORS Configuration**:
   - Ensure backend CORS settings match frontend domain
   - Consider multiple origins for different environments

3. **Authentication Security**:
   - Store tokens securely (HttpOnly cookies preferred over localStorage)
   - Implement proper token refresh mechanism
   - Clear tokens on logout

4. **Error Handling**:
   - Implement global error handling
   - Log errors to monitoring service
   - Show user-friendly error messages

5. **Performance Optimization**:
   - Implement request caching where appropriate
   - Use pagination for large data sets
   - Optimize API requests (batching, polling, etc.)

## Conclusion

This integration guide outlines the necessary steps to connect the Talent Spark Recruit frontend with the backend API. Following these practices will create a robust, maintainable, and secure application with a smooth user experience.

By implementing the authentication, API services, error handling, and real-time features described above, you'll have a solid foundation for the application's functionality. The RAG workflow integration provides advanced capabilities for resume parsing and job matching, creating a powerful recruitment platform.

Remember to regularly review and update the integration as the application evolves, ensuring that frontend and backend remain in sync with each other.