import axios from 'axios';

const configuredOrigin = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
const apiOrigin = (configuredOrigin || 'http://localhost:5000').replace(/\/$/, '');

/** Central API client. Session authentication is handled by the backend HTTP-only cookie. */
export const api = axios.create({
  baseURL: `${apiOrigin}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

export function getApiOrigin() {
  return apiOrigin;
}
