import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { 
  permissionService, 
  PermissionGroup, 
  PermissionGroupQueryParams 
} from '@/services/permissionService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const PermissionGroupsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });
  const [queryParams, setQueryParams] = useState<PermissionGroupQueryParams>({
    page: 1,
    limit: 10,
    is_active: true
  });

  useEffect(() => {
    fetchPermissionGroups();
  }, [queryParams]);

  const fetchPermissionGroups = async () => {
    setIsLoading(true);
    try {
      const response = await permissionService.getPermissionGroupsWithCategories(queryParams);
      
      if (response.success) {
        setPermissionGroups(response.data);
        setPagination(response.pagination);
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
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setQueryParams(prev => ({ ...prev, page }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQueryParams(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleSearchReset = () => {
    setSearchTerm('');
    setQueryParams(prev => ({ ...prev, search: undefined, page: 1 }));
  };

  if (isLoading && permissionGroups.length === 0) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Loading permission groups...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Permission Groups</h1>
      </div>

      <div className="flex justify-between items-center mb-4">
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search permission groups..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline" size="sm">
            Search
          </Button>
          {queryParams.search && (
            <Button type="button" variant="ghost" size="sm" onClick={handleSearchReset}>
              Clear
            </Button>
          )}
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Loading permission groups...</p>
        </div>
      ) : permissionGroups.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No permission groups found.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {permissionGroups.map((group) => (
            <Card key={group.id} className="mb-6">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">{group.name}</h2>
                  <p className="text-muted-foreground text-sm">{group.description}</p>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Permission Category</TableHead>
                      <TableHead className="text-center">View</TableHead>
                      <TableHead className="text-center">Add</TableHead>
                      <TableHead className="text-center">Edit</TableHead>
                      <TableHead className="text-center">Delete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={category.enable_view} 
                            disabled 
                            className="mx-auto" 
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={category.enable_add} 
                            disabled 
                            className="mx-auto" 
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={category.enable_edit} 
                            disabled 
                            className="mx-auto" 
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={category.enable_delete} 
                            disabled 
                            className="mx-auto" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}

          {pagination.pages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                    disabled={pagination.page === 1}
                  />
                </PaginationItem>
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === pagination.pages || 
                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                  )
                  .map((page, index, array) => {
                    // Add ellipsis if there are gaps in the sequence
                    if (index > 0 && page - array[index - 1] > 1) {
                      return (
                        <PaginationItem key={`ellipsis-${page}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === pagination.page}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                    disabled={pagination.page === pagination.pages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default PermissionGroupsPage;
