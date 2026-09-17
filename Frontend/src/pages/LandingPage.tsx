import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FiArrowRight, FiFileText, FiLock, FiPhone, FiShield, FiTruck, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
const navEase = 'cubic-bezier(0.19, 1, 0.22, 1)';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const navDrop = keyframes`
  from { opacity: 0; transform: translate(-50%, -12px); }
  to { opacity: 1; transform: translate(-50%, 0); }
`;

const tickIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  --bg: #eefaf4;
  --surface: #ffffff;
  --ink: #1a2340;
  --deep: #158a58;
  --primary: #1fb675;
  --sky: #7dd4ab;
  --sky-soft: #d2f5e6;
  --mint: #c7f9cc;
  --text: #1a2340;
  --muted: #4a5a7a;
  --faint: #7a8aa8;
  --border: #b8e5cf;
  --font-brand: 'Instrument Serif', 'Times New Roman', serif;
  --font-heading: 'Space Grotesk', system-ui, sans-serif;
  --font-body: 'Manrope', system-ui, sans-serif;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  font-weight: 500;
  overflow-x: clip;

  a {
    color: inherit;
    text-decoration: none;
  }
`;

const Nav = styled.header`
  position: fixed;
  top: 1.25rem;
  left: 50%;
  z-index: 50;
  width: min(100% - 1.5rem, 52rem);
  transform: translateX(-50%);
  animation: ${navDrop} 0.7s ${navEase} both;
`;

const NavBar = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 0.55rem 0.65rem 0.55rem 1.25rem;
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: 0 12px 40px rgba(26, 35, 64, 0.12);
`;

const Logo = styled(Link)`
  font-family: var(--font-brand);
  font-size: 1.45rem;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--ink);
  justify-self: start;
  &:hover {
    color: var(--deep);
  }
`;

const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(1rem, 2.5vw, 1.75rem);
  font-size: 0.9rem;
  font-weight: 500;

  a {
    color: var(--muted);
    transition: color 0.2s ease;

    &:hover {
      color: var(--ink);
    }
  }

  @media (max-width: 720px) {
    display: none;
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.4rem;
`;

const NavGhost = styled(Link)`
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--ink);
  padding: 0.45rem 0.65rem;

  &:hover {
    color: var(--deep);
  }

  @media (max-width: 520px) {
    display: none;
  }
`;

const NavGhostBtn = styled.button`
  appearance: none;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--ink);
  padding: 0.45rem 0.65rem;
  cursor: pointer;

  &:hover {
    color: var(--deep);
  }

  @media (max-width: 520px) {
    display: none;
  }
`;

const NavCta = styled(Link)`
  display: inline-flex;
  align-items: center;
  height: 2.35rem;
  padding: 0 0.95rem;
  background: var(--deep);
  color: #fff !important;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid var(--deep);
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: var(--primary);
    border-color: var(--primary);
    transform: translateY(-1px);
  }

  @media (max-width: 720px) {
    display: none;
  }
`;

const MenuToggle = styled.button`
  appearance: none;
  border: 1px solid transparent;
  background: transparent;
  width: 2.35rem;
  height: 2.35rem;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  span {
    display: block;
    width: 1.05rem;
    height: 1.5px;
    background: var(--ink);
    transition: transform 0.25s ${navEase}, opacity 0.2s ease;
  }

  &[aria-expanded='true'] span:first-child {
    transform: translateY(3.5px) rotate(45deg);
  }
  &[aria-expanded='true'] span:last-child {
    transform: translateY(-3.5px) rotate(-45deg);
  }

  &:hover {
    background: var(--sky-soft);
    border-color: var(--border);
  }
`;

const MenuPanel = styled.div<{ $open: boolean }>`
  position: absolute;
  top: calc(100% + 0.55rem);
  left: 0;
  right: 0;
  padding: 0.85rem 1rem 1rem;
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: 0 18px 50px rgba(26, 35, 64, 0.14);
  display: ${({ $open }) => ($open ? 'grid' : 'none')};
  gap: 0.15rem;
  animation: ${fadeIn} 0.35s ${navEase} both;

  a,
  button {
    appearance: none;
    border: 0;
    background: transparent;
    font: inherit;
    text-align: left;
    color: var(--ink);
    padding: 0.7rem 0.55rem;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s ease, color 0.2s ease;

    &:hover {
      background: var(--sky-soft);
      color: var(--deep);
    }
  }
