import { Timer, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSettingsPersistence } from './hooks/useSettingsPersistence';
import { useTimerPersistence } from './hooks/useTimerPersistence';
import { useTimer } from './hooks/useTimer';
import { useSound } from './hooks/useSound';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ThemeToggle } from './components/ThemeToggle';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerControls } from './components/TimerControls';
import { SessionCounter } from './components/SessionCounter';
import { SettingsPanel } from './components/SettingsPanel';
import './App.css';

function App() {
  const { settings, isLoaded: settingsLoaded, saveSettings } = useSettingsPersistence();
  const { persistedState, isLoaded: timerStateLoaded, saveTimerState } = useTimerPersistence();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { playWorkComplete, playBreakComplete } = useSound();
  
  // Determine initial state from persistence
  const getInitialState = () => {
    if (!persistedState) return undefined;
    return {
      mode: persistedState.mode,
      timerState: persistedState.timerState === 'running' ? 'paused' : persistedState.timerState,
      timeRemaining: persistedState.timeRemaining,
      sessionCount: persistedState.sessionCount,
    };
  };
  
  const {
    timeRemaining,
    mode,
    timerState,
    sessionCount,
    start,
    pause,
    reset,
  } = useTimer(settings, {
    onWorkComplete: playWorkComplete,
    onBreakComplete: playBreakComplete,
    autoStartBreaks: true,
    initialState: getInitialState(),
  });

  // Persist timer state whenever it changes
  useEffect(() => {
    if (!timerStateLoaded) return;
    
    saveTimerState({
      timeRemaining,
      mode,
      timerState,
      sessionCount,
    });
  }, [timeRemaining, mode, timerState, sessionCount, timerStateLoaded, saveTimerState]);

  useKeyboardShortcuts({
    timerState,
    onStart: start,
    onPause: pause,
    onReset: reset,
    enabled: settingsLoaded && timerStateLoaded,
  });

  // Calculate total time for current mode
  const getTotalTime = () => {
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
  };

  if (!settingsLoaded || !timerStateLoaded) {
    return (
      <div className="app-container" style={{ backgroundColor: 'var(--surface)', color: 'var(--text)' }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ backgroundColor: 'var(--surface)', color: 'var(--text)' }}>
      {/* Header */}
      <header className="app-header">
        <div className="app-header__left">
          <div className="app-header__icon">
            <Timer size={40} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 className="app-header__title" style={{ color: 'var(--text)' }}>
            Pomodoro Timer
          </h1>
        </div>
        <div className="app-header__actions">
          <ThemeToggle />
          <button
            type="button"
            className="app-settings-button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open settings"
            data-testid="settings-button"
          >
            <Settings size={20} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Timer Display */}
        <section className="app-timer-section">
          <TimerDisplay
            timeRemaining={timeRemaining}
            totalTime={getTotalTime()}
            mode={mode}
          />
        </section>

        {/* Timer Controls */}
        <section className="app-controls-section">
          <TimerControls
            timerState={timerState}
            onStart={start}
            onPause={pause}
            onReset={reset}
          />
        </section>

        {/* Session Counter */}
        <section className="app-session-section">
          <SessionCounter sessionCount={sessionCount} />
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p className="app-footer__hint">
          Press <kbd>Space</kbd> to start/pause, <kbd>R</kbd> to reset
        </p>
      </footer>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        durations={settings}
        onDurationsChange={saveSettings}
      />
    </div>
  );
}

export default App;
