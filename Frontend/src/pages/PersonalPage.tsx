import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { api, getErrorMessage, type Profile } from '../api/client';
import { FlowShell } from '../components/FlowShell';
import {
  Alert,
  Button,
  ErrorText,
  Field,
  Grid2,
  Input,
  Label,
  LoadingBlock,
  Select,
  Spinner,
  StepActions,
} from '../components/ui';

const schema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  date_of_birth: z.string().min(1, 'Required'),
  gender: z.string().optional(),
  address: z.string().min(1, 'Required'),
  city: z.string().min(1, 'Required'),
});

type FormValues = z.infer<typeof schema>;

export function PersonalPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    api
      .get<Profile>('/api/driver/profile')
      .then(({ data }) => {
        setEmail(data.email);
        setPhone(data.phone);
        reset({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          address: data.address || '',
          city: data.city || '',
        });
      })
      .catch((err) =>
        setError(getErrorMessage(err, 'We could not load your profile. Please try again.')),
      )
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (values: FormValues) => {
    setError('');
    try {
      await api.put('/api/driver/profile', {
        ...values,
        gender: values.gender || null,
      });
      navigate('/onboarding/identity');
    } catch (err) {
      setError(getErrorMessage(err, 'We could not save your personal details. Please try again.'));
    }
  };

  return (
    <FlowShell
      step={1}
      eyebrow="About you"
      title="Personal details"
      subtitle="Tell us a bit about yourself. Phone and email are already set from your account."
    >
      {error && <Alert $tone="error">{error}</Alert>}
      {loading ? (
        <LoadingBlock>
          <Spinner />
          Loading your profile…
        </LoadingBlock>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid2>
            <Field>
              <Label htmlFor="first_name">First name</Label>
              <Input id="first_name" {...register('first_name')} />
              {errors.first_name && <ErrorText>{errors.first_name.message}</ErrorText>}
            </Field>
            <Field>
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" {...register('last_name')} />
              {errors.last_name && <ErrorText>{errors.last_name.message}</ErrorText>}
            </Field>
          </Grid2>
          <Grid2>
            <Field>
              <Label htmlFor="date_of_birth">Date of birth</Label>
              <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
              {errors.date_of_birth && <ErrorText>{errors.date_of_birth.message}</ErrorText>}
            </Field>
            <Field>
              <Label htmlFor="gender">Gender (optional)</Label>
              <Select id="gender" {...register('gender')}>
                <option value="">Prefer not to say</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </Select>
            </Field>
          </Grid2>
          <Grid2>
            <Field>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled readOnly />
            </Field>
            <Field>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} disabled readOnly />
            </Field>
          </Grid2>
          <Field>
            <Label htmlFor="address">Residential address</Label>
            <Input id="address" {...register('address')} />
            {errors.address && <ErrorText>{errors.address.message}</ErrorText>}
          </Field>
          <Field>
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register('city')} placeholder="e.g. Harare" />
            {errors.city && <ErrorText>{errors.city.message}</ErrorText>}
          </Field>
          <StepActions>
            <span />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Continue'}
            </Button>
          </StepActions>
        </form>
      )}
    </FlowShell>
  );
}