`;

const MenuCta = styled(Link)`
  margin-top: 0.35rem !important;
  background: var(--deep) !important;
  color: #fff !important;
  text-align: center !important;
  font-weight: 600 !important;

  &:hover {
    background: var(--primary) !important;
    color: #fff !important;
  }
`;

const ArrowBtn = styled(Link)<{ $variant?: 'filled' | 'light' | 'ghost' }>`
  display: inline-flex;
  align-items: stretch;
  height: 48px;
  border: 1px solid
    ${({ $variant }) => ($variant === 'filled' ? 'var(--deep)' : 'var(--deep)')};
  overflow: hidden;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  .label {
    display: flex;
    align-items: center;
    padding: 0 18px 0 16px;
    font-weight: 600;
    font-size: 0.95rem;
    white-space: nowrap;
    background: ${({ $variant }) =>
      $variant === 'filled'
        ? 'var(--deep)'
        : $variant === 'light'
          ? '#fff'
          : 'transparent'};
    color: ${({ $variant }) =>
      $variant === 'ghost' || $variant === 'light' ? 'var(--deep)' : '#fff'};
  }

  .icon {
    display: grid;
    place-items: center;
    aspect-ratio: 1;
    border-left: 1px solid
      ${({ $variant }) =>
        $variant === 'filled' ? 'rgba(255,255,255,0.18)' : 'var(--deep)'};
    background: ${({ $variant }) =>
      $variant === 'filled' ? '#127a4e' : 'var(--deep)'};
    color: #fff;
  }
`;

const Main = styled.main`
  flex: 1;
`;

const Hero = styled.section`
  position: relative;
  padding: clamp(6.5rem, 12vw, 8.5rem) 0 clamp(3rem, 6vw, 4.5rem);
  overflow: hidden;
  background: var(--bg);
`;

const HeroGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  align-items: stretch;
  min-height: min(68vh, 640px);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    min-height: 0;
    gap: 2rem;
    padding: 0 clamp(1.25rem, 4vw, 2.5rem);
  }
`;

const HeroCopy = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 1.25rem;
  width: 100%;
  max-width: none;
  box-sizing: border-box;
  padding: clamp(1.5rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3.25rem)
    clamp(1.5rem, 4vw, 3rem) clamp(1.5rem, 5vw, 4rem);
  animation: ${fadeUp} 0.55s ${ease} both;

  @media (max-width: 900px) {
    order: -1;
    padding: 0;
  }
`;

const ProductTag = styled.p`
  margin: 0;
  font-family: var(--font-heading);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--primary);
`;

const Headline = styled.p`
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(1.45rem, 2.8vw, 2.1rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.03em;
  color: var(--ink);
`;

const Support = styled.p`
  margin: 0;
  width: 100%;
  font-size: clamp(1rem, 1.4vw, 1.1rem);
  line-height: 1.65;
  color: var(--muted);
`;

const CtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 0.35rem;
`;

const VehicleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const VehicleChip = styled.span`
  padding: 0.35rem 0.7rem;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.65);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
`;

const Waybill = styled.aside`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 88% 12%, rgba(199, 249, 204, 0.35), transparent 42%),
    radial-gradient(circle at 12% 80%, rgba(31, 182, 117, 0.18), transparent 45%),
    linear-gradient(165deg, #ffffff 0%, #f0faf5 55%, #e8f7f0 100%);
  border: 1px solid var(--border);
  border-right: 0;
  box-shadow: 0 24px 60px rgba(31, 182, 117, 0.18);
  overflow: hidden;
  animation: ${fadeUp} 0.6s ${ease} 0.1s both;

  &::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 7px;
    z-index: 1;
    background: repeating-linear-gradient(
      180deg,
      var(--primary) 0 9px,
      var(--mint) 9px 18px,
      var(--sky) 18px 27px
    );
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image:
      linear-gradient(rgba(31, 182, 117, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(31, 182, 117, 0.04) 1px, transparent 1px);
    background-size: 28px 28px;
    mask-image: radial-gradient(ellipse at 70% 30%, black 10%, transparent 70%);
  }

  @media (max-width: 900px) {
    border-right: 1px solid var(--border);
    min-height: 0;
  }
`;

const TicketTop = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 1.25rem;
  align-items: flex-start;
  padding: clamp(1.35rem, 3vw, 1.85rem) clamp(1.35rem, 3vw, 2rem)
    clamp(1.15rem, 2.5vw, 1.4rem) clamp(1.65rem, 3.5vw, 2.25rem);
  border-bottom: 1px dashed var(--border);
  background: linear-gradient(
    180deg,
    rgba(210, 245, 230, 0.95) 0%,
    rgba(238, 250, 244, 0.9) 55%,
    rgba(255, 255, 255, 0.55) 100%
  );
`;

const TicketMeta = styled.div`
  .kicker {
    margin: 0 0 0.3rem;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--primary);
  }

  h2 {
    margin: 0;
    font-family: var(--font-heading);
    font-size: clamp(1.45rem, 2.4vw, 1.85rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--ink);
  }
