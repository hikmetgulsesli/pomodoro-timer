import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import type { TimerState } from '../hooks/useTimer';
import './TimerControls.css';

export interface TimerControlsProps {
  timerState: TimerState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  timerState,
  onStart,
  onPause,
  onReset,
}) => {
  const isRunning = timerState === 'running';
  const isIdle = timerState === 'idle';

  const handlePrimaryAction = () => {
    if (isRunning) {
      onPause();
    } else {
      onStart();
    }
  };

  return (
    <div className="timer-controls" data-testid="timer-controls">
      {/* Primary Action Button (Play/Pause) */}
      <button
        type="button"
        className="timer-controls__button timer-controls__button--primary"
        onClick={handlePrimaryAction}
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        data-testid="timer-play-pause-button"
      >
        {isRunning ? (
          <Pause className="timer-controls__icon" aria-hidden="true" />
        ) : (
          <Play className="timer-controls__icon" aria-hidden="true" />
        )}
        <span className="timer-controls__label">
          {isRunning ? 'Pause' : isIdle ? 'Start' : 'Resume'}
        </span>
        <kbd className="timer-controls__shortcut" aria-hidden="true">
          Space
        </kbd>
      </button>

      {/* Reset Button */}
      <button
        type="button"
        className="timer-controls__button timer-controls__button--secondary"
        onClick={onReset}
        aria-label="Reset timer"
        data-testid="timer-reset-button"
      >
        <RotateCcw className="timer-controls__icon" aria-hidden="true" />
        <span className="timer-controls__label">Reset</span>
        <kbd className="timer-controls__shortcut" aria-hidden="true">
          R
        </kbd>
      </button>
    </div>
  );
};

export default TimerControls;
