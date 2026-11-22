import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from '@jest/globals';
import { TimelineItem } from '../../src/features/timeline/TimelineItem';

afterEach(cleanup);

describe('timeline email actions', () => {
  it('opens Gmail directly and shows only the received date as metadata', () => {
    render(<TimelineItem event={{ emailId: 'database-id', gmailUrl: 'https://mail.google.com/mail/u/0/#inbox/gmail-id', originalEmailAvailable: true, emailReceivedAt: '2026-11-22T00:00:00Z', eventDate: '2026-11-23T00:00:00Z', meetingLink: 'https://meet.example' }} />);

    const link = screen.getByRole('link', { name: 'Open in Gmail' });
    expect(link.getAttribute('href')).toBe('https://mail.google.com/mail/u/0/#inbox/gmail-id');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(screen.getByText('Email received:')).toBeTruthy();
    expect(screen.queryByText(/event date:/i)).toBeNull();
    expect(screen.queryByRole('link', { name: /meeting/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /manage association|view original email/i })).toBeNull();
  });

  it.each([undefined, 'https://example.com'])('explains when a Gmail link is unavailable: %s', (gmailUrl) => {
    render(<TimelineItem event={{ emailId: 'database-id', gmailUrl, originalEmailAvailable: true }} />);

    expect(screen.queryByRole('link', { name: 'Open in Gmail' })).toBeNull();
    expect(screen.getByText('Gmail link unavailable')).toBeTruthy();
  });
});
