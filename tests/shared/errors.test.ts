import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from '@jest/globals';
import { getErrorMessage } from '../../src/api/errors';

function apiError(status: number, data: { error?: string; message?: string } = {}) {
  return new AxiosError('Request failed', undefined, undefined, undefined, {
    status,
    statusText: 'Error',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
    data,
  });
}

describe('API error messages', () => {
  it('reports a network failure when the API cannot be reached', () => {
    expect(getErrorMessage(new AxiosError('Network Error'))).toContain('Could not reach the JobPilot API');
  });

  it('shows the backend error instead of the generic status message', () => {
    expect(getErrorMessage(apiError(401, { error: 'Session revoked' }))).toBe('Session revoked');
    expect(getErrorMessage(apiError(400, { message: 'Invalid application' }))).toBe('Invalid application');
  });

  it('explains expired sessions and server failures when no message is provided', () => {
    expect(getErrorMessage(apiError(401))).toContain('session has expired');
    expect(getErrorMessage(apiError(503))).toContain('temporarily unavailable');
  });

  it('uses the supplied fallback for an unrecognized response', () => {
    expect(getErrorMessage(apiError(403), 'Access denied')).toBe('Access denied');
  });
});
