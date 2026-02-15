import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer, type TimerSettings, type UseTimerOptions } from './useTimer';

describe('useTimer hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should default to 25 minutes work session', () => {
      const { result } = renderHook(() => useTimer());
      
      expect(result.current.timeRemaining).toBe(25 * 60); // 25 minutes in seconds
      expect(result.current.mode).toBe('work');
      expect(result.current.timerState).toBe('idle');
      expect(result.current.isRunning).toBe(false);
      expect(result.current.sessionCount).toBe(0);
    });

    it('should accept custom settings', () => {
      const customSettings: Partial<TimerSettings> = {
        workDuration: 30,
        shortBreakDuration: 10,
        longBreakDuration: 20,
      };
      
      const { result } = renderHook(() => useTimer(customSettings));
      
      expect(result.current.timeRemaining).toBe(30 * 60);
    });
  });

  describe('timer controls', () => {
    it('should start the timer', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        result.current.start();
      });
      
      expect(result.current.isRunning).toBe(true);
      expect(result.current.timerState).toBe('running');
    });

    it('should pause the timer', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        result.current.pause();
      });
      
      expect(result.current.isRunning).toBe(false);
      expect(result.current.timerState).toBe('paused');
    });

    it('should reset the timer to current mode duration', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        result.current.start();
      });
      
      // Advance time by 5 minutes
      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      });
      
      expect(result.current.timeRemaining).toBe(20 * 60);
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.timeRemaining).toBe(25 * 60);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.timerState).toBe('idle');
    });

    it('should skip to next mode', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        result.current.skip();
      });
      
      expect(result.current.mode).toBe('shortBreak');
      expect(result.current.timeRemaining).toBe(5 * 60);
      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('timer countdown', () => {
    it('should decrement timeRemaining every second when running', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        vi.advanceTimersByTime(5000); // 5 seconds
      });
      
      expect(result.current.timeRemaining).toBe(25 * 60 - 5);
    });

    it('should not decrement when paused', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      const timeAfter5Seconds = result.current.timeRemaining;
      
      act(() => {
        result.current.pause();
      });
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      expect(result.current.timeRemaining).toBe(timeAfter5Seconds);
    });
  });

  describe('mode transitions', () => {
    it('should transition to short break after work completes', () => {
      const shortWorkSettings: Partial<TimerSettings> = {
        workDuration: 1, // 1 minute for faster test
        shortBreakDuration: 1,
      };
      
      const { result } = renderHook(() => useTimer(shortWorkSettings));
      
      act(() => {
        result.current.start();
      });
      
      // Complete the work session
      act(() => {
        vi.advanceTimersByTime(1 * 60 * 1000);
      });
      
      expect(result.current.mode).toBe('shortBreak');
      expect(result.current.timeRemaining).toBe(1 * 60);
      expect(result.current.sessionCount).toBe(1);
    });

    it('should transition to long break after 4 pomodoros', () => {
      const quickSettings: Partial<TimerSettings> = {
        workDuration: 1,
        shortBreakDuration: 1,
        longBreakDuration: 2,
        pomodorosBeforeLongBreak: 4,
      };
      
      const { result } = renderHook(() => useTimer(quickSettings));
      
      // Complete 3 work sessions with short breaks
      for (let i = 0; i < 3; i++) {
        // Start and complete work
        act(() => {
          result.current.start();
        });
        act(() => {
          vi.advanceTimersByTime(1 * 60 * 1000);
        });
        
        // Complete short break
        act(() => {
          result.current.start();
        });
        act(() => {
          vi.advanceTimersByTime(1 * 60 * 1000);
        });
      }
      
      // Complete 4th work session
      act(() => {
        result.current.start();
      });
      act(() => {
        vi.advanceTimersByTime(1 * 60 * 1000);
      });
      
      expect(result.current.mode).toBe('longBreak');
      expect(result.current.timeRemaining).toBe(2 * 60);
      expect(result.current.sessionCount).toBe(4);
    });

    it('should transition back to work after any break', () => {
      const quickSettings: Partial<TimerSettings> = {
        workDuration: 1,
        shortBreakDuration: 1,
      };
      
      const { result } = renderHook(() => useTimer(quickSettings));
      
      // Complete work
      act(() => {
        result.current.start();
      });
      act(() => {
        vi.advanceTimersByTime(1 * 60 * 1000);
      });
      
      expect(result.current.mode).toBe('shortBreak');
      
      // Complete short break
      act(() => {
        result.current.start();
      });
      act(() => {
        vi.advanceTimersByTime(1 * 60 * 1000);
      });
      
      expect(result.current.mode).toBe('work');
    });

    it('should transition back to work after long break', () => {
      const quickSettings: Partial<TimerSettings> = {
        workDuration: 1,
        shortBreakDuration: 1,
        longBreakDuration: 2,
        pomodorosBeforeLongBreak: 1, // Long break after every work
      };
      
      const { result } = renderHook(() => useTimer(quickSettings));
      
      // Complete work
      act(() => {
        result.current.start();
      });
      act(() => {
        vi.advanceTimersByTime(1 * 60 * 1000);
      });
      
      expect(result.current.mode).toBe('longBreak');
      
      // Complete long break
      act(() => {
        result.current.start();
      });
      act(() => {
        vi.advanceTimersByTime(2 * 60 * 1000);
      });
      
      expect(result.current.mode).toBe('work');
    });
  });

  describe('session counting', () => {
    it('should increment session count only on work completion', () => {
      const quickSettings: Partial<TimerSettings> = {
        workDuration: 1,
        shortBreakDuration: 1,
      };
      
      const { result } = renderHook(() => useTimer(quickSettings));
      
      // Complete work
      act(() => {
        result.current.start();
      });
      act(() => {
        vi.advanceTimersByTime(1 * 60 * 1000);
      });
      
      expect(result.current.sessionCount).toBe(1);
      
      // Complete short break - session count should not increase
      act(() => {
        result.current.start();
      });
      act(() => {
        vi.advanceTimersByTime(1 * 60 * 1000);
      });
      
      expect(result.current.sessionCount).toBe(1);
    });

    it('should track multiple completed pomodoros', () => {
      const quickSettings: Partial<TimerSettings> = {
        workDuration: 1,
        shortBreakDuration: 1,
      };
      
      const { result } = renderHook(() => useTimer(quickSettings));
      
      // Complete 3 full cycles
      for (let i = 0; i < 3; i++) {
        // Work
        act(() => {
          result.current.start();
        });
        act(() => {
          vi.advanceTimersByTime(1 * 60 * 1000);
        });
        
        // Short break
        act(() => {
          result.current.start();
        });
        act(() => {
          vi.advanceTimersByTime(1 * 60 * 1000);
        });
      }
      
      expect(result.current.sessionCount).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle multiple start calls gracefully', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        result.current.start();
      });
      
      const timeBefore = result.current.timeRemaining;
      
      // Try to start again while running
      act(() => {
        result.current.start();
      });
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      // Should only decrement by 1 second, not 2
      expect(result.current.timeRemaining).toBe(timeBefore - 1);
    });

    it('should handle pause when not running', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        result.current.pause();
      });
      
      expect(result.current.timerState).toBe('idle');
      expect(result.current.isRunning).toBe(false);
    });

    it('should reset to correct duration after mode change', () => {
      const { result } = renderHook(() => useTimer());
      
      // Skip to short break
      act(() => {
        result.current.skip();
      });
      
      expect(result.current.mode).toBe('shortBreak');
      
      // Start and advance
      act(() => {
        result.current.start();
      });
      act(() => {
        vi.advanceTimersByTime(60000); // 1 minute
      });
      
      // Reset should go back to short break duration
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.timeRemaining).toBe(5 * 60);
      expect(result.current.mode).toBe('shortBreak');
    });
  });

  describe('sound notification callbacks', () => {
    it('should call onWorkComplete when work session finishes', () => {
      const onWorkComplete = vi.fn();
      const options: UseTimerOptions = { onWorkComplete };
      const quickSettings: Partial<TimerSettings> = {
        workDuration: 1,
        shortBreakDuration: 1,
      };
      
      const { result } = renderHook(() => useTimer(quickSettings, options));
      
      act(() => {
        result.current.start();
      });
      
      // Complete the work session
      act(() => {
        vi.advanceTimersByTime(1 * 60 * 1000);
      });
      
      expect(onWorkComplete).toHaveBeenCalledTimes(1);
      expect(result.current.mode).toBe('shortBreak');
    });

    it('should call onBreakComplete when short break finishes', () => {
      const onBreakComplete = vi.fn();
      const options: UseTimerOptions = { onBreakComplete };
      const quickSettings: Partial<TimerSettings> = {
        workDuration: 1,
        shortBreakDuration: 1,
      };
      
      const { result } = renderHook(() => useTimer(quickSettings, options));
      
      // Skip to short break
      act(() => {
        result.current.skip();
      });
      
      act(() => {
        result.current.start();
      });
      
      // Complete the break
      act(() => {
        vi.advanceTimersByTime(1 * 60 * 1000);
      });
      
      expect(onBreakComplete).toHaveBeenCalledTimes(1);
      expect(result.current.mode).toBe('work');
    });

    it('should call onBreakComplete when long break finishes', () => {
      const onBreakComplete = vi.fn();
      const options: UseTimerOptions = { onBreakComplete };
      const quickSettings: Partial<TimerSettings> = {
        workDuration: 1,
        shortBreakDuration: 1,
        longBreakDuration: 2,
        pomodorosBeforeLongBreak: 1, // Long break after every work
      };
      
      const { result } = renderHook(() => useTimer(quickSettings, options));
      
      // Complete work to trigger long break
      act(() => {
        result.current.start();
      });
      act(() => {
        vi.advanceTimersByTime(1 * 60 * 1000);
      });
      
      expect(result.current.mode).toBe('longBreak');
      
      act(() => {
        result.current.start();
      });
      
      // Complete the long break
      act(() => {
        vi.advanceTimersByTime(2 * 60 * 1000);
      });
      
      expect(onBreakComplete).toHaveBeenCalledTimes(1);
      expect(result.current.mode).toBe('work');
    });

    it('should call onWorkComplete for each completed work session', () => {
      const onWorkComplete = vi.fn();
      const options: UseTimerOptions = { onWorkComplete };
      const quickSettings: Partial<TimerSettings> = {
        workDuration: 1,
        shortBreakDuration: 1,
      };
      
      const { result } = renderHook(() => useTimer(quickSettings, options));
      
      // Complete 3 work sessions
      for (let i = 0; i < 3; i++) {
        // Work
        act(() => {
          result.current.start();
        });
        act(() => {
          vi.advanceTimersByTime(1 * 60 * 1000);
        });
        
        // Short break
        act(() => {
          result.current.start();
        });
        act(() => {
          vi.advanceTimersByTime(1 * 60 * 1000);
        });
      }
      
      expect(onWorkComplete).toHaveBeenCalledTimes(3);
    });

    it('should not call callbacks when timer is reset', () => {
      const onWorkComplete = vi.fn();
      const onBreakComplete = vi.fn();
      const options: UseTimerOptions = { onWorkComplete, onBreakComplete };
      
      const { result } = renderHook(() => useTimer({}, options));
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        vi.advanceTimersByTime(5000); // 5 seconds
      });
      
      act(() => {
        result.current.reset();
      });
      
      expect(onWorkComplete).not.toHaveBeenCalled();
      expect(onBreakComplete).not.toHaveBeenCalled();
    });

    it('should handle missing callbacks gracefully', () => {
      const quickSettings: Partial<TimerSettings> = {
        workDuration: 1,
        shortBreakDuration: 1,
      };
      
      // No callbacks provided
      const { result } = renderHook(() => useTimer(quickSettings, {}));
      
      act(() => {
        result.current.start();
      });
      
      // Should not throw when completing without callbacks
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(1 * 60 * 1000);
        });
      }).not.toThrow();
      
      expect(result.current.mode).toBe('shortBreak');
    });

    it('should call correct callback when skipping from work', () => {
      const onWorkComplete = vi.fn();
      const onBreakComplete = vi.fn();
      const options: UseTimerOptions = { onWorkComplete, onBreakComplete };
      
      const { result } = renderHook(() => useTimer({}, options));
      
      // Skip from work mode
      act(() => {
        result.current.skip();
      });
      
      // When skipping, onWorkComplete should be called since we're completing work
      expect(onWorkComplete).toHaveBeenCalledTimes(1);
      expect(onBreakComplete).not.toHaveBeenCalled();
    });

    it('should call correct callback when skipping from break', () => {
      const onWorkComplete = vi.fn();
      const onBreakComplete = vi.fn();
      const options: UseTimerOptions = { onWorkComplete, onBreakComplete };
      
      const { result } = renderHook(() => useTimer({}, options));
      
      // First skip to break
      act(() => {
        result.current.skip();
      });
      
      onWorkComplete.mockClear();
      
      // Then skip from break
      act(() => {
        result.current.skip();
      });
      
      // When skipping from break, onBreakComplete should be called
      expect(onBreakComplete).toHaveBeenCalledTimes(1);
      expect(onWorkComplete).not.toHaveBeenCalled();
    });
  });
});
