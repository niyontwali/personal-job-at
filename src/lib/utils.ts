import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// truncate string texts
export const truncateString = (word: string, sliceNo: number) => {
  if (word.length > sliceNo) {
    return word.slice(0, sliceNo) + ' ...';
  }
  return word;
};

// get network status
export const getNetworkStatus = () => {
  return window.navigator.onLine;
};

export const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

export const formatDateWithOrdinal = (dateInput: Date | string): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const day = date.getDate();
  const ordinalSuffix = getOrdinalSuffix(day);
  const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
  return `${day}${ordinalSuffix} ${date.toLocaleDateString('en-US', options)}`;
};

export const handleError = (error: unknown) => {
  let errorMessage = 'Something went wrong';

  if (typeof error === 'object' && error !== null && 'data' in error) {
    const { data } = error as { data: { message: string } };
    errorMessage = data.message || 'Something went wrong';
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  toast.error(errorMessage, {
    duration: 2000,
  });
};

// Updated to match the database schema exactly
export const applicationStatus: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-800' },
  { value: 'interview', label: 'Interview', color: 'bg-orange-100 text-orange-800' },
  { value: 'offer', label: 'Offer', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' },
  { value: 'closed', label: 'Closed', color: 'bg-purple-100 text-purple-800' },
];
