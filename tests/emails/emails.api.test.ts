import { AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { api } from '../../src/api/client';
import { associateEmail, createApplicationFromReviewEmail, dismissReviewEmail, getOriginalEmail, getReviewEmails } from '../../src/features/emails/emails.api';
import { getApplicationTimeline } from '../../src/features/timeline/timeline.api';

function response(data: unknown): Awaited<ReturnType<typeof api.post>> {
  return {
    data,
    status: 201,
    statusText: 'Created',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  };
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Gmail fields in email responses', () => {
  it('retains the Gmail fields and database ID in the review list', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(response({
      success: true, message: 'Loaded', error: null,
      data: { emails: [{ emailId: 'database-id', gmailMessageId: 'gmail-id', gmailUrl: 'https://mail.google.com/mail/u/0/#inbox/gmail-id' }] },
    }));

    const result = await getReviewEmails();
    expect(result.items[0]).toMatchObject({
      id: 'database-id', gmailMessageId: 'gmail-id', gmailUrl: 'https://mail.google.com/mail/u/0/#inbox/gmail-id',
    });
  });

  describe('review pagination', () => {
    it('uses pagination returned by the API', async () => {
      jest.spyOn(api, 'get').mockResolvedValue(response({
        success: true, message: 'Loaded', error: null,
        data: { emails: [{ id: 'email-1' }], pagination: { total: 3, page: 2, limit: 1, totalPages: 3 } },
      }));

      const result = await getReviewEmails(1, 10);

      expect(result).toMatchObject({ page: 2, limit: 1, total: 3, totalPages: 3, items: [{ id: 'email-1' }] });
    });

    it('uses requested pagination and item count when metadata is absent', async () => {
      jest.spyOn(api, 'get').mockResolvedValue(response({
        success: true, message: 'Loaded', error: null,
        data: { applications: [{ id: 'one' }, { id: 'two' }] },
      }));

      const result = await getReviewEmails(1, 10);

      expect(result).toMatchObject({ page: 1, limit: 10, total: 2, totalPages: 1, items: [{ id: 'one' }, { id: 'two' }] });
    });
  });

  describe('encoded resource paths', () => {
    it('encodes an application ID when fetching its timeline', async () => {
      jest.spyOn(api, 'get').mockResolvedValue(response({
        success: true, message: 'Loaded', error: null,
        data: { application: { id: 'application/one' }, timeline: [] },
      }));

      await getApplicationTimeline('application/one');

      expect(api.get).toHaveBeenCalledWith('/applications/application%2Fone/timeline');
    });

    it('encodes an email ID when associating it', async () => {
      jest.spyOn(api, 'patch').mockResolvedValue(response({
        success: true, message: 'Associated', error: null, data: {},
      }));

      await associateEmail('email/one', 'application-id');

      expect(api.patch).toHaveBeenCalledWith('/emails/email%2Fone/associate', { applicationId: 'application-id' });
    });
  });

  it('retains Gmail fields in the email details response', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(response({
      success: true, message: 'Loaded', error: null,
      data: { email: { id: 'database-id', gmailMessageId: 'gmail-id', gmailUrl: 'https://mail.google.com/mail/u/0/#inbox/gmail-id' } },
    }));

    await expect(getOriginalEmail('database-id')).resolves.toMatchObject({
      id: 'database-id', emailId: 'database-id', gmailMessageId: 'gmail-id', gmailUrl: 'https://mail.google.com/mail/u/0/#inbox/gmail-id',
    });
    expect(api.get).toHaveBeenCalledWith('/emails/database-id');
  });

  it('retains Gmail fields and database IDs in timeline events', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(response({
      success: true, message: 'Loaded', error: null,
      data: {
        application: { id: 'application-id', companyName: 'Acme', jobTitle: 'Engineer' },
        timeline: [{ emailId: 'database-id', gmailMessageId: 'gmail-id', gmailUrl: 'https://mail.google.com/mail/u/0/#inbox/gmail-id' }],
      },
    }));

    const result = await getApplicationTimeline('application-id');
    expect(result.timeline[0]).toMatchObject({
      emailId: 'database-id', gmailMessageId: 'gmail-id', gmailUrl: 'https://mail.google.com/mail/u/0/#inbox/gmail-id',
    });
  });
});

describe('dismiss review email API', () => {
  it('dismisses an encoded email id and unwraps the result', async () => {
    jest.spyOn(api, 'delete').mockResolvedValue(response({
      success: true,
      message: 'Email dismissed from review',
      data: { emailId: 'email/with/slash', dismissed: true },
      error: null,
    }));

    await expect(dismissReviewEmail('email/with/slash')).resolves.toEqual({
      emailId: 'email/with/slash',
      dismissed: true,
    });
    expect(api.delete).toHaveBeenCalledWith('/emails/email%2Fwith%2Fslash/review');
  });
});

describe('create application from review email API', () => {
  it('sends an empty object when no correction values are needed', async () => {
    jest.spyOn(api, 'post').mockResolvedValue(response({
      success: true,
      message: 'Application created',
      error: null,
      data: {
        emailId: 'email-id',
        application: {
          id: 'application-id',
          companyName: 'Acme',
          jobTitle: 'Engineer',
          status: 'INTERVIEW',
          totalEmailCount: 1,
        },
      },
    }));

    await expect(createApplicationFromReviewEmail('email-id')).resolves.toMatchObject({
      emailId: 'email-id',
      application: {
        id: 'application-id',
        companyName: 'Acme',
        jobTitle: 'Engineer',
        status: 'INTERVIEW',
      },
    });
    expect(api.post).toHaveBeenCalledWith('/emails/email-id/create-application', {});
  });

  it('sends corrections and encodes the email ID in the endpoint', async () => {
    jest.spyOn(api, 'post').mockResolvedValue(response({
      success: true,
      message: 'Application created',
      error: null,
      data: {
        emailId: 'email/with/slash',
        application: { id: 'application-id', companyName: 'Acme', jobTitle: 'Engineer' },
      },
    }));

    await createApplicationFromReviewEmail('email/with/slash', {
      companyName: 'Acme',
      jobTitle: 'Engineer',
    });

    expect(api.post).toHaveBeenCalledWith(
      '/emails/email%2Fwith%2Fslash/create-application',
      { companyName: 'Acme', jobTitle: 'Engineer' },
    );
  });

  it('rejects a malformed success response', async () => {
    jest.spyOn(api, 'post').mockResolvedValue(response({
      success: true,
      message: 'Application created',
      error: null,
      data: { application: {} },
    }));

    await expect(createApplicationFromReviewEmail('email-id')).rejects.toThrow(
      'The create-application response was missing the email or application ID.',
    );
  });
});
