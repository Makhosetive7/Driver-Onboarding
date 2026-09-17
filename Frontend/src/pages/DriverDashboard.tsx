import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FiClock, FiMapPin, FiNavigation, FiPackage, FiRefreshCw } from 'react-icons/fi';
import {
  api,
  getErrorMessage,
  type ApplicationInfo,
  type ApplicationReview,
} from '../api/client';
import { AppHeader } from '../components/AppHeader';
import { Alert, Button, Page, StatusBadge } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { DEMO_RIDES, type RideOffer } from '../data/rides';
import { formatLabel, STATUS_LABELS } from '../lib/labels';

type FilterId = 'all' | 'express' | 'nearby' | 'top_pay';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
`;

const acceptPop = keyframes`
  from { opacity: 0; transform: scale(0.96) translateY(6px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
`;

const Shell = styled(Page)`
  background:
    radial-gradient(ellipse 90% 50% at 10% -10%, rgba(31, 182, 117, 0.18), transparent 55%),
    radial-gradient(ellipse 70% 40% at 100% 0%, rgba(26, 35, 64, 0.06), transparent 50%),
    ${({ theme }) => theme.colors.background};
`;

const Main = styled.main`
  width: min(100% - 2rem, 1080px);
  margin: 0 auto;
  padding: 0.75rem 0 3.5rem;
  animation: ${fadeUp} 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
`;

const Hero = styled.header`
  display: grid;
  gap: 0.85rem;
  margin-bottom: 1.35rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr auto;
    align-items: end;
  }
`;

const Greeting = styled.div`
  h1 {
    font-size: clamp(1.7rem, 4vw, 2.35rem);
    color: ${({ theme }) => theme.colors.navy};
    margin: 0 0 0.35rem;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    max-width: 36rem;
    line-height: 1.5;
  }
`;

const LiveRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primaryDark};
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;

const LiveDot = styled.span`
  width: 8px;
  height: 8px;
  background: ${({ theme }) => theme.colors.primary};
  animation: ${pulse} 1.6s ease-in-out infinite;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
  min-width: min(100%, 18rem);
`;

const Stat = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.75rem 0.85rem;

  span {
    display: block;
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: ${({ theme }) => theme.colors.textMuted};
    margin-bottom: 0.2rem;
  }

  strong {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.15rem;
    color: ${({ theme }) => theme.colors.navy};
  }
`;

const Banner = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  padding: 1rem 1.15rem;
  margin-bottom: 1.25rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
`;

const BannerCopy = styled.div`
  flex: 1;
  min-width: 12rem;

  strong {
    display: block;
    font-family: ${({ theme }) => theme.fonts.heading};
    color: ${({ theme }) => theme.colors.navy};
    margin-bottom: 0.2rem;
  }

  p {
    margin: 0;
    font-size: 0.92rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.45;
  }
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

const FilterChip = styled.button<{ $active?: boolean }>`
  appearance: none;
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.navy : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.navy : theme.colors.surface)};
  color: ${({ theme, $active }) => ($active ? theme.colors.textOnDark : theme.colors.text)};
  font: inherit;
  font-size: 0.86rem;
  font-weight: 600;
  padding: 0.45rem 0.85rem;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease,
    transform 0.18s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.navy};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const RefreshBtn = styled.button`
  appearance: none;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primaryDark};
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  padding: 0.35rem;

  svg {
    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  }

  &[data-spin='true'] svg {
    transform: rotate(360deg);
  }

  &:hover {
    color: ${({ theme }) => theme.colors.navy};
  }
`;

const List = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const RideRow = styled.article<{ $delay: number }>`
  display: grid;
  gap: 1rem;
  padding: 1.15rem 1.2rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  animation: ${fadeUp} 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: ${({ $delay }) => `${$delay}ms`};
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderStrong};
    box-shadow: ${({ theme }) => theme.shadows.card};
    transform: translateY(-2px);
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr auto;
    align-items: center;
  }
`;

const RideBody = styled.div`
  display: grid;
  gap: 0.7rem;
