import axios, { AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { api, getApiOrigin } from '../../src/api/client';
import { getErrorMessage } from '../../src/api/errors';
import { getCurrentUser, getGoogleOAuthUrl, logout } from '../../src/features/auth/auth.api';

const response = (data: unknown): Awaited<ReturnType<typeof api.get>> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: new AxiosHeaders(),
  config: { headers: new AxiosHeaders() },
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('shared frontend authentication API', () => {
  it('uses the configured API origin and sends credentials', () => {
    expect(api.defaults.baseURL).toBe(`${getApiOrigin()}/api`);
    expect(api.defaults.withCredentials).toBe(true);
  });

  it('builds the Google OAuth URL from the shared API origin', () => {
    expect(getGoogleOAuthUrl()).toBe(
      `${getApiOrigin()}/api/auth/google`,
    );
  });

  it('parses the backend current-user response shape', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(
      response({
        success: true,
        message: 'Current user loaded',
        error: null,
        data: {
          user: {
            id: 'user-id',
            email: 'user@example.com',
            displayName: 'JobPilot User',
            profilePicture: null,
          },
        },
      }),
    );

    await expect(getCurrentUser()).resolves.toEqual({
      id: 'user-id',
      email: 'user@example.com',
      displayName: 'JobPilot User',
      profilePicture: null,
    });
    expect(api.get).toHaveBeenCalledWith('/auth/me');
  });

  it('preserves connected Gmail metadata when supplied', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(
      response({
        success: true,
        message: 'Current user loaded',
        error: null,
        data: {
          user: {
            id: 'user-id',
            email: 'user@example.com',
            displayName: 'JobPilot User',
            profilePicture: null,
            connectedAccountEmail: 'jobs@example.com',
            connectedAccountStatus: 'connected',
          },
        },
      }),
    );

    await expect(getCurrentUser()).resolves.toMatchObject({
      connectedAccountEmail: 'jobs@example.com',
      connectedAccountStatus: 'connected',
    });
  });

  it('treats only 401 as signed out and propagates network failures', async () => {
    jest.spyOn(api, 'get').mockRejectedValueOnce(
      Object.assign(new Error('Unauthorized'), {
        isAxiosError: true,
        response: { status: 401 },
      }),
    );
    await expect(getCurrentUser()).resolves.toBeNull();

    const networkError = new axios.AxiosError(
      'Network Error',
      'ERR_NETWORK',
    );
    jest.spyOn(api, 'get').mockRejectedValueOnce(networkError);
    await expect(getCurrentUser()).rejects.toBe(networkError);
    expect(getErrorMessage(networkError)).toContain('CORS configuration');
  });

  it('rejects malformed current-user payloads instead of guessing fields', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(
      response({
        success: true,
        message: 'Current user loaded',
        error: null,
        data: { id: 'user-id' },
      }),
    );

    await expect(getCurrentUser()).rejects.toThrow(
      'The authentication response did not contain a user.',
    );
  });

  it('logs out through the shared credentialed API client', async () => {
    jest.spyOn(api, 'post').mockResolvedValue(response({
      success: true,
      message: 'Logged out',
      data: null,
      error: null,
    }));

    await logout();

    expect(api.post).toHaveBeenCalledWith('/auth/logout');
  });
});
