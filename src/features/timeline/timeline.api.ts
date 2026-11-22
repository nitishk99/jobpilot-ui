import { api } from '../../api/client';
import { asRecord, unwrapData } from '../../api/response';
import type { ApiResponse } from '../../api/types';
import { adaptApplication } from '../applications/applications.api';
import type { ApplicationTimeline, TimelineEvent } from './timeline.types';

export async function getApplicationTimeline(applicationId: string): Promise<ApplicationTimeline> {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(
    `/applications/${encodeURIComponent(applicationId)}/timeline`,
  );
  const data = asRecord(unwrapData(response.data));
  const application = adaptApplication(data.application);
  const timeline = Array.isArray(data.timeline) ? data.timeline.map((value) => {
    const item = asRecord(value);
    return {
      emailId: String(item.emailId ?? item.id ?? ''),
      gmailMessageId: typeof item.gmailMessageId === 'string' ? item.gmailMessageId : null,
      gmailUrl: typeof item.gmailUrl === 'string' ? item.gmailUrl : null,
      eventType: typeof item.eventType === 'string' ? item.eventType : null,
      category: typeof item.category === 'string' ? item.category : null,
      eventDate: typeof item.eventDate === 'string' ? item.eventDate : null,
      emailReceivedAt: typeof item.emailReceivedAt === 'string' ? item.emailReceivedAt : null,
      subject: typeof item.subject === 'string' ? item.subject : null,
      summary: typeof item.summary === 'string' ? item.summary : null,
      senderName: typeof item.senderName === 'string' ? item.senderName : null,
      senderOrganization: typeof item.senderOrganization === 'string' ? item.senderOrganization : null,
      meetingLink: typeof item.meetingLink === 'string' ? item.meetingLink : null,
      originalEmailAvailable: Boolean(item.originalEmailAvailable),
    } satisfies TimelineEvent;
  }) : [];
  return { application, timeline };
}
