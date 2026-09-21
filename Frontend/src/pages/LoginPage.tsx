import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { z } from 'zod';
import { api, getErrorMessage, type TokenResponse } from '../api/client';
import { AuthShell, AuthSwitchLink } from '../components/AuthShell';
import { Alert, Button, ErrorText, Field, Input, Label } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { postAuthPath } from '../lib/routes';

const schema = z.object({
  phone_or_email: z.string().min(1, 'Phone or email is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
  margin-top: 0.35rem;
`;

export function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setError('');
    try {
      const { data } = await api.post<TokenResponse>('/api/auth/login', values);
      const me = await setSession(data.access_token);
      navigate(
        postAuthPath(
          me ?? {
            role: data.role,
            phone_verified: data.phone_verified,
            application_status: null,
          },
        ),
      );
    } catch (err) {
      setError(getErrorMessage(err, 'We could not sign you in. Please try again.'));
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      headline="Find your next delivery"
      lead="Sign in with your phone or email and password."
      showcaseTitle="Rides waiting near you"
      showcaseLead="Browse open deliveries, accept a ride, and pick up products for customers."
      preview={[
        { label: 'Live board', value: 'nearby' },
        { label: 'Express jobs', value: 'priority' },
        { label: 'Driver status', value: 'ready' },
      ]}
      footer={
        <AuthSwitchLink prompt="New here?" to="/register" label="Create an account" />
      }
      onSubmit={handleSubmit(onSubmit)}
      actions={
        <ActionRow>
          <Button type="submit" disabled={isSubmitting} $loading={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
          <Button $variant="ghost" type="button" onClick={() => setShowPassword((v) => !v)}>
            {showPassword ? 'Hide password' : 'Show password'}
          </Button>
        </ActionRow>
      }
    >
      {error ? <Alert $tone="error">{error}</Alert> : null}
      <Field>
        <Label htmlFor="phone_or_email">Phone or email</Label>
        <Input
          id="phone_or_email"
          autoComplete="username"
          placeholder="you@email.com or +263…"
          {...register('phone_or_email')}
        />
        {errors.phone_or_email ? <ErrorText>{errors.phone_or_email.message}</ErrorText> : null}
      </Field>
      <Field>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          {...register('password')}
        />
        {errors.password ? <ErrorText>{errors.password.message}</ErrorText> : null}
      </Field>
    </AuthShell>
  );
}
