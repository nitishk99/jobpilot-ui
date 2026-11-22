import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ReviewPage } from '../../src/features/review/ReviewPage';

const mockReview = {
  useOriginalEmail: jest.fn<(id?: string) => unknown>(),
  useReviewEmails: jest.fn<(page: number, limit: number) => unknown>(),
  useAllApplications: jest.fn<() => unknown>(),
  dismiss: jest.fn<(id: string, options: { onSuccess: () => void }) => void>(),
  reset: jest.fn<() => void>(),
  dismissPending: false,
};

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual<typeof import('@tanstack/react-query')>('@tanstack/react-query'),
  useQuery: (options: { queryKey: readonly unknown[] }) => {
    if (options.queryKey[0] === 'applications') return mockReview.useAllApplications();
    if (options.queryKey.length === 2) {
      const emailId = options.queryKey[1];
      return mockReview.useOriginalEmail(typeof emailId === 'string' && emailId ? emailId : undefined);
    }
    const pagination = options.queryKey[2] as { page: number; limit: number };
    return mockReview.useReviewEmails(pagination.page, pagination.limit);
  },
}));
jest.mock('../../src/features/review/use-review-actions', () => ({
  useReviewActions: () => ({
    associate: { isPending: false },
    create: { isPending: false },
    dismiss: { isPending: mockReview.dismissPending, mutate: mockReview.dismiss },
    isPending: mockReview.dismissPending,
    reset: () => { mockReview.reset(); mockReview.reset(); mockReview.reset(); },
  }),
}));

beforeEach(() => {
  mockReview.dismissPending = false;
  mockReview.useReviewEmails.mockReturnValue({
    isPending: false,
    data: {
      items: [
        { id: 'database-id-1', subject: 'Gmail message', gmailUrl: 'https://mail.google.com/mail/u/0/#inbox/gmail-id' },
        { id: 'database-id-2', subject: 'Stored message', gmailUrl: 'https://example.com' },
      ],
      page: 1, totalPages: 1, total: 2,
    },
  });
  mockReview.useOriginalEmail.mockReturnValue({ isPending: false, error: null });
  mockReview.useAllApplications.mockReturnValue({ data: [], isPending: false });
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('review queue', () => {
  it('shows the empty state without requesting page zero', () => {
    mockReview.useReviewEmails.mockReturnValue({
      isPending: false,
      data: { items: [], page: 1, totalPages: 0, total: 0 },
    });

    render(<MemoryRouter><ReviewPage /></MemoryRouter>);

    expect(screen.getByText('You’re all caught up')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /try again/i })).toBeNull();
    expect(mockReview.useReviewEmails).toHaveBeenLastCalledWith(1, 10);
    expect(mockReview.useReviewEmails.mock.calls.some(([page]) => page === 0)).toBe(false);
  });

  it('returns to page one when the last page becomes empty', () => {
    let empty = false;
    mockReview.useReviewEmails.mockImplementation((page: number) => ({
      isPending: false,
      data: empty
        ? { items: [], page, totalPages: 0, total: 0 }
        : { items: [{ id: 'database-id', subject: 'Message' }], page, totalPages: 2, total: 2 },
    }));

    const view = render(<MemoryRouter><ReviewPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(mockReview.useReviewEmails).toHaveBeenLastCalledWith(2, 10);

    empty = true;
    view.rerender(<MemoryRouter><ReviewPage /></MemoryRouter>);

    expect(screen.getByText('You’re all caught up')).toBeTruthy();
    expect(mockReview.useReviewEmails).toHaveBeenLastCalledWith(1, 10);
    expect(mockReview.useReviewEmails.mock.calls.some(([page]) => page === 0)).toBe(false);
  });

  it('keeps a failed later-page request visible instead of resetting to page one', () => {
    mockReview.useReviewEmails.mockImplementation((page: number) => page === 1
      ? {
          isPending: false,
          data: { items: [{ id: 'database-id', subject: 'Message' }], page, totalPages: 2, total: 2 },
        }
      : { isPending: false, error: new Error('Review request failed'), refetch: jest.fn() });

    render(<MemoryRouter><ReviewPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));

    expect(screen.getByText('Review request failed')).toBeTruthy();
    expect(screen.getByRole('button', { name: /try again/i })).toBeTruthy();
    expect(mockReview.useReviewEmails).toHaveBeenLastCalledWith(2, 10);
  });

  it('dismisses directly and disables the action while it is pending', () => {
    const confirm = jest.spyOn(window, 'confirm');
    const view = render(<MemoryRouter><ReviewPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('tab', { name: 'Not relevant' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mark as not relevant' }));

    expect(confirm).not.toHaveBeenCalled();
    expect(mockReview.dismiss).toHaveBeenCalledWith('database-id-1', expect.objectContaining({ onSuccess: expect.any(Function) }));

    mockReview.dismissPending = true;
    view.rerender(<MemoryRouter><ReviewPage /></MemoryRouter>);
    expect((screen.getByRole('button', { name: 'Dismissing…' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('tab', { name: 'Match existing' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('tab', { name: 'Create new' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: /stored message/i }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('disables page navigation while an action is pending', () => {
    mockReview.useReviewEmails.mockReturnValue({
      isPending: false,
      data: { items: [{ id: 'database-id', subject: 'Message' }], page: 1, totalPages: 2, total: 2 },
    });
    mockReview.dismissPending = true;

    render(<MemoryRouter><ReviewPage /></MemoryRouter>);

    expect((screen.getByRole('button', { name: 'Next page' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('surfaces application loading errors instead of showing an empty list', () => {
    const refetch = jest.fn();
    mockReview.useAllApplications.mockReturnValue({ isPending: false, error: new Error('Applications request failed'), refetch });

    render(<MemoryRouter><ReviewPage /></MemoryRouter>);

    expect(screen.getByText('Applications request failed')).toBeTruthy();
    expect(screen.queryByText(/no applications are available/i)).toBeNull();
    expect((screen.getByLabelText('Associate with an application') as HTMLSelectElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});

describe('review page Gmail navigation', () => {
  it('uses the review link without fetching the body, then fetches the stored fallback for an invalid link', () => {
    mockReview.useOriginalEmail.mockImplementation((id?: string) => ({
      isPending: !id,
      data: id ? { subject: 'Stored message', bodyText: 'Stored email body' } : undefined,
      error: null,
    }));
    render(<MemoryRouter><ReviewPage /></MemoryRouter>);

    expect(mockReview.useOriginalEmail).toHaveBeenLastCalledWith(undefined);
    expect(screen.getByRole('link', { name: /open in gmail/i }).getAttribute('href'))
      .toBe('https://mail.google.com/mail/u/0/#inbox/gmail-id');

    fireEvent.click(screen.getByRole('button', { name: /stored message/i }));
    expect(mockReview.reset).toHaveBeenCalledTimes(3);
    expect(mockReview.useOriginalEmail).toHaveBeenLastCalledWith('database-id-2');
    expect(screen.queryByRole('link', { name: /open in gmail/i })).toBeNull();
    expect(screen.getByText('Stored email body')).toBeTruthy();
  });
});
