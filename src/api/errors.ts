import axios from 'axios';
interface ApiErrorPayload {
  message?: string;
  error?: string | null;
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    if (!error.response) {
      return 'Could not reach the JobPilot API. Check your connection, API availability, or CORS configuration.';
    }
    const message = error.response.data?.error || error.response.data?.message;
    if (message) return message;
    if (error.response.status === 401) return 'Your session has expired. Please sign in again.';
    if (error.response.status >= 500) return 'The JobPilot API is temporarily unavailable. Please try again.';
    return fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
