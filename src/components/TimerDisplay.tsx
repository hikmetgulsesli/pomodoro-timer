import React from 'react';
import type { TimerMode } from '../hooks/useTimer';
import './TimerDisplay.css';

export interface TimerDisplayProps {
  timeRemaining: number;
  totalTime: number;
  mode: TimerMode;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getModeLabel(mode: TimerMode): string {
  switch (mode) {
    case 'work':
      return 'Work';
    case 'shortBreak':
      return 'Short Break';
    case 'longBreak':
      return 'Long Break';
    default:
      return 'Work';
  }
}

function getModeColor(mode: TimerMode): string {
  switch (mode) {
    case 'work':
      return 'var(--timer-work)';
    case 'shortBreak':
      return 'var(--timer-break)';
    case 'longBreak':
      return 'var(--timer-long-break)';
    default:
      return 'var(--primary)';
  }
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timeRemaining,
  totalTime,
  mode,
}) => {
  const radius = 120;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = totalTime > 0 ? timeRemaining / totalTime : 0;
  const strokeDashoffset = circumference - progress * circumference;

  const displayTime = formatTime(timeRemaining);
  const modeLabel = getModeLabel(mode);
  const modeColor = getModeColor(mode);

  return (
    <div className="timer-display" data-testid="timer-display">
      <div className="timer-display__container">
        {/* Circular Progress SVG */}
        <svg
          className="timer-display__ring"
          width={radius * 2}
          height={radius * 2}
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          data-testid="timer-ring"
        >
          {/* Background circle */}
          <circle
            className="timer-display__ring-bg"
            stroke="var(--surface-tertiary)"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            className="timer-display__ring-progress"
            stroke={modeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{
              strokeDasharray: `${circumference} ${circumference}`,
              strokeDashoffset,
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              transition: 'stroke-dashoffset 300ms ease, stroke 300ms ease',
            }}
            data-testid="timer-ring-progress"
          />
        </svg>

        {/* Time and Mode Display */}
        <div className="timer-display__content">
          <span
            className="timer-display__mode"
            data-testid="timer-mode"
            style={{ color: modeColor }}
          >
            {modeLabel}
          </span>
          <span className="timer-display__time" data-testid="timer-time">
            {displayTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;
