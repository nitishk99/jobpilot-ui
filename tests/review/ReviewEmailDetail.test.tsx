import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import type { OriginalEmail, ReviewEmail } from '../../src/features/emails/email.types';
import { ReviewEmailDetail } from '../../src/features/review/ReviewEmailDetail';

const email: ReviewEmail = {
  id: 'email-id',
  companyName: 'Acme',
  jobTitle: 'Engineer',
};

function renderDetail(onCreateApplication = jest.fn(), originalEmail?: OriginalEmail) {
  render(
    <ReviewEmailDetail
      email={email}
      originalEmail={originalEmail}
      originalEmailLoading={false}
      originalEmailError={null}
      onRetryOriginalEmail={jest.fn()}
      applications={[]}
      applicationsLoading={false}
      applicationsError={null}
      onRetryApplications={jest.fn()}
      applicationId=""
      associationPending={false}
      associationError={null}
      onApplicationChange={jest.fn()}
      onAssociate={jest.fn()}
      createApplicationPending={false}
      createApplicationError={null}
      onCreateApplication={onCreateApplication}
      dismissPending={false}
      dismissError={null}
      onDismiss={jest.fn()}
    />,
  );
  return onCreateApplication;
}

afterEach(cleanup);

describe('review email application creation form', () => {
  it('submits no corrections when extracted values are unchanged', () => {
    const onCreateApplication = renderDetail();
    fireEvent.click(screen.getByRole('tab', { name: 'Create new' }));

    fireEvent.click(screen.getByRole('button', { name: /create application/i }));

    expect(onCreateApplication).toHaveBeenCalledWith(undefined);
  });

  describe('original email navigation', () => {
    it('opens the email in Gmail instead of showing the stored body', () => {
      renderDetail(jest.fn(), {
        subject: 'Interview invitation',
        gmailUrl: 'https://mail.google.com/mail/u/0/#inbox/gmail-id',
        bodyText: 'Stored body',
      });

      const link = screen.getByRole('link', { name: /open in gmail/i });
      expect(link.getAttribute('href')).toBe('https://mail.google.com/mail/u/0/#inbox/gmail-id');
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expect(screen.queryByText('Stored body')).toBeNull();
    });

    it.each([undefined, 'https://mail.google.com.evil.example/message', 'javascript:alert(1)'])(
      'shows the stored body when the Gmail URL is absent or invalid: %s',
      (gmailUrl) => {
        renderDetail(jest.fn(), { subject: 'Interview invitation', gmailUrl, bodyText: 'Stored body' });

        expect(screen.queryByRole('link', { name: /open in gmail/i })).toBeNull();
        expect(screen.getByText('Stored body')).toBeTruthy();
      },
    );
  });

  it('submits only the fields changed from extracted values', () => {
    const onCreateApplication = renderDetail();
    fireEvent.click(screen.getByRole('tab', { name: 'Create new' }));
    fireEvent.change(screen.getByLabelText('Company'), { target: { value: 'New Acme' } });

    fireEvent.click(screen.getByRole('button', { name: /create application/i }));

    expect(onCreateApplication).toHaveBeenCalledWith({ companyName: 'New Acme' });
  });

  it('offers a separate not relevant action', () => {
    renderDetail();
    fireEvent.click(screen.getByRole('tab', { name: 'Not relevant' }));

    expect(screen.getByRole('button', { name: 'Mark as not relevant' })).toBeTruthy();
  });
});
