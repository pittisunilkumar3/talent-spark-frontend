import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Building2,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  FileUp,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { JobStatus, JobPriority, mockJobListings } from '@/types/jobs';
import { mockLocations, mockDepartments } from '@/types/organization';
import ProfitCalculator from '@/components/profit/ProfitCalculator';
import JobDescriptionUploader from '@/components/jobs/JobDescriptionUploader';

// Mock users for assignment
const mockUsers = [
  {
    id: 'user-3',
    name: 'Jamie Garcia',
    email: 'scout@talentspark.com',
    role: 'talent-scout',
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'user-4',
    name: 'Robin Taylor',
    email: 'member@talentspark.com',
    role: 'team-member',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'user-6',
    name: 'Jordan Lee',
    email: 'jordan@talentspark.com',
    role: 'talent-scout',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'user-7',
    name: 'Taylor Smith',
    email: 'taylor@talentspark.com',
    role: 'team-member',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'user-8',
    name: 'Casey Wilson',
    email: 'casey@talentspark.com',
    role: 'talent-scout',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
];

const JobCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ceo';
  const isHiringManager = user?.role === 'branch-manager' || user?.role === 'marketing-head' || user?.role === 'marketing-supervisor';

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [locationId, setLocationId] = useState(isAdmin ? '' : 'loc-1'); // Default to Miami for hiring managers
  const [status, setStatus] = useState<JobStatus>('draft');
  const [priority, setPriority] = useState<JobPriority>('medium');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [employmentType, setEmploymentType] = useState('full-time');
  const [requirements, setRequirements] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [benefits, setBenefits] = useState('');
  const [deadline, setDeadline] = useState('');
  const [assigneeId, setAssigneeId] = useState('unassigned');

  // Profit optimization fields
  const [clientBudget, setClientBudget] = useState('');
  const [companyProfit, setCompanyProfit] = useState('');
  const [candidateOffer, setCandidateOffer] = useState('');
  const [companyProfitPercentage, setCompanyProfitPercentage] = useState('30'); // Default 30%

  // Filter users based on role
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);

  // Filter users based on selected location
  useEffect(() => {
    if (locationId) {
      // In a real app, we would filter users based on their assigned location
      // For demo purposes, let's simulate this by assigning locations to users
      const locationBasedUsers = mockUsers.filter((user, index) => {
        // For demo: assign first 2 users to Miami, next 2 to New York, last one to San Francisco
        if (index < 2 && locationId === 'loc-1') return true;
        if (index >= 2 && index < 4 && locationId === 'loc-2') return true;
        if (index >= 4 && locationId === 'loc-3') return true;
        return false;
      });
      setFilteredUsers(locationBasedUsers);

      // Reset assignee if the current assignee is not in the filtered list
      if (assigneeId !== 'unassigned' && !locationBasedUsers.some(u => u.id === assigneeId)) {
        setAssigneeId('unassigned');
      }
    } else {
      // If no location is selected, show no users
      setFilteredUsers([]);
    }
  }, [locationId, assigneeId]);

  // Calculate profit splits when client budget changes
  useEffect(() => {
    if (clientBudget) {
      const budget = parseFloat(clientBudget);
      if (!isNaN(budget)) {
        // Calculate company profit (35% to company by default)
        const profit = Math.round(budget * 0.35);
        setCompanyProfit(profit.toString());

        // Calculate candidate offer
        const offer = budget - profit;
        setCandidateOffer(offer.toString());
      }
    }
  }, [clientBudget]);

  // Update candidate offer when company profit changes
  useEffect(() => {
    if (clientBudget && companyProfit) {
      const budget = parseFloat(clientBudget);
      const profit = parseFloat(companyProfit);

      if (!isNaN(budget) && !isNaN(profit)) {
        const offer = budget - profit;
        setCandidateOffer(offer.toString());
      }
    }
  }, [clientBudget, companyProfit]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!title || !description || !departmentId || !locationId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate profit optimization fields for admin and hiring manager
    if ((isAdmin || isHiringManager) && (!clientBudget || !companyProfit || !candidateOffer)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all budget fields",
        variant: "destructive",
      });
      return;
    }

    // Validate that company profit + candidate offer equals client budget
    if (isAdmin || isHiringManager) {
      const budget = parseFloat(clientBudget);
      const profit = parseFloat(companyProfit);
      const offer = parseFloat(candidateOffer);

      if (Math.abs((profit + offer) - budget) > 0.01) { // Allow for small rounding errors
        toast({
          title: "Validation Error",
          description: "Company profit + candidate offer must equal client budget",
          variant: "destructive",
        });
        return;
      }
    }

    // Get assignee details if selected and not unassigned
    const selectedAssignee = assigneeId && assigneeId !== 'unassigned' ? mockUsers.find(u => u.id === assigneeId) : null;

    // In a real app, this would be an API call to create the job
    const newJob = {
      id: `job-${mockJobListings.length + 1}`,
      title,
      description,
      department: mockDepartments.find(d => d.id === departmentId)?.name || '',
      departmentId,
      location: mockLocations.find(l => l.id === locationId)?.name || '',
      locationId,
      status,
      priority,
      assignedTo: selectedAssignee?.id || null,
      assignedToName: selectedAssignee?.name || null,
      applicantsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deadline: deadline ? new Date(deadline).toISOString() : null,
      salary: {
        min: parseInt(minSalary) || 0,
        max: parseInt(maxSalary) || 0,
        currency: 'USD'
      },
      // Profit optimization fields
      clientBudget: parseFloat(clientBudget) || 0,
      companyProfit: parseFloat(companyProfit) || 0,
      companyProfitPercentage: Math.round((parseFloat(companyProfit) / parseFloat(clientBudget)) * 100) || 35,
      candidateOffer: parseFloat(candidateOffer) || 0,
      consultancyFeePercentage: parseInt(companyProfitPercentage) || 30,
      consultancyFee: parseFloat(candidateOffer) * (parseInt(companyProfitPercentage) / 100) || 0,
      finalCandidateRate: parseFloat(candidateOffer) * (1 - parseInt(companyProfitPercentage) / 100) || 0,
      requirements: requirements.split('\n').filter(r => r.trim()),
      responsibilities: responsibilities.split('\n').filter(r => r.trim()),
      benefits: benefits.split('\n').filter(b => b.trim()),
      isRemote,
      employmentType: employmentType as any,
    };

    // In a real app, we would add this to the database
    // For now, just show a success message and navigate back
    toast({
      title: "Job Created",
      description: "The job listing has been created successfully",
    });

    navigate('/jobs-management');
  };

  // Get available departments based on selected location
  const availableDepartments = locationId
    ? mockDepartments.filter(dept => {
        const location = mockLocations.find(loc => loc.id === locationId);
        return location?.departmentIds.includes(dept.id);
      })
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => navigate('/jobs-management')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Job</h1>
            <p className="text-muted-foreground mt-1">
              Create a new job listing for candidates to apply
            </p>
          </div>
        </div>
        <Button onClick={handleSubmit}>
          <Save className="h-4 w-4 mr-2" />
          Create Job
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Job Description</CardTitle>
            <CardDescription>Upload a PDF or Word document to automatically fill the form</CardDescription>
          </CardHeader>
          <CardContent>
            <JobDescriptionUploader
              onParsedData={(data) => {
                if (data.title) setTitle(data.title);
                if (data.description) setDescription(data.description);
                if (data.requirements) setRequirements(data.requirements);
                if (data.responsibilities) setResponsibilities(data.responsibilities);
                if (data.benefits) setBenefits(data.benefits);
                if (data.minSalary) setMinSalary(data.minSalary);
                if (data.maxSalary) setMaxSalary(data.maxSalary);
                if (data.isRemote !== undefined) setIsRemote(data.isRemote);
                if (data.employmentType) setEmploymentType(data.employmentType);
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the basic details for this job listing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  placeholder="e.g. Senior Software Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  placeholder="Enter a detailed description of the job..."
                  className="min-h-[120px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                  <Select value={locationId} onValueChange={setLocationId} required>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockLocations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
                <Select
                  value={departmentId}
                  onValueChange={setDepartmentId}
                  disabled={!locationId}
                  required
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder={locationId ? "Select a department" : "Select a location first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDepartments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as JobStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as JobPriority)}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select a priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assignee Selection - Only for Admin and Hiring Manager */}
              {(isAdmin || isHiringManager) && (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="assignee">Assign To</Label>
                  <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger id="assignee">
                      <SelectValue placeholder="Select a person to assign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {filteredUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center">
                            <span>{user.name} ({user.role === 'talent-scout' ? 'Scout' : 'Team Member'})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Show selected assignee details */}
                  {assigneeId && assigneeId !== 'unassigned' && (
                    <div className="mt-4 p-3 border rounded-md bg-muted/30">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={mockUsers.find(u => u.id === assigneeId)?.avatar} />
                          <AvatarFallback>{mockUsers.find(u => u.id === assigneeId)?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{mockUsers.find(u => u.id === assigneeId)?.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {mockUsers.find(u => u.id === assigneeId)?.role === 'talent-scout' ? 'Talent Scout' : 'Team Member'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {mockUsers.find(u => u.id === assigneeId)?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Additional information about the job</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minSalary">Minimum Salary</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="minSalary"
                    type="number"
                    placeholder="e.g. 50000"
                    className="pl-8"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxSalary">Maximum Salary</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="maxSalary"
                    type="number"
                    placeholder="e.g. 80000"
                    className="pl-8"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select value={employmentType} onValueChange={setEmploymentType}>
                  <SelectTrigger id="employmentType">
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Checkbox
                  id="isRemote"
                  checked={isRemote}
                  onCheckedChange={(checked) => setIsRemote(checked as boolean)}
                />
                <label
                  htmlFor="isRemote"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  This is a remote position
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profit Optimization - Only for Admin and Hiring Manager */}
        {(isAdmin || isHiringManager) && (
          <Card>
            <CardHeader>
              <CardTitle>Profit Optimization</CardTitle>
              <CardDescription>Configure budget and profit splits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProfitCalculator
                initialValues={{
                  clientBudget: clientBudget ? parseFloat(clientBudget) : 120,
                  internalBudget: parseFloat(candidateOffer) || 90,
                  candidateSplit: 100 - (parseFloat(companyProfitPercentage) || 20),
                  companySplit: parseFloat(companyProfitPercentage) || 20
                }}
                onCalculate={(values) => {
                  setClientBudget(values.clientBudget.toString());
                  setCompanyProfit(values.clientToCompanyProfit.toString());
                  setCandidateOffer(values.internalBudget.toString());
                  setCompanyProfitPercentage(values.companySplit.toString());
                }}
              />

              <div className="mt-4 pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Only the Company-to-Candidate split percentage ({companyProfitPercentage}%) will be visible to employees.
                  The Client-to-Company split is confidential.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Job Requirements & Responsibilities</CardTitle>
            <CardDescription>Enter details about what the job entails</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <p className="text-sm text-muted-foreground">Enter each requirement on a new line</p>
              <Textarea
                id="requirements"
                placeholder="e.g. Bachelor's degree in Computer Science
5+ years of experience in software development
Strong knowledge of JavaScript and TypeScript"
                className="min-h-[120px]"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsibilities</Label>
              <p className="text-sm text-muted-foreground">Enter each responsibility on a new line</p>
              <Textarea
                id="responsibilities"
                placeholder="e.g. Design and implement new features
Collaborate with cross-functional teams
Mentor junior developers"
                className="min-h-[120px]"
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits</Label>
              <p className="text-sm text-muted-foreground">Enter each benefit on a new line</p>
              <Textarea
                id="benefits"
                placeholder="e.g. Competitive salary
Health insurance
401(k) matching
Flexible work hours"
                className="min-h-[120px]"
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            <Save className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JobCreatePage;
