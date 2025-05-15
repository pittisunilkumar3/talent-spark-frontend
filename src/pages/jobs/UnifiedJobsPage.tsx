import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Bell,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Users,
  AlertCircle,
  FileText,
  CheckCircle,
  Clock,
  Calendar,
  BarChart,
  Layers,
  ListFilter,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { isAdmin } from '@/utils/adminPermissions';
import {
  JobListing,
  JobStatus,
  mockJobListings,
  getStatusColor,
  getPriorityColor,
  getJobListingsByLocationId,
  getStatusLabel
} from '@/types/jobs';
import { mockLocations, mockDepartments, mockTeamMembers } from '@/types/organization';
import { AssignJobDialog } from '@/components/jobs/AssignJobDialog';
import JobPriorityBadge from '@/components/jobs/JobPriorityBadge';
import JobPrioritySelector from '@/components/jobs/JobPrioritySelector';

const UnifiedJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const adminUser = isAdmin(user?.role);
  const isHiringManager = user?.role === 'branch-manager';
  const isMarketingHead = user?.role === 'marketing-head';
  const isMarketingSupervisor = user?.role === 'marketing-supervisor';
  const isScout = user?.role === 'marketing-recruiter';
  const isTeamMember = user?.role === 'marketing-associate';

  // Managers and supervisors can manage jobs
  const canManageJobs = adminUser || isHiringManager || isMarketingHead || isMarketingSupervisor;

  // State for job listings
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<JobListing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState<JobListing | null>(null);

  // State for active view
  const [activeView, setActiveView] = useState('table');
  const [showEmployeeStats, setShowEmployeeStats] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Load job listings based on user role
  useEffect(() => {
    let jobs: JobListing[] = [];

    if (adminUser) {
      // CEO sees all jobs across all locations
      jobs = [...mockJobListings];
    } else if (isHiringManager && user?.locationId) {
      // Branch Manager sees jobs for their location
      jobs = getJobListingsByLocationId(user.locationId);
    } else if (isMarketingHead) {
      // Marketing Head sees all marketing jobs across locations
      jobs = mockJobListings.filter(job => job.department.includes('Marketing'));
    } else if (isMarketingSupervisor && user?.locationId) {
      // Marketing Supervisor sees marketing jobs for their location
      const locationJobs = getJobListingsByLocationId(user.locationId);
      jobs = locationJobs.filter(job => job.department.includes('Marketing'));
    } else if (isScout && user?.locationId) {
      // Marketing Recruiter sees jobs assigned to them and can reassign, but only from their location
      jobs = mockJobListings.filter(job =>
        (job.assignedTo === user?.id ||
         (job.department.includes('Marketing') && job.status === 'published')) &&
        job.locationId === user.locationId
      );
    } else if (isTeamMember && user?.locationId) {
      // Marketing Associate sees only jobs assigned to them from their location
      jobs = mockJobListings.filter(job =>
        job.assignedTo === user?.id &&
        job.locationId === user.locationId
      );
    }

    setJobListings(jobs);
    setFilteredListings(jobs);
  }, [user, adminUser, isHiringManager, isMarketingHead, isMarketingSupervisor, isScout, isTeamMember]);

  // Filter jobs based on search term and filters
  useEffect(() => {
    let filtered = [...jobListings];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.clientName && job.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(job => job.priority === priorityFilter);
    }

    // Apply location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(job => job.locationId === locationFilter);
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(job => job.departmentId === departmentFilter);
    }

    // Apply tab filter
    if (activeTab === 'draft') {
      filtered = filtered.filter(job => job.status === 'draft');
    } else if (activeTab === 'published') {
      filtered = filtered.filter(job => job.status === 'published');
    } else if (activeTab === 'in-progress') {
      filtered = filtered.filter(job => job.status === 'in-progress');
    } else if (activeTab === 'filled') {
      filtered = filtered.filter(job => job.status === 'filled' || job.status === 'closed');
    }

    setFilteredListings(filtered);
  }, [jobListings, searchTerm, statusFilter, priorityFilter, locationFilter, departmentFilter, activeTab]);

  // Handle create job
  const handleCreateJob = () => {
    navigate('/jobs/create');
  };

  // Handle job assignment
  const handleAssignJob = (job: JobListing) => {
    setCurrentJob(job);
    setIsAssignDialogOpen(true);
  };

  // Handle job assignment completion
  const handleAssignmentComplete = (jobId: string, userId: string, userName: string) => {
    // In a real app, this would be an API call
    const updatedListings = jobListings.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          assignedTo: userId,
          assignedToName: userName,
          updatedAt: new Date().toISOString()
        };
      }
      return job;
    });

    setJobListings(updatedListings);

    toast({
      title: "Job Assigned",
      description: `Job has been assigned to ${userName}`,
    });
  };

  // Handle view job details
  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  // Handle edit job
  const handleEditJob = (jobId: string) => {
    navigate(`/jobs/${jobId}/edit`);
  };

  // Handle delete job
  const handleDeleteJob = (jobId: string) => {
    // In a real app, this would be an API call
    const updatedListings = jobListings.filter(job => job.id !== jobId);
    setJobListings(updatedListings);

    toast({
      title: "Job Deleted",
      description: "The job has been deleted successfully",
    });
  };

  // Handle priority change
  const handlePriorityChange = (jobId: string, newPriority: string) => {
    // In a real app, this would be an API call
    const updatedListings = jobListings.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          priority: newPriority as JobListing['priority'],
          updatedAt: new Date().toISOString()
        };
      }
      return job;
    });

    setJobListings(updatedListings);

    toast({
      title: "Priority Updated",
      description: `Job priority has been updated to ${newPriority}`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Jobs Management</h1>
          <p className="text-muted-foreground mt-2">
            {adminUser
              ? "Manage all jobs across locations"
              : isHiringManager
                ? "Manage jobs for your branch location"
                : isMarketingHead
                  ? "Manage marketing jobs across all locations"
                  : isMarketingSupervisor
                    ? "Manage marketing jobs for your location"
                    : isScout
                      ? "Manage and assign marketing jobs"
                      : "View and manage your assigned jobs"}
          </p>
        </div>

        {canManageJobs && (
          <Button onClick={handleCreateJob}>
            <Plus className="mr-2 h-4 w-4" /> Create Job
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all" className="relative">
              All
              <Badge className="ml-2 bg-primary/20 text-primary">{jobListings.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="draft" className="relative">
              Draft
              <Badge className="ml-2 bg-primary/20 text-primary">
                {jobListings.filter(job => job.status === 'draft').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="published" className="relative">
              Published
              <Badge className="ml-2 bg-primary/20 text-primary">
                {jobListings.filter(job => job.status === 'published').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="relative">
              In Progress
              <Badge className="ml-2 bg-primary/20 text-primary">
                {jobListings.filter(job => job.status === 'in-progress').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="filled" className="relative">
              Filled/Closed
              <Badge className="ml-2 bg-primary/20 text-primary">
                {jobListings.filter(job => job.status === 'filled' || job.status === 'closed').length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <Button
              variant={activeView === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('table')}
            >
              <Layers className="h-4 w-4" />
            </Button>
            <Button
              variant={activeView === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('kanban')}
            >
              <BarChart className="h-4 w-4" />
            </Button>
            <Button
              variant={activeView === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('cards')}
            >
              <Briefcase className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Tabs>

      {/* Statistics Dashboard */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Dashboard Overview</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={!showEmployeeStats ? "default" : "outline"}
            size="sm"
            onClick={() => setShowEmployeeStats(false)}
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Job Stats
          </Button>
          <Button
            variant={showEmployeeStats ? "default" : "outline"}
            size="sm"
            onClick={() => setShowEmployeeStats(true)}
          >
            <Users className="h-4 w-4 mr-2" />
            Employee Assignment
          </Button>
        </div>
      </div>

      {!showEmployeeStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Jobs */}
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Jobs</p>
              <h3 className="text-2xl font-bold">{jobListings.length}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {jobListings.filter(job => job.status === 'filled' || job.status === 'closed').length} filled/closed
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Jobs by Location */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Jobs by Location</p>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            {mockLocations.map(location => {
              const count = jobListings.filter(job => job.locationId === location.id).length;
              const percentage = Math.round((count / jobListings.length) * 100) || 0;
              return (
                <div key={location.id} className="mt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span>{location.name}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <Progress value={percentage} className="h-1 mt-1" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Jobs by Department */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Jobs by Department</p>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            {['Marketing (Recruitment)', 'Sales'].map(dept => {
              const count = jobListings.filter(job => job.department === dept).length;
              const percentage = Math.round((count / jobListings.length) * 100) || 0;
              return (
                <div key={dept} className="mt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span>{dept}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <Progress value={percentage} className="h-1 mt-1" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Assignment Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Assignment Status</p>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </div>
            {(() => {
              const assignedCount = jobListings.filter(job => job.assignedTo).length;
              const unassignedCount = jobListings.filter(job => !job.assignedTo).length;
              const assignedPercentage = Math.round((assignedCount / jobListings.length) * 100) || 0;
              const unassignedPercentage = Math.round((unassignedCount / jobListings.length) * 100) || 0;

              return (
                <>
                  <div className="mt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span>Assigned</span>
                      <span className="font-medium">{assignedCount}</span>
                    </div>
                    <Progress value={assignedPercentage} className="h-1 mt-1 bg-muted" />
                  </div>
                  <div className="mt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span>Unassigned</span>
                      <span className="font-medium">{unassignedCount}</span>
                    </div>
                    <Progress value={unassignedPercentage} className="h-1 mt-1 bg-muted" />
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>
      ) : (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Job Assignment</CardTitle>
              <CardDescription>View job distribution across employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockLocations.map(location => (
                  <div key={location.id} className="space-y-4">
                    <h3 className="text-lg font-medium">{location.name}</h3>

                    {/* Marketing Department */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Marketing (Recruitment)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mockTeamMembers
                          .filter(member =>
                            member.departmentId === mockDepartments.find(
                              dept => dept.locationId === location.id && dept.name === 'Marketing (Recruitment)'
                            )?.id
                          )
                          .map(employee => {
                            const assignedJobs = jobListings.filter(job => job.assignedTo === employee.id);
                            return (
                              <Card key={employee.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                  <div className="flex items-center space-x-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                      {employee.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-medium">{employee.name}</p>
                                      <p className="text-xs text-muted-foreground">{employee.role}</p>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>Assigned Jobs</span>
                                      <span className="font-medium">{assignedJobs.length}</span>
                                    </div>
                                    <Progress
                                      value={assignedJobs.length > 0 ? 100 : 0}
                                      className="h-1.5"
                                    />

                                    <div className="mt-3 space-y-1">
                                      {assignedJobs.length > 0 ? (
                                        assignedJobs.map(job => (
                                          <div
                                            key={job.id}
                                            className="text-xs p-1.5 rounded bg-muted flex justify-between items-center cursor-pointer hover:bg-muted/80"
                                            onClick={() => handleViewJob(job.id)}
                                          >
                                            <div className="flex items-center">
                                              <Badge variant="outline" className="font-mono text-[10px] mr-2">
                                                {job.id}
                                              </Badge>
                                              <span className="truncate max-w-[120px]">{job.title}</span>
                                            </div>
                                            <Badge className={getStatusColor(job.status)}>
                                              {getStatusLabel(job.status)}
                                            </Badge>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-xs text-muted-foreground italic">
                                          No jobs assigned
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>
                    </div>

                    {/* Sales Department */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Sales</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mockTeamMembers
                          .filter(member =>
                            member.departmentId === mockDepartments.find(
                              dept => dept.locationId === location.id && dept.name === 'Sales'
                            )?.id
                          )
                          .map(employee => {
                            const assignedJobs = jobListings.filter(job => job.assignedTo === employee.id);
                            return (
                              <Card key={employee.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                  <div className="flex items-center space-x-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                      {employee.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-medium">{employee.name}</p>
                                      <p className="text-xs text-muted-foreground">{employee.role}</p>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>Assigned Jobs</span>
                                      <span className="font-medium">{assignedJobs.length}</span>
                                    </div>
                                    <Progress
                                      value={assignedJobs.length > 0 ? 100 : 0}
                                      className="h-1.5"
                                    />

                                    <div className="mt-3 space-y-1">
                                      {assignedJobs.length > 0 ? (
                                        assignedJobs.map(job => (
                                          <div
                                            key={job.id}
                                            className="text-xs p-1.5 rounded bg-muted flex justify-between items-center cursor-pointer hover:bg-muted/80"
                                            onClick={() => handleViewJob(job.id)}
                                          >
                                            <div className="flex items-center">
                                              <Badge variant="outline" className="font-mono text-[10px] mr-2">
                                                {job.id}
                                              </Badge>
                                              <span className="truncate max-w-[120px]">{job.title}</span>
                                            </div>
                                            <Badge className={getStatusColor(job.status)}>
                                              {getStatusLabel(job.status)}
                                            </Badge>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-xs text-muted-foreground italic">
                                          No jobs assigned
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Advanced Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search jobs by title, ID, or client..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-10"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setLocationFilter('all');
                  setDepartmentFilter('all');
                  setActiveTab('all');
                }}
              >
                <ListFilter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="status-filter" className="text-xs font-medium mb-1.5 block">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" className="w-full">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="filled">Filled</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority-filter" className="text-xs font-medium mb-1.5 block">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger id="priority-filter" className="w-full">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location-filter" className="text-xs font-medium mb-1.5 block">Location</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger id="location-filter" className="w-full">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {mockLocations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department-filter" className="text-xs font-medium mb-1.5 block">Department</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger id="department-filter" className="w-full">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="dept-1">Marketing (Miami)</SelectItem>
                  <SelectItem value="dept-2">Sales (Miami)</SelectItem>
                  <SelectItem value="dept-3">Marketing (New York)</SelectItem>
                  <SelectItem value="dept-4">Sales (New York)</SelectItem>
                  <SelectItem value="dept-5">Marketing (San Francisco)</SelectItem>
                  <SelectItem value="dept-6">Sales (San Francisco)</SelectItem>
                  <SelectItem value="dept-7">Marketing (Chicago)</SelectItem>
                  <SelectItem value="dept-8">Sales (Chicago)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assignment-filter" className="text-xs font-medium mb-1.5 block">Assignment</Label>
              <Select
                defaultValue="all"
                onValueChange={(value) => {
                  if (value === 'assigned') {
                    setFilteredListings(jobListings.filter(job => job.assignedTo !== null));
                  } else if (value === 'unassigned') {
                    setFilteredListings(jobListings.filter(job => job.assignedTo === null));
                  } else {
                    // Reset to apply other filters
                    setFilteredListings(jobListings);
                  }
                }}
              >
                <SelectTrigger id="assignment-filter" className="w-full">
                  <SelectValue placeholder="Assignment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  <SelectItem value="assigned">Assigned Only</SelectItem>
                  <SelectItem value="unassigned">Unassigned Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table View */}
      {activeView === 'table' && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">
                  <div className="flex items-center">
                    <span className="font-bold">Job ID</span>
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[200px]">
                  <div className="flex items-center">
                    Job Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[180px]">
                  <div className="flex items-center">
                    <span className="font-bold">Client Name</span>
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredListings.length > 0 ? (
                filteredListings.map((job) => (
                  <TableRow key={job.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewJob(job.id)}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-primary/5 hover:bg-primary/10">
                        {job.id}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Briefcase className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        <span className="font-medium">{job.clientName || 'Internal'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{job.department}</TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(job.status)}`}>
                        {getStatusLabel(job.status)}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {canManageJobs ? (
                        <JobPrioritySelector
                          jobId={job.id}
                          jobTitle={job.title}
                          currentPriority={job.priority}
                          onPriorityChange={handlePriorityChange}
                        />
                      ) : (
                        <JobPriorityBadge priority={job.priority} />
                      )}
                    </TableCell>
                    <TableCell>
                      {job.assignedToName ? (
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                            {job.assignedToName.charAt(0)}
                          </div>
                          <span>{job.assignedToName}</span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100">
                          Unassigned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleViewJob(job.id);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>

                          {/* Assignment permissions based on role */}
                          {(canManageJobs || isScout || job.assignedTo === user?.id) && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleAssignJob(job);
                            }}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              {job.assignedTo ? 'Reassign Job' : 'Assign Job'}
                            </DropdownMenuItem>
                          )}

                          {(canManageJobs || job.assignedTo === user?.id) && (
                            <>
                              <DropdownMenuSeparator />

                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleEditJob(job.id);
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Job
                              </DropdownMenuItem>
                            </>
                          )}

                          {canManageJobs && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteJob(job.id);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Job
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No job listings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Kanban View */}
      {activeView === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Draft Column */}
          <Card className="h-[calc(100vh-300px)] overflow-auto">
            <CardHeader className="bg-muted/50 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <CardTitle className="text-md flex items-center">
                  <span className="mr-2">Draft</span>
                  <Badge variant="outline">{jobListings.filter(job => job.status === 'draft').length}</Badge>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-2 space-y-2">
              {filteredListings.filter(job => job.status === 'draft').map(job => (
                <Card key={job.id} className="cursor-pointer hover:border-primary/50" onClick={() => handleViewJob(job.id)}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="font-mono bg-primary/5 text-xs">
                        {job.id}
                      </Badge>
                      <JobPriorityBadge priority={job.priority} />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{job.title}</h3>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Briefcase className="h-3 w-3 mr-1" />
                      <span>{job.clientName || 'Internal'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredListings.filter(job => job.status === 'draft').length === 0 && (
                <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                  <FileText className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No draft jobs</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Published Column */}
          <Card className="h-[calc(100vh-300px)] overflow-auto">
            <CardHeader className="bg-muted/50 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <CardTitle className="text-md flex items-center">
                  <span className="mr-2">Published</span>
                  <Badge variant="outline">{jobListings.filter(job => job.status === 'published').length}</Badge>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-2 space-y-2">
              {filteredListings.filter(job => job.status === 'published').map(job => (
                <Card key={job.id} className="cursor-pointer hover:border-primary/50" onClick={() => handleViewJob(job.id)}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="font-mono bg-primary/5 text-xs">
                        {job.id}
                      </Badge>
                      <JobPriorityBadge priority={job.priority} />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{job.title}</h3>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Briefcase className="h-3 w-3 mr-1" />
                      <span>{job.clientName || 'Internal'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredListings.filter(job => job.status === 'published').length === 0 && (
                <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                  <FileText className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No published jobs</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* In Progress Column */}
          <Card className="h-[calc(100vh-300px)] overflow-auto">
            <CardHeader className="bg-muted/50 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <CardTitle className="text-md flex items-center">
                  <span className="mr-2">In Progress</span>
                  <Badge variant="outline">{jobListings.filter(job => job.status === 'in-progress').length}</Badge>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-2 space-y-2">
              {filteredListings.filter(job => job.status === 'in-progress').map(job => (
                <Card key={job.id} className="cursor-pointer hover:border-primary/50" onClick={() => handleViewJob(job.id)}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="font-mono bg-primary/5 text-xs">
                        {job.id}
                      </Badge>
                      <JobPriorityBadge priority={job.priority} />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{job.title}</h3>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Briefcase className="h-3 w-3 mr-1" />
                      <span>{job.clientName || 'Internal'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredListings.filter(job => job.status === 'in-progress').length === 0 && (
                <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                  <FileText className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No in-progress jobs</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Filled/Closed Column */}
          <Card className="h-[calc(100vh-300px)] overflow-auto">
            <CardHeader className="bg-muted/50 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <CardTitle className="text-md flex items-center">
                  <span className="mr-2">Filled/Closed</span>
                  <Badge variant="outline">
                    {jobListings.filter(job => job.status === 'filled' || job.status === 'closed').length}
                  </Badge>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-2 space-y-2">
              {filteredListings.filter(job => job.status === 'filled' || job.status === 'closed').map(job => (
                <Card key={job.id} className="cursor-pointer hover:border-primary/50" onClick={() => handleViewJob(job.id)}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="font-mono bg-primary/5 text-xs">
                        {job.id}
                      </Badge>
                      <Badge className={getStatusColor(job.status)}>
                        {getStatusLabel(job.status)}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-sm mb-1">{job.title}</h3>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Briefcase className="h-3 w-3 mr-1" />
                      <span>{job.clientName || 'Internal'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredListings.filter(job => job.status === 'filled' || job.status === 'closed').length === 0 && (
                <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                  <FileText className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No filled/closed jobs</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cards View */}
      {activeView === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.length > 0 ? (
            filteredListings.map((job) => (
              <Card key={job.id} className="cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all" onClick={() => handleViewJob(job.id)}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Badge variant="outline" className="font-mono bg-primary/5 mb-2">
                        {job.id}
                      </Badge>
                      <h3 className="font-medium text-lg">{job.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Briefcase className="h-4 w-4 mr-1" />
                        <span>{job.clientName || 'Internal'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(job.status)}>
                        {getStatusLabel(job.status)}
                      </Badge>
                      <JobPriorityBadge priority={job.priority} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{job.department}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Bell className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{job.applicantsCount} applicants</span>
                    </div>
                  </div>

                  {job.assignedToName ? (
                    <div className="flex items-center mt-4 pt-4 border-t">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                        {job.assignedToName.charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm font-medium">{job.assignedToName}</span>
                        <p className="text-xs text-muted-foreground">Assigned</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center mt-4 pt-4 border-t">
                      <Badge variant="outline" className="bg-gray-100">
                        Unassigned
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 flex flex-col items-center justify-center h-64 text-muted-foreground">
              <FileText className="h-16 w-16 mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">No jobs found</h3>
              <p>Try adjusting your filters or search criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Assign Job Dialog */}
      {currentJob && (
        <AssignJobDialog
          isOpen={isAssignDialogOpen}
          onClose={() => setIsAssignDialogOpen(false)}
          job={currentJob}
          onAssign={handleAssignmentComplete}
        />
      )}
    </div>
  );
};

export default UnifiedJobsPage;
