import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { api, getErrorMessage, type DocumentItem, type Identity } from '../api/client';
import { FileDrop } from '../components/FileDrop';
import { FlowShell } from '../components/FlowShell';
import {
  Alert,
  Button,
  ErrorText,
  Field,
  Hint,
  Input,
  Label,
  Select,
  StepActions,
} from '../components/ui';

const schema = z.object({
  identity_type: z.enum(['NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENCE']),
  identity_number: z.string().min(1, 'Required'),
  expiry_date: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function IdentityPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [hasDocument, setHasDocument] = useState(false);
  const [docName, setDocName] = useState('');
  const [docId, setDocId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { identity_type: 'NATIONAL_ID' },
  });

  const identityType = watch('identity_type');

  useEffect(() => {
    Promise.all([
      api.get<Identity>('/api/driver/identity'),
      api.get<DocumentItem[]>('/api/documents'),
    ])
      .then(([identityRes, docsRes]) => {
        const data = identityRes.data;
        reset({
          identity_type: (data.identity_type as FormValues['identity_type']) || 'NATIONAL_ID',
          identity_number: data.identity_number || '',
          expiry_date: data.expiry_date || '',
        });
        const idDoc = docsRes.data.find((d) => d.document_type === 'IDENTITY_DOCUMENT');
        if (idDoc) {
          setHasDocument(true);
          setDocName(idDoc.file_name);
          setDocId(idDoc.id);
        } else {
          setHasDocument(data.has_document);
        }
      })
      .catch((err) =>
        setError(getErrorMessage(err, 'We could not load identity details. Please try again.')),
      );
  }, [reset]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('document_type', 'IDENTITY_DOCUMENT');
      form.append('file', file);
      const { data } = await api.post<DocumentItem>('/api/documents', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setHasDocument(true);
      setDocName(data.file_name);
      setDocId(data.id);
    } catch (err) {
      setError(getErrorMessage(err, 'We could not upload that document. Please try again.'));
    } finally {
      setUploading(false);
    }
  };

  const removeDoc = async () => {
    if (!docId) {
      setHasDocument(false);
      setDocName('');
      return;
    }
    try {
      await api.delete(`/api/documents/${docId}`);
      setHasDocument(false);
      setDocName('');
      setDocId(null);
    } catch (err) {
      setError(getErrorMessage(err, 'We could not remove that document. Please try again.'));
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!hasDocument) {
      setError('Please upload your identity document before continuing.');
      return;
    }
    setError('');
    try {
      await api.put('/api/driver/identity', {
        identity_type: values.identity_type,
        identity_number: values.identity_number,
        expiry_date: values.expiry_date || null,
      });
      navigate('/onboarding/vehicle');
    } catch (err) {
      setError(getErrorMessage(err, 'We could not save your identity details. Please try again.'));
    }
  };

  return (
    <FlowShell
      step={2}
      eyebrow="Compliance"
      title="Identity verification"
      subtitle="Confirm who you are so we can verify your application."
    >
      <Hint>Use Zimbabwe test data only — never real IDs for this demo.</Hint>
      {error && <Alert $tone="error">{error}</Alert>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Field>
          <Label htmlFor="identity_type">ID type</Label>
          <Select id="identity_type" {...register('identity_type')}>
            <option value="NATIONAL_ID">National ID</option>
            <option value="PASSPORT">Passport</option>
            <option value="DRIVERS_LICENCE">Driver's licence</option>
          </Select>
        </Field>
        <Field>
          <Label htmlFor="identity_number">ID / passport number</Label>
          <Input
            id="identity_number"
            placeholder="e.g. 63-123456A63"
            {...register('identity_number')}
          />
          {errors.identity_number && <ErrorText>{errors.identity_number.message}</ErrorText>}
        </Field>
        {(identityType === 'PASSPORT' || identityType === 'DRIVERS_LICENCE') && (
          <Field>
            <Label htmlFor="expiry_date">Expiry date</Label>
            <Input id="expiry_date" type="date" {...register('expiry_date')} />
          </Field>
        )}
        <Field>
          <Label>Identity document</Label>
          <FileDrop
            fileName={hasDocument ? docName || 'document' : undefined}
            uploading={uploading}
            onUpload={(file) => void uploadFile(file)}
            onRemove={() => void removeDoc()}
          />
        </Field>
        <StepActions>
          <Button $variant="secondary" type="button" onClick={() => navigate('/onboarding/personal')}>
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Continue'}
          </Button>
        </StepActions>
      </form>
    </FlowShell>
  );
}
