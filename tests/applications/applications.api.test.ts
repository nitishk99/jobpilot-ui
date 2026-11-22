import { AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { api } from '../../src/api/client';
import { getAllApplications } from '../../src/features/applications/applications.api';

function pageResponse(page: number) {
  return {
    data: {
      success: true,
      message: 'Loaded',
      error: null,
      data: {
        applications: [{ id: `application-${page}` }],
        pagination: { page, limit: 1, total: 3, totalPages: 3 },
        stats: {},
      },
    },
    status: 200,
    statusText: 'OK',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  };
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('loading applications for review', () => {
  it('loads every page and keeps results in page order', async () => {
    jest.spyOn(api, 'get')
      .mockResolvedValueOnce(pageResponse(1))
      .mockResolvedValueOnce(pageResponse(2))
      .mockResolvedValueOnce(pageResponse(3));

    const applications = await getAllApplications(1);

    expect(applications.map((application) => application.id)).toEqual([
      'application-1', 'application-2', 'application-3',
    ]);
    expect(api.get).toHaveBeenCalledTimes(3);
  });

  it('reports an error if a later page fails', async () => {
    const error = new Error('Failed to load applications');
    jest.spyOn(api, 'get')
      .mockResolvedValueOnce(pageResponse(1))
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(pageResponse(3));

    await expect(getAllApplications(1)).rejects.toBe(error);
  });
});
