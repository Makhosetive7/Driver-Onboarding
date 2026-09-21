import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { needsOnboarding, postAuthPath } from '../lib/routes';
import { Brand, Button, HeaderBar } from './ui';

const Shell = styled.div`
  width: min(100% - 2rem, 1080px);
  margin: 0 auto;
  padding: 1rem clamp(0, 2vw, 0) 0;
`;

const Bar = styled(HeaderBar)`
  padding: 12px 14px 12px 18px;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-self: end;
`;

export function AppHeader({ showAuthActions = true }: { showAuthActions?: boolean }) {
  const { user, logout } = useAuth();
  const homeTo = user ? postAuthPath(user) : '/';

  return (
    <Shell>
      <Bar>
        <Link to={homeTo} style={{ textDecoration: 'none' }}>
          <Brand>
            Take<span>OFF</span>
          </Brand>
        </Link>
        {showAuthActions && (
          <Actions>
            {user ? (
              <>
                {user.role === 'ADMIN' ? (
                  <Button as={Link} to="/admin" $variant="ghost">
                    Admin
                  </Button>
                ) : !user.phone_verified ? null : needsOnboarding(user) ? (
                  <Button as={Link} to="/onboarding/personal" $variant="ghost">
                    Application
                  </Button>
                ) : (
                  <Button as={Link} to="/dashboard" $variant="ghost">
                    Rides
                  </Button>
                )}
                <Button $variant="ghost" type="button" onClick={logout}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button as={Link} to="/login" $variant="secondary">
                Sign in
              </Button>
            )}
          </Actions>
        )}
      </Bar>
    </Shell>
  );
}
