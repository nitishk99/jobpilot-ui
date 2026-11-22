import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { ApplicationsPage } from '../../src/features/applications/ApplicationsPage';

const mockUseApplications = jest.fn<(
  page: number,
  limit: number,
  options: { search: string; sortBy: string; order: string },
) => unknown>();
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual<typeof import('@tanstack/react-query')>('@tanstack/react-query'),
  useQuery: (options: { queryKey: readonly [string, string, { page: number; limit: number; search: string; sortBy: string; order: string }] }) => {
    const { page, limit, search, sortBy, order } = options.queryKey[2];
    return mockUseApplications(page, limit, { search, sortBy, order });
  },
}));
jest.mock('../../src/hooks/use-debounced-value', () => ({ useDebouncedValue: (value: string) => value }));

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('application search and sorting', () => {
  it('sends search and sort options and returns to the first page', () => {
    mockUseApplications.mockReturnValue({
      isPending: false,
      data: {
        items: [],
        page: 1,
        total: 30,
        totalPages: 2,
        stats: { total: 30, inProgress: 0, interviewing: 0, offers: 0, newlyApplied: 0 },
      },
    });

    render(<ApplicationsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(mockUseApplications).toHaveBeenLastCalledWith(2, 10, expect.any(Object));

    fireEvent.change(screen.getByLabelText('Sort applications'), { target: { value: 'company' } });
    expect(mockUseApplications).toHaveBeenLastCalledWith(1, 10, {
      search: '', sortBy: 'companyName', order: 'asc',
    });

    fireEvent.change(screen.getByLabelText('Search applications'), { target: { value: ' Acme ' } });
    expect(mockUseApplications).toHaveBeenLastCalledWith(1, 10, {
      search: 'Acme', sortBy: 'companyName', order: 'asc',
    });
  });
});
