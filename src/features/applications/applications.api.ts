import { api } from '../../api/client';
import { asRecord, firstNumber, firstString, unwrapData } from '../../api/response';
import type { ApiResponse } from '../../api/types';
import type { Application, ApplicationListOptions, ApplicationsData, ApplicationStatus } from './application.types';

const applicationStatuses: ApplicationStatus[] = [
  'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN',
];

export function adaptApplication(value: unknown): Application {
  const item = asRecord(value);
  const apiStatus = firstString(item, ['status']);
  const status = applicationStatuses.find((value) => value === apiStatus);

  return {
    id: firstString(item, ['id', 'applicationId']) ?? '',
    companyName: firstString(item, ['companyName', 'company']) ?? 'Company not identified',
    jobTitle: firstString(item, ['jobTitle', 'title', 'position']) ?? 'Position not identified',
    status: status ?? 'APPLIED',
    appliedAt: firstString(item, ['appliedAt']) ?? null,
    lastActivityAt: firstString(item, ['lastActivityAt', 'updatedAt']) ?? null,
    totalEmailCount: firstNumber(item, ['totalEmailCount', 'emailCount', 'emailsCount']) ?? 0,
  };
}

export interface ApplicationPage {
  items: Application[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  stats: ApplicationsData['stats'];
}

export async function getApplications(
  page = 1,
  limit = 10,
  options: ApplicationListOptions = {},
): Promise<ApplicationPage> {
  const search = options.search?.trim();
  if (search && search.length > 200) throw new Error('Search must be 200 characters or fewer.');
  const params = {
    page,
    limit,
    ...(search ? { search } : {}),
    sortBy: options.sortBy,
    order: options.order,
  };
  const response = await api.get<ApiResponse<ApplicationsData>>('/applications', {
    params,
  });
  const payload = unwrapData<ApplicationsData>(response.data);
  return {
    items: payload.applications.map(adaptApplication),
    ...payload.pagination,
    stats: payload.stats,
  };
}

export async function getAllApplications(limit = 100): Promise<Application[]> {
  const firstPage = await getApplications(1, limit);
  if (firstPage.totalPages <= 1) return firstPage.items;

  const requests: Promise<ApplicationPage>[] = [];
  for (let page = 2; page <= firstPage.totalPages; page++) {
    requests.push(getApplications(page, limit));
  }

  const remainingPages = await Promise.all(requests);
  const applications = [...firstPage.items];
  for (const page of remainingPages) {
    applications.push(...page.items);
  }
  return applications;
}
