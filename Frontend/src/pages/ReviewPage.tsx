import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  api,
  getErrorMessage,
  type ApplicationInfo,
  type ApplicationReview,
} from '../api/client';
import { FlowShell } from '../components/FlowShell';
import {
  Alert,
  Button,
  CheckboxRow,
  LoadingBlock,
  Spinner,
  StatusBadge,
  StepActions,
} from '../components/ui';
import {
  formatLabel,
  IDENTITY_TYPE_LABELS,
  VEHICLE_TYPE_LABELS,
} from '../lib/labels';
import { useAuth } from '../context/AuthContext';

const Section = styled.section`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1.15rem 0;

  &:first-of-type {
    border-top: none;
    padding-top: 0;
  }
`;

const SectionHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 0.65rem;

  h3 {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 1.25rem;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.navy};
  }

  a {
    font-size: 0.9rem;
  }
`;

const Dl = styled.dl`
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.4rem 1rem;

  @media (min-width: 480px) {
    grid-template-columns: 140px 1fr;
  }

  dt {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.88rem;
  }
  dd {
    margin: 0;
    font-weight: 600;
  }
`;

const DocChip = styled.span`
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 0.25rem 0.6rem;
  border-radius: 0;
  background: ${({ theme }) => theme.colors.mist};
  font-size: 0.85rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DOC_LABELS: Record<string, string> = {
  DRIVERS_LICENCE: "Driver's licence",
  IDENTITY_DOCUMENT: 'Identity document',
  VEHICLE_REGISTRATION: 'Vehicle registration',
  INSURANCE: 'Insurance',
  ROADWORTHINESS: 'Roadworthiness',
};

export function ReviewPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [data, setData] = useState<ApplicationReview | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get<ApplicationReview>('/api/application')
      .then(({ data: d }) => {
        if (
          d.application.status === 'PENDING_REVIEW' ||
          d.application.status === 'APPROVED' ||
          d.application.status === 'REJECTED'
        ) {
          navigate('/onboarding/submitted', { replace: true, state: d.application });
          return;
        }
        setData(d);
      })
      .catch((err) =>
        setError(getErrorMessage(err, 'We could not load your application. Please try again.')),
      );
  }, [navigate]);

  const submit = async () => {
    if (!confirmed) {
      setError('Please confirm that the information provided is accurate.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const { data: app } = await api.post<ApplicationInfo>('/api/application/submit');
      await refreshUser();
      navigate('/onboarding/submitted', { state: app });
    } catch (err) {
      setError(getErrorMessage(err, 'We could not submit your application. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const p = data?.profile;
  const i = data?.identity;
  const v = data?.vehicle;

  return (
    <FlowShell
      step={6}
      eyebrow="Almost there"
      title="Review application"
      subtitle="Check everything carefully before you submit."
    >
      {error && <Alert $tone="error">{error}</Alert>}
      {!data ? (
        <LoadingBlock>
          <Spinner />
          Loading your application…
        </LoadingBlock>
      ) : (
        <>
          <Section>
            <SectionHead>
              <h3>Personal</h3>
              <Link to="/onboarding/personal">Edit</Link>
            </SectionHead>
            <Dl>
              <dt>Name</dt>
              <dd>
                {p?.first_name} {p?.last_name}
              </dd>
              <dt>Date of birth</dt>
              <dd>{p?.date_of_birth}</dd>
              <dt>Gender</dt>
              <dd>{p?.gender || '—'}</dd>
              <dt>Email</dt>
              <dd>{p?.email}</dd>
              <dt>Phone</dt>
              <dd>{p?.phone}</dd>
              <dt>Address</dt>
              <dd>
                {p?.address}, {p?.city}
              </dd>
            </Dl>
          </Section>
          <Section>
            <SectionHead>
              <h3>Identity</h3>
              <Link to="/onboarding/identity">Edit</Link>
            </SectionHead>
            <Dl>
              <dt>Type</dt>
              <dd>{formatLabel(IDENTITY_TYPE_LABELS, i?.identity_type)}</dd>
              <dt>Number</dt>
              <dd>{i?.identity_number || '—'}</dd>
              <dt>Expiry</dt>
              <dd>{i?.expiry_date || '—'}</dd>
              <dt>Document</dt>
              <dd>
                {i?.has_document ? (
                  <StatusBadge $tone="success">Uploaded</StatusBadge>
                ) : (
                  <StatusBadge $tone="danger">Missing</StatusBadge>
                )}
              </dd>
            </Dl>
          </Section>
          <Section>
            <SectionHead>
              <h3>Vehicle</h3>
              <Link to="/onboarding/vehicle">Edit</Link>
            </SectionHead>
            <Dl>
              <dt>Type</dt>
              <dd>{formatLabel(VEHICLE_TYPE_LABELS, v?.vehicle_type)}</dd>
              <dt>Vehicle</dt>
              <dd>
                {v?.make} {v?.model} ({v?.year})
              </dd>
              <dt>Registration</dt>
              <dd>{v?.registration_number || '—'}</dd>
              <dt>Colour</dt>
              <dd>{v?.colour || '—'}</dd>
              <dt>Ownership</dt>
              <dd>{v?.ownership || '—'}</dd>
            </Dl>
          </Section>
          <Section>
            <SectionHead>
              <h3>Documents</h3>
              <Link to="/onboarding/documents">Edit</Link>
            </SectionHead>
            <Dl>
              {data.documents.map((d) => (
                <div key={d.id} style={{ display: 'contents' }}>
                  <dt>{DOC_LABELS[d.document_type] || d.document_type}</dt>
                  <dd>
                    <DocChip title={d.file_name}>{d.file_name}</DocChip>
                  </dd>
                </div>
              ))}
            </Dl>
          </Section>
          <CheckboxRow>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span>I confirm that the information provided is accurate.</span>
          </CheckboxRow>
          <StepActions>
            <Button
              $variant="secondary"
              type="button"
              onClick={() => navigate('/onboarding/documents')}
            >
              Back
            </Button>
            <Button type="button" onClick={submit} disabled={submitting || !confirmed}>
              {submitting ? 'Submitting…' : 'Submit application'}
            </Button>
          </StepActions>
        </>
      )}
    </FlowShell>
  );
}
