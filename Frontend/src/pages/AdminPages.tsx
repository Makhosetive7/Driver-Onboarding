import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  api,
  getErrorMessage,
  type AdminSummary,
  type ApplicationReview,
} from '../api/client';
import { FlowShell } from '../components/FlowShell';
import {
  Alert,
  Button,
  Field,
  Label,
  LoadingBlock,
  Spinner,
  StatusBadge,
  StepActions,
  TextArea,
} from '../components/ui';
import {
  formatLabel,
  IDENTITY_TYPE_LABELS,
  STATUS_LABELS,
  VEHICLE_TYPE_LABELS,
} from '../lib/labels';

const Table = styled.div`
  overflow-x: auto;
`;

const GridTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;

  th,
  td {
    text-align: left;
    padding: 0.85rem 0.65rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  th {
    color: ${({ theme }) => theme.colors.muted};
    font-weight: 600;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  tbody tr {
    cursor: pointer;
    transition: background 0.15s ease;
  }

  tbody tr:hover td {
    background: ${({ theme }) => theme.colors.mist};
  }

  tbody tr:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: -2px;
  }
`;

const EmptyCell = styled.td`
  padding: 2rem 0.65rem !important;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center !important;
`;

const MetaBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.25rem;
  margin-bottom: 1.25rem;
  padding: 1rem 1.1rem;
  background: ${({ theme }) => theme.colors.creamLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const MetaRef = styled.strong`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.navy};
`;

const Section = styled.section`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1.15rem 0;

  &:first-of-type {
    border-top: none;
    padding-top: 0;
  }
`;

const SectionHead = styled.div`
  margin-bottom: 0.65rem;

  h3 {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 1.25rem;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.navy};
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

const DocRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
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

const DocLink = styled.button`
  appearance: none;
  border: none;
  background: none;
  padding: 0;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.maroon};
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: ${({ theme }) => theme.colors.maroonDeep};
  }
`;

const BackRow = styled.div`
  margin: -0.5rem 0 1.15rem;
`;

