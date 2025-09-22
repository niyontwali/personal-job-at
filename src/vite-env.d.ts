/// <reference types="vite/client" />

// types/application.ts
type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn' | 'closed';

interface Application {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  companyName: string;
  positionTitle: string;
  applicationDate: string;
  status: ApplicationStatus;
  jobLink?: string;
  location: string;
  source: string;
  description: string;
  stacks: string;
  notes?: string;
  nextStep?: string;
  resumeVersion?: string;
}

interface ApplicationFormData {
  companyName: string;
  positionTitle: string;
  applicationDate: string;
  status: ApplicationStatus;
  jobLink?: string;
  location: string;
  source: string;
  description: string;
  stacks: string;
  notes?: string;
  nextStep?: string;
  resumeVersion?: string;
}
