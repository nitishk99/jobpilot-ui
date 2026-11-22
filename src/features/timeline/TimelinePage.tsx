import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { getApplicationTimeline } from './timeline.api';
import { queryKeys } from '../../api/query-keys';
import { TimelineOverview } from './TimelineOverview';
import { routes } from '../../config/routes';

export function TimelinePage() {
  const { id = '' } = useParams();
  const timelineQuery = useQuery({
    queryKey: queryKeys.applications.timeline(id),
    queryFn: () => getApplicationTimeline(id),
    enabled: Boolean(id),
  });
  const timeline = timelineQuery.data;

  if (timelineQuery.isPending) return <LoadingState label="Loading application timeline…" />;
  if (timelineQuery.error) return <div className="page-stack"><Link className="back-link" to={routes.applications}><ArrowLeft size={15} /> Back to applications</Link><ErrorState error={timelineQuery.error} onRetry={() => void timelineQuery.refetch()} /></div>;
  if (!timeline) return null;
  const { application } = timeline;

  return (
    <div className="page-stack">
      <Link className="back-link" to={routes.applications}><ArrowLeft size={15} /> All applications</Link>
      <header className="application-hero">
        <div className="application-hero-copy">
          <span className="eyebrow">APPLICATION JOURNEY</span>
          <h1>{application.companyName}</h1>
          <p>{application.jobTitle}</p>
        </div>
        <div className="application-hero-side">
          <StatusBadge status={application.status} />
          <span>{timeline.timeline.length} recorded {timeline.timeline.length === 1 ? 'event' : 'events'}</span>
        </div>
      </header>
      <TimelineOverview timeline={timeline} />
    </div>
  );
}
