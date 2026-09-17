import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { z } from 'zod';
import { api, getErrorMessage, type TokenResponse } from '../api/client';
import { AuthShell, AuthSwitchLink } from '../components/AuthShell';
import {
  Alert,
  Button,
  ErrorText,
  Field,
  Grid2,
  Input,
  Label,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';

const schema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().min(8, 'Phone number is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(8, 'Confirm your password'),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords must match',
    path: ['confirm_password'],
  });

type FormValues = z.infer<typeof schema>;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
  margin-top: 0.35rem;
`;

export function RegisterPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setError('');
    try {
      const { data } = await api.post<TokenResponse>('/api/auth/register', values);
      await setSession(data.access_token);
      navigate('/verify', {
        state: {
          message: `Account created. We've sent a verification code to ${values.phone}.`,
        },
      });
    } catch (err) {
      setError(getErrorMessage(err, 'We could not create your account. Please try again.'));
    }
  };

  return (
    <AuthShell
      eyebrow="Join the cohort"
      headline="Create your driver account"
      lead="Use your name, email, phone, and a password to get started."
      showcaseTitle="From signup to review desk"
      showcaseLead="One guided path — verify your phone, complete identity and vehicle details, then submit."
      preview={[
        { label: 'Account', value: 'create' },
        { label: 'Verify', value: 'OTP' },
        { label: 'Submit', value: 'review' },
      ]}
      footer={
        <AuthSwitchLink prompt="Already applied?" to="/login" label="Sign in" />
      }
      onSubmit={handleSubmit(onSubmit)}
      actions={
        <ActionRow>
          <Button type="submit" disabled={isSubmitting} $loading={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </ActionRow>
      }
    >
      {error ? <Alert $tone="error">{error}</Alert> : null}
      <Field>
        <Label htmlFor="first_name">First name</Label>
        <Input id="first_name" autoComplete="given-name" {...register('first_name')} />
        {errors.first_name ? <ErrorText>{errors.first_name.message}</ErrorText> : null}
      </Field>
      <Field>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email ? <ErrorText>{errors.email.message}</ErrorText> : null}
      </Field>
      <Field>
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+263 77 000 0000"
          {...register('phone')}
        />
        {errors.phone ? <ErrorText>{errors.phone.message}</ErrorText> : null}
      </Field>
      <Grid2>
        <Field>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
          />
          {errors.password ? <ErrorText>{errors.password.message}</ErrorText> : null}
        </Field>
        <Field>
          <Label htmlFor="confirm_password">Confirm password</Label>
          <Input
            id="confirm_password"
            type="password"
            autoComplete="new-password"
            {...register('confirm_password')}
          />
          {errors.confirm_password ? (
            <ErrorText>{errors.confirm_password.message}</ErrorText>
          ) : null}
        </Field>
      </Grid2>
    </AuthShell>
  );
}