`;

const Route = styled.div`
  display: grid;
  gap: 0.35rem;
`;

const Place = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.navy};

  svg {
    margin-top: 0.2rem;
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.primary};
  }

  span {
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textMuted};
    margin-right: 0.35rem;
  }
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem 1rem;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  em {
    font-style: normal;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }
`;

const RideAside = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.65rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    align-items: flex-end;
    min-width: 9.5rem;
  }
`;

const Payout = styled.div`
  text-align: left;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    text-align: right;
  }

  strong {
    display: block;
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.35rem;
    color: ${({ theme }) => theme.colors.primaryDark};
    letter-spacing: -0.02em;
  }

  span {
    font-size: 0.78rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
`;

const Toast = styled.div`
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 40;
  width: min(100% - 2rem, 26rem);
  padding: 0.95rem 1.15rem;
  background: ${({ theme }) => theme.colors.navy};
  color: ${({ theme }) => theme.colors.textOnDark};
  box-shadow: ${({ theme }) => theme.shadows.float};
  animation: ${acceptPop} 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;

  strong {
    display: block;
    font-family: ${({ theme }) => theme.fonts.heading};
    margin-bottom: 0.15rem;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.9;
    line-height: 1.4;
  }
`;

const Empty = styled.div`
  padding: 2.5rem 1.25rem;
  text-align: center;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.creamLight};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

function statusTone(status?: string): 'pending' | 'success' | 'danger' {
  if (status === 'APPROVED') return 'success';
  if (status === 'REJECTED') return 'danger';
  return 'pending';
}

function onboardingCta(status?: string) {
  if (status === 'PENDING_REVIEW' || status === 'APPROVED' || status === 'REJECTED') {
    return { to: '/onboarding/review', label: 'View application status' };
  }
  return { to: '/onboarding/personal', label: 'Complete application' };
}

function filterRides(rides: RideOffer[], filter: FilterId) {
  if (filter === 'express') return rides.filter((r) => r.urgency === 'express');
  if (filter === 'nearby') return [...rides].sort((a, b) => a.distanceKm - b.distanceKm);
  if (filter === 'top_pay') return [...rides].sort((a, b) => b.payout - a.payout);
  return rides;
}

