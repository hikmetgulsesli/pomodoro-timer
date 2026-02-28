import React, { useState, useEffect, useCallback } from 'react';
import { Settings, X } from 'lucide-react';
import './SettingsPanel.css';

export interface TimerDurations {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
}

export interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  durations: TimerDurations;
  onDurationsChange: (durations: TimerDurations) => void;
}

const MIN_DURATION = 1;
const MAX_DURATION = 60;

const DEFAULT_DURATIONS: TimerDurations = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  durations,
  onDurationsChange,
}) => {
  // Local state for form values (only apply on save)
  const [formValues, setFormValues] = useState<TimerDurations>(durations);
  const [errors, setErrors] = useState<Partial<Record<keyof TimerDurations, string>>>({});

  // Update form values when props change or panel opens
  useEffect(() => {
    if (isOpen) {
      setFormValues(durations);
      setErrors({});
    }
  }, [isOpen, durations]);

  // Handle escape key to close panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const validateValue = (value: number): string | undefined => {
    if (isNaN(value)) return 'Please enter a valid number';
    if (value < MIN_DURATION) return `Minimum ${MIN_DURATION} minute`;
    if (value > MAX_DURATION) return `Maximum ${MAX_DURATION} minutes`;
    return undefined;
  };

  const handleInputChange = useCallback((field: keyof TimerDurations, value: string) => {
    const numValue = parseInt(value, 10);
    
    setFormValues(prev => ({
      ...prev,
      [field]: isNaN(numValue) ? '' : numValue,
    }));

    const error = validateValue(numValue);
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Partial<Record<keyof TimerDurations, string>> = {};
    let hasErrors = false;

    (Object.keys(formValues) as Array<keyof TimerDurations>).forEach(key => {
      const error = validateValue(formValues[key] as number);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // Apply changes
    onDurationsChange({
      workDuration: Math.max(MIN_DURATION, Math.min(MAX_DURATION, formValues.workDuration || DEFAULT_DURATIONS.workDuration)),
      shortBreakDuration: Math.max(MIN_DURATION, Math.min(MAX_DURATION, formValues.shortBreakDuration || DEFAULT_DURATIONS.shortBreakDuration)),
      longBreakDuration: Math.max(MIN_DURATION, Math.min(MAX_DURATION, formValues.longBreakDuration || DEFAULT_DURATIONS.longBreakDuration)),
    });
    onClose();
  }, [formValues, onDurationsChange, onClose]);

  const handleResetDefaults = useCallback(() => {
    setFormValues(DEFAULT_DURATIONS);
    setErrors({});
  }, []);

  const hasErrors = Object.values(errors).some(error => error !== undefined);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`settings-panel__backdrop ${isOpen ? 'settings-panel__backdrop--open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
        data-testid="settings-backdrop"
      />

      {/* Panel */}
      <aside
        className={`settings-panel ${isOpen ? 'settings-panel--open' : ''}`}
        aria-hidden={!isOpen}
        aria-label="Settings panel"
        data-testid="settings-panel"
      >
        <div className="settings-panel__header">
          <div className="settings-panel__title-wrapper">
            <Settings className="settings-panel__icon" aria-hidden="true" />
            <h2 className="settings-panel__title">Settings</h2>
          </div>
          <button
            type="button"
            className="settings-panel__close-button"
            onClick={onClose}
            aria-label="Close settings"
            data-testid="settings-close-button"
          >
            <X className="settings-panel__close-icon" aria-hidden="true" />
          </button>
        </div>

        <form className="settings-panel__form" onSubmit={handleSubmit}>
          <div className="settings-panel__section">
            <h3 className="settings-panel__section-title">Timer Durations</h3>
            <p className="settings-panel__section-description">
              Changes will take effect on the next timer start.
            </p>

            <div className="settings-panel__field">
              <label htmlFor="work-duration" className="settings-panel__label">
                Work Duration
              </label>
              <div className="settings-panel__input-wrapper">
                <input
                  id="work-duration"
                  type="number"
                  min={MIN_DURATION}
                  max={MAX_DURATION}
                  value={formValues.workDuration}
                  onChange={(e) => handleInputChange('workDuration', e.target.value)}
                  className={`settings-panel__input ${errors.workDuration ? 'settings-panel__input--error' : ''}`}
                  aria-describedby={errors.workDuration ? 'work-duration-error' : 'work-duration-hint'}
                  aria-invalid={errors.workDuration ? 'true' : 'false'}
                  data-testid="work-duration-input"
                />
                <span className="settings-panel__input-suffix">min</span>
              </div>
              {errors.workDuration ? (
                <span id="work-duration-error" className="settings-panel__error" role="alert" data-testid="work-duration-error">
                  {errors.workDuration}
                </span>
              ) : (
                <span id="work-duration-hint" className="settings-panel__hint">
                  Default: {DEFAULT_DURATIONS.workDuration} minutes
                </span>
              )}
            </div>

            <div className="settings-panel__field">
              <label htmlFor="short-break-duration" className="settings-panel__label">
                Short Break Duration
              </label>
              <div className="settings-panel__input-wrapper">
                <input
                  id="short-break-duration"
                  type="number"
                  min={MIN_DURATION}
                  max={MAX_DURATION}
                  value={formValues.shortBreakDuration}
                  onChange={(e) => handleInputChange('shortBreakDuration', e.target.value)}
                  className={`settings-panel__input ${errors.shortBreakDuration ? 'settings-panel__input--error' : ''}`}
                  aria-describedby={errors.shortBreakDuration ? 'short-break-duration-error' : 'short-break-duration-hint'}
                  aria-invalid={errors.shortBreakDuration ? 'true' : 'false'}
                  data-testid="short-break-duration-input"
                />
                <span className="settings-panel__input-suffix">min</span>
              </div>
              {errors.shortBreakDuration ? (
                <span id="short-break-duration-error" className="settings-panel__error" role="alert" data-testid="short-break-duration-error">
                  {errors.shortBreakDuration}
                </span>
              ) : (
                <span id="short-break-duration-hint" className="settings-panel__hint">
                  Default: {DEFAULT_DURATIONS.shortBreakDuration} minutes
                </span>
              )}
            </div>

            <div className="settings-panel__field">
              <label htmlFor="long-break-duration" className="settings-panel__label">
                Long Break Duration
              </label>
              <div className="settings-panel__input-wrapper">
                <input
                  id="long-break-duration"
                  type="number"
                  min={MIN_DURATION}
                  max={MAX_DURATION}
                  value={formValues.longBreakDuration}
                  onChange={(e) => handleInputChange('longBreakDuration', e.target.value)}
                  className={`settings-panel__input ${errors.longBreakDuration ? 'settings-panel__input--error' : ''}`}
                  aria-describedby={errors.longBreakDuration ? 'long-break-duration-error' : 'long-break-duration-hint'}
                  aria-invalid={errors.longBreakDuration ? 'true' : 'false'}
                  data-testid="long-break-duration-input"
                />
                <span className="settings-panel__input-suffix">min</span>
              </div>
              {errors.longBreakDuration ? (
                <span id="long-break-duration-error" className="settings-panel__error" role="alert" data-testid="long-break-duration-error">
                  {errors.longBreakDuration}
                </span>
              ) : (
                <span id="long-break-duration-hint" className="settings-panel__hint">
                  Default: {DEFAULT_DURATIONS.longBreakDuration} minutes
                </span>
              )}
            </div>
          </div>

          <div className="settings-panel__actions">
            <button
              type="button"
              className="settings-panel__button settings-panel__button--secondary"
              onClick={handleResetDefaults}
              data-testid="settings-reset-defaults"
            >
              Reset to Defaults
            </button>
            <div className="settings-panel__actions-right">
              <button
                type="button"
                className="settings-panel__button settings-panel__button--secondary"
                onClick={onClose}
                data-testid="settings-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="settings-panel__button settings-panel__button--primary"
                disabled={hasErrors}
                data-testid="settings-save"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </aside>
    </>
  );
};

export default SettingsPanel;
