import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, LogOut, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { getErrorMessage } from '../../api/errors';
import { initials } from '../../utils/format';
import { logout } from '../auth/auth.api';
import { useAuth } from '../auth/use-auth';
import { routes } from '../../config/routes';

export function AccountPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const signOut = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      navigate(routes.login, { replace: true });
    },
  });
  const name = user?.displayName || 'JobPilot user';
  const email = user?.email || 'Not available';
  const profileImage = user?.profilePicture;

  return (
    <div className="page-stack">
      <PageHeader eyebrow="WORKSPACE SETTINGS" title="Account" description="Manage your profile and session." />
      <div className="account-layout">
        <section className="panel account-panel">
          <div className="account-profile">
            <span className="account-avatar">
              {profileImage ? <img src={profileImage} alt="Profile" /> : initials(name)}
            </span>
            <div><h2>{name}</h2><p>{email}</p></div>
            <span className="status-badge status-offer"><CheckCircle2 size={12} /> Signed in</span>
          </div>
          <div className="account-divider" />
          <div className="account-signout">
            <div><strong>Sign out of JobPilot</strong><p>You can reconnect your Google account at any time.</p></div>
            <button className="button button-danger" onClick={() => signOut.mutate()} disabled={signOut.isPending}>
              <LogOut size={16} /> {signOut.isPending ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
          {signOut.error && (
            <p className="form-error">{getErrorMessage(signOut.error, 'Sign out failed. Please try again.')}</p>
          )}
        </section>
        <aside className="privacy-card account-privacy">
          <ShieldCheck size={19} />
          <div><strong>Your data stays yours.</strong><p>JobPilot uses a secure session and never exposes your sign-in credentials.</p></div>
        </aside>
      </div>
    </div>
  );
}
