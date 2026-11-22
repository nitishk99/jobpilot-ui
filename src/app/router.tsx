import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AppLayout } from '../components/layouts/AppLayout';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { LoginPage } from '../features/auth/LoginPage';
import { useAuth } from '../features/auth/use-auth';
import { ApplicationsPage } from '../features/applications/ApplicationsPage';
import { TimelinePage } from '../features/timeline/TimelinePage';
import { ReviewPage } from '../features/review/ReviewPage';
import { AccountPage } from '../features/account/AccountPage';
import { routes } from '../config/routes';

function SessionError({ error, refetch }: { error: unknown; refetch: () => unknown }) {
  return (
    <div className="auth-error-wrap">
      <ErrorState
        error={error}
        onRetry={() => void refetch()}
        title="We couldn’t verify your session"
      />
    </div>
  );
}

export function ProtectedLayout() {
  const { isLoading, isAuthenticated, error, refetch } = useAuth();
  const location = useLocation();
  if (isLoading) return <LoadingState label="Checking your secure session…" />;
  if (error) return <SessionError error={error} refetch={refetch} />;
  if (!isAuthenticated) return <Navigate to={routes.login} replace state={{ from: location.pathname }} />;
  return <AppLayout />;
}

export function PublicLayout() {
  const { isLoading, isAuthenticated, error, refetch } = useAuth();
  if (isLoading) return <LoadingState label="Checking your session…" />;
  if (error) return <SessionError error={error} refetch={refetch} />;
  if (isAuthenticated) return <Navigate to={routes.applications} replace />;
  return <div className="auth-shell"><Outlet /></div>;
}

export function RootRedirect() {
  return <Navigate to={routes.applications} replace />;
}

export const router = createBrowserRouter([
  { path: routes.home, element: <RootRedirect /> },
  {
    element: <PublicLayout />,
    children: [{ path: routes.login, element: <LoginPage /> }],
  },
  {
    element: <ProtectedLayout />,
    children: [
      { path: routes.applications, element: <ApplicationsPage /> },
      { path: routes.applicationDetailPattern, element: <TimelinePage /> },
      { path: routes.review, element: <ReviewPage /> },
      { path: routes.account, element: <AccountPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

