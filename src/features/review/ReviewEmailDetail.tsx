import { ArrowUpRight, FilePlus2, FileSearch, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { OriginalEmailContent } from '../../components/common/OriginalEmailContent';
import { ErrorState } from '../../components/common/ErrorState';
import { getErrorMessage } from '../../api/errors';
import { titleCase } from '../../utils/format';
import type { Application } from '../applications/application.types';
import type { ApplicationCorrections, OriginalEmail, ReviewEmail } from '../emails/email.types';

interface ReviewEmailDetailProps {
  email: ReviewEmail;
  originalEmail?: OriginalEmail;
  originalEmailLoading: boolean;
  originalEmailError: unknown;
  onRetryOriginalEmail: () => void;
  applications: Application[];
  applicationsLoading: boolean;
  applicationsError: unknown;
  onRetryApplications: () => void;
  applicationId: string;
  associationPending: boolean;
  associationError: unknown;
  onApplicationChange: (applicationId: string) => void;
  onAssociate: () => void;
  createApplicationPending: boolean;
  createApplicationError: unknown;
  onCreateApplication: (corrections?: ApplicationCorrections) => void;
  dismissPending: boolean;
  dismissError: unknown;
  onDismiss: () => void;
}

export function ReviewEmailDetail({
  email,
  originalEmail,
  originalEmailLoading,
  originalEmailError,
  onRetryOriginalEmail,
  applications,
  applicationsLoading,
  applicationsError,
  onRetryApplications,
  applicationId,
  associationPending,
  associationError,
  onApplicationChange,
  onAssociate,
  createApplicationPending,
  createApplicationError,
  onCreateApplication,
  dismissPending,
  dismissError,
  onDismiss,
}: ReviewEmailDetailProps) {
  const [companyName, setCompanyName] = useState(email.companyName ?? '');
  const [jobTitle, setJobTitle] = useState(email.jobTitle ?? '');
  const [decision, setDecision] = useState<'associate' | 'create' | 'dismiss'>('associate');
  const actionPending = associationPending || createApplicationPending || dismissPending;

  function submitCreateApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const company = companyName.trim();
    const title = jobTitle.trim();
    const corrections: ApplicationCorrections = {};
    if (company !== (email.companyName ?? '').trim()) corrections.companyName = company;
    if (title !== (email.jobTitle ?? '').trim()) corrections.jobTitle = title;

    onCreateApplication(Object.keys(corrections).length ? corrections : undefined);
  }

  return (
    <section className="panel review-detail-panel">
      <div className="panel-heading">
        <div>
          <h2>Email review</h2>
          <p>Inspect the original email before choosing an application.</p>
        </div>
        <span className="status-badge status-screening">Unassigned</span>
      </div>
      <div className="extraction-summary">
        <div className="extraction-heading">
          <span className="extraction-icon"><FileSearch size={17} /></span>
          <div><strong>AI extracted details</strong><small>Suggestions from the email content</small></div>
        </div>
        <div className="extraction-grid">
          <div><span>Company</span><strong>{email.companyName || 'Not identified'}</strong></div>
          <div><span>Job title</span><strong>{email.jobTitle || 'Not identified'}</strong></div>
          <div><span>Event</span><strong>{titleCase(email.eventType)}</strong></div>
          <div><span>Category</span><strong>{titleCase(email.category)}</strong></div>
        </div>
        {email.summary && <p className="extraction-summary-text">{email.summary}</p>}
      </div>
      <div className="review-original-block">
        <div className="section-kicker">ORIGINAL EMAIL</div>
        <OriginalEmailContent
          email={originalEmail}
          isLoading={originalEmailLoading}
          error={originalEmailError}
          onRetry={onRetryOriginalEmail}
        />
      </div>
      <div className="review-decision-tabs" role="tablist" aria-label="Review action">
        <button type="button" role="tab" disabled={actionPending} aria-selected={decision === 'associate'} className={decision === 'associate' ? 'active' : ''} onClick={() => setDecision('associate')}>Match existing</button>
        <button type="button" role="tab" disabled={actionPending} aria-selected={decision === 'create'} className={decision === 'create' ? 'active' : ''} onClick={() => setDecision('create')}>Create new</button>
        <button type="button" role="tab" disabled={actionPending} aria-selected={decision === 'dismiss'} className={`dismiss-tab ${decision === 'dismiss' ? 'active' : ''}`} onClick={() => setDecision('dismiss')}>Not relevant</button>
      </div>
      {decision === 'associate' && <div className="associate-box">
        <label className="field-label" htmlFor="application-select">Associate with an application</label>
        <select
          id="application-select"
          className="form-select"
          value={applicationId}
          disabled={applicationsLoading || Boolean(applicationsError) || actionPending}
          onChange={(event) => onApplicationChange(event.target.value)}
        >
          <option value="">Select a matching application</option>
          {applications.map((application) => (
            <option key={application.id} value={application.id}>
              {application.companyName} — {application.jobTitle}
            </option>
          ))}
        </select>
        {applicationsError ? <ErrorState error={applicationsError} onRetry={onRetryApplications} title="Couldn’t load applications" /> : null}
        {!applicationsLoading && !applicationsError && applications.length === 0 && (
          <p className="muted-note">
            No applications are available to associate. You can create a new application below.
          </p>
        )}
        {associationError ? (
          <p className="form-error">
            {associationError instanceof Error ? associationError.message : 'Could not associate this email.'}
          </p>
        ) : null}
        <button
          className="button button-primary button-full"
          disabled={!applicationId || applicationsLoading || Boolean(applicationsError) || actionPending}
          onClick={onAssociate}
        >
          {associationPending ? 'Associating…' : 'Confirm association'}
          <ArrowUpRight size={16} />
        </button>
      </div>}
      {decision === 'create' && <form className="associate-box" onSubmit={submitCreateApplication}>
        <div className="drawer-action-title">Create a new application</div>
        <p className="muted-note">
          This creates a separate application and associates this email with it.
        </p>
        <label className="field-label" htmlFor="new-application-company">Company</label>
        <input
          id="new-application-company"
          className="form-select"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          required
        />
        <label className="field-label" htmlFor="new-application-title">Job title</label>
        <input
          id="new-application-title"
          className="form-select"
          value={jobTitle}
          onChange={(event) => setJobTitle(event.target.value)}
          required
        />
        {createApplicationError ? (
          <p className="form-error">
            {getErrorMessage(createApplicationError, 'Could not create an application from this email.')}
          </p>
        ) : null}
        <button
          className="button button-secondary button-full"
          type="submit"
          disabled={!companyName.trim() || !jobTitle.trim() || actionPending}
        >
          <FilePlus2 size={16} />
          {createApplicationPending ? 'Creating application…' : 'Create application'}
        </button>
      </form>}
      {decision === 'dismiss' && <div className="associate-box dismiss-action">
        <span className="dismiss-icon"><Trash2 size={18} /></span>
        <div>
          <div className="drawer-action-title">Dismiss this email</div>
          <p className="muted-note">It will leave the review queue and will not be reconsidered automatically.</p>
        </div>
        {dismissError ? <p className="form-error">{getErrorMessage(dismissError, 'Could not dismiss this email.')}</p> : null}
        <button className="button button-danger button-full" disabled={actionPending} onClick={onDismiss}>
          {dismissPending ? 'Dismissing…' : 'Mark as not relevant'}
        </button>
      </div>}
    </section>
  );
}
