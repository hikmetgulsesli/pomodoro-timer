import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTimerPersistence, TIMER_STATE_KEY, type PersistedTimerState } from './useTimerPersistence';

describe('useTimerPersistence', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should start with null persistedState', () => {
      const { result } = renderHook(() => useTimerPersistence());
      
      expect(result.current.persistedState).toBeNull();
      expect(result.current.isLoaded).toBe(true);
    });

    it('should load state from LocalStorage on mount', async () => {
      const storedState: PersistedTimerState = {
        timeRemaining: 1200,
        mode: 'work',
        timerState: 'paused',
        sessionCount: 3,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(storedState));
      
      const { result } = renderHook(() => useTimerPersistence());
      
      await waitFor(() => {
        expect(result.current.persistedState).toEqual(storedState);
      });
    });

    it('should use LocalStorage key "pomodoro-timer-state"', () => {
      const storedState: PersistedTimerState = {
        timeRemaining: 600,
        mode: 'shortBreak',
        timerState: 'running',
        sessionCount: 1,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(storedState));
      
      renderHook(() => useTimerPersistence());
      
      expect(localStorage.getItem(TIMER_STATE_KEY)).toBe(JSON.stringify(storedState));
    });

    it('should handle missing LocalStorage gracefully', () => {
      const { result } = renderHook(() => useTimerPersistence());
      
      expect(result.current.persistedState).toBeNull();
      expect(result.current.isLoaded).toBe(true);
    });

    it('should handle invalid JSON in LocalStorage', () => {
      localStorage.setItem(TIMER_STATE_KEY, 'not valid json');
      
      const { result } = renderHook(() => useTimerPersistence());
      
      expect(result.current.persistedState).toBeNull();
    });

    it('should handle invalid stored values gracefully', () => {
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify({
        timeRemaining: 'not a number',
        mode: 'invalid',
        timerState: 'unknown',
        sessionCount: -1,
      }));
      
      const { result } = renderHook(() => useTimerPersistence());
      
      expect(result.current.persistedState).toBeNull();
    });

    it('should handle LocalStorage errors gracefully', () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      
      const { result } = renderHook(() => useTimerPersistence());
      
      expect(result.current.persistedState).toBeNull();
      expect(result.current.isLoaded).toBe(true);
      
      localStorage.getItem = originalGetItem;
    });
  });

  describe('saveTimerState', () => {
    it('should save state to LocalStorage', async () => {
      const { result } = renderHook(() => useTimerPersistence());
      
      const stateToSave = {
        timeRemaining: 1500,
        mode: 'work' as const,
        timerState: 'running' as const,
        sessionCount: 5,
      };
      
      act(() => {
        result.current.saveTimerState(stateToSave);
      });
      
      const stored = localStorage.getItem(TIMER_STATE_KEY);
      expect(stored).not.toBeNull();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.timeRemaining).toBe(1500);
      expect(parsed.mode).toBe('work');
      expect(parsed.timerState).toBe('running');
      expect(parsed.sessionCount).toBe(5);
      expect(parsed.lastUpdated).toBeDefined();
    });

    it('should update persistedState when saving', async () => {
      const { result } = renderHook(() => useTimerPersistence());
      
      const stateToSave = {
        timeRemaining: 300,
        mode: 'longBreak' as const,
        timerState: 'paused' as const,
        sessionCount: 8,
      };
      
      act(() => {
        result.current.saveTimerState(stateToSave);
      });
      
      expect(result.current.persistedState?.timeRemaining).toBe(300);
      expect(result.current.persistedState?.mode).toBe('longBreak');
      expect(result.current.persistedState?.timerState).toBe('paused');
      expect(result.current.persistedState?.sessionCount).toBe(8);
    });

    it('should add lastUpdated timestamp when saving', () => {
      const { result } = renderHook(() => useTimerPersistence());
      
      const beforeSave = Date.now();
      
      act(() => {
        result.current.saveTimerState({
          timeRemaining: 600,
          mode: 'shortBreak',
          timerState: 'idle',
          sessionCount: 2,
        });
      });
      
      const afterSave = Date.now();
      
      expect(result.current.persistedState?.lastUpdated).toBeGreaterThanOrEqual(beforeSave);
      expect(result.current.persistedState?.lastUpdated).toBeLessThanOrEqual(afterSave);
    });

    it('should handle LocalStorage save errors gracefully', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      
      const { result } = renderHook(() => useTimerPersistence());
      
      // Should not throw
      expect(() => {
        act(() => {
          result.current.saveTimerState({
            timeRemaining: 600,
            mode: 'shortBreak',
            timerState: 'idle',
            sessionCount: 2,
          });
        });
      }).not.toThrow();
      
      localStorage.setItem = originalSetItem;
    });
  });

  describe('clearTimerState', () => {
    it('should remove state from LocalStorage', () => {
      const storedState: PersistedTimerState = {
        timeRemaining: 1200,
        mode: 'work',
        timerState: 'paused',
        sessionCount: 3,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(storedState));
      
      const { result } = renderHook(() => useTimerPersistence());
      
      act(() => {
        result.current.clearTimerState();
      });
      
      expect(localStorage.getItem(TIMER_STATE_KEY)).toBeNull();
    });

    it('should set persistedState to null', () => {
      const storedState: PersistedTimerState = {
        timeRemaining: 1200,
        mode: 'work',
        timerState: 'paused',
        sessionCount: 3,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(storedState));
      
      const { result } = renderHook(() => useTimerPersistence());
      
      act(() => {
        result.current.clearTimerState();
      });
      
      expect(result.current.persistedState).toBeNull();
    });

    it('should handle LocalStorage remove errors gracefully', () => {
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      
      const { result } = renderHook(() => useTimerPersistence());
      
      // Should not throw
      expect(() => {
        act(() => {
          result.current.clearTimerState();
        });
      }).not.toThrow();
      
      localStorage.removeItem = originalRemoveItem;
    });
  });

  describe('state restoration', () => {
    it('should restore timer mode from LocalStorage', async () => {
      const storedState: PersistedTimerState = {
        timeRemaining: 300,
        mode: 'shortBreak',
        timerState: 'idle',
        sessionCount: 2,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(storedState));
      
      const { result } = renderHook(() => useTimerPersistence());
      
      await waitFor(() => {
        expect(result.current.persistedState?.mode).toBe('shortBreak');
      });
    });

    it('should restore time remaining from LocalStorage', async () => {
      const storedState: PersistedTimerState = {
        timeRemaining: 888,
        mode: 'work',
        timerState: 'running',
        sessionCount: 4,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(storedState));
      
      const { result } = renderHook(() => useTimerPersistence());
      
      await waitFor(() => {
        expect(result.current.persistedState?.timeRemaining).toBe(888);
      });
    });

    it('should restore session count from LocalStorage', async () => {
      const storedState: PersistedTimerState = {
        timeRemaining: 600,
        mode: 'longBreak',
        timerState: 'paused',
        sessionCount: 10,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(storedState));
      
      const { result } = renderHook(() => useTimerPersistence());
      
      await waitFor(() => {
        expect(result.current.persistedState?.sessionCount).toBe(10);
      });
    });

    it('should restore timer state from LocalStorage', async () => {
      const storedState: PersistedTimerState = {
        timeRemaining: 600,
        mode: 'work',
        timerState: 'paused',
        sessionCount: 1,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(storedState));
      
      const { result } = renderHook(() => useTimerPersistence());
      
      await waitFor(() => {
        expect(result.current.persistedState?.timerState).toBe('paused');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle negative timeRemaining gracefully', () => {
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify({
        timeRemaining: -100,
        mode: 'work',
        timerState: 'idle',
        sessionCount: 0,
        lastUpdated: Date.now(),
      }));
      
      const { result } = renderHook(() => useTimerPersistence());
      
      expect(result.current.persistedState).toBeNull();
    });

    it('should handle negative sessionCount gracefully', () => {
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify({
        timeRemaining: 100,
        mode: 'work',
        timerState: 'idle',
        sessionCount: -5,
        lastUpdated: Date.now(),
      }));
      
      const { result } = renderHook(() => useTimerPersistence());
      
      expect(result.current.persistedState).toBeNull();
    });

    it('should handle NaN values gracefully', () => {
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify({
        timeRemaining: NaN,
        mode: 'work',
        timerState: 'idle',
        sessionCount: 0,
        lastUpdated: Date.now(),
      }));
      
      const { result } = renderHook(() => useTimerPersistence());
      
      expect(result.current.persistedState).toBeNull();
    });

    it('should handle null values gracefully', () => {
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify({
        timeRemaining: null,
        mode: null,
        timerState: null,
        sessionCount: null,
        lastUpdated: Date.now(),
      }));
      
      const { result } = renderHook(() => useTimerPersistence());
      
      expect(result.current.persistedState).toBeNull();
    });
  });
});
