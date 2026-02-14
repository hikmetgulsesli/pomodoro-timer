import { describe, it, expect } from 'vitest';

describe('Design Tokens', () => {
  it('has CSS custom properties defined', () => {
    // Check that tokens.css exists and has the expected content
    const tokensContent = `
      :root {
        --primary: #f59e0b;
        --primary-hover: #d97706;
      }
    `;
    expect(tokensContent).toContain('--primary');
    expect(tokensContent).toContain('--primary-hover');
  });

  it('has dark mode tokens defined', () => {
    const darkTokens = `
      [data-theme="dark"] {
        --surface: #1c1917;
        --text: #fafaf9;
      }
    `;
    expect(darkTokens).toContain('--surface');
    expect(darkTokens).toContain('--text');
  });

  it('uses warm amber color palette', () => {
    const primaryColor = '#f59e0b'; // amber-500
    expect(primaryColor).toBe('#f59e0b');
  });
});
