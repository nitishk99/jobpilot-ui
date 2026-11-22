import { Mail, RefreshCw } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { TimelineItem } from './TimelineItem';
import type { ApplicationTimeline } from './timeline.types';
import { formatDate } from '../../utils/format';

interface TimelineOverviewProps {
  timeline: ApplicationTimeline;
}

export function TimelineOverview({ timeline }: TimelineOverviewProps) {
  const { application, timeline: events } = timeline;
  const eventCount = events.length;

  return (
    <>
      <div className="detail-metrics-grid">
        <div className="detail-metric"><span>Last activity</span><strong>{formatDate(application.lastActivityAt)}</strong><RefreshCw size={17} /></div>
        <div className="detail-metric"><span>Emails in history</span><strong>{application.totalEmailCount ?? eventCount}</strong><Mail size={17} /></div>
      </div>
      <section className="panel timeline-panel">
        <div className="panel-heading">
          <div><h2>Application timeline</h2><p>Every milestone and hiring conversation associated with this role.</p></div>
          <span className="timeline-count">{eventCount} events</span>
        </div>
        {events.length ? (
          <div className="timeline-list">
            {events.map((event, index) => (
              <TimelineItem key={`${event.emailId}-${index}`} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState title="No timeline events yet" description="When JobPilot associates job-related emails with this application, their milestones will appear here." />
        )}
      </section>
    </>
  );
}
