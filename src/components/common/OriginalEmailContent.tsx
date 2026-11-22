import { ArrowUpRight, Mail, UserRound } from 'lucide-react';
import { formatDateTime } from '../../utils/format';
import { getGmailUrl } from '../../utils/gmail';
import type { OriginalEmail } from '../../features/emails/email.types';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';

export function OriginalEmailContent({ email, isLoading, error, onRetry }: { email?: OriginalEmail; isLoading: boolean; error?: unknown; onRetry?: () => void }) {
  if (isLoading) return <LoadingState label="Loading original email…" />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!email) return null;
  const gmailUrl = getGmailUrl(email.gmailUrl);
  return (
    <div className="original-email">
      <h3>{email.subject || '(No subject)'}</h3>
      <div className="email-meta-row"><UserRound size={15} /><span>From</span><strong>{email.senderName ? `${email.senderName} ` : ''}{email.fromEmail || 'Not available'}</strong></div>
      {email.toEmail && <div className="email-meta-row"><Mail size={15} /><span>To</span><strong>{email.toEmail}</strong></div>}
      <div className="email-date">Received {formatDateTime(email.receivedAt)}</div>
      {gmailUrl ? (
        <a className="button button-secondary" href={gmailUrl} target="_blank" rel="noopener noreferrer">
          Open in Gmail <ArrowUpRight size={15} />
        </a>
      ) : (
        <div className="email-body">{email.bodyText || 'The stored email body is empty or unavailable.'}</div>
      )}
    </div>
  );
}