const DecisionBlock = styled.div`
  margin-top: 0.5rem;
  padding-top: 1.35rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const DOC_LABELS: Record<string, string> = {
  DRIVERS_LICENCE: "Driver's licence",
  IDENTITY_DOCUMENT: 'Identity document',
  VEHICLE_REGISTRATION: 'Vehicle registration',
  INSURANCE: 'Insurance',
  ROADWORTHINESS: 'Roadworthiness',
};

function statusTone(status?: string): 'pending' | 'success' | 'danger' {
  if (status === 'APPROVED') return 'success';
  if (status === 'REJECTED') return 'danger';
  return 'pending';
}

async function openProtectedFile(fileUrl: string) {
  const base = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token');
  const res = await fetch(`${base}${fileUrl}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Could not open file');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function AdminListPage() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<AdminSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<AdminSummary[]>('/api/admin/applications')
      .then(({ data }) => setApps(data))
      .catch((err) =>
        setError(getErrorMessage(err, 'We could not load applications. Please try again.')),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <FlowShell
      wide
      eyebrow="Admin"
      title="Reviewer dashboard"
      subtitle="Applications submitted by driver candidates."
    >
      {error && <Alert $tone="error">{error}</Alert>}
      {loading ? (
        <LoadingBlock>
          <Spinner />
          Loading applications…
        </LoadingBlock>
      ) : (
        <Table>
          <GridTable>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Name</th>
                <th>Vehicle</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {apps.length === 0 ? (
                <tr>
                  <EmptyCell colSpan={4}>No applications yet.</EmptyCell>
                </tr>
              ) : (
                apps.map((a) => (
                  <tr
                    key={a.id}
                    tabIndex={0}
                    onClick={() => navigate(`/admin/applications/${a.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/admin/applications/${a.id}`);
                      }
                    }}
                  >
                    <td>{a.reference_number || `Draft #${a.id}`}</td>
                    <td>
                      {a.first_name} {a.last_name}
                    </td>
                    <td>
                      {a.vehicle_make
                        ? `${a.vehicle_make} ${a.vehicle_model}`
                        : formatLabel(VEHICLE_TYPE_LABELS, a.vehicle_type)}
                    </td>
                    <td>
                      <StatusBadge $tone={statusTone(a.status)}>
                        {formatLabel(STATUS_LABELS, a.status)}
                      </StatusBadge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </GridTable>
        </Table>
      )}
    </FlowShell>
  );
}

export function AdminDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ApplicationReview | null>(null);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    api
      .get<ApplicationReview>(`/api/admin/applications/${id}`)
      .then(({ data: d }) => setData(d))
      .catch((err) =>
        setError(getErrorMessage(err, 'We could not load this application. Please try again.')),
      );
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async (status: 'APPROVED' | 'REJECTED') => {
    setBusy(true);
    setError('');
    try {
      await api.patch(`/api/admin/applications/${id}/status`, {
        status,
        rejection_reason: status === 'REJECTED' ? reason : null,
      });
      load();
    } catch (err) {
      setError(getErrorMessage(err, 'We could not update the status. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const p = data?.profile;
  const i = data?.identity;
  const v = data?.vehicle;
  const a = data?.application;

  return (
    <FlowShell
      eyebrow="Admin"
      title="Application detail"
      subtitle="Review the candidate's information, then approve or reject."
    >
      <BackRow>
        <Button $variant="ghost" type="button" onClick={() => navigate('/admin')}>
          ← All applications
        </Button>
      </BackRow>

      {error && <Alert $tone="error">{error}</Alert>}

      {!data ? (
        <LoadingBlock>
          <Spinner />
          Loading application…
        </LoadingBlock>
      ) : (
        <>
          <MetaBar>
            <MetaRef>{a?.reference_number || `Draft #${a?.id}`}</MetaRef>
            <StatusBadge $tone={statusTone(a?.status)}>
              {formatLabel(STATUS_LABELS, a?.status)}
            </StatusBadge>
          </MetaBar>

          <Section>
            <SectionHead>
              <h3>Personal</h3>
            </SectionHead>
            <Dl>
              <dt>Name</dt>
              <dd>
                {p?.first_name} {p?.last_name}
              </dd>
              <dt>Date of birth</dt>
              <dd>{p?.date_of_birth || '—'}</dd>
              <dt>Gender</dt>
              <dd>{p?.gender || '—'}</dd>
              <dt>Email</dt>
              <dd>{p?.email || '—'}</dd>
              <dt>Phone</dt>
              <dd>{p?.phone || '—'}</dd>
              <dt>Address</dt>
              <dd>
                {[p?.address, p?.city].filter(Boolean).join(', ') || '—'}
              </dd>
            </Dl>
          </Section>

          <Section>
            <SectionHead>
              <h3>Identity</h3>
            </SectionHead>
            <Dl>
              <dt>Type</dt>
              <dd>{formatLabel(IDENTITY_TYPE_LABELS, i?.identity_type)}</dd>
              <dt>Number</dt>
              <dd>{i?.identity_number || '—'}</dd>
              <dt>Expiry</dt>
              <dd>{i?.expiry_date || '—'}</dd>
            </Dl>
          </Section>

          <Section>
            <SectionHead>
              <h3>Vehicle</h3>
            </SectionHead>
            <Dl>
              <dt>Type</dt>
              <dd>{formatLabel(VEHICLE_TYPE_LABELS, v?.vehicle_type)}</dd>
              <dt>Vehicle</dt>
              <dd>
                {v?.make || v?.model || v?.year
                  ? `${v?.make || ''} ${v?.model || ''}`.trim() +
                    (v?.year ? ` (${v.year})` : '')
                  : '—'}
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
            </SectionHead>
            <Dl>
              {data.documents.length === 0 ? (
                <>
                  <dt>Files</dt>
                  <dd>—</dd>
                </>
              ) : (
                data.documents.map((d) => (
                  <div key={d.id} style={{ display: 'contents' }}>
                    <dt>{DOC_LABELS[d.document_type] || d.document_type}</dt>
                    <dd>
                      <DocRow>
                        <DocChip title={d.file_name}>{d.file_name}</DocChip>
                        <DocLink
                          type="button"
                          onClick={() =>
                            openProtectedFile(d.file_url).catch(() =>
                              setError('We could not open that document.'),
                            )
                          }
                        >
                          View
                        </DocLink>
                      </DocRow>
                    </dd>
                  </div>
                ))
              )}
            </Dl>
          </Section>

          {a?.rejection_reason && (
            <Alert $tone="warning">Rejection reason: {a.rejection_reason}</Alert>
          )}

          {a?.status === 'PENDING_REVIEW' && (
            <DecisionBlock>
              <Field>
                <Label htmlFor="rejection-reason">Rejection reason</Label>
                <TextArea
                  id="rejection-reason"
                  placeholder="Required if rejecting"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </Field>
              <StepActions>
                <Button
                  $variant="danger"
                  type="button"
                  disabled={busy}
                  onClick={() => updateStatus('REJECTED')}
                >
                  {busy ? 'Updating…' : 'Reject'}
                </Button>
                <Button type="button" disabled={busy} onClick={() => updateStatus('APPROVED')}>
                  {busy ? 'Updating…' : 'Approve'}
                </Button>
              </StepActions>
            </DecisionBlock>
          )}
        </>
      )}
    </FlowShell>
  );
}
