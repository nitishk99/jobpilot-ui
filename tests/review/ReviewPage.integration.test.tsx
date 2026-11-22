import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import * as emailsApi from '../../src/features/emails/emails.api';
import * as applicationsApi from '../../src/features/applications/applications.api';
import { ReviewPage } from '../../src/features/review/ReviewPage';

const application = {
  id: 'application-1',
  companyName: 'Acme',
  jobTitle: 'Engineer',
  status: 'APPLIED' as const,
  appliedAt: null,
  lastActivityAt: null,
  totalEmailCount: 0,
};

const reviewPage = {
  items: [{
    id: 'email-1',
    subject: 'Unmatched email',
    companyName: 'Acme',
    jobTitle: 'Engineer',
    gmailUrl: 'https://mail.google.com/mail/u/0/#inbox/email-1',
  }],
  page: 1, limit: 10, total: 1, totalPages: 1,
};
const emptyPage = { items: [], page: 1, limit: 10, total: 0, totalPages: 1 };

function renderReview() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/review']}>
        <Routes>
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/applications/:id" element={<p>Application timeline opened</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

describe('review actions and data refresh', () => {
  it('reloads the queue after dismissing an email', async () => {
    const getEmails = jest.spyOn(emailsApi, 'getReviewEmails')
      .mockResolvedValueOnce(reviewPage)
      .mockResolvedValue(emptyPage);
    jest.spyOn(emailsApi, 'dismissReviewEmail').mockResolvedValue({ emailId: 'email-1', dismissed: true });
    const getOriginal = jest.spyOn(emailsApi, 'getOriginalEmail').mockResolvedValue({});
    jest.spyOn(applicationsApi, 'getAllApplications').mockResolvedValue([]);

    renderReview();

    expect(await screen.findByRole('button', { name: /unmatched email/i })).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: 'Not relevant' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mark as not relevant' }));

    expect(await screen.findByText('You’re all caught up')).toBeTruthy();
    expect(screen.getByText('Email dismissed from the review queue.')).toBeTruthy();
    expect(getEmails).toHaveBeenCalledTimes(2);
    expect(getOriginal).not.toHaveBeenCalled();
  });

  it('associates the selected email and refreshes the review queue', async () => {
    const getEmails = jest.spyOn(emailsApi, 'getReviewEmails')
      .mockResolvedValueOnce(reviewPage)
      .mockResolvedValue(emptyPage);
    jest.spyOn(applicationsApi, 'getAllApplications').mockResolvedValue([application]);
    const associate = jest.spyOn(emailsApi, 'associateEmail').mockResolvedValue({});

    renderReview();

    await screen.findByRole('option', { name: 'Acme — Engineer' });
    fireEvent.change(screen.getByLabelText('Associate with an application'), { target: { value: 'application-1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm association' }));

    expect(await screen.findByText('You’re all caught up')).toBeTruthy();
    expect(screen.getByText('Email associated successfully. It will now appear in the application timeline.')).toBeTruthy();
    expect(associate).toHaveBeenCalledWith('email-1', 'application-1');
    expect(getEmails).toHaveBeenCalledTimes(2);
  });

  it('shows an association error without removing the email', async () => {
    const getEmails = jest.spyOn(emailsApi, 'getReviewEmails').mockResolvedValue(reviewPage);
    jest.spyOn(applicationsApi, 'getAllApplications').mockResolvedValue([application]);
    jest.spyOn(emailsApi, 'associateEmail').mockRejectedValue(new Error('Association failed'));

    renderReview();

    await screen.findByRole('option', { name: 'Acme — Engineer' });
    fireEvent.change(screen.getByLabelText('Associate with an application'), { target: { value: 'application-1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm association' }));

    expect(await screen.findByText('Association failed')).toBeTruthy();
    expect(screen.getByRole('button', { name: /unmatched email/i })).toBeTruthy();
    expect(getEmails).toHaveBeenCalledTimes(1);
  });

  it('creates an application with corrected details and opens its timeline', async () => {
    jest.spyOn(emailsApi, 'getReviewEmails').mockResolvedValue(reviewPage);
    jest.spyOn(applicationsApi, 'getAllApplications').mockResolvedValue([]);
    const create = jest.spyOn(emailsApi, 'createApplicationFromReviewEmail')
      .mockResolvedValue({ emailId: 'email-1', application });

    renderReview();

    await screen.findByRole('button', { name: /unmatched email/i });
    fireEvent.click(screen.getByRole('tab', { name: 'Create new' }));
    fireEvent.change(screen.getByLabelText('Company'), { target: { value: 'New Acme' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create application' }));

    expect(await screen.findByText('Application timeline opened')).toBeTruthy();
    expect(create).toHaveBeenCalledWith('email-1', { companyName: 'New Acme' });
  });
});
