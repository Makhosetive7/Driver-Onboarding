import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styled, { css, keyframes } from 'styled-components';
import { FiArrowRight } from 'react-icons/fi';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const Page = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const Container = styled.div<{ $narrow?: boolean }>`
  width: min(100% - 2rem, ${({ $narrow }) => ($narrow ? '560px' : '1080px')});
  margin: 0 auto;
  padding: 1.5rem 0 3.5rem;
  animation: ${fadeUp} 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
`;

export const Card = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0;
  box-shadow: ${({ theme }) => theme.shadows.card};
  padding: 1.75rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 2.25rem;
  }
`;

export const Brand = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -0.03em;
  line-height: 1;
  color: ${({ theme }) => theme.colors.maroon};

  span {
    font-style: normal;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(1.55rem, 3.5vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.maroon};
  margin-bottom: 0.4rem;
`;

export const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.55;
  font-size: 1rem;
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.88rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 0.5rem;
`;

export const Field = styled.div`
  margin-bottom: 1.1rem;
`;

const fieldStyles = css`
  width: 100%;
  padding: 13px 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0;
  background: ${({ theme }) => theme.colors.cream};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;

  &:hover:not(:disabled):not(:focus) {
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }

  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.borderStrong};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryTint};
  }

  &:disabled,
  &[readonly] {
    background: ${({ theme }) => theme.colors.mist};
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const Input = styled.input`
  ${fieldStyles}
`;

export const Select = styled.select`
  ${fieldStyles}
`;

export const TextArea = styled.textarea`
  ${fieldStyles}
  min-height: 96px;
  resize: vertical;
`;

export const ErrorText = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.82rem;
  margin-top: 0.35rem;
`;

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'filled' | 'light';

const Face = styled.span<{ $tone: ButtonVariant; $size: 'md' | 'sm' }>`
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 100%;
  border-radius: 0;
  overflow: hidden;
  border: 1px solid
    ${({ theme, $tone }) => {
      if ($tone === 'danger') return '#9f1239';
      if ($tone === 'filled' || $tone === 'primary') return theme.colors.maroonDeep;
      return theme.colors.maroon;
    }};
  font-weight: 600;
  font-size: ${({ $size }) => ($size === 'sm' ? '0.85rem' : '0.95rem')};
  line-height: 1;
  transition: transform 0.2s ease;
`;

const FaceLabel = styled.span<{ $tone: ButtonVariant; $size: 'md' | 'sm' }>`
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
  padding: ${({ $size }) => ($size === 'sm' ? '0 14px 0 16px' : '0 18px 0 20px')};
  white-space: nowrap;
  background: ${({ theme, $tone }) => {
    if ($tone === 'filled' || $tone === 'primary') return theme.colors.maroon;
    if ($tone === 'light' || $tone === 'secondary') return theme.colors.surface;
    if ($tone === 'danger') return theme.colors.danger;
    return 'transparent';
  }};
  color: ${({ theme, $tone }) => {
    if ($tone === 'ghost' || $tone === 'light' || $tone === 'secondary') return theme.colors.maroon;
    return '#fff';
  }};
`;

const FaceIcon = styled.span<{ $tone: ButtonVariant }>`
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border-left: 1px solid
    ${({ theme, $tone }) => {
      if ($tone === 'filled' || $tone === 'primary') return 'rgba(255,255,255,0.18)';
      if ($tone === 'danger') return 'rgba(255,255,255,0.2)';
      return theme.colors.maroon;
    }};
  background: ${({ theme, $tone }) => {
    if ($tone === 'filled' || $tone === 'primary') return theme.colors.maroonDeep;
    if ($tone === 'danger') return '#9f1239';
    return theme.colors.maroon;
  }};
  color: #fff;
`;

const buttonRootCss = css<{ $full?: boolean; $size?: 'md' | 'sm' }>`
  appearance: none;
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  font: inherit;
  line-height: 0;
  display: inline-flex;
  align-items: stretch;
  vertical-align: middle;
  flex-shrink: 1;
  max-width: 100%;
  width: ${({ $full }) => ($full ? '100%' : 'auto')};
  height: ${({ $size = 'md' }) => ($size === 'sm' ? '40px' : '48px')};
  text-decoration: none;
  color: inherit;
  box-sizing: border-box;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) ${Face} {
    transform: translateY(-1px);
  }
`;

const ButtonRoot = styled.button<{ $full?: boolean; $size?: 'md' | 'sm' }>`
  ${buttonRootCss}
`;

const LinkRoot = styled(Link)<{ $full?: boolean; $size?: 'md' | 'sm' }>`
  ${buttonRootCss}