export function DriverDashboard() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterId>('all');
  const [rides, setRides] = useState(DEMO_RIDES);
  const [spinning, setSpinning] = useState(false);
  const [app, setApp] = useState<ApplicationInfo | null>(null);
  const [appError, setAppError] = useState('');
  const [accepted, setAccepted] = useState<RideOffer | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get<ApplicationReview>('/api/application');
        if (alive) setApp(data.application);
      } catch (err) {
        if (alive) setAppError(getErrorMessage(err, 'Could not load application status.'));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!accepted) return;
    const t = window.setTimeout(() => setAccepted(null), 3200);
    return () => window.clearTimeout(t);
  }, [accepted]);

  const visible = useMemo(() => filterRides(rides, filter), [rides, filter]);
  const canAccept = app?.status === 'APPROVED';
  const name = user?.first_name || 'Driver';
  const cta = onboardingCta(app?.status);
  const openCount = rides.length;
  const expressCount = rides.filter((r) => r.urgency === 'express').length;
  const topPayout = Math.max(...rides.map((r) => r.payout));

  const refresh = () => {
    setSpinning(true);
    setRides([...DEMO_RIDES].sort(() => Math.random() - 0.5));
    window.setTimeout(() => setSpinning(false), 450);
  };

  const acceptRide = (ride: RideOffer) => {
    if (!canAccept) return;
    setAccepted(ride);
    setRides((prev) => prev.filter((r) => r.id !== ride.id));
  };

  return (
    <Shell>
      <AppHeader />
      <Main>
        <Hero>
          <Greeting>
            <LiveRow>
              <LiveDot />
              Live deliveries nearby
            </LiveRow>
            <h1>Hi {name}, find a ride</h1>
            <p>
              Browse open deliveries in your area — pick up products from sellers and drop them
              off for customers.
            </p>
          </Greeting>
          <Stats>
            <Stat>
              <span>Open</span>
              <strong>{openCount}</strong>
            </Stat>
            <Stat>
              <span>Express</span>
              <strong>{expressCount}</strong>
            </Stat>
            <Stat>
              <span>Top pay</span>
              <strong>${topPayout.toFixed(0)}</strong>
            </Stat>
          </Stats>
        </Hero>

        {appError ? <Alert $tone="error">{appError}</Alert> : null}

        {app && app.status !== 'APPROVED' ? (
          <Banner>
            <BannerCopy>
              <strong>
                {app.status === 'DRAFT'
                  ? 'Finish onboarding to unlock deliveries'
                  : app.status === 'PENDING_REVIEW'
                    ? 'Application under review'
                    : app.status === 'REJECTED'
                      ? 'Application needs attention'
                      : 'Driver access pending'}
              </strong>
              <p>
                You can browse the marketplace now. Accepting rides unlocks once your driver
                application is approved.
                {app.status !== 'DRAFT' ? (
                  <>
                    {' '}
                    Status:{' '}
                    <StatusBadge $tone={statusTone(app.status)}>
                      {formatLabel(STATUS_LABELS, app.status)}
                    </StatusBadge>
                  </>
                ) : null}
              </p>
            </BannerCopy>
            <Button as={Link} to={cta.to} $variant="secondary">
              {cta.label}
            </Button>
          </Banner>
        ) : null}

        <Toolbar>
          <Filters>
            {(
              [
                ['all', 'All rides'],
                ['express', 'Express'],
                ['nearby', 'Nearest'],
                ['top_pay', 'Highest pay'],
              ] as const
            ).map(([id, label]) => (
              <FilterChip
                key={id}
                type="button"
                $active={filter === id}
                onClick={() => setFilter(id)}
              >
                {label}
              </FilterChip>
            ))}
          </Filters>
          <RefreshBtn type="button" data-spin={spinning} onClick={refresh}>
            <FiRefreshCw />
            Refresh
          </RefreshBtn>
        </Toolbar>

        <List>
          {visible.length === 0 ? (
            <Empty>No open deliveries match this filter. Try another view or refresh.</Empty>
          ) : (
            visible.map((ride, i) => (
              <RideRow key={ride.id} $delay={Math.min(i * 45, 220)}>
                <RideBody>
                  <Route>
                    <Place>
                      <FiMapPin />
                      <div>
                        <span>Pickup</span>
                        {ride.pickup}
                      </div>
                    </Place>
                    <Place>
                      <FiNavigation />
                      <div>
                        <span>Drop-off</span>
                        {ride.dropoff}
                      </div>
                    </Place>
                  </Route>
                  <Meta>
                    <em>
                      <FiPackage />
                      {ride.packageLabel} · {ride.weightKg} kg
                    </em>
                    <em>
                      <FiClock />
                      {ride.etaMin} min · {ride.distanceKm} km
                    </em>
                    <em>{ride.area}</em>
                    <em>{ride.postedAgo}</em>
                    {ride.urgency === 'express' ? (
                      <StatusBadge $tone="pending">Express</StatusBadge>
                    ) : null}
                  </Meta>
                </RideBody>
                <RideAside>
                  <Payout>
                    <strong>
                      {ride.currency} {ride.payout.toFixed(2)}
                    </strong>
                    <span>Estimated pay</span>
                  </Payout>
                  <Button
                    type="button"
                    disabled={!canAccept}
                    title={
                      canAccept
                        ? 'Accept this delivery'
                        : 'Available after your application is approved'
                    }
                    onClick={() => acceptRide(ride)}
                  >
                    Accept
                  </Button>
                </RideAside>
              </RideRow>
            ))
          )}
        </List>
      </Main>

      {accepted ? (
        <Toast role="status">
          <strong>Ride accepted</strong>
          <p>
            Heading to {accepted.pickup} → {accepted.dropoff}. Demo only — live dispatch is not
            wired yet.
          </p>
        </Toast>
      ) : null}
    </Shell>
  );
}
