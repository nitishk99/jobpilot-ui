import { ArrowUpRight, Mail } from 'lucide-react';
import type { TimelineEvent } from './timeline.types';
import { formatDateTime, titleCase } from '../../utils/format';
import { getGmailUrl } from '../../utils/gmail';

export function TimelineItem({ event }: { event: TimelineEvent }) {
  const gmailUrl = getGmailUrl(event.gmailUrl);
  return (
    <article className="timeline-item">
      <div className="timeline-marker"><span /></div>
      <div className="timeline-card">
        <div className="timeline-card-top"><span className="event-type">{titleCase(event.eventType || event.category)}</span>{event.category && <span className="event-category">{titleCase(event.category)}</span>}</div>
        <h3>{event.eventType ? titleCase(event.eventType) : event.subject || 'Email update'}</h3>
        {event.summary && <p className="timeline-summary">{event.summary}</p>}
        <div className="timeline-dates">
          <span><Mail size={14} /> Email received: <strong>{formatDateTime(event.emailReceivedAt)}</strong></span>
        </div>
        {gmailUrl ? (
          <a className="email-open-link" href={gmailUrl} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={15} /> Open in Gmail</a>
        ) : (
          <span className="email-open-unavailable">Gmail link unavailable</span>
        )}
      </div>
    </article>
  );
}