`;

function mapTone(variant?: ButtonVariant): ButtonVariant {
  if (!variant || variant === 'primary') return 'filled';
  if (variant === 'secondary') return 'light';
  return variant;
}

type CommonButtonProps = {
  children: ReactNode;
  $variant?: ButtonVariant;
  $full?: boolean;
  $size?: 'md' | 'sm';
  $loading?: boolean;
  className?: string;
};

export type ButtonProps = CommonButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    as?: never;
    to?: never;
  };

type LinkButtonProps = CommonButtonProps & {
  as: typeof Link;
  to: string;
  type?: never;
  onClick?: () => void;
  disabled?: boolean;
};

function ArrowFace({
  children,
  tone,
  size,
  loading,
  ghostSimple,
}: {
  children: ReactNode;
  tone: ButtonVariant;
  size: 'md' | 'sm';
  loading?: boolean;
  ghostSimple?: boolean;
}) {
  if (ghostSimple || tone === 'ghost') {
    return (
      <FaceLabel
        $tone="ghost"
        $size={size}
        style={{
          border: 'none',
          background: 'transparent',
          padding: '0 0.35rem',
          height: '100%',
          width: '100%',
          justifyContent: 'center',
        }}
      >
        {loading ? '…' : children}
      </FaceLabel>
    );
  }

  return (
    <Face $tone={tone} $size={size}>
      <FaceLabel $tone={tone} $size={size}>
        {children}
      </FaceLabel>
      <FaceIcon $tone={tone}>
        {loading ? (
          <Spinner style={{ width: 16, height: 16, margin: 0, borderWidth: 2 }} />
        ) : (
          <FiArrowRight size={size === 'sm' ? 16 : 18} strokeWidth={2.25} />
        )}
      </FaceIcon>
    </Face>
  );
}

export function Button({
  children,
  $variant = 'primary',
  $full,
  $size = 'md',
  $loading,
  className,
  as,
  to,
  type = 'button',
  disabled,
  onClick,
  ...rest
}: ButtonProps | LinkButtonProps) {
  const tone = mapTone($variant);
  const face = (
    <ArrowFace
      tone={tone}
      size={$size}
      loading={$loading}
      ghostSimple={$variant === 'ghost'}
    >
      {children}
    </ArrowFace>
  );

  if (as === Link && to) {
    return (
      <LinkRoot to={to} $full={$full} $size={$size} className={className} onClick={onClick}>
        {face}
      </LinkRoot>
    );
  }

  return (
    <ButtonRoot
      type={type}
      $full={$full}
      $size={$size}
      disabled={disabled || $loading}
      className={className}
      onClick={onClick}
      {...rest}
    >
      {face}
    </ButtonRoot>
  );
}

/** Legacy styled-button API for places that still use `$variant` on a styled component */
export const LegacyButton = styled.button<{
  $variant?: ButtonVariant;
  $full?: boolean;
}>`
  ${buttonRootCss}
`;

export const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.25rem;
  align-items: stretch;
`;

export const StepActions = styled(ButtonRow)`
  margin-top: 1.75rem;
  padding-top: 1.35rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  justify-content: space-between;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column-reverse;

    > * {
      width: 100%;
    }
  }
`;

export const AuthFooter = styled.p`
  margin: 1.5rem 0 0;
  text-align: left;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.92rem;

  a {
    color: ${({ theme }) => theme.colors.maroon};
    font-weight: 600;
  }
`;

export const Alert = styled.div<{ $tone?: 'error' | 'success' | 'info' | 'warning' }>`
  border-radius: 0;
  padding: 0.9rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  line-height: 1.45;

  ${({ $tone = 'error', theme }) => {
    const map = {
      error: { bg: theme.colors.dangerBg, fg: theme.colors.danger },
      success: { bg: theme.colors.successBg, fg: theme.colors.success },
      warning: { bg: theme.colors.warningBg, fg: theme.colors.warning },
      info: { bg: theme.colors.mist, fg: theme.colors.navySoft },
    } as const;
    const t = map[$tone];
    return css`
      background: ${t.bg};
      color: ${t.fg};
      border: 1px solid color-mix(in srgb, ${t.fg} 22%, transparent);
    `;
  }}
`;

export const HeaderBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 14px 16px;
  background: rgba(238, 246, 255, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

export const Muted = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.9rem;
`;

export const Grid2 = styled.div`
  display: grid;
  gap: 0 1rem;
  grid-template-columns: 1fr;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const CheckboxRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  margin: 1.15rem 0;
  cursor: pointer;
  line-height: 1.45;
  padding: 0.95rem 1rem;
  border-radius: 0;
  background: ${({ theme }) => theme.colors.cream};
  border: 1px solid ${({ theme }) => theme.colors.border};

  input {
    margin-top: 0.2rem;
    width: 1.1rem;
    height: 1.1rem;
    accent-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Spinner = styled.div`
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 0;
  border: 2.5px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  animation: ${spin} 0.7s linear infinite;
  margin: 0 auto;
`;

export const LoadingBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2.5rem 1rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.95rem;
`;

export const StatusBadge = styled.span<{ $tone?: 'pending' | 'success' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  border-radius: 0;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;

  ${({ $tone = 'pending', theme }) => {
    const map = {
      pending: { bg: theme.colors.warningBg, fg: theme.colors.warning },
      success: { bg: theme.colors.successBg, fg: theme.colors.success },
      danger: { bg: theme.colors.dangerBg, fg: theme.colors.danger },
    } as const;
    const t = map[$tone];
    return css`
      background: ${t.bg};
      color: ${t.fg};
    `;
  }}
`;

export const Hint = styled.p`
  margin: 0 0 1rem;
  padding: 0.75rem 0.9rem;
  border-radius: 0;
  background: ${({ theme }) => theme.colors.primaryTint};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.navySoft};
  font-size: 0.9rem;
  line-height: 1.45;
`;

export const Eyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 0;
  background: ${({ theme }) => theme.colors.peach};
  color: ${({ theme }) => theme.colors.maroon};
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  &::before {
    content: '';
    width: 7px;
    height: 7px;
    background: ${({ theme }) => theme.colors.primary};
  }
`;