`;

const Stamp = styled.div`
  position: relative;
  z-index: 1;
  padding: 0.55rem 0.7rem;
  border: 2px solid var(--primary);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(210, 245, 230, 0.55));
  box-shadow: 0 8px 20px rgba(31, 182, 117, 0.15);
  transform: rotate(-4deg);
  text-align: right;

  .ref {
    margin: 0;
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 0.95rem;
    letter-spacing: 0.03em;
    color: var(--deep);
  }

  .note {
    margin: 0.1rem 0 0;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--primary);
  }
`;

const RouteBoard = styled.div`
  position: relative;
  z-index: 1;
  flex: 1;
  padding: clamp(1.25rem, 3vw, 1.75rem) clamp(1.35rem, 3vw, 2rem)
    clamp(1.15rem, 2.5vw, 1.5rem) clamp(1.65rem, 3.5vw, 2.25rem);
`;

const RouteLabel = styled.p`
  margin: 0 0 1rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--faint);
`;

const RouteTrack = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0;
`;

const RouteStop = styled.li<{ $state: 'done' | 'here' | 'todo'; $delay: string }>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.85rem;
  align-items: center;
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--border);
  animation: ${tickIn} 0.4s ${ease} both;
  animation-delay: ${({ $delay }) => $delay};

  &:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  strong {
    font-size: 0.92rem;
    color: var(--ink);
  }

  .detail {
    font-size: 0.78rem;
    color: var(--faint);
  }

  .state {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${({ $state }) =>
      $state === 'here' ? 'var(--deep)' : $state === 'done' ? 'var(--primary)' : 'var(--faint)'};
  }
`;

const StopDot = styled.span<{ $state: 'done' | 'here' | 'todo' }>`
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  font-size: 0.7rem;
  font-weight: 700;
  background: ${({ $state }) =>
    $state === 'done' ? 'var(--primary)' : $state === 'here' ? 'var(--deep)' : '#fff'};
  color: ${({ $state }) => ($state === 'todo' ? 'var(--faint)' : '#fff')};
  border: 2px solid
    ${({ $state }) =>
      $state === 'todo' ? 'var(--border)' : $state === 'here' ? 'var(--deep)' : 'var(--primary)'};
`;

const TicketFoot = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border);
  border-top: 1px dashed var(--border);

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const FootCell = styled.div`
  background: linear-gradient(180deg, #e8f7f0 0%, #d2f5e6 100%);
  padding: 1rem 1.15rem 1.15rem clamp(1.65rem, 3.5vw, 2.25rem);

  .label {
    margin: 0 0 0.2rem;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--faint);
  }

  .value {
    margin: 0;
    font-family: var(--font-heading);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--ink);
  }
`;

const Band = styled.section<{ $tone?: 'plain' | 'deep' | 'mint' }>`
  padding: clamp(3.5rem, 8vw, 5.5rem) clamp(1.25rem, 4vw, 2.5rem);
  background: ${({ $tone }) =>
    $tone === 'deep' ? 'var(--deep)' : $tone === 'mint' ? '#e8fff0' : 'transparent'};
  color: ${({ $tone }) => ($tone === 'deep' ? '#fff' : 'var(--ink)')};
