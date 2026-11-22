import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ArrowRight, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../config/routes';
import { formatDate } from '../../utils/format';
import type { Application } from './application.types';

function ApplicationCard({ application }: { application: Application }) {
  const navigate = useNavigate();
  const statusClass = `status-${(application.status ?? 'unknown').toLowerCase().replaceAll('_', '-')}`;

  return (
    <button className={`application-card ${statusClass}`} onClick={() => navigate(routes.application(application.id))}>
      <span className="application-card-top">
        <span className="company-avatar">{application.companyName.slice(0, 2).toUpperCase()}</span>
        <span className="application-main">
          <span className="application-company">{application.companyName}</span>
          <strong>{application.jobTitle}</strong>
        </span>
        <ArrowRight className="row-open" size={17} />
      </span>
      <span className="application-card-bottom">
        <StatusBadge status={application.status} />
        <span className="application-activity">
          <small>Updated</small>
          {formatDate(application.lastActivityAt || application.appliedAt)}
        </span>
        <span className="application-emails"><Mail size={14} /><strong>{application.totalEmailCount ?? 0}</strong><small>messages</small></span>
      </span>
    </button>
  );
}

export function ApplicationResults({ applications }: { applications: Application[] }) {
  if (!applications.length) {
    return (
      <EmptyState
        title="Your applications will appear here"
        description="Once JobPilot processes a reliable application confirmation from Gmail, the application and its email history will appear here."
      />
    );
  }

  return (
    <div className="application-grid">
      {applications.map((application) => (
        <ApplicationCard key={application.id} application={application} />
      ))}
    </div>
  );
}
