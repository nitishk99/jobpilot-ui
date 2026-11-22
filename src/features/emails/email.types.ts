export interface ReviewEmail {
  id: string;
  gmailMessageId?: string | null;
  gmailUrl?: string | null;
  subject?: string | null;
  fromEmail?: string | null;
  senderName?: string | null;
  senderOrganization?: string | null;
  receivedAt?: string | null;
  companyName?: string | null;
  jobTitle?: string | null;
  eventType?: string | null;
  category?: string | null;
  summary?: string | null;
}

export interface OriginalEmail {
  id?: string;
  emailId?: string;
  gmailMessageId?: string | null;
  gmailUrl?: string | null;
  subject?: string | null;
  fromEmail?: string | null;
  toEmail?: string | null;
  bodyText?: string | null;
  receivedAt?: string | null;
  senderName?: string | null;
  senderOrganization?: string | null;
}

export interface ApplicationCorrections {
  companyName?: string;
  jobTitle?: string;
}
