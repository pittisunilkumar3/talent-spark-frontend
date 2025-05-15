# Job Listings Page Implementation Guide

This guide provides detailed instructions for implementing the job listings page that uses the job service and components we've created.

## Implementing the Job Listings Page

### 1. Create Department and Location Services

First, we need to create services for departments and locations to populate our filters.

#### 1.1 Create Department Service

Create a new file `src/services/departmentService.ts`:

```typescript
import apiClient from './api';

// Types
export interface Department {
  id: number;
  name: string;
  description?: string;
  manager?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  parentDepartment?: {
    id: number;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentsResponse {
  departments: Department[];
  total: number;
}

// Department service
export const departmentService = {
  // Get all departments
  getDepartments: async (params = {}): Promise<DepartmentsResponse> => {
    try {
      const response = await apiClient.get<DepartmentsResponse>('/departments', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get department by ID
  getDepartmentById: async (id: number): Promise<Department> => {
    try {
      const response = await apiClient.get<{ department: Department }>(`/departments/${id}`);
      return response.data.department;
    } catch (error) {
      throw error;
    }
  }
};
```

#### 1.2 Create Location Service

Create a new file `src/services/locationService.ts`:

```typescript
import apiClient from './api';

// Types
export interface Location {
  id: number;
  name: string;
  address?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  manager?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocationsResponse {
  locations: Location[];
  total: number;
}

// Location service
export const locationService = {
  // Get all locations
  getLocations: async (params = {}): Promise<LocationsResponse> => {
    try {
      const response = await apiClient.get<LocationsResponse>('/locations', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get location by ID
  getLocationById: async (id: number): Promise<Location> => {
    try {
      const response = await apiClient.get<{ location: Location }>(`/locations/${id}`);
      return response.data.location;
    } catch (error) {
      throw error;
    }
  }
};
```

### 2. Create Pagination Component

Create a new file `src/components/ui/pagination.tsx`:

```typescript
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than or equal to maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page, last page, current page, and pages around current page
      pageNumbers.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, 4);
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Add last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };
  
  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        <ChevronsLeft className="h-4 w-4" />
        <span className="sr-only">First page</span>
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>
      
      {getPageNumbers().map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-2">...</span>
        ) : (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? 'default' : 'outline'}
            size="icon"
            onClick={() => typeof page === 'number' && onPageChange(page)}
          >
            {page}
          </Button>
        )
      ))}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <ChevronsRight className="h-4 w-4" />
        <span className="sr-only">Last page</span>
      </Button>
    </div>
  );
}
```

### 3. Create Job Listings Page

