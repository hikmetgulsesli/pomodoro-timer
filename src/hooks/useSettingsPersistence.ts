import { useState, useEffect, useCallback } from 'react';
import type { TimerDurations } from '../components/SettingsPanel';

export const STORAGE_KEY = 'pomodoro-settings';

export const DEFAULT_DURATIONS: TimerDurations = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
};

export interface UseSettingsPersistenceReturn {
  settings: TimerDurations;
  isLoaded: boolean;
  saveSettings: (settings: TimerDurations) => void;
  resetSettings: () => void;
}

function isValidDuration(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && value >= 1 && value <= 60;
}

function mergeWithDefaults(stored: Partial<TimerDurations>): TimerDurations {
  return {
    workDuration: isValidDuration(stored.workDuration) 
      ? stored.workDuration 
      : DEFAULT_DURATIONS.workDuration,
    shortBreakDuration: isValidDuration(stored.shortBreakDuration) 
      ? stored.shortBreakDuration 
      : DEFAULT_DURATIONS.shortBreakDuration,
    longBreakDuration: isValidDuration(stored.longBreakDuration) 
      ? stored.longBreakDuration 
      : DEFAULT_DURATIONS.longBreakDuration,
  };
}

function sanitizeDurations(value: unknown): TimerDurations | null {
  if (typeof value !== 'object' || value === null) return null;
  
  const obj = value as Record<string, unknown>;
  
  const workDuration = isValidDuration(obj.workDuration) ? obj.workDuration : null;
  const shortBreakDuration = isValidDuration(obj.shortBreakDuration) ? obj.shortBreakDuration : null;
  const longBreakDuration = isValidDuration(obj.longBreakDuration) ? obj.longBreakDuration : null;
  
  // If all values are valid, return the sanitized object
  if (workDuration !== null && shortBreakDuration !== null && longBreakDuration !== null) {
    return { workDuration, shortBreakDuration, longBreakDuration };
  }
  
  // Otherwise, merge with defaults
  return mergeWithDefaults({
    workDuration: workDuration ?? undefined,
    shortBreakDuration: shortBreakDuration ?? undefined,
    longBreakDuration: longBreakDuration ?? undefined,
  });
}

export function useSettingsPersistence(): UseSettingsPersistenceReturn {
  const [settings, setSettings] = useState<TimerDurations>(DEFAULT_DURATIONS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const sanitized = sanitizeDurations(parsed);
        if (sanitized) {
          setSettings(sanitized);
        }
      }
    } catch (error) {
      // Invalid JSON or localStorage not available (private browsing)
      console.warn('Failed to load settings from LocalStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save settings to LocalStorage
  const saveSettings = useCallback((newSettings: TimerDurations) => {
    // Always update state first
    setSettings(newSettings);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.warn('Failed to save settings to LocalStorage:', error);
    }
  }, []);

  // Reset settings to defaults
  const resetSettings = useCallback(() => {
    // Always update state first
    setSettings(DEFAULT_DURATIONS);
    
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to reset settings in LocalStorage:', error);
    }
  }, []);

  return {
    settings,
    isLoaded,
    saveSettings,
    resetSettings,
  };
}

export default useSettingsPersistence;
