import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { LoginPage } from '../../src/features/auth/LoginPage';

jest.mock('../../src/features/auth/auth.api', () => ({
  getGoogleOAuthUrl: () => {
    throw new Error('Invalid API configuration');
  },
}));

afterEach(cleanup);

describe('Google sign-in', () => {
  it('shows an error and allows retry if the redirect cannot start', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: /continue with google/i }));

    expect(screen.getByRole('alert').textContent).toContain('Unable to start Google sign-in');
    expect((screen.getByRole('button', { name: /continue with google/i }) as HTMLButtonElement).disabled).toBe(false);
  });
});
