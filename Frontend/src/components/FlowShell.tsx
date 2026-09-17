import type { ReactNode } from 'react';
import styled from 'styled-components';
import { AppHeader } from './AppHeader';
import { ProgressIndicator } from './ProgressIndicator';
import { Card, Container, Eyebrow, Page, Subtitle, Title } from './ui';

const ShellPage = styled(Page)`
  background: ${({ theme }) => theme.colors.background};
`;

const Intro = styled.div`
  margin-bottom: 0.35rem;
`;

type FlowShellProps = {
  children: ReactNode;
  step?: number;
  title?: string;
  subtitle?: ReactNode;
  eyebrow?: string;
  cardStyle?: React.CSSProperties;
  /** Use the wider content column (admin list, etc.). Default is the onboarding narrow column. */
  wide?: boolean;
};

export function FlowShell({
  children,
  step,
  title,
  subtitle,
  eyebrow,
  cardStyle,
  wide = false,
}: FlowShellProps) {
  return (
    <ShellPage>
      <AppHeader />
      <Container $narrow={!wide}>
        {typeof step === 'number' && <ProgressIndicator current={step} />}
        <Card style={cardStyle}>
          {(eyebrow || title) && (
            <Intro>
              {eyebrow ? <Eyebrow style={{ marginBottom: '0.85rem' }}>{eyebrow}</Eyebrow> : null}
              {title ? <Title>{title}</Title> : null}
            </Intro>
          )}
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
          {children}
        </Card>
      </Container>
    </ShellPage>
  );
}
