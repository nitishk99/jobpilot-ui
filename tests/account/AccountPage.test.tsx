import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AccountPage } from '../../src/features/account/AccountPage';

const mockLogout = jest.fn<() => Promise<void>>();

jest.mock('../../src/features/auth/auth.api', () => ({ logout: () => mockLogout() }));
jest.mock('../../src/features/auth/use-auth', () => ({
  useAuth: () => ({ user: { displayName: 'Alex', email: 'alex@example.com' } }),
}));

function renderAccount() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  queryClient.setQueryData(['applications'], ['cached application']);
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/account']}>
        <Routes>
          <Route path="/account" element={<AccountPage />} />
          <Route path="/login" element={<p>Login page</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return queryClient;
}

beforeEach(() => {
  mockLogout.mockReset();
});

afterEach(cleanup);

describe('account sign out', () => {
  it('clears cached data and goes to login after the backend signs out', async () => {
    mockLogout.mockResolvedValue(undefined);
    const queryClient = renderAccount();

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    expect(await screen.findByText('Login page')).toBeTruthy();
    expect(queryClient.getQueryData(['applications'])).toBeUndefined();
  });

  it('shows an error and keeps cached data when sign out fails', async () => {
    mockLogout.mockRejectedValue(new Error('Sign out failed'));
    const queryClient = renderAccount();

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    expect(await screen.findByText('Sign out failed')).toBeTruthy();
    await waitFor(() => expect(mockLogout).toHaveBeenCalledTimes(1));
    expect(queryClient.getQueryData(['applications'])).toEqual(['cached application']);
    expect(screen.queryByText('Login page')).toBeNull();
  });
});
