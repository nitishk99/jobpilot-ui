import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockGetCurrentUser = jest.fn<() => Promise<{
  id: string;
  email: string;
  displayName: string;
  profilePicture: null;
} | null>>();

jest.mock('../../src/features/auth/auth.api', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

import {
  ProtectedLayout,
  PublicLayout,
  RootRedirect,
} from '../../src/app/router';
import { routes } from '../../src/config/routes';

const signedInUser = {
  id: 'user-id',
  email: 'user@example.com',
  displayName: 'JobPilot User',
  profilePicture: null,
};

function renderAuthRoutes(
  initialPath: string,
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  }),
) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        initialEntries={[initialPath]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path={routes.home} element={<RootRedirect />} />
          <Route element={<PublicLayout />}>
            <Route path={routes.login} element={<p>Login page</p>} />
          </Route>
          <Route element={<ProtectedLayout />}>
            <Route path={routes.applications} element={<p>Applications dashboard</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  jest.resetAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('authentication route restoration', () => {
  it('waits for session verification before rendering the protected page', async () => {
    mockGetCurrentUser.mockResolvedValue(signedInUser);

    renderAuthRoutes(routes.applications);

    expect(await screen.findByText('Applications dashboard')).toBeTruthy();
  });

  it('routes a 401 result to login', async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    renderAuthRoutes(routes.applications);

    expect(await screen.findByText('Login page')).toBeTruthy();
  });

  it('redirects an authenticated root visit to applications', async () => {
    mockGetCurrentUser.mockResolvedValue(signedInUser);

    renderAuthRoutes(routes.home);

    expect(await screen.findByText('Applications dashboard')).toBeTruthy();
    expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('shows a retryable error instead of treating network failures as logout', async () => {
    mockGetCurrentUser.mockRejectedValue(
      new Error('Could not reach the JobPilot API. Check CORS configuration.'),
    );

    renderAuthRoutes(routes.login);

    expect(
      await screen.findByText('Could not reach the JobPilot API. Check CORS configuration.'),
    ).toBeTruthy();
    expect(screen.queryByText('Login page')).toBeNull();
    expect(screen.getByRole('button', { name: /try again/i })).toBeTruthy();
  });

  it('checks the session once while the root route redirects to login', async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    renderAuthRoutes(routes.home);

    expect(await screen.findByText('Login page')).toBeTruthy();
    expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
  });
});