`;

const Inner = styled.div`
  width: min(1120px, 100%);
  margin: 0 auto;
`;

const SectionHead = styled.div<{ $dark?: boolean }>`
  max-width: 36rem;
  margin-bottom: clamp(1.75rem, 4vw, 2.5rem);

  .kicker {
    margin: 0 0 0.65rem;
    font-family: var(--font-heading);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${({ $dark }) => ($dark ? 'var(--mint)' : 'var(--primary)')};
  }

  h2 {
    margin: 0 0 0.75rem;
    font-family: var(--font-heading);
    font-size: clamp(1.85rem, 4vw, 2.65rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.12;
    color: ${({ $dark }) => ($dark ? '#fff' : 'var(--ink)')};
  }

  p {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.6;
    color: ${({ $dark }) => ($dark ? 'rgba(255,255,255,0.78)' : 'var(--muted)')};
  }
`;

const WhyGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const WhyCard = styled.article`
  padding: 1.5rem;
  background: #fff;
  border: 1px solid var(--border);

  h3 {
    margin: 0 0 0.55rem;
    font-family: var(--font-heading);
    font-size: 1.2rem;
    color: var(--deep);
  }

  p {
    margin: 0;
    color: var(--muted);
    line-height: 1.55;
  }
`;

const Steps = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);

  @media (max-width: 860px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const Step = styled.li`
  background: rgba(0, 0, 0, 0.18);
  padding: 1.35rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 100%;

  .num {
    width: 2rem;
    height: 2rem;
    display: grid;
    place-items: center;
    background: #fff;
    color: var(--deep);
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 0.85rem;
  }

  h3 {
    margin: 0;
    font-size: 1.05rem;
    color: #fff;
  }

  p {
    margin: 0;
    font-size: 0.92rem;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.72);
  }

  svg {
    color: var(--mint);
  }
`;

const SafetyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const SafetyCard = styled.article`
  padding: 1.35rem;
  background: #fff;
  border: 1px solid var(--border);

  .icon {
    width: 2.25rem;
    height: 2.25rem;
    display: grid;
    place-items: center;
    background: var(--sky-soft);
    color: var(--deep);
    margin-bottom: 0.85rem;
    font-size: 1.1rem;
  }

  h3 {
    margin: 0 0 0.4rem;
    font-family: var(--font-heading);
    font-size: 1.05rem;
    color: var(--ink);
  }

  p {
    margin: 0;
    color: var(--muted);
    line-height: 1.5;
    font-size: 0.95rem;
  }
`;

const Closing = styled.section`
  padding: 0 clamp(1.25rem, 4vw, 2.5rem) clamp(3.5rem, 7vw, 5rem);
