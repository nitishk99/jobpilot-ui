import { api } from '../../api/client';
import { asRecord, firstNumber, firstString, unwrapData } from '../../api/response';
import type { ApiResponse, PaginatedResult } from '../../api/types';
import { adaptApplication } from '../applications/applications.api';
import type { Application } from '../applications/application.types';
import type { ApplicationCorrections, OriginalEmail, ReviewEmail } from './email.types';

export function adaptReviewEmail(value: unknown): ReviewEmail {
  const item = asRecord(value);
  const extraction = asRecord(item.extractedData ?? item.extraction);
  const sender = asRecord(item.sender);

  return {
    id: firstString(item, ['id', 'emailId']) ?? '',
    gmailMessageId: firstString(item, ['gmailMessageId']),
    gmailUrl: firstString(item, ['gmailUrl']),
    subject: firstString(item, ['subject']),
    fromEmail: firstString(item, ['fromEmail', 'senderEmail']) ?? firstString(sender, ['email']),
    senderName: firstString(item, ['senderName']) ?? firstString(extraction, ['senderName']) ?? firstString(sender, ['name']),
    senderOrganization: firstString(item, ['senderOrganization']),
    receivedAt: firstString(item, ['receivedAt', 'emailReceivedAt']),
    companyName: firstString(item, ['companyName']) ?? firstString(extraction, ['companyName']),
    jobTitle: firstString(item, ['jobTitle']) ?? firstString(extraction, ['jobTitle']),
    eventType: firstString(item, ['eventType']) ?? firstString(extraction, ['eventType']),
    category: firstString(item, ['category']) ?? firstString(extraction, ['category']),
    summary: firstString(item, ['summary']) ?? firstString(extraction, ['summary']),
  };
}

export async function getReviewEmails(page = 1, limit = 10): Promise<PaginatedResult<ReviewEmail>> {
  const response = await api.get<ApiResponse<Record<string, unknown>>>('/emails/review', { params: { page, limit } });
  const data = asRecord(unwrapData(response.data));
  const pagination = asRecord(data.pagination ?? data.meta);
  const candidates = [data.items, data.applications, data.emails, data.results];
  const items: unknown[] = candidates.find(Array.isArray) ?? [];
  const total = firstNumber(data, ['total', 'totalCount', 'totalItems', 'totalRecords'])
    ?? firstNumber(pagination, ['total', 'totalCount', 'totalItems', 'totalRecords', 'count'])
    ?? items.length;
  const currentPage = firstNumber(data, ['page', 'currentPage'])
    ?? firstNumber(pagination, ['page', 'currentPage'])
    ?? page;
  const pageSize = firstNumber(data, ['limit', 'pageSize'])
    ?? firstNumber(pagination, ['limit', 'pageSize'])
    ?? limit;
  const totalPages = firstNumber(data, ['totalPages'])
    ?? firstNumber(pagination, ['totalPages'])
    ?? Math.max(1, Math.ceil(total / Math.max(1, pageSize)));

  return {
    items: items.map(adaptReviewEmail),
    page: currentPage,
    limit: pageSize,
    total,
    totalPages,
  };
}

export function adaptOriginalEmail(value: unknown): OriginalEmail {
  const root = asRecord(value);
  const item = asRecord(root.email ?? root);

  return {
    id: firstString(item, ['id', 'emailId']),
    emailId: firstString(item, ['emailId', 'id']),
    gmailMessageId: firstString(item, ['gmailMessageId']),
    gmailUrl: firstString(item, ['gmailUrl']),
    subject: firstString(item, ['subject']),
    fromEmail: firstString(item, ['fromEmail', 'senderEmail']),
    toEmail: firstString(item, ['toEmail', 'recipientEmail']),
    bodyText: firstString(item, ['bodyText', 'textBody', 'body']),
    receivedAt: firstString(item, ['receivedAt', 'emailReceivedAt']),
    senderName: firstString(item, ['senderName']),
    senderOrganization: firstString(item, ['senderOrganization']),
  };
}

export interface CreatedApplicationFromEmail {
  emailId: string;
  application: Application;
}

export interface DismissedReviewEmail {
  emailId: string;
  dismissed: true;
}

export async function getOriginalEmail(emailId: string): Promise<OriginalEmail> {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(`/emails/${encodeURIComponent(emailId)}`);
  return adaptOriginalEmail(unwrapData(response.data));
}

export async function createApplicationFromReviewEmail(
  emailId: string,
  corrections?: ApplicationCorrections,
): Promise<CreatedApplicationFromEmail> {
  const response = await api.post<ApiResponse<Record<string, unknown>>>(
    `/emails/${encodeURIComponent(emailId)}/create-application`,
    corrections ?? {},
  );
  const payload = asRecord(unwrapData(response.data));
  const application = adaptApplication(payload.application);
  const resultEmailId = firstString(payload, ['emailId']);

  if (!resultEmailId || !application.id) {
    throw new Error('The create-application response was missing the email or application ID.');
  }

  return { emailId: resultEmailId, application };
}

export async function associateEmail(emailId: string, applicationId: string) {
  const response = await api.patch<ApiResponse<Record<string, unknown>>>(
    `/emails/${encodeURIComponent(emailId)}/associate`,
    { applicationId },
  );
  return unwrapData(response.data);
}

export async function dismissReviewEmail(emailId: string): Promise<DismissedReviewEmail> {
  const response = await api.delete<ApiResponse<DismissedReviewEmail>>(
    `/emails/${encodeURIComponent(emailId)}/review`,
  );
  const result = unwrapData<DismissedReviewEmail>(response.data);
  if (!result.emailId || result.dismissed !== true) {
    throw new Error('The dismiss-review response was incomplete.');
  }
  return result;
}
