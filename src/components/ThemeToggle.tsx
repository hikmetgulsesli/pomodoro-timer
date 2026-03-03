import type { ReactElement } from 'react';
import { Sun } from 'lucide-react';
import './ThemeToggle.css';

/**
 * Theme toggle button component
 * Note: Light-only mode - dark mode is disabled per design requirements
 * This component is rendered but non-functional (hidden)
 */
export function ThemeToggle(): ReactElement {
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Light mode"
      title="Light mode"
      data-testid="theme-toggle"
      data-theme="light"
      style={{ display: 'none' }}
    >
      <span className="theme-toggle__icon-wrapper">
        <Sun
          size={20}
          className="theme-toggle__icon"
          aria-hidden="true"
          data-testid="sun-icon"
        />
      </span>
    </button>
  );
}
