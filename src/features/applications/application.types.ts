export type ApplicationStatus =
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface Application {
  id: string;
  companyName: string;
  jobTitle: string;
  status: ApplicationStatus;
  appliedAt: string | null;
  lastActivityAt: string | null;
  totalEmailCount: number;
}

export interface ApplicationStats {
  total: number;
  inProgress: number;
  interviewing: number;
  offers: number;
  newlyApplied: number;
}

export interface ApplicationListOptions {
  search?: string;
  sortBy?: 'createdAt' | 'lastActivityAt' | 'companyName';
  order?: 'asc' | 'desc';
}

export interface ApplicationsData {
  applications: Application[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: ApplicationStats;
}
