import { AxiosHeaders } from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { api } from '../../src/api/client';
import { TimelinePage } from '../../src/features/timeline/TimelinePage';

function timelineResponse(events: object[]) {
  return {
    data: {
      success: true,
      message: 'Timeline loaded',
      error: null,
      data: {
        application: {
          id: 'application-1',
          companyName: 'Acme',
          jobTitle: 'Engineer',
          status: 'INTERVIEW',
          totalEmailCount: events.length,
        },
        timeline: events,
      },
    },
    status: 200,
    statusText: 'OK',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  };
}

function renderTimeline() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/applications/application-1']}>
        <Routes>
          <Route path="/applications/:id" element={<TimelinePage />} />
          <Route path="/applications" element={<p>Applications page</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

describe('application timeline page', () => {
  it('loads the application and renders its email history', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(timelineResponse([{
      emailId: 'email-1',
      eventType: 'INTERVIEW',
      summary: 'Interview scheduled',
      gmailUrl: 'https://mail.google.com/mail/u/0/#inbox/email-1',
    }]));

    renderTimeline();

    expect(screen.getByText('Loading application timeline…')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Acme' })).toBeTruthy();
    expect(screen.getByText('Engineer')).toBeTruthy();
    expect(screen.queryByText('Applied')).toBeNull();
    expect(screen.getByText('Interview scheduled')).toBeTruthy();
    expect(screen.getByRole('link', { name: /open in gmail/i }).getAttribute('href'))
      .toBe('https://mail.google.com/mail/u/0/#inbox/email-1');
    expect(api.get).toHaveBeenCalledWith('/applications/application-1/timeline');
  });

  it('shows an empty history when no events exist', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(timelineResponse([]));

    renderTimeline();

    expect(await screen.findByText('No timeline events yet')).toBeTruthy();
    expect(screen.getByText('0 recorded events')).toBeTruthy();
  });

  it('shows a retryable error and loads the timeline after retry', async () => {
    jest.spyOn(api, 'get')
      .mockRejectedValueOnce(new Error('Timeline unavailable'))
      .mockResolvedValueOnce(timelineResponse([]));

    renderTimeline();

    expect(await screen.findByText('Timeline unavailable')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByText('No timeline events yet')).toBeTruthy();
    expect(api.get).toHaveBeenCalledTimes(2);
  });
});