Create a new file `src/pages/jobs/JobListingsPage.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobService, JobFilters as JobFiltersType, Job } from '@/services/jobService';
import { departmentService } from '@/services/departmentService';
import { locationService } from '@/services/locationService';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import JobCard from '@/components/jobs/JobCard';
import JobFilters from '@/components/jobs/JobFilters';
import { Plus, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const JobListingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState<JobFiltersType>({
    page: 1,
    limit: 9,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);
  
  // Fetch jobs with filters
  const {
    data: jobsData,
    isLoading: isLoadingJobs,
    isError: isJobsError,
    error: jobsError,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobService.getJobs(filters),
  });
  
  // Fetch departments for filters
  const {
    data: departmentsData,
    isLoading: isLoadingDepartments,
    isError: isDepartmentsError,
  } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getDepartments({ isActive: true }),
  });
  
  // Fetch locations for filters
  const {
    data: locationsData,
    isLoading: isLoadingLocations,
    isError: isLocationsError,
  } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationService.getLocations({ isActive: true }),
  });
  
  // Handle filter changes
  const handleFilterChange = (newFilters: JobFiltersType) => {
    setFilters({ ...filters, ...newFilters });
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };
  
  // Handle job edit
  const handleEditJob = (job: Job) => {
    navigate(`/jobs/${job.id}/edit`);
  };
  
  // Handle job delete confirmation
  const handleDeleteConfirm = (jobId: number) => {
    setJobToDelete(jobId);
    setDeleteDialogOpen(true);
  };
  
  // Handle job delete
  const handleDeleteJob = async () => {
    if (jobToDelete) {
      try {
        await jobService.deleteJob(jobToDelete);
        setDeleteDialogOpen(false);
        setJobToDelete(null);
        refetchJobs();
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };
  
  // Check if user can create jobs
  const canCreateJob = user?.role === 'ceo' || 
                       user?.role === 'branch-manager' || 
                       user?.role === 'marketing-head' || 
                       user?.role === 'marketing-supervisor';
  
  // Loading state
  if (isLoadingJobs && !jobsData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  
  // Error state
  if (isJobsError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {jobsError instanceof Error ? jobsError.message : 'Failed to load jobs'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Job Listings</h1>
        {canCreateJob && (
          <Button onClick={() => navigate('/jobs/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Job
          </Button>
        )}
      </div>
      
      <JobFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        departments={departmentsData?.departments || []}
        locations={locationsData?.locations || []}
      />
      
      {isLoadingJobs && (
        <div className="flex h-96 items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}
      
      {!isLoadingJobs && jobsData?.jobs.length === 0 && (
        <div className="mt-8 flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="mb-2 text-xl font-semibold">No jobs found</h3>
          <p className="text-gray-500">
            Try adjusting your filters or create a new job listing.
          </p>
          {canCreateJob && (
            <Button className="mt-4" onClick={() => navigate('/jobs/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Job
            </Button>
          )}
        </div>
      )}
      
      {!isLoadingJobs && jobsData?.jobs.length > 0 && (
        <>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobsData.jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={canCreateJob ? handleEditJob : undefined}
                onDelete={canCreateJob ? handleDeleteConfirm : undefined}
              />
            ))}
          </div>
          
          <div className="mt-8">
            <Pagination
              currentPage={jobsData.page}
              totalPages={jobsData.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteJob}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobListingsPage;
```

### 4. Update the App.tsx Routes

Make sure your `App.tsx` includes the route for the job listings page:

```typescript
// Inside your Routes component in App.tsx
<Route 
  element={
    <ProtectedRoute 
      allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor']} 
    />
  }
>
  <Route path="/job-listings" element={<JobListingsPage />} />
  {/* Other routes... */}
</Route>
```

### 5. Add Navigation Link in Sidebar

Update your sidebar component to include a link to the job listings page:

```typescript
// Inside your sidebar component
<NavItem
  icon={<Briefcase className="h-5 w-5" />}
  label="Job Listings"
  to="/job-listings"
  active={pathname === '/job-listings'}
/>
```

## Testing the Implementation

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
npm run dev
```

3. Navigate to the login page and log in with appropriate credentials.

4. After successful login, navigate to the Job Listings page.

5. Test the following functionality:
   - Filtering jobs by different criteria
   - Pagination
   - Viewing job details
   - Creating a new job (if you have appropriate permissions)
   - Editing and deleting jobs (if you have appropriate permissions)

## Troubleshooting Common Issues

### API Connection Issues

If you encounter issues connecting to the API:

1. Check that the backend server is running.
2. Verify that the API base URL is correctly set in your environment variables.
3. Check the browser console for CORS errors. If present, ensure the backend CORS settings include your frontend origin.
4. Verify that the API endpoints match what the backend expects.

### Authentication Issues

If you encounter authentication issues:

1. Check that the JWT token is being correctly stored in localStorage.
2. Verify that the token is being included in the Authorization header for API requests.
3. Check that the token has not expired.
4. Ensure the user has the appropriate role to access the job listings page.

### Data Display Issues

If job data is not displaying correctly:

1. Check the API response format matches what your components expect.
2. Verify that the data is being correctly passed to child components.
3. Check for any type mismatches between the API response and your TypeScript interfaces.
4. Use React Query's devtools to inspect the query state and data.

## Next Steps

After implementing the job listings page, you can proceed to implement:

1. Job details page
2. Job creation and editing forms
3. Application submission functionality
4. Candidate matching features

These features will build upon the foundation established with the job listings page and reuse many of the same components and services.
