import type { ReactElement } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import './ThemeToggle.css';

/**
 * Theme toggle button component
 * Shows sun icon in light mode, moon icon in dark mode
 * Toggles between light and dark themes on click
 */
export function ThemeToggle(): ReactElement {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      data-testid="theme-toggle"
      data-theme={theme}
    >
      <span className="theme-toggle__icon-wrapper">
        {isDark ? (
          <Moon
            size={20}
            className="theme-toggle__icon"
            aria-hidden="true"
            data-testid="moon-icon"
          />
        ) : (
          <Sun
            size={20}
            className="theme-toggle__icon"
            aria-hidden="true"
            data-testid="sun-icon"
          />
        )}
      </span>
    </button>
  );
}
