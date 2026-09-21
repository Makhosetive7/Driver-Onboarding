import { FaCheck } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ONBOARDING_STEPS } from '../lib/onboarding';

const Wrap = styled.div`
  margin: 0 0 1.35rem;
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.muted};
`;

const CurrentLabel = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
`;

const Bar = styled.div`
  height: 3px;
  border-radius: 0;
  background: ${({ theme }) => theme.colors.border};
  margin-bottom: 0.9rem;
  overflow: hidden;
`;

const BarFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 0;
  transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1);
`;

const Track = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: flex-start;
`;

const Step = styled.li<{ $state: 'done' | 'current' | 'todo'; $clickable: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  position: relative;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 0.75rem;
    left: calc(50% + 0.95rem);
    right: calc(-50% + 0.95rem);
    height: 2px;
    background: ${({ $state, theme }) =>
      $state === 'done' ? theme.colors.primary : theme.colors.border};
    z-index: 0;
  }
`;

const Dot = styled.span<{ $state: 'done' | 'current' | 'todo' }>`
  width: 1.55rem;
  height: 1.55rem;
  border-radius: 0;
  display: grid;
  place-items: center;
  font-size: 0.7rem;
  font-weight: 700;
  position: relative;
  z-index: 1;
  border: 2px solid
    ${({ $state, theme }) =>
      $state === 'todo' ? theme.colors.border : theme.colors.primary};
  background: ${({ $state, theme }) =>
    $state === 'done'
      ? theme.colors.primary
      : $state === 'current'
        ? theme.colors.surface
        : theme.colors.mist};
  color: ${({ $state, theme }) =>
    $state === 'done'
      ? '#fff'
      : $state === 'current'
        ? theme.colors.primary
        : theme.colors.muted};
  box-shadow: ${({ $state, theme }) =>
    $state === 'current' ? `0 0 0 3px ${theme.colors.primaryTint}` : 'none'};
`;

const Name = styled.span<{ $active: boolean }>`
  font-size: 0.68rem;
  text-align: center;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  color: ${({ $active, theme }) => ($active ? theme.colors.navy : theme.colors.muted)};
  font-weight: ${({ $active }) => ($active ? 700 : 500)};

  @media (max-width: 480px) {
    font-size: 0.58rem;
    white-space: normal;
  }
`;

type Props = { current: number };

export function ProgressIndicator({ current }: Props) {
  const navigate = useNavigate();
  const last = ONBOARDING_STEPS.length - 1;
  const pct = last <= 0 ? 100 : ((current - 1) / last) * 100;

  return (
    <Wrap>
      <Meta>
        <span>
          Step {current} of {ONBOARDING_STEPS.length}
        </span>
        <CurrentLabel>{ONBOARDING_STEPS[current - 1]?.label}</CurrentLabel>
      </Meta>
      <Bar>
        <BarFill $pct={pct} />
      </Bar>
      <Track>
        {ONBOARDING_STEPS.map((step, index) => {
          const stepNum = index + 1;
          const state =
            stepNum < current ? 'done' : stepNum === current ? 'current' : 'todo';
          const clickable = state === 'done' && step.path !== '/verify';
          return (
            <Step
              key={step.path}
              $state={state}
              $clickable={clickable}
              onClick={() => {
                if (clickable) navigate(step.path);
              }}
            >
              <Dot $state={state}>{state === 'done' ? <FaCheck /> : stepNum}</Dot>
              <Name $active={state !== 'todo'}>{step.label}</Name>
            </Step>
          );
        })}
      </Track>
    </Wrap>
  );
}
