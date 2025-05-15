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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

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

const RoleEditPage = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    permissions: [] as string[],
  });
  const [originalKey, setOriginalKey] = useState('');
  const [isKeyEdited, setIsKeyEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, this would be an API call
    const foundRole = mockRoles.find(r => r.id === roleId);
    if (foundRole) {
      setFormData({
        name: foundRole.name,
        key: foundRole.key,
        description: foundRole.description,
        permissions: [...foundRole.permissions],
      });
      setOriginalKey(foundRole.key);
      setIsLoading(false);
    } else {
      toast({
        title: "Role not found",
        description: "The requested role could not be found.",
        variant: "destructive",
      });
      navigate('/roles');
    }
  }, [roleId, navigate, toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'key') {
      setIsKeyEdited(true);
    }
    
    if (name === 'name' && !isKeyEdited) {
      setFormData({
        ...formData,
        name: value,
        key: value.toLowerCase().replace(/\s+/g, '-'),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData({
      ...formData,
      permissions: checked
        ? [...formData.permissions, permissionId]
        : formData.permissions.filter(id => id !== permissionId),
    });
  };
  
  const handleCategorySelectAll = (categoryId: string, checked: boolean) => {
    const category = permissionCategories.find(cat => cat.id === categoryId);
    if (!category) return;
    
    const categoryPermissionIds = category.permissions.map(p => p.id);
    
    setFormData({
      ...formData,
      permissions: checked
        ? [...new Set([...formData.permissions, ...categoryPermissionIds])]
        : formData.permissions.filter(id => !categoryPermissionIds.includes(id)),
    });
  };
  
  const isCategorySelected = (categoryId: string) => {
    const category = permissionCategories.find(cat => cat.id === categoryId);
    if (!category) return false;
    
    return category.permissions.every(p => formData.permissions.includes(p.id));
  };
  
  const isPermissionSelected = (permissionId: string) => {
    return formData.permissions.includes(permissionId);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.key || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.permissions.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one permission for this role.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would call an API to update the role
    toast({
      title: "Role Updated",
      description: `Role "${formData.name}" has been updated successfully.`,
    });
    
    // Navigate back to role details
    navigate(`/roles/${roleId}`);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center">
        <p>Loading role details...</p>
      </div>
    );
  }
  
  // Prevent editing the CEO role key
  const isCeoRole = originalKey === 'ceo';
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate(`/roles/${roleId}`)} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Role Details
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Role</h1>
          <p className="text-muted-foreground">
            Update role information and permissions
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Role Information</CardTitle>
              <CardDescription>
                Basic information about the role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isCeoRole} // Prevent editing CEO role name
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="key">Role Key</Label>
                <Input
                  id="key"
                  name="key"
                  value={formData.key}
                  onChange={handleInputChange}
                  required
                  disabled={isCeoRole} // Prevent editing CEO role key
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier for the role
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>
                Select the permissions for this role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {permissionCategories.map((category) => (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={isCategorySelected(category.id)}
                          onCheckedChange={(checked) => 
                            handleCategorySelectAll(category.id, checked as boolean)
                          }
                          onClick={(e) => e.stopPropagation()}
                          disabled={isCeoRole} // Prevent editing CEO role permissions
                        />
                        <Label
                          htmlFor={`category-${category.id}`}
                          className="text-sm font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {category.name}
                        </Label>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="ml-6 space-y-2">
                        {category.permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={isPermissionSelected(permission.id)}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(permission.id, checked as boolean)
                              }
                              disabled={isCeoRole} // Prevent editing CEO role permissions
                            />
                            <Label
                              htmlFor={permission.id}
                              className="text-sm"
                            >
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {isCeoRole && (
                <div className="bg-primary/10 p-3 rounded-md mt-4">
                  <p className="text-sm">
                    The CEO role has full system access and its permissions cannot be modified.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(`/roles/${roleId}`)} className="mr-2">
            Cancel
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RoleEditPage;
