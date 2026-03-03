import React from 'react';
import type { TimerMode } from '../hooks/useTimer';
import './ModeSelector.css';

export interface ModeSelectorProps {
  currentMode: TimerMode;
  onModeChange: (mode: TimerMode) => void;
  disabled?: boolean;
}

interface ModeOption {
  value: TimerMode;
  label: string;
  duration: string;
}

const MODES: ModeOption[] = [
  { value: 'work', label: 'Work', duration: '25 min' },
  { value: 'shortBreak', label: 'Short Break', duration: '5 min' },
  { value: 'longBreak', label: 'Long Break', duration: '15 min' },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
  disabled = false,
}) => {
  const handleModeChange = (mode: TimerMode) => {
    if (!disabled && mode !== currentMode) {
      onModeChange(mode);
    }
  };

  return (
    <div className="mode-selector" data-testid="mode-selector">
      {MODES.map((mode) => (
        <button
          key={mode.value}
          type="button"
          className={`mode-selector__button ${
            currentMode === mode.value ? 'mode-selector__button--active' : ''
          }`}
          onClick={() => handleModeChange(mode.value)}
          disabled={disabled}
          aria-pressed={currentMode === mode.value}
          data-testid={`mode-button-${mode.value}`}
        >
          <span className="mode-selector__label">{mode.label}</span>
          <span className="mode-selector__duration">{mode.duration}</span>
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;
