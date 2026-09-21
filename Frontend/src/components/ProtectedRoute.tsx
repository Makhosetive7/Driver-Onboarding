import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingBlock, Page, Spinner } from './ui';
import { useAuth } from '../context/AuthContext';
import { needsOnboarding } from '../lib/routes';

export function ProtectedRoute({
  requireVerified = false,
  requireAdmin = false,
  requireOnboarded = false,
}: {
  requireVerified?: boolean;
  requireAdmin?: boolean;
  requireOnboarded?: boolean;
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Page>
        <LoadingBlock style={{ minHeight: '50vh', justifyContent: 'center' }}>
          <Spinner />
          Loading…
        </LoadingBlock>
      </Page>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  if (requireVerified && user.role === 'DRIVER' && !user.phone_verified) {
    return <Navigate to="/verify" replace />;
  }

  if (requireOnboarded && needsOnboarding(user)) {
    return <Navigate to="/onboarding/personal" replace />;
  }

  return <Outlet />;
}
