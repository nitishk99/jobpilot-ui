import { describe, expect, it } from '@jest/globals';
import { unwrapData } from '../../src/api/response';
import { adaptApplication } from '../../src/features/applications/applications.api';
import { adaptOriginalEmail, adaptReviewEmail } from '../../src/features/emails/emails.api';

describe('response adapters', () => {
  it('maps application aliases into the application model', () => {
    expect(adaptApplication({
      applicationId: 'application-1',
      company: 'Acme',
      position: 'Frontend Engineer',
      updatedAt: '2026-01-02T00:00:00Z',
      emailsCount: 4,
    })).toMatchObject({
      id: 'application-1',
      companyName: 'Acme',
      jobTitle: 'Frontend Engineer',
      lastActivityAt: '2026-01-02T00:00:00Z',
      totalEmailCount: 4,
    });
  });

  it('maps nested review extraction fields', () => {
    expect(adaptReviewEmail({
      emailId: 'email-1',
      sender: { email: 'recruiter@example.com', name: 'Recruiter' },
      extraction: { companyName: 'Acme', eventType: 'INTERVIEW' },
    })).toMatchObject({
      id: 'email-1',
      fromEmail: 'recruiter@example.com',
      senderName: 'Recruiter',
      companyName: 'Acme',
      eventType: 'INTERVIEW',
    });
  });

  it('unwraps a nested original email response', () => {
    expect(adaptOriginalEmail({
      email: {
        emailId: 'email-1',
        subject: 'Interview',
        textBody: 'Please choose a time.',
      },
    })).toMatchObject({
      id: 'email-1',
      emailId: 'email-1',
      subject: 'Interview',
      bodyText: 'Please choose a time.',
    });
  });

  it('unwraps successful API response data', () => {
    expect(unwrapData({
      success: true,
      message: 'Loaded',
      data: { applications: [] },
      error: null,
    })).toEqual({ applications: [] });
  });

  it('rejects unsuccessful envelopes with the API error', () => {
    expect(() => unwrapData({
      success: false,
      message: 'Application request failed',
      data: null,
      error: 'Application not found',
    })).toThrow('Application not found');
  });
});
