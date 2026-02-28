import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettingsPersistence, DEFAULT_DURATIONS } from './useSettingsPersistence';
import type { TimerDurations } from '../components/SettingsPanel';

const STORAGE_KEY = 'pomodoro-settings';

describe('useSettingsPersistence', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should use default values when no stored settings exist', () => {
      const { result } = renderHook(() => useSettingsPersistence());

      expect(result.current.settings).toEqual(DEFAULT_DURATIONS);
      expect(result.current.isLoaded).toBe(true);
    });

    it('should load custom durations from LocalStorage on mount', () => {
      const customDurations: TimerDurations = {
        workDuration: 30,
        shortBreakDuration: 10,
        longBreakDuration: 20,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customDurations));

      const { result } = renderHook(() => useSettingsPersistence());

      expect(result.current.settings).toEqual(customDurations);
      expect(result.current.isLoaded).toBe(true);
    });

    it('should merge with defaults if stored settings are partial', () => {
      const partialSettings = { workDuration: 45 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(partialSettings));

      const { result } = renderHook(() => useSettingsPersistence());

      // Should merge partial settings with defaults
      expect(result.current.settings).toEqual({
        workDuration: 45,
        shortBreakDuration: 5,
        longBreakDuration: 15,
      });
    });

    it('should use defaults if stored settings have invalid values', () => {
      const invalidSettings = {
        workDuration: 0, // invalid - below min
        shortBreakDuration: 100, // invalid - above max
        longBreakDuration: 15,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidSettings));

      const { result } = renderHook(() => useSettingsPersistence());

      expect(result.current.settings).toEqual(DEFAULT_DURATIONS);
    });

    it('should use defaults if stored settings are not valid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not valid json');

      const { result } = renderHook(() => useSettingsPersistence());

      expect(result.current.settings).toEqual(DEFAULT_DURATIONS);
      expect(result.current.isLoaded).toBe(true);
    });

    it('should use defaults if LocalStorage throws error', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useSettingsPersistence());

      expect(result.current.settings).toEqual(DEFAULT_DURATIONS);
      expect(result.current.isLoaded).toBe(true);
    });
  });

  describe('saveSettings', () => {
    it('should save settings to LocalStorage', () => {
      const { result } = renderHook(() => useSettingsPersistence());

      const newSettings: TimerDurations = {
        workDuration: 45,
        shortBreakDuration: 10,
        longBreakDuration: 25,
      };

      act(() => {
        result.current.saveSettings(newSettings);
      });

      expect(result.current.settings).toEqual(newSettings);
      expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(newSettings));
    });

    it('should update state even if LocalStorage fails', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useSettingsPersistence());

      const newSettings: TimerDurations = {
        workDuration: 35,
        shortBreakDuration: 7,
        longBreakDuration: 18,
      };

      act(() => {
        result.current.saveSettings(newSettings);
      });

      // State should still be updated
      expect(result.current.settings).toEqual(newSettings);
    });

    it('should persist across page reloads', () => {
      const { result } = renderHook(() => useSettingsPersistence());

      const customSettings: TimerDurations = {
        workDuration: 50,
        shortBreakDuration: 12,
        longBreakDuration: 30,
      };

      act(() => {
        result.current.saveSettings(customSettings);
      });

      // Simulate page reload by rendering a new hook instance
      const { result: newResult } = renderHook(() => useSettingsPersistence());

      expect(newResult.current.settings).toEqual(customSettings);
    });
  });

  describe('resetSettings', () => {
    it('should reset settings to defaults', () => {
      const { result } = renderHook(() => useSettingsPersistence());

      const customSettings: TimerDurations = {
        workDuration: 45,
        shortBreakDuration: 10,
        longBreakDuration: 25,
      };

      act(() => {
        result.current.saveSettings(customSettings);
      });

      act(() => {
        result.current.resetSettings();
      });

      expect(result.current.settings).toEqual(DEFAULT_DURATIONS);
    });

    it('should remove settings from LocalStorage when resetting', () => {
      const customSettings: TimerDurations = {
        workDuration: 45,
        shortBreakDuration: 10,
        longBreakDuration: 25,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customSettings));

      const { result } = renderHook(() => useSettingsPersistence());

      act(() => {
        result.current.resetSettings();
      });

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should reset state even if LocalStorage removal fails', () => {
      const customSettings: TimerDurations = {
        workDuration: 45,
        shortBreakDuration: 10,
        longBreakDuration: 25,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customSettings));

      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useSettingsPersistence());

      act(() => {
        result.current.resetSettings();
      });

      expect(result.current.settings).toEqual(DEFAULT_DURATIONS);
    });
  });

  describe('LocalStorage key', () => {
    it('should use the correct LocalStorage key', () => {
      const { result } = renderHook(() => useSettingsPersistence());

      const newSettings: TimerDurations = {
        workDuration: 40,
        shortBreakDuration: 8,
        longBreakDuration: 20,
      };

      act(() => {
        result.current.saveSettings(newSettings);
      });

      expect(localStorage.getItem('pomodoro-settings')).toBe(JSON.stringify(newSettings));
    });
  });

  describe('edge cases', () => {
    it('should handle null values in stored settings', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(null));

      const { result } = renderHook(() => useSettingsPersistence());

      expect(result.current.settings).toEqual(DEFAULT_DURATIONS);
    });

    it('should handle non-object values in stored settings', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify('string value'));

      const { result } = renderHook(() => useSettingsPersistence());

      expect(result.current.settings).toEqual(DEFAULT_DURATIONS);
    });

    it('should handle stored settings with missing fields', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ workDuration: 30 }));

      const { result } = renderHook(() => useSettingsPersistence());

      // Should merge with defaults
      expect(result.current.settings).toEqual({
        workDuration: 30,
        shortBreakDuration: 5,
        longBreakDuration: 15,
      });
    });

    it('should handle stored settings with extra fields', () => {
      const settingsWithExtra = {
        workDuration: 30,
        shortBreakDuration: 10,
        longBreakDuration: 20,
        extraField: 'should be ignored',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsWithExtra));

      const { result } = renderHook(() => useSettingsPersistence());

      // Extra fields are preserved but don't affect functionality
      expect(result.current.settings.workDuration).toBe(30);
      expect(result.current.settings.shortBreakDuration).toBe(10);
      expect(result.current.settings.longBreakDuration).toBe(20);
    });
  });
});
