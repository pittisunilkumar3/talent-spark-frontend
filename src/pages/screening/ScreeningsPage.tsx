
import { useState, useMemo } from 'react';
import {
  Search, Filter, Play, FileCheck, Clock, AlertCircle, BarChart3,
  MapPin, Building2, Users, ChevronDown, PieChart, Download, Calendar,
  ArrowUpDown, Mail, Phone, User, Layers
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { isAdmin } from '@/utils/adminPermissions';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import ScreeningDialog from '@/components/screening/ScreeningDialog';
import { mockLocations, mockDepartments, getLocationById, getDepartmentById } from '@/types/organization';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Enhanced screenings data with location and department information
const mockScreenings = [
  {
    id: '1',
    candidate: 'Jordan Lee',
    position: 'Senior Software Engineer',
    status: 'pending',
    created: '2025-04-22T14:30:00',
    email: 'jordan.lee@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    locationId: 'loc-1', // Miami Headquarters
    departmentId: 'dept-1', // Marketing (Recruitment)
    source: 'LinkedIn',
    assignedTo: 'user-11', // Sarah Chen
  },
  {
    id: '2',
    candidate: 'Taylor Smith',
    position: 'Frontend Developer',
    status: 'scheduled',
    created: '2025-04-23T10:15:00',
    email: 'taylor.smith@example.com',
    scheduledFor: '2025-04-27T11:00:00',
    avatarUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    locationId: 'loc-1', // Miami Headquarters
    departmentId: 'dept-1', // Marketing (Recruitment)
    source: 'Indeed',
    assignedTo: 'user-20', // Jordan Lee
  },
  {
    id: '3',
    candidate: 'Morgan Chen',
    position: 'Data Scientist',
    status: 'completed',
    created: '2025-04-20T09:45:00',
    completedAt: '2025-04-21T15:30:00',
    score: 87,
    email: 'morgan.chen@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    locationId: 'loc-2', // New York Office
    departmentId: 'dept-3', // Marketing (Recruitment)
    source: 'Referral',
    assignedTo: 'user-22', // Alex Morgan
  },
  {
    id: '4',
    candidate: 'Casey Wilson',
    position: 'UX Designer',
    status: 'completed',
    created: '2025-04-18T14:20:00',
    completedAt: '2025-04-19T11:10:00',
    score: 92,
    email: 'casey.wilson@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    locationId: 'loc-3', // San Francisco Branch
    departmentId: 'dept-5', // Marketing (Recruitment)
    source: 'Dribbble',
    assignedTo: 'user-24', // Morgan Chen
  },
  {
    id: '5',
    candidate: 'Robin Taylor',
    position: 'Product Manager',
    status: 'scheduled',
    created: '2025-04-21T11:30:00',
    scheduledFor: '2025-04-28T14:00:00',
    email: 'robin.taylor@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    locationId: 'loc-3', // San Francisco Branch
    departmentId: 'dept-6', // Sales
    source: 'LinkedIn',
    assignedTo: 'user-25', // Jordan Taylor
  },
  {
    id: '6',
    candidate: 'Alex Johnson',
    position: 'Backend Developer',
    status: 'pending',
    created: '2025-04-24T09:15:00',
    email: 'alex.johnson@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    locationId: 'loc-4', // Chicago Office
    departmentId: 'dept-7', // Marketing (Recruitment)
    source: 'Indeed',
    assignedTo: 'user-26', // Taylor Reed
  },
  {
    id: '7',
    candidate: 'Jamie Garcia',
    position: 'Mobile Developer',
    status: 'completed',
    created: '2025-04-17T13:45:00',
    completedAt: '2025-04-18T16:20:00',
    score: 89,
    email: 'jamie.garcia@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    locationId: 'loc-4', // Chicago Office
    departmentId: 'dept-8', // Sales
    source: 'Referral',
    assignedTo: 'user-27', // Drew Garcia
  },
  {
    id: '8',
    candidate: 'Riley Martinez',
    position: 'Marketing Specialist',
    status: 'scheduled',
    created: '2025-04-22T15:30:00',
    scheduledFor: '2025-04-29T10:00:00',
    email: 'riley.martinez@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    locationId: 'loc-1', // Miami Headquarters
    departmentId: 'dept-1', // Marketing (Recruitment)
    source: 'Company Website',
    assignedTo: 'user-11', // Sarah Chen
  }
];

/**
 * ScreeningsPage - Manages candidate screening processes
 * Admin users have full access to all screenings across the organization
 * and can initiate, reschedule, or view results for any candidate
 */
const ScreeningsPage = () => {
  const { user } = useAuth();
  const adminUser = isAdmin(user?.role);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [isScreeningDialogOpen, setIsScreeningDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showDashboard, setShowDashboard] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState<'date' | 'name'>('date');

  // Get role-filtered screenings for metrics
  const roleFilteredScreeningsForMetrics = useMemo(() => {
    // CEO can see all screenings
    if (user?.role === 'ceo') {
      return mockScreenings;
    }

    // Branch Manager can only see screenings from their location
    if (user?.role === 'branch-manager' && user?.locationId) {
      return mockScreenings.filter(screening => screening.locationId === user.locationId);
    }

    // Department roles can only see screenings from their department and location
    if (['marketing-head', 'marketing-supervisor', 'marketing-recruiter', 'marketing-associate'].includes(user?.role || '')) {
      let filteredScreenings = mockScreenings;

      // Filter by department if available
      if (user?.departmentId) {
        filteredScreenings = filteredScreenings.filter(screening => screening.departmentId === user.departmentId);
      }

      // Filter by location if available
      if (user?.locationId) {
        filteredScreenings = filteredScreenings.filter(screening => screening.locationId === user.locationId);
      }

      return filteredScreenings;
    }

    return mockScreenings;
  }, [user]);

  // Compute metrics and filters
  const screeningsByLocation = useMemo(() => {
    const result: Record<string, number> = {};
    roleFilteredScreeningsForMetrics.forEach(screening => {
      if (screening.locationId) {
        result[screening.locationId] = (result[screening.locationId] || 0) + 1;
      }
    });
    return result;
  }, [roleFilteredScreeningsForMetrics]);

  const screeningsByDepartment = useMemo(() => {
    const result: Record<string, number> = {};
    roleFilteredScreeningsForMetrics.forEach(screening => {
      if (screening.departmentId) {
        result[screening.departmentId] = (result[screening.departmentId] || 0) + 1;
      }
    });
    return result;
  }, [roleFilteredScreeningsForMetrics]);

  const screeningsBySource = useMemo(() => {
    const result: Record<string, number> = {};
    roleFilteredScreeningsForMetrics.forEach(screening => {
      if (screening.source) {
        result[screening.source] = (result[screening.source] || 0) + 1;
      }
    });
    return result;
  }, [roleFilteredScreeningsForMetrics]);

  // Filter screenings based on user role, tab, search term, position, location, and department
  const filterScreenings = () => {
    // First filter by user role - use the same logic as roleFilteredScreeningsForMetrics
    let roleFilteredScreenings = roleFilteredScreeningsForMetrics;

    // Then apply other filters
    return roleFilteredScreenings.filter(screening => {
      // Filter by tab (status)
      if (activeTab !== 'all' && screening.status !== activeTab) return false;

      // Filter by search term
      if (searchTerm && !screening.candidate.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      // Filter by position
      if (positionFilter !== 'all' && screening.position !== positionFilter) return false;

      // Filter by location
      if (locationFilter !== 'all' && screening.locationId !== locationFilter) return false;

      // Filter by department
      if (departmentFilter !== 'all' && screening.departmentId !== departmentFilter) return false;

      // Filter by source
      if (sourceFilter !== 'all' && screening.source !== sourceFilter) return false;

      return true;
    }).sort((a, b) => {
      // Sort by date (newest first)
      if (sortOrder === 'date') {
        return new Date(b.created).getTime() - new Date(a.created).getTime();
      }

      // Sort by name (alphabetical)
      return a.candidate.localeCompare(b.candidate);
    });
  };

  // Get unique values for filters
  const positions = ['all', ...new Set(roleFilteredScreeningsForMetrics.map(s => s.position))];
  const sources = ['all', ...new Set(roleFilteredScreeningsForMetrics.filter(s => s.source).map(s => s.source as string))];

  // Calculate metrics for dashboard
  const totalScreenings = roleFilteredScreeningsForMetrics.length;
  const screeningsByStatus = {
    pending: roleFilteredScreeningsForMetrics.filter(s => s.status === 'pending').length,
    scheduled: roleFilteredScreeningsForMetrics.filter(s => s.status === 'scheduled').length,
    completed: roleFilteredScreeningsForMetrics.filter(s => s.status === 'completed').length,
  };

  // Handle actions - Admin can always send screenings for any candidate
  const handleSendScreening = (screening: any) => {
    // Admin users can bypass any workflow restrictions here
    setSelectedCandidate({
      id: screening.id,
      name: screening.candidate,
      position: screening.position,
      email: screening.email
    });
    setIsScreeningDialogOpen(true);
  };

  const handleViewResults = (screening: any) => {
    // For completed screenings, view the results
    setSelectedCandidate({
      id: screening.id,
      name: screening.candidate,
      position: screening.position,
      email: screening.email,
      score: screening.score
    });
    setIsScreeningDialogOpen(true);
  };

  const handleReschedule = (id: string) => {
    toast({
      title: "Reschedule Screening",
      description: `Rescheduling screening for ID: ${id}`,
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800"><AlertCircle className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" /> Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><FileCheck className="h-3 w-3 mr-1" /> Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get action button based on status
  const getActionButton = (screening: any) => {
    switch (screening.status) {
      case 'pending':
        return (
          <Button
            size="sm"
            onClick={() => handleSendScreening(screening)}
          >
            <Play className="h-3 w-3 mr-1" /> Start Screening
          </Button>
        );
      case 'scheduled':
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleReschedule(screening.id)}
          >
            <Clock className="h-3 w-3 mr-1" /> Reschedule
          </Button>
        );
      case 'completed':
        return (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleViewResults(screening)}
          >
            <BarChart3 className="h-3 w-3 mr-1" /> View Results
          </Button>
        );
      default:
        return null;
    }
  };

  const filteredScreenings = filterScreenings();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Screenings</h1>
          <p className="text-muted-foreground mt-2">
            Manage AI screenings for candidates
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showDashboard ? "default" : "outline"}
            onClick={() => setShowDashboard(true)}
            className="flex items-center gap-1"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
          <Button
            variant={!showDashboard ? "default" : "outline"}
            onClick={() => setShowDashboard(false)}
            className="flex items-center gap-1"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Screenings</span>
          </Button>
          <Button variant="outline" onClick={() => toast({ title: "Export Data", description: "Exporting screening data to CSV" })}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="bg-recruit-info/30 p-2 rounded-full mb-3">
                <BarChart3 className="h-5 w-5 text-recruit-secondary" />
              </div>
              <div className="text-2xl font-bold">{totalScreenings}</div>
              <p className="text-sm text-muted-foreground">Total Screenings</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="bg-amber-100 p-2 rounded-full mb-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-2xl font-bold">{screeningsByStatus.pending}</div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-2 rounded-full mb-3">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{screeningsByStatus.scheduled}</div>
              <p className="text-sm text-muted-foreground">Scheduled</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-2 rounded-full mb-3">
                <FileCheck className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{screeningsByStatus.completed}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard View */}
      {showDashboard && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                Screenings by Location
              </CardTitle>
              <CardDescription>
                Distribution of screenings across different office locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLocations.map(location => {
                  const count = screeningsByLocation[location.id] || 0;
                  const percentage = totalScreenings > 0 ? Math.round((count / totalScreenings) * 100) : 0;

                  return (
                    <div key={location.id} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{location.name}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{count}</span>
                          <span className="text-muted-foreground ml-1">({percentage}%)</span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">{location.city}, {location.state}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline" size="sm" onClick={() => {
                setLocationFilter('all');
                setShowDashboard(false);
              }}>
                View All Locations
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toast({ title: "Export", description: "Exporting location data" })}>
                <Download className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Department Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                Screenings by Department
              </CardTitle>
              <CardDescription>
                Distribution of screenings across different departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDepartments.map(department => {
                  const count = screeningsByDepartment[department.id] || 0;
                  const percentage = totalScreenings > 0 ? Math.round((count / totalScreenings) * 100) : 0;
                  const location = mockLocations.find(loc => loc.id === department.locationId);

                  return (
                    <div key={department.id} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{department.name}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{count}</span>
                          <span className="text-muted-foreground ml-1">({percentage}%)</span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{location?.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline" size="sm" onClick={() => {
                setDepartmentFilter('all');
                setShowDashboard(false);
              }}>
                View All Departments
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toast({ title: "Export", description: "Exporting department data" })}>
                <Download className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5 text-muted-foreground" />
                Screenings by Status
              </CardTitle>
              <CardDescription>
                Distribution of screenings across different stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(screeningsByStatus).map(([status, count]) => {
                  const percentage = totalScreenings > 0 ? Math.round((count / totalScreenings) * 100) : 0;
                  const statusColors: Record<string, string> = {
                    pending: 'bg-amber-100',
                    scheduled: 'bg-blue-100',
                    completed: 'bg-green-100'
                  };
                  const statusTextColors: Record<string, string> = {
                    pending: 'text-amber-800',
                    scheduled: 'text-blue-800',
                    completed: 'text-green-800'
                  };

                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge className={`${statusColors[status]} ${statusTextColors[status]}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{count}</span>
                          <span className="text-muted-foreground ml-1">({percentage}%)</span>
                        </div>
                      </div>
                      <Progress
                        value={percentage}
                        className="h-2"
                        indicatorClassName={statusColors[status]}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline" size="sm" onClick={() => {
                setActiveTab('all');
                setShowDashboard(false);
              }}>
                View All Statuses
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toast({ title: "Export", description: "Exporting status data" })}>
                <Download className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Source Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-5 w-5 text-muted-foreground" />
                Screenings by Source
              </CardTitle>
              <CardDescription>
                Distribution of screenings by candidate source
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(screeningsBySource).map(([source, count]) => {
                  const percentage = totalScreenings > 0 ? Math.round((count / totalScreenings) * 100) : 0;

                  return (
                    <div key={source} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="h-5 px-2">
                            {source}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{count}</span>
                          <span className="text-muted-foreground ml-1">({percentage}%)</span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline" size="sm" onClick={() => {
                setSourceFilter('all');
                setShowDashboard(false);
              }}>
                View All Sources
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toast({ title: "Export", description: "Exporting source data" })}>
                <Download className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="relative sm:col-span-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Location" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {mockLocations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Department" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {mockDepartments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2 flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="sr-only">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortOrder('date')}>
                  Sort by Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('name')}>
                  Sort by Name
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-1 text-muted-foreground"
          >
            <Filter className="h-4 w-4" />
            {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
            <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab('all');
                setPositionFilter('all');
                setLocationFilter('all');
                setDepartmentFilter('all');
                setSourceFilter('all');
                setSearchTerm('');
              }}
              className="text-xs"
            >
              Clear Filters
            </Button>

            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
              {filteredScreenings.length} screenings
            </Badge>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-md bg-muted/10">
            <div>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Position" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {positions.filter(p => p !== 'all').map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Layers className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Source" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {sources.filter(s => s !== 'all').map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Screenings List */}
      <Card>
        <CardHeader>
          <CardTitle>TalentPulse Screenings</CardTitle>
          <CardDescription>Manage voice-based candidate screenings</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            {filteredScreenings.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No screenings found for the current filters
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Candidate</th>
                      <th className="text-left py-3 px-4">Position</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Location</th>
                      <th className="text-left py-3 px-4">Department</th>
                      <th className="text-left py-3 px-4">Created</th>
                      <th className="text-left py-3 px-4">Details</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredScreenings.map((screening) => (
                      <tr key={screening.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full overflow-hidden mr-3">
                              <img
                                src={screening.avatarUrl}
                                alt={screening.candidate}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{screening.candidate}</p>
                              <p className="text-xs text-muted-foreground">{screening.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{screening.position}</td>
                        <td className="py-3 px-4">
                          {getStatusBadge(screening.status)}
                        </td>
                        <td className="py-3 px-4">
                          {screening.locationId ? (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{getLocationById(screening.locationId)?.name || 'Unknown'}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not specified</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {screening.departmentId ? (
                            <div className="flex items-center">
                              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{getDepartmentById(screening.departmentId)?.name || 'Unknown'}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not specified</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(screening.created).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {screening.status === 'scheduled' && (
                            <p className="text-xs">
                              Scheduled for:{' '}
                              <span className="font-medium">
                                {new Date(screening.scheduledFor).toLocaleDateString()}
                              </span>
                            </p>
                          )}
                          {screening.status === 'completed' && (
                            <p className="text-xs">
                              Score:{' '}
                              <span className="font-medium">{screening.score}%</span>
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {getActionButton(screening)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How TalentPulse Screening Works</CardTitle>
          <CardDescription>Understanding the voice-based screening process</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-muted p-4 rounded-lg">
              <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Play className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Step 1: Initiate Screening</h3>
              <p className="text-sm text-muted-foreground">
                Send a screening link to candidates via email or WhatsApp. They can complete it on their own time.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Step 2: TalentPulse Analysis</h3>
              <p className="text-sm text-muted-foreground">
                TalentPulse analyzes responses for technical accuracy, communication skills, and problem-solving ability.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <FileCheck className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Step 3: Review Results</h3>
              <p className="text-sm text-muted-foreground">
                Review AI-generated feedback and scores to make informed decisions about advancing candidates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Screening Dialog */}
      {selectedCandidate && (
        <ScreeningDialog
          isOpen={isScreeningDialogOpen}
          onClose={() => setIsScreeningDialogOpen(false)}
          candidate={selectedCandidate}
        />
      )}
    </div>
  );
};

export default ScreeningsPage;
