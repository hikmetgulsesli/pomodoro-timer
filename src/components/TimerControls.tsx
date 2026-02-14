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

  const handlePlayPause = () => {
    if (isRunning) {
      onPause();
    } else {
      onStart();
    }
  };

  return (
    <div className="timer-controls" data-testid="timer-controls">
      {/* Play/Pause Button */}
      <button
        type="button"
        className="timer-controls__play-pause"
        onClick={handlePlayPause}
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        data-testid="play-pause-button"
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
        className="timer-controls__reset"
        onClick={onReset}
        aria-label="Reset timer"
        data-testid="reset-button"
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
