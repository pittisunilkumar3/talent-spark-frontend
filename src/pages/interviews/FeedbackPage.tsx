import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Filter, FileText, User, Calendar, Clock,
  ChevronDown, Star, StarHalf, MapPin, Building2,
  ThumbsUp, ThumbsDown, ArrowUpDown, CheckCircle2, XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { mockLocations, mockDepartments, getLocationById, getDepartmentById } from '@/types/organization';
import { useAuth } from '@/context/AuthContext';

// Mock feedback data based on the interviews
const mockFeedback = [
  {
    id: '1',
    candidateId: '3',
    candidateName: 'Morgan Chen',
    candidatePosition: 'Data Scientist',
    candidateAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    interviewType: 'technical',
    interviewDate: '2025-04-25T15:00:00',
    interviewers: ['Robin Taylor', 'Jamie Garcia'],
    locationId: 'loc-2',
    departmentId: 'dept-3',
    rating: 4,
    strengths: 'Strong technical skills in machine learning algorithms. Good understanding of data preprocessing techniques.',
    weaknesses: 'Could improve on communication of complex technical concepts to non-technical stakeholders.',
    notes: 'Overall a strong candidate with excellent technical background.',
    recommendation: 'hire',
    technicalSkills: {
      technicalKnowledge: 4,
      problemSolving: 5
    },
    softSkills: {
      communication: 3,
      teamwork: 4
    },
    status: 'completed'
  },
  {
    id: '2',
    candidateId: '4',
    candidateName: 'Casey Wilson',
    candidatePosition: 'UX Designer',
    candidateAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    interviewType: 'portfolio',
    interviewDate: '2025-04-24T10:00:00',
    interviewers: ['Alex Johnson'],
    locationId: 'loc-3',
    departmentId: 'dept-5',
    rating: 5,
    strengths: 'Exceptional portfolio with strong user-centered design approach. Excellent understanding of design systems.',
    weaknesses: 'Limited experience with enterprise-level applications.',
    notes: 'Would be a great addition to the design team.',
    recommendation: 'hire',
    technicalSkills: {
      technicalKnowledge: 5,
      problemSolving: 4
    },
    softSkills: {
      communication: 5,
      teamwork: 4
    },
    status: 'completed'
  },
  {
    id: '3',
    candidateId: '7',
    candidateName: 'Alex Johnson',
    candidatePosition: 'Backend Developer',
    candidateAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    interviewType: 'technical',
    interviewDate: '2025-04-23T14:00:00',
    interviewers: ['Taylor Reed', 'Drew Garcia'],
    locationId: 'loc-4',
    departmentId: 'dept-7',
    rating: 3,
    strengths: 'Good knowledge of backend technologies and database design.',
    weaknesses: 'Needs improvement in system architecture and scalability concepts.',
    notes: 'Has potential but requires mentoring in advanced concepts.',
    recommendation: 'consider',
    technicalSkills: {
      technicalKnowledge: 3,
      problemSolving: 3
    },
    softSkills: {
      communication: 4,
      teamwork: 3
    },
    status: 'completed'
  }
];

const FeedbackPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [recommendationFilter, setRecommendationFilter] = useState('all');
  const [interviewTypeFilter, setInterviewTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'date' | 'rating'>('date');
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Filter feedback based on user role
  const roleFilteredFeedback = useMemo(() => {
    if (!user) return [];

    // CEO can see all feedback
    if (user.role === 'ceo') {
      return mockFeedback;
    }

    // Branch Manager can only see feedback from their location
    if (user.role === 'branch-manager' && user.locationId) {
      return mockFeedback.filter(feedback => feedback.locationId === user.locationId);
    }

    // Department roles can only see feedback from their department and location
    if (['marketing-head', 'marketing-supervisor', 'marketing-recruiter', 'marketing-associate'].includes(user.role)) {
      let filteredFeedback = mockFeedback;

      // Filter by department if available
      if (user.departmentId) {
        filteredFeedback = filteredFeedback.filter(feedback => feedback.departmentId === user.departmentId);
      }

      // Filter by location if available
      if (user.locationId) {
        filteredFeedback = filteredFeedback.filter(feedback => feedback.locationId === user.locationId);
      }

      return filteredFeedback;
    }

    return mockFeedback;
  }, [user]);

  // Filter feedback based on search and filters
  const filteredFeedback = useMemo(() => {
    return roleFilteredFeedback.filter(feedback => {
      // Filter by search term
      if (searchTerm && !feedback.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !feedback.candidatePosition.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filter by recommendation
      if (recommendationFilter !== 'all' && feedback.recommendation !== recommendationFilter) {
        return false;
      }

      // Filter by interview type
      if (interviewTypeFilter !== 'all' && feedback.interviewType !== interviewTypeFilter) {
        return false;
      }

      // Filter by location
      if (locationFilter !== 'all' && feedback.locationId !== locationFilter) {
        return false;
      }

      // Filter by department
      if (departmentFilter !== 'all' && feedback.departmentId !== departmentFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by date (newest first)
      if (sortOrder === 'date') {
        return new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime();
      }
      // Sort by rating (highest first)
      return b.rating - a.rating;
    });
  }, [roleFilteredFeedback, searchTerm, recommendationFilter, interviewTypeFilter, locationFilter, departmentFilter, sortOrder]);

  // Get unique values for filters
  const interviewTypes = ['all', ...new Set(roleFilteredFeedback.map(f => f.interviewType))];
  const recommendations = ['all', ...new Set(roleFilteredFeedback.map(f => f.recommendation))];

  // Handle view feedback details
  const handleViewFeedback = (feedback: any) => {
    setSelectedFeedback(feedback);
    setIsDetailDialogOpen(true);
  };

  // Render rating stars
  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Feedback</h1>
          <p className="text-muted-foreground mt-2">
            Review and analyze candidate interview feedback
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/interviews">
            <FileText className="h-4 w-4 mr-2" />
            Back to Interviews
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Filters</CardTitle>
          <CardDescription>
            Filter feedback by candidate, recommendation, and more
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <Select value={recommendationFilter} onValueChange={setRecommendationFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Recommendation" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recommendations</SelectItem>
                  <SelectItem value="hire">Hire</SelectItem>
                  <SelectItem value="consider">Consider</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Select value={interviewTypeFilter} onValueChange={setInterviewTypeFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Interview Type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {interviewTypes.filter(t => t !== 'all').map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div className="sm:col-span-2 flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10">
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="sr-only">Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <SelectItem onClick={() => setSortOrder('date')}>
                    Sort by Date
                  </SelectItem>
                  <SelectItem onClick={() => setSortOrder('rating')}>
                    Sort by Rating
                  </SelectItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Candidate</TableHead>
                <TableHead>Interview Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Recommendation</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Interviewers</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedback.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No feedback found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredFeedback.map(feedback => (
                  <TableRow key={feedback.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={feedback.candidateAvatar} alt={feedback.candidateName} />
                          <AvatarFallback>{feedback.candidateName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div>{feedback.candidateName}</div>
                          <div className="text-xs text-muted-foreground">{feedback.candidatePosition}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {feedback.interviewType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(feedback.interviewDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {renderRatingStars(feedback.rating)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={feedback.recommendation === 'hire' ? 'default' :
                                feedback.recommendation === 'consider' ? 'outline' : 'destructive'}
                        className={feedback.recommendation === 'hire' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                  feedback.recommendation === 'consider' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}
                      >
                        {feedback.recommendation.charAt(0).toUpperCase() + feedback.recommendation.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getLocationById(feedback.locationId)?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {feedback.interviewers.map((interviewer, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {interviewer}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => handleViewFeedback(feedback)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Feedback Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Interview Feedback Details</DialogTitle>
            <DialogDescription>
              {selectedFeedback && `Feedback for ${selectedFeedback.candidateName}'s ${selectedFeedback.interviewType} interview`}
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedFeedback.candidateAvatar} alt={selectedFeedback.candidateName} />
                  <AvatarFallback>{selectedFeedback.candidateName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">{selectedFeedback.candidateName}</h3>
                  <p className="text-muted-foreground">{selectedFeedback.candidatePosition}</p>
                </div>
                <div className="ml-auto">
                  <Badge
                    variant={selectedFeedback.recommendation === 'hire' ? 'default' :
                            selectedFeedback.recommendation === 'consider' ? 'outline' : 'destructive'}
                    className={selectedFeedback.recommendation === 'hire' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                              selectedFeedback.recommendation === 'consider' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}
                  >
                    {selectedFeedback.recommendation.charAt(0).toUpperCase() + selectedFeedback.recommendation.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-700 mb-1">Interview Type</h3>
                  <p className="text-sm capitalize">{selectedFeedback.interviewType}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium text-green-700 mb-1">Date Conducted</h3>
                  <p className="text-sm">{format(new Date(selectedFeedback.interviewDate), 'PPP')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-2 border-b">
                    <h3 className="font-medium">Strengths</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-sm">{selectedFeedback.strengths}</p>
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-2 border-b">
                    <h3 className="font-medium">Areas for Improvement</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-sm">{selectedFeedback.weaknesses}</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b">
                  <h3 className="font-medium">Additional Notes</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm">{selectedFeedback.notes}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-2 border-b">
                    <h3 className="font-medium">Technical Skills</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Technical Knowledge</span>
                        <span className="text-sm font-medium">{selectedFeedback.technicalSkills.technicalKnowledge}/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(selectedFeedback.technicalSkills.technicalKnowledge / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Problem Solving</span>
                        <span className="text-sm font-medium">{selectedFeedback.technicalSkills.problemSolving}/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(selectedFeedback.technicalSkills.problemSolving / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-2 border-b">
                    <h3 className="font-medium">Soft Skills</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Communication</span>
                        <span className="text-sm font-medium">{selectedFeedback.softSkills.communication}/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(selectedFeedback.softSkills.communication / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Teamwork</span>
                        <span className="text-sm font-medium">{selectedFeedback.softSkills.teamwork}/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(selectedFeedback.softSkills.teamwork / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b">
                  <h3 className="font-medium">Interviewers</h3>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedFeedback.interviewers.map((interviewer, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {interviewer}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbackPage;
