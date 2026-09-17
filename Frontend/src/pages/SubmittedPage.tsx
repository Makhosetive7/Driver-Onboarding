import { FaCircleCheck } from 'react-icons/fa6';
import { Link, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import type { ApplicationInfo } from '../api/client';
import { FlowShell } from '../components/FlowShell';
import { Button, ButtonRow, StatusBadge, Subtitle, Title } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { formatLabel, STATUS_LABELS } from '../lib/labels';

const pop = keyframes`
  from { transform: scale(0.6); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const IconWrap = styled.div`
  color: ${({ theme }) => theme.colors.success};
  font-size: 3.2rem;
  margin: 0.25rem 0 0.85rem;
  animation: ${pop} 0.45s cubic-bezier(0.19, 1, 0.22, 1) both;
`;

const Meta = styled.div`
  background: ${({ theme }) => theme.colors.creamLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 1.1rem 1.2rem;
  margin: 0.35rem 0 1.25rem;
  display: grid;
  gap: 0.75rem;
  text-align: left;

  strong {
    color: ${({ theme }) => theme.colors.navy};
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.15rem;
    font-weight: 700;
  }
`;

const MetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.muted};
`;

function statusTone(status?: string): 'pending' | 'success' | 'danger' {
  if (status === 'APPROVED') return 'success';
  if (status === 'REJECTED') return 'danger';
  return 'pending';
}

export function SubmittedPage() {
  const { user } = useAuth();
  const location = useLocation();
  const app = (location.state as ApplicationInfo | null) || null;
  const name = app?.first_name || user?.first_name || 'there';
  const status = app?.status || 'PENDING_REVIEW';

  return (
    <FlowShell cardStyle={{ textAlign: 'center' }}>
      <IconWrap>
        <FaCircleCheck />
      </IconWrap>
      <Title>Application submitted</Title>
      <Subtitle>
        Thank you, {name}. Your driver application has been successfully submitted.
      </Subtitle>
      <Meta>
        <MetaRow>
          <span>Application number</span>
          <strong>{app?.reference_number || 'Pending assignment'}</strong>
        </MetaRow>
        <MetaRow>
          <span>Status</span>
          <StatusBadge $tone={statusTone(status)}>
            {formatLabel(STATUS_LABELS, status)}
          </StatusBadge>
        </MetaRow>
      </Meta>
      <Subtitle>
        Our team will review your application and notify you once a decision has been made.
      </Subtitle>
      <ButtonRow style={{ justifyContent: 'center' }}>
        <Button as={Link} to="/dashboard">
          Go to rides
        </Button>
        <Button as={Link} to="/" $variant="secondary">
          Back to home
        </Button>
      </ButtonRow>
    </FlowShell>
  );
}
