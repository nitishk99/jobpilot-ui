import axios from 'axios';
import { api, getApiOrigin } from '../../api/client';
import { assertSuccess, unwrapData } from '../../api/response';
import type { ApiResponse } from '../../api/types';

interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  profilePicture: string | null;
  connectedAccountEmail?: string | null;
  connectedAccountStatus?: string | null;
}

interface CurrentUserResponse {
  user: AuthUser;
}

function parseCurrentUserResponse(value: unknown): AuthUser {
  if (value === null || typeof value !== 'object' || !('user' in value)) {
    throw new Error('The authentication response did not contain a user.');
  }

  const user = (value as CurrentUserResponse).user;
  if (
    user === null ||
    typeof user !== 'object' ||
    typeof user.id !== 'string' ||
    typeof user.email !== 'string' ||
    typeof user.displayName !== 'string' ||
    (typeof user.profilePicture !== 'string' && user.profilePicture !== null) ||
    (user.connectedAccountEmail != null && typeof user.connectedAccountEmail !== 'string') ||
    (user.connectedAccountStatus != null && typeof user.connectedAccountStatus !== 'string')
  ) {
    throw new Error('The authentication response contained an invalid user.');
  }

  const currentUser: AuthUser = {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    profilePicture: user.profilePicture,
  };
  if (user.connectedAccountEmail != null) currentUser.connectedAccountEmail = user.connectedAccountEmail;
  if (user.connectedAccountStatus != null) currentUser.connectedAccountStatus = user.connectedAccountStatus;
  return currentUser;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await api.get<ApiResponse<CurrentUserResponse>>('/auth/me');
    return parseCurrentUserResponse(unwrapData(response.data));
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) return null;
    throw error;
  }
}

export function getGoogleOAuthUrl() {
  // The backend owns the OAuth flow and sets the HTTP-only session cookie.
  return `${getApiOrigin()}/api/auth/google`;
}

export async function logout() {
  const response = await api.post<ApiResponse<null>>('/auth/logout');
  assertSuccess(response.data);
}
