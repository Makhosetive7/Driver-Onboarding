import { useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { api, getErrorMessage, type DocumentItem } from '../api/client';
import { FileDrop } from '../components/FileDrop';
import { FlowShell } from '../components/FlowShell';
import {
  Alert,
  Button,
  Hint,
  Muted,
  StepActions,
} from '../components/ui';

const REQUIRED = [
  { type: 'DRIVERS_LICENCE', label: "Driver's licence" },
  { type: 'IDENTITY_DOCUMENT', label: 'Identity document' },
  { type: 'VEHICLE_REGISTRATION', label: 'Vehicle registration' },
  { type: 'INSURANCE', label: 'Insurance' },
  { type: 'ROADWORTHINESS', label: 'Roadworthiness' },
] as const;

const ProgressChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1rem;
  padding: 0.4rem 0.75rem;
  border-radius: 0;
  background: ${({ theme }) => theme.colors.mist};
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
`;

const DocList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const DocRow = styled.li<{ $ok: boolean }>`
  border: 1px solid
    ${({ $ok, theme }) =>
      $ok
        ? 'color-mix(in srgb, ' + theme.colors.success + ' 28%, transparent)'
        : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 1rem;
  background: ${({ $ok, theme }) => ($ok ? theme.colors.successBg : theme.colors.creamLight)};
`;

const DocHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const DocTitle = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
`;

const Status = styled.span<{ $ok: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: ${({ $ok, theme }) => ($ok ? theme.colors.success : theme.colors.muted)};
`;

export function DocumentsPage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [error, setError] = useState('');
  const [busyType, setBusyType] = useState<string | null>(null);

  const load = async () => {
    try {
      const { data } = await api.get<DocumentItem[]>('/api/documents');
      setDocs(data);
    } catch (err) {
      setError(getErrorMessage(err, 'We could not load your documents. Please try again.'));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const byType = Object.fromEntries(docs.map((d) => [d.document_type, d]));
  const uploadedCount = REQUIRED.filter((r) => byType[r.type]).length;
  const allPresent = uploadedCount === REQUIRED.length;

  const upload = async (type: string, file: File) => {
    setBusyType(type);
    setError('');
    try {
      const form = new FormData();
      form.append('document_type', type);
      form.append('file', file);
      await api.post('/api/documents', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await load();
    } catch (err) {
      setError(getErrorMessage(err, 'We could not upload that file. Please try again.'));
    } finally {
      setBusyType(null);
    }
  };

  const remove = async (id: string) => {
    setError('');
    try {
      await api.delete(`/api/documents/${id}`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, 'We could not remove that document. Please try again.'));
    }
  };

  return (
    <FlowShell
      step={4}
      eyebrow="Uploads"
      title="Driver & vehicle documents"
      subtitle="Upload all required documents so we can complete your application review."
    >
      <Hint>PDF, JPG, or PNG · max 5 MB · use DEMO / TEST files only.</Hint>
      {error && <Alert $tone="error">{error}</Alert>}
      <ProgressChip>
        <FaCheck /> {uploadedCount} of {REQUIRED.length} uploaded
      </ProgressChip>
      <DocList>
        {REQUIRED.map((item) => {
          const existing = byType[item.type];
          return (
            <DocRow key={item.type} $ok={Boolean(existing)}>
              <DocHead>
                <DocTitle>{item.label}</DocTitle>
                <Status $ok={Boolean(existing)}>
                  {existing ? (
                    <>
                      <FaCheck /> Uploaded
                    </>
                  ) : (
                    'Required'
                  )}
                </Status>
              </DocHead>
              <FileDrop
                compact
                fileName={existing?.file_name}
                uploading={busyType === item.type}
                onUpload={(file) => void upload(item.type, file)}
                onRemove={existing ? () => void remove(existing.id) : undefined}
              />
            </DocRow>
          );
        })}
      </DocList>
      {!allPresent && (
        <Muted style={{ display: 'block', marginTop: '1rem' }}>
          All five documents are required before you can continue.
        </Muted>
      )}
      <StepActions>
        <Button $variant="secondary" type="button" onClick={() => navigate('/onboarding/vehicle')}>
          Back
        </Button>
        <Button
          type="button"
          disabled={!allPresent}
          onClick={() => navigate('/onboarding/review')}
        >
          Continue
        </Button>
      </StepActions>
    </FlowShell>
  );
}
