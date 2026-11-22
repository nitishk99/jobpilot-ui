import { useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/use-auth';
import { initials } from '../../utils/format';
import { routes } from '../../config/routes';

export function Topbar() {
  const { user } = useAuth();
  const label = user?.displayName || user?.email || 'Your account';
  const connectionStatus = user?.connectedAccountStatus?.toLowerCase();
  const isGmailConnected = connectionStatus === 'connected' || connectionStatus === 'active' || Boolean(user?.connectedAccountEmail);
  const location = useLocation();
  const pageTitle = location.pathname === routes.review
    ? 'Review inbox'
    : location.pathname === routes.account
      ? 'Account'
      : location.pathname.startsWith('/applications/')
        ? 'Application timeline'
        : 'Pipeline';
  return (
    <header className="topbar">
      <div className="topbar-context">{pageTitle}</div>
      <div className="topbar-actions">
        <span className="connected-indicator"><span className={isGmailConnected ? '' : 'disconnected'} /> {isGmailConnected ? 'Live workspace' : 'Signed in'}</span>
        <div className="topbar-user" title={label}><span className="avatar">{initials(label)}</span><span className="topbar-user-label">{label}</span></div>
      </div>
    </header>
  );
}
