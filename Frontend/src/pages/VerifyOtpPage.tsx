import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { api, getErrorMessage } from '../api/client';
import { FlowShell } from '../components/FlowShell';
import { Alert, Button, ButtonRow, Muted } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { postAuthPath } from '../lib/routes';

const OtpRow = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: clamp(0.35rem, 2vw, 0.6rem);
  margin: 1.25rem 0 0.5rem;
  max-width: 22rem;
`;

const OtpInput = styled.input`
  width: 100%;
  aspect-ratio: 1;
  text-align: center;
  font-size: clamp(1.1rem, 4vw, 1.4rem);
  font-weight: 700;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0;
  background: ${({ theme }) => theme.colors.cream};

  &:focus {
    outline: none;
    background: #fff;
    border-color: ${({ theme }) => theme.colors.borderStrong};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryTint};
  }
`;

const ResendRow = styled.div`
  margin-top: 1.15rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
`;

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser } = useAuth();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [maskedPhone, setMaskedPhone] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [message, setMessage] = useState(
    (location.state as { message?: string } | null)?.message || '',
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const verifying = useRef(false);

  const sendOtp = async (resend = false) => {
    setError('');
    try {
      const { data } = await api.post(
        resend ? '/api/auth/resend-otp' : '/api/auth/send-otp',
      );
      setMaskedPhone(data.masked_phone);
      setDevOtp(data.development_otp ?? null);
      setMessage(data.message);
      if (resend) setCooldown(30);
    } catch (err) {
      setError(getErrorMessage(err, 'We could not send a verification code. Please try again.'));
    }
  };

  useEffect(() => {
    if (user?.phone_verified) {
      navigate(postAuthPath(user), { replace: true });
      return;
    }
    void sendOtp(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const verify = async (otp: string) => {
    if (otp.length !== 6 || verifying.current) return;
    verifying.current = true;
    setBusy(true);
    setError('');
    try {
      await api.post('/api/auth/verify-otp', { otp });
      await refreshUser();
      navigate('/onboarding/personal');
    } catch (err) {
      setError(getErrorMessage(err, 'We could not verify that code. Please try again.'));
      verifying.current = false;
    } finally {
      setBusy(false);
    }
  };

  const onChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    if (clean && index < 5) inputs.current[index + 1]?.focus();
    const code = next.join('');
    if (code.length === 6) void verify(code);
  };

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const next = text.padEnd(6, ' ').split('').map((c) => (c === ' ' ? '' : c));
    setDigits(next.slice(0, 6));
    inputs.current[Math.min(text.length, 5)]?.focus();
    if (text.length === 6) void verify(text);
  };

  return (
    <FlowShell
      step={1}
      eyebrow="Phone check"
      title="Verify your phone"
      subtitle={`We've sent a 6-digit code to ${maskedPhone || user?.phone || 'your phone'}.`}
    >
      {message && <Alert $tone="info">{message}</Alert>}
      {devOtp && (
        <Alert $tone="warning">
          Development OTP: <strong>{devOtp}</strong>
        </Alert>
      )}
      {error && <Alert $tone="error">{error}</Alert>}
      <OtpRow onPaste={onPaste}>
        {digits.map((d, i) => (
          <OtpInput
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => onChange(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            aria-label={`Digit ${i + 1}`}
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
          />
        ))}
      </OtpRow>
      <ButtonRow>
        <Button
          type="button"
          onClick={() => void verify(digits.join(''))}
          $full
          disabled={busy || digits.join('').length !== 6}
        >
          {busy ? 'Verifying…' : 'Verify'}
        </Button>
      </ButtonRow>
      <ResendRow>
        <Muted>Didn't receive the code?</Muted>
        <Button
          $variant="ghost"
          type="button"
          disabled={cooldown > 0}
          onClick={() => void sendOtp(true)}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </Button>
      </ResendRow>
    </FlowShell>
  );
}
