import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  MoreHorizontal,
  ExternalLink,
  Briefcase,
  User,
  LogOut,
  RefreshCw,
  Clock,
  MessageCircle,
  CheckCircle,
  XCircle,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ApplicationFormModal from '@/components/ApplicationFormModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import ProfileSheet from '@/components/ProfileSheet';
import Empty from '@/components/Empty';
import Error from '@/components/Error';
import { toast } from 'sonner';
import {
  useGetApplicationsQuery,
  useDeleteApplicationMutation,
  useUpdateApplicationMutation,
} from '@/hooks/useApplications';
import { useAuth } from '@/contexts/AuthContext';
import { applicationStatus } from '@/lib/utils';

const ITEMS_PER_PAGE = 5;

const Applications = () => {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  // Get URL parameters
  const statusFromUrl = searchParams.get('status') || 'all';
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);

  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'all'>(
    statusFromUrl as ApplicationStatus | 'all'
  );
  const [currentPage, setCurrentPage] = useState(pageFromUrl);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [deletingApplication, setDeletingApplication] = useState<Application | null>(null);
  const [statusUpdateApplication, setStatusUpdateApplication] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('applied');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // navigation
  const navigate = useNavigate();

  // Profile sheet state
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);

  // Fetch all applications (no status filtering in API)
  const { data: applicationsData, isLoading, error } = useGetApplicationsQuery();
  const deleteMutation = useDeleteApplicationMutation();
  const updateMutation = useUpdateApplicationMutation();

  // Update URL when status or page changes
  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);

    if (selectedStatus !== 'all') {
      newSearchParams.set('status', selectedStatus);
    } else {
      newSearchParams.delete('status');
    }

    if (currentPage !== 1) {
      newSearchParams.set('page', currentPage.toString());
    } else {
      newSearchParams.delete('page');
    }

    setSearchParams(newSearchParams, { replace: true });
  }, [selectedStatus, currentPage, setSearchParams, searchParams]);

  // Filter applications by status and search query locally
  const filteredApplications = useMemo(() => {
    if (!applicationsData?.data) return [];

    let filtered = applicationsData.data;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        app =>
          app.companyName.toLowerCase().includes(query) ||
          app.positionTitle.toLowerCase().includes(query) ||
          app.location.toLowerCase().includes(query) ||
          app.source.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [applicationsData?.data, selectedStatus, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

  // Calculate stats from all applications
  const stats = useMemo(() => {
    if (!applicationsData?.data) return { total: 0, applied: 0, interview: 0, offer: 0, rejected: 0 };

    const data = applicationsData.data;
    return {
      total: data.length,
      applied: data.filter(app => app.status === 'applied').length,
      interview: data.filter(app => app.status === 'interview').length,
      offer: data.filter(app => app.status === 'offer').length,
      rejected: data.filter(app => app.status === 'rejected').length,
    };
  }, [applicationsData?.data]);

  // Reset to page 1 when status or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchQuery]);

  // Get user initials for avatar
  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handlers
  const handleEdit = (application: Application) => {
    setEditingApplication(application);
  };
  const handleView = (id: string) => {
    navigate(`/applications/view/${id}`);
  };

  const handleDelete = (application: Application) => {
    setDeletingApplication(application);
  };

  const handleStatusUpdate = (application: Application) => {
    setStatusUpdateApplication(application);
    setNewStatus(application.status);
  };

  const handleStatusChange = (status: ApplicationStatus | 'all') => {
    setSelectedStatus(status);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const confirmDelete = async () => {
    if (!deletingApplication) return;

    try {
      await deleteMutation.mutateAsync(deletingApplication.$id);
      toast.success('Application deleted successfully!');
      setDeletingApplication(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete application. Please try again.');
    }
  };

  const confirmStatusUpdate = async () => {
    if (!statusUpdateApplication) return;

    setIsUpdatingStatus(true);
    try {
      await updateMutation.mutateAsync({
        id: statusUpdateApplication.$id,
        data: { status: newStatus },
      });
      toast.success('Status updated successfully!');
      setStatusUpdateApplication(null);
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleLogout = async () => {
    const loadingToast = toast.loading('Logging out...');

    try {
      await logout();
      toast.dismiss(loadingToast);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to logout. Please try again.');
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const statusConfig = applicationStatus.find(s => s.value === status);
    if (!statusConfig) return null;

    return (
      <Badge variant='secondary' className={`${statusConfig.color} border-0`}>
        {statusConfig.label}
      </Badge>
    );
  };

  if (error) {
    return <Error description='Failed to load applications. Please try again.' />;
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-primary/10 rounded-lg'>
            <Briefcase className='w-6 h-6 text-primary' />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Applied Jobs</h1>
            <p className='text-sm text-muted-foreground'>Track and manage your job applications</p>
          </div>
        </div>

        {/* User Dropdown */}
        <div className='flex items-center gap-3'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='relative h-10 w-10 rounded-full'>
                <Avatar className='h-10 w-10'>
                  <AvatarFallback className='bg-primary/10 text-primary font-medium'>
                    {getUserInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56' align='end' forceMount>
              <DropdownMenuLabel className='font-normal'>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm font-medium leading-none'>{user?.name || 'User'}</p>
                  <p className='text-xs leading-none text-muted-foreground'>{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='cursor-pointer' onClick={() => setIsProfileSheetOpen(true)}>
                <User className='mr-2 h-4 w-4' />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='cursor-pointer' onClick={handleLogout}>
                <LogOut className='mr-2 h-4 w-4' />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
        <Card className='shadow-none border'>
          <CardContent className='flex items-center'>
            <div className='flex items-center space-x-4'>
              <div className='p-3 bg-blue-100 rounded-full'>
                <Users className='w-6 h-6 text-blue-600' />
              </div>
              <div>
                <div className='text-2xl font-bold text-blue-600'>{stats.total}</div>
                <div className='text-sm text-muted-foreground'>Total Applied</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='shadow-none border'>
          <CardContent className='flex items-center'>
            <div className='flex items-center space-x-4'>
              <div className='p-3 bg-orange-100 rounded-full'>
                <Clock className='w-6 h-6 text-orange-600' />
              </div>
              <div>
                <div className='text-2xl font-bold text-orange-600'>{stats.applied}</div>
                <div className='text-sm text-muted-foreground'>Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='shadow-none border'>
          <CardContent className='flex items-center'>
            <div className='flex items-center space-x-4'>
              <div className='p-3 bg-purple-100 rounded-full'>
                <MessageCircle className='w-6 h-6 text-purple-600' />
              </div>
              <div>
                <div className='text-2xl font-bold text-purple-600'>{stats.interview}</div>
                <div className='text-sm text-muted-foreground'>Interviews</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='shadow-none border'>
          <CardContent className='flex items-center'>
            <div className='flex items-center space-x-4'>
              <div className='p-3 bg-green-100 rounded-full'>
                <CheckCircle className='w-6 h-6 text-green-600' />
              </div>
              <div>
                <div className='text-2xl font-bold text-green-600'>{stats.offer}</div>
                <div className='text-sm text-muted-foreground'>Offers</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='shadow-none border'>
          <CardContent className='flex items-center'>
            <div className='flex items-center space-x-4'>
              <div className='p-3 bg-red-100 rounded-full'>
                <XCircle className='w-6 h-6 text-red-600' />
              </div>
              <div>
                <div className='text-2xl font-bold text-red-600'>{stats.rejected}</div>
                <div className='text-sm text-muted-foreground'>Rejected</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1'>
          {/* Status Tabs */}
          <Tabs value={selectedStatus}>
            <TabsList className='grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4'>
              <TabsTrigger value='all' onClick={() => handleStatusChange('all')}>
                All ({stats.total})
              </TabsTrigger>
              <TabsTrigger value='applied' onClick={() => handleStatusChange('applied')}>
                Pending ({stats.applied})
              </TabsTrigger>
              <TabsTrigger value='interview' onClick={() => handleStatusChange('interview')}>
                Interview ({stats.interview})
              </TabsTrigger>
              <TabsTrigger value='rejected' onClick={() => handleStatusChange('rejected')}>
                Rejected ({stats.rejected})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search */}
          <div className='relative w-full sm:w-80'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
            <Input
              placeholder='Search companies, positions, locations...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>

        {/* Add Button */}
        <Button onClick={() => setIsCreateModalOpen(true)} className='gap-2'>
          <Plus className='w-4 h-4' />
          Add Application
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card className='shadow-none border'>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-16'>S/N</TableHead>
                  <TableHead className='min-w-[200px]'>Company & Position</TableHead>
                  <TableHead className='min-w-[120px]'>Location</TableHead>
                  <TableHead className='min-w-[180px]'>Tech Stack</TableHead>
                  <TableHead className='min-w-[100px]'>Application Date</TableHead>
                  <TableHead className='min-w-[100px]'>Status</TableHead>
                  <TableHead className='min-w-[120px]'>Job Link</TableHead>
                  <TableHead className='min-w-[100px]'>Resume</TableHead>
                  <TableHead className='w-12'></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className='h-3 bg-gray-200 rounded animate-pulse w-8'></div>
                    </TableCell>
                    <TableCell>
                      <div className='space-y-2'>
                        <div className='h-4 bg-gray-200 rounded animate-pulse'></div>
                        <div className='h-3 bg-gray-100 rounded animate-pulse w-3/4'></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='h-3 bg-gray-200 rounded animate-pulse w-20'></div>
                    </TableCell>
                    <TableCell>
                      <div className='flex gap-1'>
                        <div className='h-5 bg-gray-200 rounded animate-pulse w-12'></div>
                        <div className='h-5 bg-gray-200 rounded animate-pulse w-16'></div>
                        <div className='h-5 bg-gray-200 rounded animate-pulse w-14'></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='h-3 bg-gray-200 rounded animate-pulse w-20'></div>
                    </TableCell>
                    <TableCell>
                      <div className='h-5 bg-gray-200 rounded animate-pulse w-16'></div>
                    </TableCell>
                    <TableCell>
                      <div className='h-3 bg-gray-200 rounded animate-pulse w-16'></div>
                    </TableCell>
                    <TableCell>
                      <div className='h-3 bg-gray-200 rounded animate-pulse w-12'></div>
                    </TableCell>
                    <TableCell>
                      <div className='h-8 w-8 bg-gray-200 rounded animate-pulse'></div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : filteredApplications.length === 0 ? (
        <Empty
          description={
            searchQuery
              ? `No applications found matching "${searchQuery}". Try adjusting your search terms.`
              : applicationsData?.data?.length === 0
              ? 'No applications found. Start by adding your first job application!'
              : `No ${selectedStatus === 'all' ? '' : selectedStatus} applications found.`
          }
        />
      ) : (
        <>
          <Card className='shadow-none border'>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-16'>S/N</TableHead>
                    <TableHead className='min-w-[200px]'>Company & Position</TableHead>
                    <TableHead className='min-w-[120px]'>Location</TableHead>
                    <TableHead className='min-w-[180px]'>Tech Stack</TableHead>
                    <TableHead className='min-w-[100px]'>Application Date</TableHead>
                    <TableHead className='min-w-[100px]'>Status</TableHead>
                    <TableHead className='min-w-[120px]'>Job Link</TableHead>
                    <TableHead className='min-w-[100px]'>Resume</TableHead>
                    <TableHead className='w-12'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedApplications.map((application, index) => (
                    <TableRow key={application.$id} className='group hover:bg-muted/50'>
                      <TableCell className='text-sm text-muted-foreground'>{startIndex + index + 1}</TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <div className='font-medium text-sm'>{application.companyName}</div>
                          <div className='text-xs text-muted-foreground'>{application.positionTitle}</div>
                        </div>
                      </TableCell>
                      <TableCell className='text-sm'>{application.location}</TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1 max-w-[160px]'>
                          {application.stacks ? (
                            application.stacks.split(',').map((stack, index) => (
                              <Badge key={index} variant='outline' className='text-xs px-2 py-0.5'>
                                {stack.trim()}
                              </Badge>
                            ))
                          ) : (
                            <span className='text-xs text-muted-foreground'>Not specified</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='text-sm'>
                        {format(new Date(application.applicationDate), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>
                        {application.jobLink ? (
                          <a
                            href={application.jobLink}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm'
                          >
                            <ExternalLink className='w-3 h-3' />
                            View Job
                          </a>
                        ) : (
                          <span className='text-xs text-muted-foreground'>No link</span>
                        )}
                      </TableCell>
                      <TableCell className='text-sm'>
                        {application.resumeVersion ? (
                          <div className='max-w-[90px]'>
                            <Badge variant='secondary'>
                              {application.resumeVersion.length > 15
                                ? `${application.resumeVersion.substring(0, 15)}...`
                                : application.resumeVersion}
                            </Badge>
                          </div>
                        ) : (
                          <span className='text-xs text-muted-foreground'>Default</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                            >
                              <MoreHorizontal className='w-4 h-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(application)}>
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(application)}>
                              Edit Application
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleView(application.$id)}>
                              View Application
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(application)} className='text-red-600'>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-between'>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href='#'
                      onClick={e => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    if (totalPages <= 7) {
                      // Show all pages if total pages <= 7
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href='#'
                            onClick={e => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                            isActive={currentPage === page}
                            className='cursor-pointer'
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else {
                      // Show ellipsis for large page counts
                      if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href='#'
                              onClick={e => {
                                e.preventDefault();
                                handlePageChange(page);
                              }}
                              isActive={currentPage === page}
                              className='cursor-pointer'
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (page === 2 && currentPage > 4) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      } else if (page === totalPages - 1 && currentPage < totalPages - 3) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    }
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href='#'
                      onClick={e => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <ApplicationFormModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} mode='create' />

      <ApplicationFormModal
        isOpen={!!editingApplication}
        onClose={() => setEditingApplication(null)}
        application={editingApplication}
        mode='edit'
      />

      <ConfirmationModal
        isOpen={!!deletingApplication}
        onClose={() => setDeletingApplication(null)}
        onConfirm={confirmDelete}
        title='Delete Application'
        description={`Are you sure you want to delete the application for ${deletingApplication?.positionTitle} at ${deletingApplication?.companyName}? This action cannot be undone.`}
        confirmText='Delete'
        type='destructive'
        isLoading={deleteMutation.isPending}
      />

      {/* Status Update Modal */}
      <Dialog open={!!statusUpdateApplication} onOpenChange={() => setStatusUpdateApplication(null)}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>
              Update the status for <strong>{statusUpdateApplication?.positionTitle}</strong> at{' '}
              <strong>{statusUpdateApplication?.companyName}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Select new status</label>
              <Select value={newStatus} onValueChange={value => setNewStatus(value as ApplicationStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {applicationStatus.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className='flex items-center gap-2'>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            status.color.includes('bg-') ? status.color : 'bg-gray-400'
                          }`}
                        />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setStatusUpdateApplication(null)} disabled={isUpdatingStatus}>
              Cancel
            </Button>
            <Button onClick={confirmStatusUpdate} disabled={isUpdatingStatus}>
              {isUpdatingStatus ? (
                <>
                  <RefreshCw className='w-4 h-4 mr-2 animate-spin' />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Sheet */}
      <ProfileSheet isOpen={isProfileSheetOpen} onClose={() => setIsProfileSheetOpen(false)} />
    </div>
  );
};

export default Applications;
