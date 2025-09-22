import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';
import { useCreateApplicationMutation, useUpdateApplicationMutation } from '@/hooks/useApplications';
import { applicationStatus } from '@/lib/utils';

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  application?: Application | null;
  mode: 'create' | 'edit';
}

const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({ isOpen, onClose, application, mode }) => {
  const createMutation = useCreateApplicationMutation();
  const updateMutation = useUpdateApplicationMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormData>({
    defaultValues: {
      companyName: '',
      positionTitle: '',
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'applied',
      jobLink: '',
      location: '',
      source: '',
      notes: '',
      nextStep: '',
      resumeVersion: '',
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting;

  // Reset form when modal opens/closes or application changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && application) {
        reset({
          companyName: application.companyName,
          positionTitle: application.positionTitle,
          applicationDate: application.applicationDate.split('T')[0],
          status: application.status,
          jobLink: application.jobLink || '',
          location: application.location,
          source: application.source,
          notes: application.notes || '',
          nextStep: application.nextStep || '',
          resumeVersion: application.resumeVersion || '',
        });
      } else {
        reset({
          companyName: '',
          positionTitle: '',
          applicationDate: new Date().toISOString().split('T')[0],
          status: 'applied',
          jobLink: '',
          location: '',
          source: '',
          notes: '',
          nextStep: '',
          resumeVersion: '',
        });
      }
    }
  }, [isOpen, mode, application, reset]);

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data);
        toast.success('Application created successfully!');
      } else if (mode === 'edit' && application) {
        await updateMutation.mutateAsync({ id: application.$id, data });
        toast.success('Application updated successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(
        mode === 'create'
          ? 'Failed to create application. Please try again.'
          : 'Failed to update application. Please try again.'
      );
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[600px] max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Application' : 'Edit Application'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Company Name */}
            <div className='space-y-2'>
              <Label htmlFor='companyName'>Company Name *</Label>
              <Input
                id='companyName'
                placeholder='e.g. Google, Apple, Microsoft'
                disabled={isLoading}
                {...register('companyName', {
                  required: 'Company name is required',
                  minLength: {
                    value: 2,
                    message: 'Company name must be at least 2 characters',
                  },
                })}
              />
              {errors.companyName && <p className='text-sm text-destructive'>{errors.companyName.message}</p>}
            </div>

            {/* Position Title */}
            <div className='space-y-2'>
              <Label htmlFor='positionTitle'>Position Title *</Label>
              <Input
                id='positionTitle'
                placeholder='e.g. Software Engineer, Product Manager'
                disabled={isLoading}
                {...register('positionTitle', {
                  required: 'Position title is required',
                  minLength: {
                    value: 2,
                    message: 'Position title must be at least 2 characters',
                  },
                })}
              />
              {errors.positionTitle && <p className='text-sm text-destructive'>{errors.positionTitle.message}</p>}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Application Date */}
            <div className='space-y-2'>
              <Label>Application Date *</Label>
              <Controller
                name='applicationDate'
                control={control}
                rules={{ required: 'Application date is required' }}
                render={({ field }) => <Input type='date' disabled={isLoading} {...field} />}
              />
              {errors.applicationDate && <p className='text-sm text-destructive'>{errors.applicationDate.message}</p>}
            </div>

            {/* Status */}
            <div className='space-y-2'>
              <Label>Status *</Label>
              <Controller
                name='status'
                control={control}
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent>
                      {applicationStatus.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className='text-sm text-destructive'>{errors.status.message}</p>}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Location */}
            <div className='space-y-2'>
              <Label htmlFor='location'>Location *</Label>
              <Input
                id='location'
                placeholder='e.g. London, UK or Remote'
                disabled={isLoading}
                {...register('location', {
                  required: 'Location is required',
                })}
              />
              {errors.location && <p className='text-sm text-destructive'>{errors.location.message}</p>}
            </div>

            {/* Source */}
            <div className='space-y-2'>
              <Label htmlFor='source'>Source *</Label>
              <Input
                id='source'
                placeholder='e.g. LinkedIn, Indeed, Referral'
                disabled={isLoading}
                {...register('source', {
                  required: 'Source is required',
                })}
              />
              {errors.source && <p className='text-sm text-destructive'>{errors.source.message}</p>}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Job Link */}
            <div className='space-y-2'>
              <Label htmlFor='jobLink'>Job Link</Label>
              <div className='relative'>
                <Input
                  id='jobLink'
                  type='url'
                  placeholder='https://...'
                  disabled={isLoading}
                  {...register('jobLink', {
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'Please enter a valid URL starting with http:// or https://',
                    },
                  })}
                />
                <ExternalLink className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              </div>
              {errors.jobLink && <p className='text-sm text-destructive'>{errors.jobLink.message}</p>}
            </div>

            {/* Resume Version */}
            <div className='space-y-2'>
              <Label htmlFor='resumeVersion'>Resume Version</Label>
              <Input
                id='resumeVersion'
                placeholder='e.g. Resume_v2.1, Tech_Resume'
                disabled={isLoading}
                {...register('resumeVersion')}
              />
            </div>
          </div>

          {/* Next Step */}
          <div className='space-y-2'>
            <Label htmlFor='nextStep'>Next Step</Label>
            <Input
              id='nextStep'
              placeholder='e.g. Follow up in 1 week, Prepare for interview'
              disabled={isLoading}
              {...register('nextStep')}
            />
          </div>

          {/* Notes */}
          <div className='space-y-2'>
            <Label htmlFor='notes'>Notes</Label>
            <Textarea
              id='notes'
              rows={3}
              placeholder='Additional notes, interview feedback, recruiter details...'
              disabled={isLoading}
              {...register('notes')}
            />
          </div>

          <div className='flex justify-end space-x-3 pt-4 border-t'>
            <Button type='button' variant='outline' onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isLoading}
              isLoading={isLoading}
              loadingText={mode === 'create' ? 'Creating...' : 'Updating...'}
            >
              {mode === 'create' ? 'Create Application' : 'Update Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationFormModal;
