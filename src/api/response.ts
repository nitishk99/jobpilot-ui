import type { ApiResponse } from './types';

function readEnvelope<T>(payload: unknown): ApiResponse<T> {
  if (
    payload === null ||
    typeof payload !== 'object' ||
    !('success' in payload) ||
    !('message' in payload) ||
    !('data' in payload) ||
    !('error' in payload)
  ) {
    throw new Error('The API returned an invalid response envelope.');
  }

  const response = payload as ApiResponse<T>;
  if (
    typeof response.success !== 'boolean' ||
    typeof response.message !== 'string' ||
    (response.error !== null && typeof response.error !== 'string')
  ) {
    throw new Error('The API returned an invalid response envelope.');
  }
  if (!response.success) {
    throw new Error(response.error ?? response.message);
  }
  return response;
}

export function assertSuccess(payload: unknown): void {
  readEnvelope(payload);
}

export function unwrapData<T>(payload: unknown): T {
  const response = readEnvelope<T>(payload);
  if (response.data === null) {
    throw new Error(response.message || 'The API response did not contain data.');
  }
  return response.data;
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object'
    ? value as Record<string, unknown>
    : {};
}

export function firstString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return undefined;
}

export function firstNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return undefined;
}

