import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from '@jest/globals';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ApplicationResults } from '../../src/features/applications/ApplicationResults';
import type { Application } from '../../src/features/applications/application.types';

const application: Application = {
  id: 'application 1',
  companyName: 'Acme',
  jobTitle: 'Engineer',
  status: 'INTERVIEW',
  appliedAt: null,
  lastActivityAt: null,
  totalEmailCount: 2,
};

function TimelineDestination() {
  const location = useLocation();
  return <p>Opened {location.pathname}</p>;
}

afterEach(cleanup);

describe('application results', () => {
  it('shows a helpful message when there are no applications', () => {
    render(<ApplicationResults applications={[]} />);

    expect(screen.getByText('Your applications will appear here')).toBeTruthy();
  });

  it('opens the selected application with an encoded ID', () => {
    render(
      <MemoryRouter initialEntries={['/applications']}>
        <Routes>
          <Route path="/applications" element={<ApplicationResults applications={[application]} />} />
          <Route path="/applications/:id" element={<TimelineDestination />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Acme')).toBeTruthy();
    expect(screen.getByText('Engineer')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /acme.*engineer/i }));
    expect(screen.getByText('Opened /applications/application%201')).toBeTruthy();
  });
});
