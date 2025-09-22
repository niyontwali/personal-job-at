import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ExternalLink, X, Plus } from 'lucide-react';
import { useCreateApplicationMutation, useUpdateApplicationMutation } from '@/hooks/useApplications';
import { applicationStatus } from '@/lib/utils';

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  application?: Application | null;
  mode: 'create' | 'edit';
}

// TagInput component for stacks
const TagInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}> = ({ value, onChange, placeholder, disabled = false }) => {
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Convert string to tags array
  useEffect(() => {
    if (value) {
      const tagsArray = value
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
      setTags(tagsArray);
    } else {
      setTags([]);
    }
  }, [value]);

  // Convert tags array to string and notify parent
  const updateValue = (newTags: string[]) => {
    const stringValue = newTags.join(', ');
    onChange(stringValue);
  };

  const addTag = () => {
    const newTag = inputValue.trim();
    if (newTag && !tags.includes(newTag)) {
      const newTags = [...tags, newTag];
      setTags(newTags);
      updateValue(newTags);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    updateValue(newTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent, tagToRemove: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeTag(tagToRemove);
  };

  return (
    <div className='space-y-2'>
      <div className='flex flex-wrap gap-2 mb-2'>
        {tags.map((tag, index) => (
          <Badge key={index} variant='secondary' className='flex items-center gap-1 pr-1'>
            <span>{tag}</span>
            {!disabled && (
              <button
                type='button'
                onClick={e => handleRemoveClick(e, tag)}
                className='ml-1 p-0.5 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors'
                disabled={disabled}
                title={`Remove ${tag}`}
              >
                <X className='w-3 h-3' />
              </button>
            )}
          </Badge>
        ))}
      </div>
      <div className='flex gap-2'>
        <Input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className='flex-1'
        />
        <Button type='button' variant='outline' size='sm' onClick={addTag} disabled={disabled || !inputValue.trim()}>
          <Plus className='w-4 h-4' />
        </Button>
      </div>
    </div>
  );
};

const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({ isOpen, onClose, application, mode }) => {
  const createMutation = useCreateApplicationMutation();
  const updateMutation = useUpdateApplicationMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
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
      description: '',
      stacks: '',
      notes: '',
      nextStep: '',
      resumeVersion: '',
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting;
  const jobLinkValue = watch('jobLink');

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
          description: application.description || '',
          stacks: application.stacks || '',
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
          description: '',
          stacks: '',
          notes: '',
          nextStep: '',
          resumeVersion: '',
        });
      }
    }
  }, [isOpen, mode, application, reset]);

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      // Clean up optional fields - remove empty strings
      const cleanedData = {
        ...data,
        jobLink: data.jobLink?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
        nextStep: data.nextStep?.trim() || undefined,
        resumeVersion: data.resumeVersion?.trim() || undefined,
        description: data.description?.trim() || '',
        stacks: data.stacks?.trim() || '',
        source: data.source?.trim() || '',
      };

      if (mode === 'create') {
        await createMutation.mutateAsync(cleanedData);
        toast.success('Application created successfully!');
      } else if (mode === 'edit' && application) {
        await updateMutation.mutateAsync({ id: application.$id, data: cleanedData });
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
      <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='pb-4'>
          <DialogTitle className='text-xl font-semibold'>
            {mode === 'create' ? 'Add New Job Application' : 'Edit Job Application'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {/* Basic Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='companyName' className='text-sm font-medium'>
                Company Name <span className='text-red-500'>*</span>
              </Label>
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

            <div className='space-y-2'>
              <Label htmlFor='positionTitle' className='text-sm font-medium'>
                Position Title <span className='text-red-500'>*</span>
              </Label>
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

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>
                Application Date <span className='text-red-500'>*</span>
              </Label>
              <Controller
                name='applicationDate'
                control={control}
                rules={{ required: 'Application date is required' }}
                render={({ field }) => <Input type='date' disabled={isLoading} {...field} />}
              />
              {errors.applicationDate && <p className='text-sm text-destructive'>{errors.applicationDate.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label className='text-sm font-medium'>
                Status <span className='text-red-500'>*</span>
              </Label>
              <Controller
                name='status'
                control={control}
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
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

            <div className='space-y-2'>
              <Label htmlFor='source' className='text-sm font-medium'>
                Source
              </Label>
              <Input
                id='source'
                placeholder='e.g. LinkedIn, Indeed, Referral'
                disabled={isLoading}
                {...register('source')}
              />
              {errors.source && <p className='text-sm text-destructive'>{errors.source.message}</p>}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='location' className='text-sm font-medium'>
                Location <span className='text-red-500'>*</span>
              </Label>
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

            <div className='space-y-2'>
              <Label htmlFor='jobLink' className='text-sm font-medium'>
                Job Link <span className='text-red-500'>*</span>
              </Label>
              <div className='relative'>
                <Input
                  id='jobLink'
                  type='url'
                  placeholder='https://company.com/jobs/position'
                  disabled={isLoading}
                  className='pr-10'
                  {...register('jobLink', {
                    required: 'Job link is required',
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'Please enter a valid URL starting with http:// or https://',
                    },
                  })}
                />
                {jobLinkValue && (
                  <ExternalLink className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                )}
              </div>
              {errors.jobLink && <p className='text-sm text-destructive'>{errors.jobLink.message}</p>}
            </div>
          </div>

          {/* Job Details */}
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='description' className='text-sm font-medium'>
                Job Description <span className='text-red-500'>*</span>
              </Label>
              <Textarea
                id='description'
                rows={3}
                placeholder='Brief description of the role and responsibilities...'
                disabled={isLoading}
                {...register('description', {
                  required: 'Job description is required',
                  minLength: {
                    value: 10,
                    message: 'Description must be at least 10 characters',
                  },
                })}
              />
              {errors.description && <p className='text-sm text-destructive'>{errors.description.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='stacks' className='text-sm font-medium'>
                Tech Stack/Requirements <span className='text-red-500'>*</span>
              </Label>
              <Controller
                name='stacks'
                control={control}
                rules={{
                  required: 'Tech stack/requirements is required',
                  minLength: {
                    value: 2,
                    message: 'At least one technology is required',
                  },
                }}
                render={({ field }) => (
                  <TagInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder='Type tech stack and press Enter (e.g. React, Node.js, Python)'
                    disabled={isLoading}
                  />
                )}
              />
              {errors.stacks && <p className='text-sm text-destructive'>{errors.stacks.message}</p>}
              <p className='text-xs text-muted-foreground'>
                Type each technology and press Enter or click + to add. Click × to remove.
              </p>
            </div>
          </div>

          {/* Additional Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='resumeVersion' className='text-sm font-medium'>
                Resume Version <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='resumeVersion'
                placeholder='e.g. Resume_v2.1, Tech_Resume'
                disabled={isLoading}
                {...register('resumeVersion', {
                  required: 'Resume version is required',
                })}
              />
              {errors.resumeVersion && <p className='text-sm text-destructive'>{errors.resumeVersion.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='nextStep' className='text-sm font-medium'>
                Next Step
              </Label>
              <Input
                id='nextStep'
                placeholder='e.g. Follow up in 1 week, Prepare for interview'
                disabled={isLoading}
                {...register('nextStep')}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='notes' className='text-sm font-medium'>
              Notes
            </Label>
            <Textarea
              id='notes'
              rows={3}
              placeholder='Additional notes, interview feedback, recruiter details, etc.'
              disabled={isLoading}
              {...register('notes')}
            />
          </div>

          {/* Form Actions */}
          <div className='flex justify-end space-x-3 pt-4 border-t'>
            <Button type='button' variant='outline' onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? (
                <div className='flex items-center gap-2'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </div>
              ) : mode === 'create' ? (
                'Create Application'
              ) : (
                'Update Application'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationFormModal;
