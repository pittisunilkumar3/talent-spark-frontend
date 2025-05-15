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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Shield, Loader2 } from 'lucide-react';
import { roleService, Role } from '@/services/roleService';

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

const RolePermissionsPage = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRoleDetails = async () => {
      setIsLoading(true);
      try {
        if (!roleId) {
          toast({
            title: "Invalid role ID",
            description: "No role ID was provided.",
            variant: "destructive",
          });
          navigate('/roles');
          return;
        }

        const response = await roleService.getRoleById(roleId);

        if (response.success && response.data) {
          setRole(response.data);
          // For now, we'll use mock permissions until we implement the permissions API
          setPermissions(['users.view', 'users.edit']);
        } else {
          toast({
            title: "Role not found",
            description: "The requested role could not be found.",
            variant: "destructive",
          });
          navigate('/roles');
        }
      } catch (error) {
        console.error('Error fetching role details:', error);
        toast({
          title: "Error",
          description: "Failed to load role details. Please try again.",
          variant: "destructive",
        });
        navigate('/roles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoleDetails();
  }, [roleId, navigate, toast]);

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setPermissions(prev =>
      checked
        ? [...prev, permissionId]
        : prev.filter(id => id !== permissionId)
    );
  };

  const handleCategorySelectAll = (categoryId: string, checked: boolean) => {
    const category = permissionCategories.find(cat => cat.id === categoryId);
    if (!category) return;

    const categoryPermissionIds = category.permissions.map(p => p.id);

    setPermissions(prev =>
      checked
        ? [...new Set([...prev, ...categoryPermissionIds])]
        : prev.filter(id => !categoryPermissionIds.includes(id))
    );
  };

  const isCategorySelected = (categoryId: string) => {
    const category = permissionCategories.find(cat => cat.id === categoryId);
    if (!category) return false;

    return category.permissions.every(p => permissions.includes(p.id));
  };

  const isPermissionSelected = (permissionId: string) => {
    return permissions.includes(permissionId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (permissions.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one permission for this role.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // In a real implementation, we would call an API to update the role permissions
      // For now, we'll just simulate a successful update

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Permissions Updated",
        description: `Permissions for role "${role?.name}" have been updated successfully.`,
      });

      // Navigate back to role details
      navigate(`/roles/${roleId}`);
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        title: "Error",
        description: "Failed to update permissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Loading role details...</p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="container mx-auto py-6 flex justify-center">
        <p>Role not found.</p>
      </div>
    );
  }

  // Prevent editing system roles
  const isSystemRole = role.is_system;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate('/roles')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Roles
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Shield className="h-6 w-6 mr-2 text-primary" />
            {role.name} - Permissions
          </h1>
          <p className="text-muted-foreground">
            Manage permissions for this role
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>
              Select the permissions for this role
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSystemRole ? (
              <div className="bg-primary/10 p-4 rounded-md mb-4">
                <p className="text-sm flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-primary" />
                  System roles have predefined permissions that cannot be modified.
                </p>
              </div>
            ) : null}

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
                        disabled={isSystemRole || isSubmitting}
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
                            disabled={isSystemRole || isSubmitting}
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
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/roles/${roleId}`)}
              className="mr-2"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSystemRole || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Permissions
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default RolePermissionsPage;
