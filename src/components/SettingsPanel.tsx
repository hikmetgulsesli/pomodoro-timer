import React, { useState, useEffect, useCallback } from 'react';
import { Settings, X, Volume2, VolumeX } from 'lucide-react';
import './SettingsPanel.css';

export interface TimerDurations {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
}

export interface SoundSettings {
  isMuted: boolean;
  volume: number; // 0-1
}

export interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  durations: TimerDurations;
  onDurationsChange: (durations: TimerDurations) => void;
  soundSettings?: SoundSettings;
  onSoundSettingsChange?: (settings: SoundSettings) => void;
}

const MIN_DURATION = 1;
const MAX_DURATION = 60;
const MIN_VOLUME = 0;
const MAX_VOLUME = 100;

const DEFAULT_DURATIONS: TimerDurations = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
};

const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  isMuted: false,
  volume: 0.5,
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  durations,
  onDurationsChange,
  soundSettings = DEFAULT_SOUND_SETTINGS,
  onSoundSettingsChange,
}) => {
  // Local state for form values (only apply on save)
  const [formValues, setFormValues] = useState<TimerDurations>(durations);
  const [soundFormValues, setSoundFormValues] = useState<SoundSettings>(soundSettings);
  const [errors, setErrors] = useState<Partial<Record<keyof TimerDurations, string>>>({});

  // Update form values when props change or panel opens
  useEffect(() => {
    if (isOpen) {
      setFormValues(durations);
      setSoundFormValues(soundSettings);
      setErrors({});
    }
  }, [isOpen, durations, soundSettings]);

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

  const handleVolumeChange = useCallback((value: string) => {
    const numValue = parseInt(value, 10);
    const clampedVolume = isNaN(numValue) ? 0 : Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, numValue));
    
    setSoundFormValues(prev => ({
      ...prev,
      volume: clampedVolume / 100,
      // Unmute when volume is changed
      // Mute if volume is set to 0, otherwise unmute.
      isMuted: clampedVolume === 0,
    }));
  }, []);

  const handleMuteToggle = useCallback(() => {
    setSoundFormValues(prev => ({
      ...prev,
      isMuted: !prev.isMuted,
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

    // Apply duration changes
    onDurationsChange({
      workDuration: Math.max(MIN_DURATION, Math.min(MAX_DURATION, formValues.workDuration || DEFAULT_DURATIONS.workDuration)),
      shortBreakDuration: Math.max(MIN_DURATION, Math.min(MAX_DURATION, formValues.shortBreakDuration || DEFAULT_DURATIONS.shortBreakDuration)),
      longBreakDuration: Math.max(MIN_DURATION, Math.min(MAX_DURATION, formValues.longBreakDuration || DEFAULT_DURATIONS.longBreakDuration)),
    });

    // Apply sound settings changes
    onSoundSettingsChange?.(soundFormValues);
    
    onClose();
  }, [formValues, soundFormValues, onDurationsChange, onSoundSettingsChange, onClose]);

  const handleResetDefaults = useCallback(() => {
    setFormValues(DEFAULT_DURATIONS);
    setSoundFormValues(DEFAULT_SOUND_SETTINGS);
    setErrors({});
  }, []);

  const hasErrors = Object.values(errors).some(error => error !== undefined);
  const displayVolume = Math.round(soundFormValues.volume * 100);

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

          {/* Sound Settings Section */}
          <div className="settings-panel__section">
            <h3 className="settings-panel__section-title">Sound Settings</h3>
            <p className="settings-panel__section-description">
              Configure notification sounds for timer completion.
            </p>

            <div className="settings-panel__field">
              <div className="settings-panel__sound-header">
                <label htmlFor="volume-slider" className="settings-panel__label">
                  Volume
                </label>
                <button
                  type="button"
                  className="settings-panel__mute-button"
                  onClick={handleMuteToggle}
                  aria-label={soundFormValues.isMuted ? 'Unmute sound' : 'Mute sound'}
                  data-testid="mute-toggle-button"
                >
                  {soundFormValues.isMuted ? (
                    <VolumeX className="settings-panel__mute-icon" aria-hidden="true" />
                  ) : (
                    <Volume2 className="settings-panel__mute-icon" aria-hidden="true" />
                  )}
                </button>
              </div>
              <div className="settings-panel__volume-control">
                <input
                  id="volume-slider"
                  type="range"
                  min={MIN_VOLUME}
                  max={MAX_VOLUME}
                  value={soundFormValues.isMuted ? 0 : displayVolume}
                  onChange={(e) => handleVolumeChange(e.target.value)}
                  className={`settings-panel__volume-slider ${soundFormValues.isMuted ? 'settings-panel__volume-slider--muted' : ''}`}
                  aria-describedby="volume-hint"
                  data-testid="volume-slider"
                  disabled={soundFormValues.isMuted}
                />
                <span className="settings-panel__volume-value" data-testid="volume-value">
                  {soundFormValues.isMuted ? 'Muted' : `${displayVolume}%`}
                </span>
              </div>
              <span id="volume-hint" className="settings-panel__hint">
                {soundFormValues.isMuted 
                  ? 'Sound is muted. Click the speaker icon to unmute.' 
                  : 'Adjust the volume for timer completion sounds.'}
              </span>
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
