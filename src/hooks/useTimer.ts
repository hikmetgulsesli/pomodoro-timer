import { useState, useCallback, useEffect, useRef } from 'react';

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';
export type TimerState = 'idle' | 'running' | 'paused';

export interface TimerSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  pomodorosBeforeLongBreak: number;
}

export interface UseTimerReturn {
  timeRemaining: number; // in seconds
  isRunning: boolean;
  mode: TimerMode;
  timerState: TimerState;
  sessionCount: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
}

export interface UseTimerOptions {
  onWorkComplete?: () => void;
  onBreakComplete?: () => void;
}

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  pomodorosBeforeLongBreak: 4,
};

function getDurationForMode(mode: TimerMode, settings: TimerSettings): number {
  switch (mode) {
    case 'work':
      return settings.workDuration * 60;
    case 'shortBreak':
      return settings.shortBreakDuration * 60;
    case 'longBreak':
      return settings.longBreakDuration * 60;
    default:
      return settings.workDuration * 60;
  }
}

export function useTimer(
  settings: Partial<TimerSettings> = {},
  options: UseTimerOptions = {}
): UseTimerReturn {
  const mergedSettings = { ...DEFAULT_SETTINGS, ...settings };
  
  const [mode, setMode] = useState<TimerMode>('work');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeRemaining, setTimeRemaining] = useState<number>(
    getDurationForMode('work', mergedSettings)
  );
  const [sessionCount, setSessionCount] = useState<number>(0);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settingsRef = useRef(mergedSettings);
  const optionsRef = useRef(options);
  
  // Update refs when dependencies change
  useEffect(() => {
    settingsRef.current = { ...DEFAULT_SETTINGS, ...settings };
  }, [settings]);
  
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const getNextMode = useCallback((): TimerMode => {
    if (mode === 'work') {
      // After work, check if we should take a long break
      const nextSessionCount = sessionCount + 1;
      if (nextSessionCount % settingsRef.current.pomodorosBeforeLongBreak === 0) {
        return 'longBreak';
      }
      return 'shortBreak';
    }
    // After any break, go back to work
    return 'work';
  }, [mode, sessionCount]);

  const transitionToNextMode = useCallback(() => {
    const nextMode = getNextMode();
    const currentMode = mode;
    
    // Increment session count when completing a work session
    if (currentMode === 'work') {
      setSessionCount(prev => prev + 1);
      // Play work complete sound
      optionsRef.current.onWorkComplete?.();
    } else {
      // Play break complete sound
      optionsRef.current.onBreakComplete?.();
    }
    
    setMode(nextMode);
    setTimeRemaining(getDurationForMode(nextMode, settingsRef.current));
    setTimerState('idle');
  }, [mode, getNextMode]);

  const start = useCallback(() => {
    if (timerState === 'running') return;
    
    setTimerState('running');
    
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Timer completed
          clearTimerInterval();
          // Transition to next mode will be handled in effect
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [timerState, clearTimerInterval]);

  const pause = useCallback(() => {
    if (timerState !== 'running') return;
    
    clearTimerInterval();
    setTimerState('paused');
  }, [timerState, clearTimerInterval]);

  const reset = useCallback(() => {
    clearTimerInterval();
    setTimerState('idle');
    setTimeRemaining(getDurationForMode(mode, settingsRef.current));
  }, [mode, clearTimerInterval]);

  const skip = useCallback(() => {
    clearTimerInterval();
    transitionToNextMode();
  }, [clearTimerInterval, transitionToNextMode]);

  // Handle timer completion (when timeRemaining reaches 0)
  useEffect(() => {
    if (timeRemaining === 0 && timerState === 'running') {
      transitionToNextMode();
    }
  }, [timeRemaining, timerState, transitionToNextMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval]);

  return {
    timeRemaining,
    isRunning: timerState === 'running',
    mode,
    timerState,
    sessionCount,
    start,
    pause,
    reset,
    skip,
  };
}
