import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { roleService, Role } from '@/services/roleService';
import { permissionService, PermissionGroup } from '@/services/permissionService';

// Define permission modules and features
const permissionModules = [
  {
    id: 'student-information',
    name: 'Student Information',
    features: [
      { id: 'student', name: 'Student' },
      { id: 'import-student', name: 'Import Student' },
      { id: 'student-categories', name: 'Student Categories' },
      { id: 'student-houses', name: 'Student Houses' },
      { id: 'disable-student', name: 'Disable Student' },
      { id: 'student-timeline', name: 'Student Timeline' },
      { id: 'disable-reason', name: 'Disable Reason' },
    ],
  },
  {
    id: 'fees-collection',
    name: 'Fees Collection',
    features: [
      { id: 'collect-fees', name: 'Collect Fees' },
      { id: 'fees-carry-forward', name: 'Fees Carry Forward' },
      { id: 'fees-master', name: 'Fees Master' },
      { id: 'fees-group', name: 'Fees Group' },
      { id: 'fees-group-assign', name: 'Fees Group Assign' },
      { id: 'fees-type', name: 'Fees Type' },
      { id: 'fees-discount', name: 'Fees Discount' },
      { id: 'fees-discount-assign', name: 'Fees Discount Assign' },
      { id: 'search-fees-payment', name: 'Search Fees Payment' },
      { id: 'search-due-fees', name: 'Search Due Fees' },
      { id: 'fees-reminder', name: 'Fees Reminder' },
      { id: 'offline-bank-payments', name: 'Offline Bank Payments' },
    ],
  },
];

// Permission types
const permissionTypes = [
  { id: 'view', name: 'View' },
  { id: 'add', name: 'Add' },
  { id: 'edit', name: 'Edit' },
  { id: 'delete', name: 'Delete' },
];

const RolePermissionsPage = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
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
          // Initialize with default permissions
          // In a real implementation, you would fetch the actual role permissions from the API
          const defaultPermissions: Record<string, string[]> = {};
          setPermissions(defaultPermissions);
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

  useEffect(() => {
    const fetchPermissionGroups = async () => {
      setIsLoadingPermissions(true);
      try {
        const response = await permissionService.getPermissionGroupsWithCategories({
          is_active: true,
          limit: 100 // Get all active permission groups
        });

        if (response.success) {
          console.log('Permission groups response:', response);
          setPermissionGroups(response.data);

          // Initialize permissions based on categories
          const initialPermissions: Record<string, string[]> = {};
          response.data.forEach(group => {
            console.log('Processing group:', group.name);
            // Check if PermissionCategories exists and is an array
            if (group.PermissionCategories && Array.isArray(group.PermissionCategories)) {
              console.log(`Group ${group.name} has ${group.PermissionCategories.length} categories`);
              group.PermissionCategories.forEach(category => {
                console.log('Processing category:', category.name);
                const permTypes = [];
                if (category.enable_view) permTypes.push('view');
                if (category.enable_add) permTypes.push('add');
                if (category.enable_edit) permTypes.push('edit');
                if (category.enable_delete) permTypes.push('delete');

                console.log('Category permission types:', permTypes);
                initialPermissions[category.short_code] = [];
              });
            } else {
              console.log(`Group ${group.name} has no PermissionCategories or PermissionCategories is not an array`);
            }
          });

          console.log('Initial permissions:', initialPermissions);
          setPermissions(prev => ({...prev, ...initialPermissions}));
        } else {
          toast({
            title: "Error",
            description: "Failed to load permission groups. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching permission groups:', error);
        toast({
          title: "Error",
          description: "Failed to load permission groups. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    fetchPermissionGroups();
  }, [toast]);

  const handlePermissionChange = (featureId: string, permissionType: string, checked: boolean) => {
    setPermissions(prev => {
      const updatedPermissions = { ...prev };

      if (!updatedPermissions[featureId]) {
        updatedPermissions[featureId] = [];
      }

      if (checked) {
        if (!updatedPermissions[featureId].includes(permissionType)) {
          updatedPermissions[featureId] = [...updatedPermissions[featureId], permissionType];
        }
      } else {
        updatedPermissions[featureId] = updatedPermissions[featureId].filter(p => p !== permissionType);
      }

      return updatedPermissions;
    });
  };

  const isPermissionSelected = (featureId: string, permissionType: string) => {
    return permissions[featureId]?.includes(permissionType) || false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real implementation, we would call an API to update the role permissions
      // For now, we'll just simulate a successful update
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

  if (isLoading || isLoadingPermissions) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Loading {isLoading ? 'role details' : 'permissions'}...</p>
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

  // Check if we have any permission groups with categories
  const hasPermissionCategories = permissionGroups.some(group =>
    group.PermissionCategories && Array.isArray(group.PermissionCategories) && group.PermissionCategories.length > 0
  );

  if (permissionGroups.length === 0 || !hasPermissionCategories) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/roles')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roles
          </Button>
          <h1 className="text-2xl font-bold">Assign Permission ({role.name})</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p>No permission groups or categories found. Please create permission groups and categories first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/roles')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Roles
        </Button>
        <h1 className="text-2xl font-bold">Assign Permission ({role.name})</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 w-1/4">Module</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 w-1/4">Feature</th>
                    {permissionTypes.map(type => (
                      <th key={type.id} className="text-center py-3 px-4 font-medium text-gray-700">
                        {type.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissionGroups.map(group => (
                    <React.Fragment key={group.id}>
                      {group.PermissionCategories && Array.isArray(group.PermissionCategories) && group.PermissionCategories.map((category, categoryIndex) => (
                        <tr key={category.id} className={categoryIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          {categoryIndex === 0 ? (
                            <td
                              className="py-3 px-4 border-t"
                              rowSpan={group.PermissionCategories.length}
                            >
                              {group.name}
                            </td>
                          ) : null}
                          <td className="py-3 px-4 border-t">{category.name}</td>
                          {permissionTypes.map(type => (
                            <td key={type.id} className="text-center py-3 px-4 border-t">
                              {/* Only show checkbox if the permission type is enabled for this category */}
                              {(
                                (type.id === 'view' && category.enable_view) ||
                                (type.id === 'add' && category.enable_add) ||
                                (type.id === 'edit' && category.enable_edit) ||
                                (type.id === 'delete' && category.enable_delete)
                              ) ? (
                                <Checkbox
                                  id={`${category.short_code}-${type.id}`}
                                  checked={isPermissionSelected(category.short_code, type.id)}
                                  onCheckedChange={(checked) =>
                                    handlePermissionChange(category.short_code, type.id, checked as boolean)
                                  }
                                  disabled={isSubmitting}
                                  className="mx-auto"
                                />
                              ) : null}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/roles/${roleId}`)}
            className="mr-2"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
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
        </div>
      </form>
    </div>
  );
};

export default RolePermissionsPage;
