import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import Error from '@/components/Error';
import {
  ExternalLink,
  MapPin,
  Calendar,
  ArrowLeft,
  RefreshCw,
  Eye,
  FileText,
  Code,
  StickyNote,
  ChevronRight,
  Link,
} from 'lucide-react';
import { useGetApplicationQuery } from '@/hooks/useApplications';
import { applicationStatus, formatDateWithOrdinal } from '@/lib/utils';

interface ApplicationDetailsPageProps {
  onBack?: () => void;
}

const ApplicationDetailsPage: React.FC<ApplicationDetailsPageProps> = ({ onBack }) => {
  const { id: applicationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: application, isLoading, error } = useGetApplicationQuery(applicationId || '');

  useEffect(() => {
    console.log('ApplicationDetailsPage Debug:', {
      applicationId,
      hasId: Boolean(applicationId),
      idType: typeof applicationId,
      idLength: applicationId?.length,
      idTrimmed: applicationId?.trim(),
      isLoading,
      hasData: Boolean(application),
      hasError: Boolean(error),
      errorMessage: error?.message,
    });
  }, [applicationId, application, isLoading, error]);

  const getStatusDisplay = (status: string) => {
    const statusConfig = applicationStatus.find(s => s.value === status);
    const statusColors = {
      applied: 'text-blue-600 bg-blue-50',
      interview: 'text-amber-600 bg-amber-50',
      offer: 'text-green-600 bg-green-50',
      rejected: 'text-red-600 bg-red-50',
      pending: 'text-gray-600 bg-gray-50',
    };

    const colorClass = statusColors[status as keyof typeof statusColors] || statusColors.pending;
    const label = statusConfig?.label || status;

    return <span className={`px-3 py-1 rounded text-sm font-medium ${colorClass}`}>{label}</span>;
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/applications');
    }
  };

  const LoadingSkeleton = () => (
    <div className='space-y-3'>
      <div className='animate-pulse'>
        {/* Header skeleton */}
        <div className='mb-6'>
          <div className='h-8 bg-gray-200 rounded w-1/2 mb-2'></div>
          <div className='h-6 bg-gray-200 rounded w-1/3 mb-3'></div>
          <div className='flex gap-2 mb-2'>
            <div className='h-4 bg-gray-200 rounded w-32'></div>
            <div className='h-4 bg-gray-200 rounded w-28'></div>
          </div>
        </div>

        {/* Quick info grid skeleton */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-2 mb-6'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='bg-white p-4 rounded-lg border'>
              <div className='h-4 bg-gray-200 rounded w-20 mb-2'></div>
              <div className='h-5 bg-gray-200 rounded w-24'></div>
            </div>
          ))}
        </div>

        {/* Tech stack skeleton */}
        <div className='bg-white rounded-lg border mb-6'>
          <div className='p-4 border-b'>
            <div className='h-5 bg-gray-200 rounded w-1/4'></div>
          </div>
          <div className='p-4'>
            <div className='flex gap-2'>
              {[...Array(6)].map((_, i) => (
                <div key={i} className='h-6 bg-gray-200 rounded w-16'></div>
              ))}
            </div>
          </div>
        </div>

        {/* Job description skeleton */}
        <div className='bg-white rounded-lg border mb-6'>
          <div className='p-4 border-b'>
            <div className='h-5 bg-gray-200 rounded w-1/3'></div>
          </div>
          <div className='p-4'>
            <div className='space-y-2'>
              <div className='h-4 bg-gray-200 rounded'></div>
              <div className='h-4 bg-gray-200 rounded w-5/6'></div>
              <div className='h-4 bg-gray-200 rounded w-4/5'></div>
              <div className='h-4 bg-gray-200 rounded w-3/4'></div>
              <div className='h-4 bg-gray-200 rounded w-5/6'></div>
            </div>
          </div>
        </div>

        {/* Notes skeleton */}
        <div className='bg-white rounded-lg border mb-6'>
          <div className='p-4 border-b'>
            <div className='h-5 bg-gray-200 rounded w-1/4'></div>
          </div>
          <div className='p-4'>
            <div className='space-y-2'>
              <div className='h-4 bg-gray-200 rounded'></div>
              <div className='h-4 bg-gray-200 rounded w-4/5'></div>
              <div className='h-4 bg-gray-200 rounded w-3/4'></div>
            </div>
          </div>
        </div>

        {/* Next step skeleton */}
        <div className='bg-white rounded-lg border'>
          <div className='p-4 border-b'>
            <div className='h-5 bg-gray-200 rounded w-1/4'></div>
          </div>
          <div className='p-4'>
            <div className='space-y-2'>
              <div className='h-4 bg-gray-200 rounded'></div>
              <div className='h-4 bg-gray-200 rounded w-3/4'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const getErrorDescription = (error: Error) => {
    const message = error.message?.toLowerCase() || '';
    if (message.includes('not found') || message.includes('404')) {
      return `Application with ID "${applicationId}" could not be found. It may have been deleted or you may not have access to it.`;
    }
    if (message.includes('permission') || message.includes('401')) {
      return 'You do not have permission to view this application.';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'Unable to load the application due to a network error. Please check your connection and try again.';
    }
    return error.message || 'An unexpected error occurred while loading the application.';
  };

  if (!applicationId || typeof applicationId !== 'string' || applicationId.trim() === '') {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='max-w-5xl mx-auto py-6 px-6'>
          <button
            onClick={handleBack}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors cursor-pointer'
          >
            <ArrowLeft className='w-4 h-4' />
            Back to Applications
          </button>
          <h1 className='text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
            <Eye className='w-6 h-6' />
            Application Details
          </h1>
          <Error description='No valid application ID was provided in the URL.' />
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-5xl mx-auto py-6 px-6'>
        <button
          onClick={handleBack}
          className='flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors cursor-pointer'
        >
          <ArrowLeft className='w-4 h-4' />
          Back to Applications
        </button>

        {error ? (
          <div>
            <h1 className='text-2xl font-semibold text-gray-900 mb-6'>Application Details</h1>
            <Error description={getErrorDescription(error)} />
          </div>
        ) : isLoading ? (
          <div>
            <div className='flex items-center gap-3 mb-6'>
              <h1 className='text-2xl font-semibold text-gray-900'>Application Details</h1>
              <div className='flex items-center gap-2 text-gray-600'>
                <RefreshCw className='w-4 h-4 animate-spin' />
                <span className='text-sm'>Loading...</span>
              </div>
            </div>
            <LoadingSkeleton />
          </div>
        ) : application ? (
          <div className='space-y-3'>
            {/* Header Section */}
            <div className='flex items-start justify-between mb-6'>
              <div>
                <h1 className='text-2xl font-bold text-gray-900 mb-1'>{application.companyName}</h1>
                <p className='text-lg text-gray-600 mb-3'>{application.positionTitle}</p>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <span className='flex items-center gap-1'>
                    <Calendar className='w-4 h-4' />
                    Applied {formatDateWithOrdinal(application.applicationDate)}
                  </span>
                  {application.location && (
                    <span className='flex items-center gap-1'>
                      <MapPin className='w-4 h-4' />
                      {application.location}
                    </span>
                  )}
                </div>
              </div>
              <div>{getStatusDisplay(application.status)}</div>
            </div>

            {/* Quick Info Grid - Short fields only */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
              {application.source && (
                <div className='bg-white p-4 rounded-lg border'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Link className='w-4 h-4 text-green-600' />
                    <span className='text-sm font-medium text-gray-600'>Source</span>
                  </div>
                  <p className='font-medium text-gray-900'>{application.source}</p>
                </div>
              )}

              {application.resumeVersion && (
                <div className='bg-white p-4 rounded-lg border'>
                  <div className='flex items-center gap-2 mb-1'>
                    <FileText className='w-4 h-4 text-purple-600' />
                    <span className='text-sm font-medium text-gray-600'>Resume Version</span>
                  </div>
                  <p className='font-medium text-gray-900'>{application.resumeVersion}</p>
                </div>
              )}

              {application.jobLink && (
                <div className='bg-white p-4 rounded-lg border'>
                  <div className='flex items-center gap-2 mb-1'>
                    <ExternalLink className='w-4 h-4 text-blue-600' />
                    <span className='text-sm font-medium text-gray-600'>Job Posting</span>
                  </div>
                  <a
                    href={application.jobLink}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors'
                  >
                    View Original Posting
                  </a>
                </div>
              )}
            </div>

            {/* Tech Stack - Full width but compact */}
            {application.stacks && (
              <div className='bg-white rounded-lg border'>
                <div className='p-4 border-b'>
                  <h3 className='font-medium text-gray-900 flex items-center gap-2'>
                    <Code className='w-4 h-4' />
                    Tech Stack
                  </h3>
                </div>
                <div className='p-4'>
                  <div className='flex flex-wrap gap-2'>
                    {application.stacks.split(',').map((stack, index) => (
                      <Badge key={index} variant='outline' className='px-2 py-1 text-xs'>
                        {stack.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Job Description - Full width for textarea content */}
            {application.description && (
              <div className='bg-white rounded-lg border'>
                <div className='p-4 border-b'>
                  <h3 className='font-medium text-gray-900 flex items-center gap-2'>
                    <FileText className='w-4 h-4' />
                    Job Description
                  </h3>
                </div>
                <div className='p-4'>
                  <p className='text-gray-700 text-sm leading-relaxed whitespace-pre-wrap'>{application.description}</p>
                </div>
              </div>
            )}

            {/* Notes - Full width for textarea content */}
            {application.notes && (
              <div className='bg-white rounded-lg border'>
                <div className='p-4 border-b'>
                  <h3 className='font-medium text-gray-900 flex items-center gap-2'>
                    <StickyNote className='w-4 h-4' />
                    Notes
                  </h3>
                </div>
                <div className='p-4'>
                  <p className='text-gray-700 text-sm leading-relaxed whitespace-pre-wrap'>{application.notes}</p>
                </div>
              </div>
            )}

            {/* Next Step - Full width for textarea content */}
            {application.nextStep && (
              <div className='bg-white rounded-lg border'>
                <div className='p-4 border-b'>
                  <h3 className='font-medium text-gray-900 flex items-center gap-2'>
                    <ChevronRight className='w-4 h-4' />
                    Next Step
                  </h3>
                </div>
                <div className='p-4'>
                  <p className='text-gray-700 text-sm leading-relaxed whitespace-pre-wrap'>{application.nextStep}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Error description='The application loaded successfully but contains no data.' />
        )}
      </div>
    </div>
  );
};

export default ApplicationDetailsPage;
