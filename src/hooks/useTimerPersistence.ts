import { useState, useEffect, useCallback } from 'react';
import type { TimerMode, TimerState } from './useTimer';

export const TIMER_STATE_KEY = 'pomodoro-timer-state';

export interface PersistedTimerState {
  timeRemaining: number;
  mode: TimerMode;
  timerState: TimerState;
  sessionCount: number;
  lastUpdated: number;
}

export interface UseTimerPersistenceReturn {
  persistedState: PersistedTimerState | null;
  isLoaded: boolean;
  saveTimerState: (state: Omit<PersistedTimerState, 'lastUpdated'>) => void;
  clearTimerState: () => void;
}

export const DEFAULT_PERSISTED_STATE: PersistedTimerState = {
  timeRemaining: 25 * 60,
  mode: 'work',
  timerState: 'idle',
  sessionCount: 0,
  lastUpdated: Date.now(),
};

function isValidTimerMode(value: unknown): value is TimerMode {
  return value === 'work' || value === 'shortBreak' || value === 'longBreak';
}

function isValidTimerState(value: unknown): value is TimerState {
  return value === 'idle' || value === 'running' || value === 'paused';
}

function sanitizePersistedState(value: unknown): PersistedTimerState | null {
  if (typeof value !== 'object' || value === null) return null;
  
  const obj = value as Record<string, unknown>;
  
  const timeRemaining = typeof obj.timeRemaining === 'number' && !isNaN(obj.timeRemaining) && obj.timeRemaining >= 0
    ? obj.timeRemaining
    : null;
  const mode = isValidTimerMode(obj.mode) ? obj.mode : null;
  const timerState = isValidTimerState(obj.timerState) ? obj.timerState : null;
  const sessionCount = typeof obj.sessionCount === 'number' && !isNaN(obj.sessionCount) && obj.sessionCount >= 0
    ? obj.sessionCount
    : null;
  
  if (timeRemaining !== null && mode !== null && timerState !== null && sessionCount !== null) {
    return {
      timeRemaining,
      mode,
      timerState,
      sessionCount,
      lastUpdated: typeof obj.lastUpdated === 'number' ? obj.lastUpdated : Date.now(),
    };
  }
  
  return null;
}

export function useTimerPersistence(): UseTimerPersistenceReturn {
  const [persistedState, setPersistedState] = useState<PersistedTimerState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load timer state from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TIMER_STATE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const sanitized = sanitizePersistedState(parsed);
        if (sanitized) {
          setPersistedState(sanitized);
        }
      }
    } catch (error) {
      console.warn('Failed to load timer state from LocalStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save timer state to LocalStorage
  const saveTimerState = useCallback((state: Omit<PersistedTimerState, 'lastUpdated'>) => {
    const stateWithTimestamp: PersistedTimerState = {
      ...state,
      lastUpdated: Date.now(),
    };
    
    try {
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(stateWithTimestamp));
      setPersistedState(stateWithTimestamp);
    } catch (error) {
      console.warn('Failed to save timer state to LocalStorage:', error);
    }
  }, []);

  // Clear timer state from LocalStorage
  const clearTimerState = useCallback(() => {
    try {
      localStorage.removeItem(TIMER_STATE_KEY);
      setPersistedState(null);
    } catch (error) {
      console.warn('Failed to clear timer state from LocalStorage:', error);
    }
  }, []);

  return {
    persistedState,
    isLoaded,
    saveTimerState,
    clearTimerState,
  };
}

export default useTimerPersistence;