`;

const ClosingCard = styled.div`
  width: min(1120px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 2rem;
  align-items: center;
  padding: clamp(2rem, 5vw, 3rem);
  background: var(--deep);
  color: #fff;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }

  h2 {
    margin: 0 0 0.75rem;
    font-family: var(--font-brand);
    font-size: clamp(2.2rem, 5vw, 3.4rem);
    font-weight: 400;
    letter-spacing: -0.03em;
    line-height: 0.95;
    max-width: 12ch;
  }

  p {
    margin: 0 0 1.35rem;
    max-width: 34ch;
    color: rgba(255, 255, 255, 0.78);
    line-height: 1.55;
  }
`;

const ClosingMeta = styled.div`
  display: grid;
  gap: 0.65rem;
`;

const MetaLine = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.9rem;

  strong {
    color: var(--mint);
    font-family: var(--font-heading);
  }
`;

const Foot = styled.footer`
  margin-top: auto;
  background: var(--ink);
  color: rgba(255, 255, 255, 0.7);
  padding: clamp(3rem, 6vw, 4rem) clamp(1.25rem, 4vw, 2.5rem) 1.5rem;
`;

const FootGrid = styled.div`
  width: min(1120px, 100%);
  margin: 0 auto 2.5rem;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 2rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const FootBrand = styled(Link)`
  display: inline-block;
  font-family: var(--font-brand);
  font-size: 1.75rem;
  color: #fff;
  margin-bottom: 0.65rem;

  span {
    font-style: italic;
  }
`;

const Blurb = styled.p`
  margin: 0;
  max-width: 28rem;
  line-height: 1.55;
`;

const ColTitle = styled.h3`
  margin: 0 0 0.75rem;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  font-family: var(--font-body);
`;

const FootList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;

  a {
    color: rgba(255, 255, 255, 0.72);
    font-weight: 500;
    &:hover {
      color: #fff;
    }
  }
`;

const Wordmark = styled.p`
  width: min(1120px, 100%);
  margin: 0 auto;
  font-family: var(--font-brand);
  font-size: clamp(4rem, 16vw, 9.5rem);
  line-height: 0.82;
  letter-spacing: -0.05em;
  color: #24304f;
  text-align: center;
  user-select: none;
`;

const Bottom = styled.div`
  width: min(1120px, 100%);
  margin: 1.25rem auto 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.85rem;
`;

const ROUTE_STOPS = [
  { title: 'Verify phone', detail: 'OTP unlocks the rest', state: 'done' as const },
  { title: 'Personal details', detail: 'Who is driving', state: 'done' as const },
  { title: 'Identity & licence', detail: 'ID + DL on file', state: 'done' as const },
  { title: 'Vehicle & docs', detail: 'You are here', state: 'here' as const },
  { title: 'Fleet review', detail: 'Reference issued', state: 'todo' as const },
];

const APPLY_STEPS = [
  {
    icon: FiPhone,
    title: 'Sign up & verify',
    text: 'Create your account and confirm your phone with a one-time code.',
  },
  {
    icon: FiUser,
    title: 'Tell us who you are',
    text: 'Personal details and identity so we can match the rider to the paperwork.',
  },
  {
    icon: FiTruck,
    title: 'Add your vehicle',
    text: 'Bike, car, or van — plus the licence and files reviewers need.',
  },
  {
    icon: FiFileText,
    title: 'Submit for review',
    text: 'One application, one reference number, a clear decision trail.',
  },
] as const;

export function LandingPage() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const startTo = user
    ? user.role === 'ADMIN'
      ? '/admin'
      : user.phone_verified
        ? '/dashboard'
        : '/verify'
    : '/register';

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <Page>
      <Nav ref={navRef}>
        <NavBar>
          <Logo to="/" onClick={closeMenu}>
            TakeOFF
          </Logo>
          <NavLinks>
            <a href="#why" onClick={closeMenu}>
              Why
            </a>
            <a href="#apply" onClick={closeMenu}>
              Apply
            </a>
            <a href="#safety" onClick={closeMenu}>
              Safety
            </a>
          </NavLinks>
          <NavActions>
            {user ? (
              <>
                <NavGhostBtn type="button" onClick={logout}>
                  Sign out
                </NavGhostBtn>
                <NavCta to={startTo}>{user.role === 'ADMIN' ? 'Admin' : 'Continue'}</NavCta>
              </>
            ) : (
              <>
                <NavGhost to="/login">Sign in</NavGhost>
                <NavCta to={startTo}>Apply</NavCta>
              </>
            )}
            <MenuToggle
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
            </MenuToggle>
          </NavActions>
        </NavBar>
        <MenuPanel $open={menuOpen}>
          <a href="#why" onClick={closeMenu}>
            Why TakeOFF
          </a>
          <a href="#apply" onClick={closeMenu}>
            How to apply
          </a>
          <a href="#safety" onClick={closeMenu}>
            Safety
          </a>
          {user ? (
            <>
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  logout();
                }}
              >
                Sign out
              </button>
              <MenuCta to={startTo} onClick={closeMenu}>
                {user.role === 'ADMIN' ? 'Admin' : 'Continue'}
              </MenuCta>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}>
                Sign in
              </Link>
              <MenuCta to={startTo} onClick={closeMenu}>
                Apply
              </MenuCta>
            </>
          )}
        </MenuPanel>
      </Nav>

      <Main>
        <Hero>
          <HeroGrid>
            <HeroCopy>
              <ProductTag>Driver onboarding</ProductTag>

              <Headline>TAKEOFF: Apply once. Get ready to deliver.</Headline>
              <Support>
                A guided route onto the TakeOFF fleet — phone, identity, vehicle,
                documents, then human review with a real reference number.
              </Support>
              <CtaRow>
                <ArrowBtn to={startTo} $variant="filled">
                  <span className="label">Start application</span>
                  <span className="icon" aria-hidden>
                    <FiArrowRight size={18} />
                  </span>
                </ArrowBtn>
                <ArrowBtn to="/login" $variant="ghost">
                  <span className="label">Sign in</span>
                  <span className="icon" aria-hidden>
                    <FiArrowRight size={18} />
                  </span>
                </ArrowBtn>
              </CtaRow>
              <VehicleRow aria-label="Vehicle types">
                <VehicleChip>Bike</VehicleChip>
                <VehicleChip>Car</VehicleChip>
                <VehicleChip>Van</VehicleChip>
              </VehicleRow>
            </HeroCopy>

            <Waybill aria-label="Sample application waybill">
              <TicketTop>
                <TicketMeta>
                  <p className="kicker">Application waybill</p>
                  <h2>Route to the fleet</h2>
                </TicketMeta>
                <Stamp>
                  <p className="ref">TO — ····</p>
                  <p className="note">On submit</p>
                </Stamp>
              </TicketTop>
              <RouteBoard>
                <RouteLabel>Five stops</RouteLabel>
                <RouteTrack>
                  {ROUTE_STOPS.map((stop, i) => (
                    <RouteStop
                      key={stop.title}
                      $state={stop.state}
                      $delay={`${0.35 + i * 0.07}s`}
                    >
                      <StopDot $state={stop.state}>
                        {stop.state === 'done' ? '✓' : i + 1}
                      </StopDot>
                      <div>
                        <strong>{stop.title}</strong>
                        <div className="detail">{stop.detail}</div>
                      </div>
                      <span className="state">
                        {stop.state === 'done' ? 'Done' : stop.state === 'here' ? 'Now' : 'Next'}
                      </span>
                    </RouteStop>
                  ))}
                </RouteTrack>
              </RouteBoard>
              <TicketFoot>
                <FootCell>
                  <p className="label">Clearance</p>
                  <p className="value">Licence + ID</p>
                </FootCell>
                <FootCell>
                  <p className="label">Destination</p>
                  <p className="value">Fleet review</p>
                </FootCell>
                <FootCell>
                  <p className="label">Outcome</p>
                  <p className="value">Road-ready</p>
                </FootCell>
              </TicketFoot>
            </Waybill>
          </HeroGrid>
        </Hero>

        <Band id="why">
          <Inner>
            <SectionHead>
              <p className="kicker">Why TakeOFF</p>
              <h2>Joining a fleet shouldn&apos;t mean chasing paperwork.</h2>
              <p>
                Missing licences, blurry IDs, and silence after you send files —
                that is not how couriers should get on the road.
              </p>
            </SectionHead>
            <WhyGrid>
              <WhyCard>
                <h3>Docs live on the application</h3>
                <p>
                  Licence, ID, registration, insurance — uploaded once, stored
                  securely, visible to reviewers. No more WhatsApp scavenger hunts.
                </p>
              </WhyCard>
              <WhyCard>
                <h3>Every stop is named</h3>
                <p>
                  You always know what is next. Save progress, submit when ready,
                  and track your application with a TakeOFF reference number.
                </p>
              </WhyCard>
            </WhyGrid>
          </Inner>
        </Band>

        <Band $tone="deep" id="apply">
          <Inner>
            <SectionHead $dark>
              <p className="kicker">How to apply</p>
              <h2>Four stops. Then the review desk.</h2>
              <p>
                Built for delivery riders and the ops team that clears them —
                clear for you, compliant for TakeOFF.
              </p>
            </SectionHead>
            <Steps>
              {APPLY_STEPS.map(({ icon: Icon, title, text }, i) => (
                <Step key={title}>
                  <span className="num">{i + 1}</span>
                  <Icon size={22} />
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </Step>
              ))}
            </Steps>
          </Inner>
        </Band>

        <Band $tone="mint" id="safety">
          <Inner>
            <SectionHead>
              <p className="kicker">Safety first</p>
              <h2>We verify before you deliver.</h2>
              <p>
                TakeOFF only clears drivers after phone, identity, and document
                checks — with humans deciding every approval.
              </p>
            </SectionHead>
            <SafetyGrid>
              <SafetyCard>
                <div className="icon">
                  <FiShield />
                </div>
                <h3>Phone you own</h3>
                <p>OTP confirmation before the rest of the route unlocks.</p>
              </SafetyCard>
              <SafetyCard>
                <div className="icon">
                  <FiLock />
                </div>
                <h3>Licence &amp; ID locked down</h3>
                <p>Authenticated storage — not a shared ops inbox.</p>
              </SafetyCard>
              <SafetyCard>
                <div className="icon">
                  <FiFileText />
                </div>
                <h3>Human fleet review</h3>
                <p>Approve, reject, or request a clearer photo with a full trail.</p>
              </SafetyCard>
            </SafetyGrid>
          </Inner>
        </Band>

        <Closing>
          <ClosingCard>
            <div>
              <h2>Ready to ride with TakeOFF?</h2>
              <p>
                Start your driver application when you are. We&apos;ll take you
                from signup to fleet review.
              </p>
              <CtaRow>
                <ArrowBtn to={startTo} $variant="light">
                  <span className="label">Start application</span>
                  <span className="icon" aria-hidden>
                    <FiArrowRight size={18} />
                  </span>
                </ArrowBtn>
                <ArrowBtn
                  to="/login"
                  $variant="ghost"
                  style={{ borderColor: 'rgba(255,255,255,0.35)' }}
                >
                  <span className="label" style={{ color: '#fff' }}>
                    Sign in
                  </span>
                  <span className="icon" aria-hidden>
                    <FiArrowRight size={18} />
                  </span>
                </ArrowBtn>
              </CtaRow>
            </div>
            <ClosingMeta aria-hidden>
              <MetaLine>
                <span>Vehicle</span>
                <strong>Bike · Car · Van</strong>
              </MetaLine>
              <MetaLine>
                <span>Clearance</span>
                <strong>Licence + ID</strong>
              </MetaLine>
              <MetaLine>
                <span>Reference</span>
                <strong>TO — ····</strong>
              </MetaLine>
            </ClosingMeta>
          </ClosingCard>
        </Closing>
      </Main>

      <Foot>
        <FootGrid>
          <div>
            <FootBrand to="/">
              Take<span>OFF</span>
            </FootBrand>
            <Blurb>
              Driver onboarding for the TakeOFF fleet — one route from signup to
              road-ready review.
            </Blurb>
          </div>
          <div>
            <ColTitle>Explore</ColTitle>
            <FootList>
              <li>
                <a href="#why">Why TakeOFF</a>
              </li>
              <li>
                <a href="#apply">How to apply</a>
              </li>
              <li>
                <a href="#safety">Safety</a>
              </li>
            </FootList>
          </div>
          <div>
            <ColTitle>Account</ColTitle>
            <FootList>
              {user ? (
                <>
                  <li>
                    <Link to={startTo}>
                      {user.role === 'ADMIN' ? 'Admin' : 'Continue application'}
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={logout}
                      style={{
                        appearance: 'none',
                        border: 0,
                        background: 'transparent',
                        color: 'rgba(255,255,255,0.72)',
                        font: 'inherit',
                        fontWeight: 500,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Sign out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login">Sign in</Link>
                  </li>
                  <li>
                    <Link to="/register">Apply to drive</Link>
                  </li>
                </>
              )}
            </FootList>
          </div>
        </FootGrid>
        <Wordmark aria-hidden>TakeOFF</Wordmark>
        <Bottom>
          <span>Driver onboarding for fleets that deliver.</span>
          <span>© {new Date().getFullYear()} TakeOFF. All rights reserved.</span>
        </Bottom>
      </Foot>
    </Page>
  );
}
