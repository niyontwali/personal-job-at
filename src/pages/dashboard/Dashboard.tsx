import { useState, useMemo } from 'react';
import { Search, Plus, MoreHorizontal, Edit, Trash2, ExternalLink, Bell, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApplicationFormModal from '@/components/ApplicationFormModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import Empty from '@/components/Empty';
import Error from '@/components/Error';
import { toast } from 'sonner';
import { useGetApplicationsQuery, useDeleteApplicationMutation, useApplicationStats } from '@/hooks/useApplications';
import { applicationStatus } from '@/lib/utils';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'all'>('all');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [deletingApplication, setDeletingApplication] = useState<Application | null>(null);

  // Hooks
  const {
    data: applicationsData,
    isLoading,
    error,
    refetch,
  } = useGetApplicationsQuery(selectedStatus === 'all' ? undefined : selectedStatus);
  const deleteMutation = useDeleteApplicationMutation();
  const stats = useApplicationStats();

  // Filtered applications based on search
  const filteredApplications = useMemo(() => {
    if (!applicationsData?.data) return [];

    return applicationsData.data.filter(
      app =>
        app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.positionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [applicationsData?.data, searchQuery]);

  // Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplications(filteredApplications.map(app => app.$id));
    } else {
      setSelectedApplications([]);
    }
  };

  const handleSelectApplication = (applicationId: string, checked: boolean) => {
    if (checked) {
      setSelectedApplications(prev => [...prev, applicationId]);
    } else {
      setSelectedApplications(prev => prev.filter(id => id !== applicationId));
    }
  };

  const handleEdit = (application: Application) => {
    setEditingApplication(application);
  };

  const handleDelete = (application: Application) => {
    setDeletingApplication(application);
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
        <div className='flex items-center gap-3'>
          <Button variant='outline' size='icon' onClick={() => refetch()}>
            <Bell className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Briefcase className='w-5 h-5' />
            Jobs You Have Applied
            <span className='ml-auto text-sm font-normal text-muted-foreground'>{stats.total} jobs applied</span>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Controls */}
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-4 flex-1'>
          {/* Status Tabs */}
          <Tabs value={selectedStatus} onValueChange={value => setSelectedStatus(value as ApplicationStatus | 'all')}>
            <TabsList>
              <TabsTrigger value='all'>All</TabsTrigger>
              <TabsTrigger value='applied'>Pending</TabsTrigger>
              <TabsTrigger value='interview'>Shortlisted</TabsTrigger>
              <TabsTrigger value='rejected'>Rejected</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search */}
          <div className='relative max-w-sm'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
            <Input
              placeholder='Search...'
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
        <div className='flex items-center justify-center py-12'>
          <div className='text-center space-y-2'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
            <p className='text-sm text-muted-foreground'>Loading applications...</p>
          </div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <Empty description='No applications found. Start by adding your first job application!' />
      ) : (
        <Card>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-12'>
                    <Checkbox
                      checked={selectedApplications.length === filteredApplications.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Salary Range</TableHead>
                  <TableHead>Interview Date</TableHead>
                  <TableHead>Interview Type</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className='w-12'></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map(application => (
                  <TableRow key={application.$id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedApplications.includes(application.$id)}
                        onCheckedChange={checked => handleSelectApplication(application.$id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className='space-y-1'>
                        <div className='font-medium'>{application.companyName}</div>
                        <div className='text-sm text-muted-foreground'>{application.location}</div>
                      </div>
                    </TableCell>
                    <TableCell className='font-medium'>{application.positionTitle}</TableCell>
                    <TableCell className='text-sm text-muted-foreground'>-</TableCell>
                    <TableCell className='text-sm'>
                      {format(new Date(application.applicationDate), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>{application.source}</TableCell>
                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon'>
                            <MoreHorizontal className='w-4 h-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => handleEdit(application)}>
                            <Edit className='w-4 h-4 mr-2' />
                            Edit
                          </DropdownMenuItem>
                          {application.jobLink && (
                            <DropdownMenuItem asChild>
                              <a href={application.jobLink} target='_blank' rel='noopener noreferrer'>
                                <ExternalLink className='w-4 h-4 mr-2' />
                                View Job
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(application)} className='text-red-600'>
                            <Trash2 className='w-4 h-4 mr-2' />
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
    </div>
  );
};

export default Dashboard;
