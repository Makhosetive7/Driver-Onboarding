import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }

  html {
    font-size: 16px;
    -webkit-text-size-adjust: 100%;
  }

  body {
    margin: 0;
    min-height: 100vh;
    font-family: ${({ theme }) => theme.fonts.body};
    font-weight: 500;
    letter-spacing: 0.01em;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.background};
    background-attachment: fixed;
  }

  #root {
    min-height: 100vh;
  }

  h1, h2, h3, h4 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: 700;
    letter-spacing: -0.03em;
    margin: 0 0 0.5rem;
  }

  p { margin: 0 0 1rem; }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: 600;
  }

  a:hover { text-decoration: underline; }

  button, input, select, textarea {
    font: inherit;
  }

  img { max-width: 100%; display: block; }
`;
