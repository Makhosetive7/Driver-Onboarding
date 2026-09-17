import type { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Eyebrow } from './ui';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: clamp(1.5rem, 4vw, 2.5rem);
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};
`;

const Shell = styled.div`
  width: min(980px, 100%);
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.float};
  animation: ${fadeUp} 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const FormPane = styled.div`
  padding: clamp(1.75rem, 4vw, 2.75rem);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Intro = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
`;

const Brand = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 700;
  font-size: clamp(2rem, 4vw, 2.6rem);
  letter-spacing: -0.04em;
  line-height: 0.95;
  color: ${({ theme }) => theme.colors.maroon};
`;

const Headline = styled.h1`
  margin: 0;
  font-size: clamp(1.25rem, 2.4vw, 1.55rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textPrimary};
  max-width: 18ch;
`;

const Lead = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.55;
  font-size: 0.98rem;
  max-width: 34ch;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FooterNote = styled.div`
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.92rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  a {
    color: ${({ theme }) => theme.colors.maroon};
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Showcase = styled.aside`
  position: relative;
  padding: clamp(1.5rem, 3.5vw, 2.25rem);
  background: ${({ theme }) => theme.colors.maroon};
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  min-height: 420px;

  @media (max-width: 820px) {
    min-height: 260px;
    order: -1;
  }
`;

const ShowcaseCopy = styled.div`
  position: relative;
  z-index: 1;

  h2 {
    margin: 0 0 10px;
    color: white;
    font-size: clamp(1.35rem, 2.5vw, 1.7rem);
    max-width: 14ch;
  }

  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.78);
    line-height: 1.55;
    font-size: 0.95rem;
    max-width: 28ch;
  }
`;

const Preview = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  gap: 10px;
`;

const PreviewLine = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.88rem;

  strong {
    color: ${({ theme }) => theme.colors.mint};
  }
`;

const TopLink = styled(Link)`
  position: absolute;
  top: 1.25rem;
  left: clamp(1.25rem, 4vw, 2.5rem);
  z-index: 2;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.maroon};
  text-decoration: none;

  &:hover {
    text-decoration: none;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

type AuthShellProps = {
  eyebrow: string;
  headline: string;
  lead: string;
  showcaseTitle: string;
  showcaseLead: string;
  preview: Array<{ label: string; value: string }>;
  footer?: ReactNode;
  onSubmit?: (event: FormEvent) => void;
  children: ReactNode;
  actions?: ReactNode;
};

export function AuthShell({
  eyebrow,
  headline,
  lead,
  showcaseTitle,
  showcaseLead,
  preview,
  footer = null,
  onSubmit,
  children,
  actions = null,
}: AuthShellProps) {
  return (
    <Page>
      <TopLink to="/">TakeOFF</TopLink>
      <Shell>
        <FormPane>
          <Intro>
            <Eyebrow>{eyebrow}</Eyebrow>
            <div>
              <Brand>TakeOFF</Brand>
              <Headline>{headline}</Headline>
            </div>
            <Lead>{lead}</Lead>
          </Intro>
          <Form
            onSubmit={(event) => {
              if (onSubmit) onSubmit(event);
              else event.preventDefault();
            }}
          >
            {children}
            {actions}
          </Form>
          {footer ? <FooterNote>{footer}</FooterNote> : null}
        </FormPane>

        <Showcase>
          <ShowcaseCopy>
            <h2>{showcaseTitle}</h2>
            <p>{showcaseLead}</p>
          </ShowcaseCopy>
          <Preview>
            {preview.map((row) => (
              <PreviewLine key={row.label}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </PreviewLine>
            ))}
          </Preview>
        </Showcase>
      </Shell>
    </Page>
  );
}

export function AuthSwitchLink({
  prompt,
  to,
  label,
}: {
  prompt: string;
  to: string;
  label: string;
}) {
  return (
    <>
      {prompt} <Link to={to}>{label}</Link>
    </>
  );
}
