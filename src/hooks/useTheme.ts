import { useEffect, useCallback } from 'react';

const THEME_STORAGE_KEY = 'pomodoro-theme';

// Light-only theme - dark mode is disabled per design requirements
type Theme = 'light';

interface UseThemeReturn {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

/**
 * Hook for managing theme state
 * Note: This app is light-only per design requirements
 * Dark mode toggle is disabled
 */
export function useTheme(): UseThemeReturn {
  // Always use light theme
  const theme: Theme = 'light';

  // Apply theme to document (always light)
  useEffect(() => {
    const root = document.documentElement;
    root.removeAttribute('data-theme');
  }, []);

  // No-op toggles for API compatibility
  const toggleTheme = useCallback(() => {
    // Dark mode disabled - do nothing
  }, []);

  const setTheme = useCallback(() => {
    // Dark mode disabled - do nothing
  }, []);

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark: false, // Always false since we only support light
  };
}

export type { Theme, UseThemeReturn };
export { THEME_STORAGE_KEY };
