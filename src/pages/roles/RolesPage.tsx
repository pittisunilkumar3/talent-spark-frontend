import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  UserCheck, 
  Shield,
  Eye
} from 'lucide-react';

// Mock roles data
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

const RolesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter roles based on search query
  const filteredRoles = mockRoles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle role actions
  const handleViewRole = (roleId: string) => {
    navigate(`/roles/${roleId}`);
  };

  const handleEditRole = (roleId: string) => {
    navigate(`/roles/edit/${roleId}`);
  };

  const handleDeleteRole = (roleId: string) => {
    // In a real app, this would call an API to delete the role
    toast({
      title: "Role deletion",
      description: "This feature is not implemented yet.",
    });
  };

  const handleAddRole = () => {
    navigate('/roles/add');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles Management</h1>
          <p className="text-muted-foreground">
            View and manage user roles and their permissions
          </p>
        </div>
        <Button onClick={handleAddRole}>
          <Plus className="mr-2 h-4 w-4" /> Add New Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Roles</CardTitle>
          <CardDescription>
            Manage the roles available in the system and their associated permissions
          </CardDescription>
          <div className="flex w-full max-w-sm items-center space-x-2 mt-4">
            <Input
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <Button type="submit" size="icon" variant="ghost">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-primary" />
                      {role.name}
                    </div>
                  </TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.userCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 2).map((permission, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{role.permissions.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewRole(role.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditRole(role.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteRole(role.id)}
                          disabled={role.key === 'ceo'} // Prevent deleting CEO role
                          className={role.key === 'ceo' ? 'text-muted-foreground' : 'text-destructive'}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredRoles.length} of {mockRoles.length} roles
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RolesPage;
