# Job Management Integration Guide

This guide provides detailed instructions for implementing the job service and connecting the job listings page to the API.

## Phase 4: Core Feature Integration - Job Management

### 4.1 Create Job Service

#### 4.1.1 Create the job service file

Create a new file `src/services/jobService.ts`:

```typescript
import apiClient from './api';

// Types
export interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  department: {
    id: number;
    name: string;
  };
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  experienceLevel: string;
  employmentType: string;
  isRemote: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'FILLED';
  applicationDeadline: string;
  createdAt: string;
  updatedAt: string;
  hiringManager: {
    id: number;
    firstName: string;
    lastName: string;
  };
  clientName?: string;
  clientToCompanyProfit?: number;
  companyToCandidateProfit?: number;
}

export interface JobFilters {
  status?: string;
  department?: number;
  location?: number;
  experienceLevel?: string;
  employmentType?: string;
  isRemote?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JobFormData {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  locationId: number;
  departmentId: number;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  experienceLevel: string;
  employmentType: string;
  isRemote: boolean;
  applicationDeadline: string;
  clientName?: string;
  clientToCompanyProfit?: number;
  companyToCandidateProfit?: number;
}

// Job service
export const jobService = {
  // Get all jobs with filtering
  getJobs: async (filters: JobFilters = {}): Promise<JobsResponse> => {
    try {
      const response = await apiClient.get<JobsResponse>('/jobs', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get public jobs (for applicants)
  getPublicJobs: async (filters: JobFilters = {}): Promise<JobsResponse> => {
    try {
      const response = await apiClient.get<JobsResponse>('/jobs/public', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get job by ID
  getJobById: async (id: number): Promise<Job> => {
    try {
      const response = await apiClient.get<{ job: Job }>(`/jobs/${id}`);
      return response.data.job;
    } catch (error) {
      throw error;
    }
  },
  
  // Get public job by ID (for applicants)
  getPublicJobById: async (id: number): Promise<Job> => {
    try {
      const response = await apiClient.get<{ job: Job }>(`/jobs/public/${id}`);
      return response.data.job;
    } catch (error) {
      throw error;
    }
  },
  
  // Create new job
  createJob: async (jobData: JobFormData): Promise<Job> => {
    try {
      const response = await apiClient.post<{ job: Job }>('/jobs', jobData);
      return response.data.job;
    } catch (error) {
      throw error;
    }
  },
  
  // Update existing job
  updateJob: async (id: number, jobData: Partial<JobFormData>): Promise<Job> => {
    try {
      const response = await apiClient.put<{ job: Job }>(`/jobs/${id}`, jobData);
      return response.data.job;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete job
  deleteJob: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/jobs/${id}`);
    } catch (error) {
      throw error;
    }
  },
  
  // Get jobs by department
  getJobsByDepartment: async (departmentId: number, filters: JobFilters = {}): Promise<JobsResponse> => {
    try {
      const response = await apiClient.get<JobsResponse>(`/jobs/department/${departmentId}`, { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get jobs by location
  getJobsByLocation: async (locationId: number, filters: JobFilters = {}): Promise<JobsResponse> => {
    try {
      const response = await apiClient.get<JobsResponse>(`/jobs/location/${locationId}`, { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get job statistics
  getJobStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/jobs/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Match job with candidates
  matchJobWithCandidates: async (jobId: number): Promise<any> => {
    try {
      const response = await apiClient.post(`/jobs/${jobId}/match-candidates`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
```

### 4.2 Connect Job Listings Page to API

#### 4.2.1 Create a JobCard component

Create a new file `src/components/jobs/JobCard.tsx`:

```typescript
import { formatDistanceToNow } from 'date-fns';
import { Job } from '@/services/jobService';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  MapPin, 
  Building, 
  Clock, 
  DollarSign,
  ExternalLink,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

interface JobCardProps {
  job: Job;
  onEdit?: (job: Job) => void;
  onDelete?: (jobId: number) => void;
}

const JobCard = ({ job, onEdit, onDelete }: JobCardProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ceo' || user?.role === 'branch-manager' || 
                  user?.role === 'marketing-head' || user?.role === 'marketing-supervisor';
  
  // Format salary range
  const formatSalary = (min: number, max: number, currency: string) => {
    return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}`;
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'CLOSED':
        return 'bg-red-100 text-red-800';
      case 'FILLED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
          <Badge className={getStatusColor(job.status)}>
            {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
          </Badge>
        </div>
        {job.clientName && isAdmin && (
          <p className="text-sm text-gray-500">Client: {job.clientName}</p>
        )}
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-500">
            <Building className="mr-2 h-4 w-4" />
            <span>{job.department.name}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{job.location}{job.isRemote ? ' (Remote)' : ''}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Briefcase className="mr-2 h-4 w-4" />
            <span>{job.employmentType} · {job.experienceLevel}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <DollarSign className="mr-2 h-4 w-4" />
            <span>{formatSalary(job.salary.min, job.salary.max, job.salary.currency)}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="mr-2 h-4 w-4" />
            <span>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
          </div>
          
          {isAdmin && job.clientToCompanyProfit !== undefined && (
            <div className="text-sm text-gray-500">
              <span className="font-medium">Client-Company Profit:</span> {job.clientToCompanyProfit}%
            </div>
          )}
          
          {(isAdmin || user?.role === 'marketing-recruiter') && job.companyToCandidateProfit !== undefined && (
            <div className="text-sm text-gray-500">
              <span className="font-medium">Company-Candidate Profit:</span> {job.companyToCandidateProfit}%
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between">
        <Link to={`/jobs/${job.id}`}>
          <Button variant="outline" size="sm">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </Link>
        
        {isAdmin && (
          <div className="flex space-x-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(job)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            
            {onDelete && (
              <Button variant="outline" size="sm" className="text-red-600" onClick={() => onDelete(job.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default JobCard;
```

#### 4.2.2 Create a JobFilters component

Create a new file `src/components/jobs/JobFilters.tsx`:

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { JobFilters as JobFiltersType } from '@/services/jobService';
import { Search, Filter, X } from 'lucide-react';

interface JobFiltersProps {
  filters: JobFiltersType;
  onFilterChange: (filters: JobFiltersType) => void;
  departments: { id: number; name: string }[];
  locations: { id: number; name: string }[];
}

const JobFilters = ({ filters, onFilterChange, departments, locations }: JobFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<JobFiltersType>(filters);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters(prev => ({ ...prev, search: e.target.value }));
  };
  
  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: localFilters.search, page: 1 });
  };
  
  // Handle filter change
  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Apply filters
  const applyFilters = () => {
    onFilterChange({ ...localFilters, page: 1 });
    setIsOpen(false);
  };
  
  // Reset filters
  const resetFilters = () => {
    const resetFilters = {
      search: '',
      status: undefined,
      department: undefined,
      location: undefined,
      experienceLevel: undefined,
      employmentType: undefined,
      isRemote: undefined,
      page: 1
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
    setIsOpen(false);
  };
  
  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="flex w-full items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search jobs..."
            className="pl-9"
            value={localFilters.search || ''}
            onChange={handleSearchChange}
          />
        </div>
        <Button type="submit">Search</Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </form>
      
      {/* Filters panel */}
      {isOpen && (
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Status filter */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={localFilters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value || undefined)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="FILLED">Filled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Department filter */}
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={localFilters.department?.toString() || ''}
                onValueChange={(value) => handleFilterChange('department', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Location filter */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={localFilters.location?.toString() || ''}
                onValueChange={(value) => handleFilterChange('location', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id.toString()}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Experience level filter */}
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Select
                value={localFilters.experienceLevel || ''}
                onValueChange={(value) => handleFilterChange('experienceLevel', value || undefined)}
              >
                <SelectTrigger id="experienceLevel">
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All levels</SelectItem>
                  <SelectItem value="ENTRY">Entry Level</SelectItem>
                  <SelectItem value="MID">Mid Level</SelectItem>
                  <SelectItem value="SENIOR">Senior Level</SelectItem>
                  <SelectItem value="EXECUTIVE">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Employment type filter */}
            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select
                value={localFilters.employmentType || ''}
                onValueChange={(value) => handleFilterChange('employmentType', value || undefined)}
              >
                <SelectTrigger id="employmentType">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="FULL_TIME">Full Time</SelectItem>
                  <SelectItem value="PART_TIME">Part Time</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="TEMPORARY">Temporary</SelectItem>
                  <SelectItem value="INTERNSHIP">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Remote filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRemote"
                checked={localFilters.isRemote === true}
                onCheckedChange={(checked) => 
                  handleFilterChange('isRemote', checked === true ? true : undefined)
                }
              />
              <Label htmlFor="isRemote">Remote positions only</Label>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={resetFilters}>
              <X className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={applyFilters}>Apply Filters</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobFilters;
```
