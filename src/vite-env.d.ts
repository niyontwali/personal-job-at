/// <reference types="vite/client" />

// types/application.ts
type ApplicationStatus = 'applied' | 'in_review' | 'interview' | 'offer' | 'rejected' | 'withdrawn';

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
  notes?: string;
  nextStep?: string;
  resumeVersion?: string;
}
