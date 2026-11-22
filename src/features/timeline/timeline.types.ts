import type { Application } from '../applications/application.types';

export interface TimelineEvent {
  emailId: string;
  gmailMessageId?: string | null;
  gmailUrl?: string | null;
  eventType?: string | null;
  category?: string | null;
  eventDate?: string | null;
  emailReceivedAt?: string | null;
  subject?: string | null;
  summary?: string | null;
  senderName?: string | null;
  senderOrganization?: string | null;
  meetingLink?: string | null;
  originalEmailAvailable?: boolean;
}

export interface ApplicationTimeline {
  application: Application;
  timeline: TimelineEvent[];
}
