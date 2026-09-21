import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { api, type ApplicationReview } from '../api/client';
import { canAccessOnboardingPath, firstIncompleteOnboardingPath } from '../lib/onboarding';
import { LoadingBlock, Page, Spinner } from './ui';

export function OnboardingGuard() {
  const location = useLocation();
  const [allowed, setAllowed] = useState(false);
  const [redirect, setRedirect] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setAllowed(false);
    setRedirect(null);

    api
      .get<ApplicationReview>('/api/application')
      .then(({ data }) => {
        if (!alive) return;
        if (canAccessOnboardingPath(location.pathname, data)) {
          setAllowed(true);
          return;
        }
        const status = data.application.status;
        setRedirect(
          status === 'DRAFT'
            ? firstIncompleteOnboardingPath(data)
            : '/onboarding/submitted',
        );
      })
      .catch(() => {
        if (alive) setAllowed(true);
      });

    return () => {
      alive = false;
    };
  }, [location.pathname]);

  if (redirect) {
    return <Navigate to={redirect} replace />;
  }

  if (!allowed) {
    return (
      <Page>
        <LoadingBlock style={{ minHeight: '50vh', justifyContent: 'center' }}>
          <Spinner />
          Loading your application…
        </LoadingBlock>
      </Page>
    );
  }

  return <Outlet />;
}
