import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTheme, THEME_STORAGE_KEY } from './useTheme';

describe('useTheme', () => {
  describe('light-only mode', () => {
    it('should always return light theme', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe('light');
      expect(result.current.isDark).toBe(false);
    });

    it('should export correct storage key', () => {
      expect(THEME_STORAGE_KEY).toBe('pomodoro-theme');
    });

    it('should not throw on toggleTheme', () => {
      const { result } = renderHook(() => useTheme());
      expect(() => result.current.toggleTheme()).not.toThrow();
    });

    it('should not throw on setTheme', () => {
      const { result } = renderHook(() => useTheme());
      expect(() => result.current.setTheme('light')).not.toThrow();
    });
  });
});
