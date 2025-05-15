import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Edit, 
  Trash, 
  Shield,
  Users,
  Check,
  X
} from 'lucide-react';

// Mock roles data - same as in RolesPage
const mockRoles = [
  { 
    id: '1', 
    name: 'CEO', 
    key: 'ceo', 
    description: 'Full access to all features and settings', 
    permissions: ['all'], 
    userCount: 1 
  },
  { 
    id: '2', 
    name: 'Branch Manager', 
    key: 'branch-manager', 
    description: 'Manages a specific branch location', 
    permissions: ['branch.*', 'users.view', 'users.edit'], 
    userCount: 3 
  },
  { 
    id: '3', 
    name: 'Marketing Head', 
    key: 'marketing-head', 
    description: 'Leads the marketing department', 
    permissions: ['marketing.*', 'users.view'], 
    userCount: 2 
  },
  { 
    id: '4', 
    name: 'Marketing Supervisor', 
    key: 'marketing-supervisor', 
    description: 'Supervises marketing team members', 
    permissions: ['marketing.view', 'marketing.edit', 'users.view'], 
    userCount: 4 
  },
  { 
    id: '5', 
    name: 'Marketing Recruiter', 
    key: 'marketing-recruiter', 
    description: 'Handles candidate recruitment', 
    permissions: ['candidates.*', 'resume.*'], 
    userCount: 8 
  },
  { 
    id: '6', 
    name: 'Marketing Associate', 
    key: 'marketing-associate', 
    description: 'Assists with marketing activities', 
    permissions: ['marketing.view', 'candidates.view'], 
    userCount: 12 
  },
  { 
    id: '7', 
    name: 'Applicant', 
    key: 'applicant', 
    description: 'External job applicant', 
    permissions: ['application.view', 'application.edit'], 
    userCount: 45 
  },
];

// Mock permission categories - same as in AddRolePage
const permissionCategories = [
  {
    id: 'users',
    name: 'User Management',
    permissions: [
      { id: 'users.view', name: 'View Users' },
      { id: 'users.create', name: 'Create Users' },
      { id: 'users.edit', name: 'Edit Users' },
      { id: 'users.delete', name: 'Delete Users' },
    ],
  },
  {
    id: 'roles',
    name: 'Role Management',
    permissions: [
      { id: 'roles.view', name: 'View Roles' },
      { id: 'roles.create', name: 'Create Roles' },
      { id: 'roles.edit', name: 'Edit Roles' },
      { id: 'roles.delete', name: 'Delete Roles' },
    ],
  },
  {
    id: 'jobs',
    name: 'Job Management',
    permissions: [
      { id: 'jobs.view', name: 'View Jobs' },
      { id: 'jobs.create', name: 'Create Jobs' },
      { id: 'jobs.edit', name: 'Edit Jobs' },
      { id: 'jobs.delete', name: 'Delete Jobs' },
    ],
  },
  {
    id: 'candidates',
    name: 'Candidate Management',
    permissions: [
      { id: 'candidates.view', name: 'View Candidates' },
      { id: 'candidates.create', name: 'Create Candidates' },
      { id: 'candidates.edit', name: 'Edit Candidates' },
      { id: 'candidates.delete', name: 'Delete Candidates' },
    ],
  },
  {
    id: 'interviews',
    name: 'Interview Management',
    permissions: [
      { id: 'interviews.view', name: 'View Interviews' },
      { id: 'interviews.schedule', name: 'Schedule Interviews' },
      { id: 'interviews.feedback', name: 'Provide Interview Feedback' },
    ],
  },
];

// Helper function to check if a role has a specific permission
const hasPermission = (rolePermissions: string[], permissionId: string): boolean => {
  if (rolePermissions.includes('all')) return true;
  
  // Check for wildcard permissions (e.g., 'users.*' includes 'users.view')
  const wildcardPrefix = permissionId.split('.')[0] + '.*';
  if (rolePermissions.includes(wildcardPrefix)) return true;
  
  return rolePermissions.includes(permissionId);
};

const RoleDetailsPage = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [role, setRole] = useState<typeof mockRoles[0] | null>(null);
  
  useEffect(() => {
    // In a real app, this would be an API call
    const foundRole = mockRoles.find(r => r.id === roleId);
    if (foundRole) {
      setRole(foundRole);
    } else {
      toast({
        title: "Role not found",
        description: "The requested role could not be found.",
        variant: "destructive",
      });
      navigate('/roles');
    }
  }, [roleId, navigate, toast]);
  
  const handleEditRole = () => {
    navigate(`/roles/edit/${roleId}`);
  };
  
  const handleDeleteRole = () => {
    // In a real app, this would call an API to delete the role
    toast({
      title: "Role deletion",
      description: "This feature is not implemented yet.",
    });
  };
  
  if (!role) {
    return (
      <div className="container mx-auto py-6 flex justify-center">
        <p>Loading role details...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate('/roles')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Roles
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Shield className="h-6 w-6 mr-2 text-primary" />
            {role.name}
          </h1>
          <p className="text-muted-foreground">
            {role.description}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleEditRole}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Role
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteRole}
            disabled={role.key === 'ceo'} // Prevent deleting CEO role
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete Role
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Role Information</CardTitle>
            <CardDescription>
              Basic information about the role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Role Name</h3>
                <p className="text-base">{role.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Role Key</h3>
                <p className="text-base font-mono">{role.key}</p>
              </div>
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="text-base">{role.description}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Users with this role</h3>
                <div className="flex items-center mt-1">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Badge variant="outline">{role.userCount}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>
              Permissions assigned to this role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {permissionCategories.map((category) => (
                <div key={category.id} className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">{category.name}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {category.permissions.map((permission) => {
                      const hasAccess = hasPermission(role.permissions, permission.id);
                      return (
                        <div key={permission.id} className="flex items-center">
                          {hasAccess ? (
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 mr-2 text-red-500" />
                          )}
                          <span className={hasAccess ? "" : "text-muted-foreground"}>
                            {permission.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {role.permissions.includes('all') && (
                <div className="bg-primary/10 p-3 rounded-md mt-4">
                  <p className="text-sm font-medium flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-primary" />
                    This role has full system access (all permissions)
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleDetailsPage;
