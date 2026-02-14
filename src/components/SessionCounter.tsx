import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import './SessionCounter.css';

export interface SessionCounterProps {
  /** Current session count from timer */
  sessionCount: number;
  /** Called when a new session is completed (count increments) */
  onSessionComplete?: (newCount: number) => void;
}

const STORAGE_KEY = 'pomodoro-sessions';

/**
 * SessionCounter Component
 * 
 * Displays the completed Pomodoro session count with persistence to LocalStorage.
 * Shows a warm, encouraging message based on the count.
 */
export const SessionCounter: React.FC<SessionCounterProps> = ({
  sessionCount,
  onSessionComplete,
}) => {
  const [displayCount, setDisplayCount] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          setDisplayCount(parsed);
        }
      }
    } catch {
      // LocalStorage not available (e.g., private browsing)
      setDisplayCount(0);
    }
    setIsLoaded(true);
  }, []);

  // Sync display count with prop changes and persist to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;

    // Only update if the prop count is greater than our stored count
    // This indicates a new session was completed
    if (sessionCount > displayCount) {
      setDisplayCount(sessionCount);
      
      try {
        localStorage.setItem(STORAGE_KEY, sessionCount.toString());
      } catch {
        // LocalStorage not available
      }
      
      onSessionComplete?.(sessionCount);
    }
  }, [sessionCount, displayCount, isLoaded, onSessionComplete]);

  // Get encouraging message based on count
  const getMessage = (count: number): string => {
    if (count === 0) return 'Start your first pomodoro!';
    if (count === 1) return '1 pomodoro completed';
    if (count < 4) return `${count} pomodoros completed`;
    if (count < 8) return `${count} pomodoros completed - Great focus!`;
    return `${count} pomodoros completed - Amazing productivity!`;
  };

  return (
    <div 
      className="session-counter" 
      data-testid="session-counter"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="session-counter__content">
        <CheckCircle2 
          className="session-counter__icon" 
          size={20} 
          aria-hidden="true"
        />
        <span 
          className="session-counter__text"
          data-testid="session-counter-text"
        >
          {getMessage(displayCount)}
        </span>
        <span 
          className="session-counter__count"
          data-testid="session-counter-count"
          aria-label={`${displayCount} pomodoros completed`}
        >
          {displayCount}
        </span>
      </div>
    </div>
  );;
};

export default SessionCounter;
