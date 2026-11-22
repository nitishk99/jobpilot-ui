import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { useReviewActions } from '../../src/features/review/use-review-actions';

const mockApi = {
  associateEmail: jest.fn<typeof import('../../src/features/emails/emails.api').associateEmail>(),
  createApplicationFromReviewEmail: jest.fn<typeof import('../../src/features/emails/emails.api').createApplicationFromReviewEmail>(),
  dismissReviewEmail: jest.fn<typeof import('../../src/features/emails/emails.api').dismissReviewEmail>(),
};
jest.mock('../../src/features/emails/emails.api', () => ({
  associateEmail: (emailId: string, applicationId: string) => mockApi.associateEmail(emailId, applicationId),
  createApplicationFromReviewEmail: (emailId: string, corrections?: import('../../src/features/emails/email.types').ApplicationCorrections) =>
    mockApi.createApplicationFromReviewEmail(emailId, corrections),
  dismissReviewEmail: (emailId: string) => mockApi.dismissReviewEmail(emailId),
}));

function renderActions() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  client.setQueryData(['emails', 'review', { page: 1, limit: 10 }], []);
  client.setQueryData(['applications', 'list'], []);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, ...renderHook(() => useReviewActions(), { wrapper }) };
}

beforeEach(() => {
  jest.resetAllMocks();
});

afterEach(cleanup);

describe('review actions', () => {
  it('refreshes the review queue and applications after association', async () => {
    mockApi.associateEmail.mockResolvedValue({});
    const { client, result } = renderActions();

    await act(() => result.current.associate.mutateAsync({ emailId: 'email', applicationId: 'application' }));

    expect(mockApi.associateEmail).toHaveBeenCalledWith('email', 'application');
    expect(client.getQueryState(['emails', 'review', { page: 1, limit: 10 }])?.isInvalidated).toBe(true);
    expect(client.getQueryState(['applications', 'list'])?.isInvalidated).toBe(true);
  });

  it('refreshes only the review queue after dismissal', async () => {
    mockApi.dismissReviewEmail.mockResolvedValue({ emailId: 'email', dismissed: true });
    const { client, result } = renderActions();

    await act(() => result.current.dismiss.mutateAsync('email'));

    expect(client.getQueryState(['emails', 'review', { page: 1, limit: 10 }])?.isInvalidated).toBe(true);
    expect(client.getQueryState(['applications', 'list'])?.isInvalidated).toBe(false);
  });

  it('refreshes the review queue and applications after creation', async () => {
    mockApi.createApplicationFromReviewEmail.mockResolvedValue({
      emailId: 'email',
      application: {
        id: 'application', companyName: 'Acme', jobTitle: 'Engineer', status: 'APPLIED',
        appliedAt: null, lastActivityAt: null, totalEmailCount: 0,
      },
    });
    const { client, result } = renderActions();

    await act(() => result.current.create.mutateAsync({ emailId: 'email' }));

    expect(client.getQueryState(['emails', 'review', { page: 1, limit: 10 }])?.isInvalidated).toBe(true);
    expect(client.getQueryState(['applications', 'list'])?.isInvalidated).toBe(true);
  });

  it('refreshes the review queue on a create conflict without hiding the error', async () => {
    const error = Object.assign(new Error('Conflict'), { isAxiosError: true, response: { status: 409 } });
    mockApi.createApplicationFromReviewEmail.mockRejectedValue(error);
    const { client, result } = renderActions();

    await act(async () => {
      await expect(result.current.create.mutateAsync({ emailId: 'email' })).rejects.toBe(error);
    });

    expect(client.getQueryState(['emails', 'review', { page: 1, limit: 10 }])?.isInvalidated).toBe(true);
    expect(client.getQueryState(['applications', 'list'])?.isInvalidated).toBe(false);
  });
});
