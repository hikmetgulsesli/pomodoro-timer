import { Timer, Settings } from 'lucide-react';
import { useState } from 'react';
import { useSettingsPersistence } from './hooks/useSettingsPersistence';
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
  const { settings, isLoaded, saveSettings } = useSettingsPersistence();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { playWorkComplete, playBreakComplete } = useSound();
  
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
  });

  useKeyboardShortcuts({
    timerState,
    onStart: start,
    onPause: pause,
    onReset: reset,
    enabled: isLoaded,
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

  if (!isLoaded) {
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
      {/* Theme Toggle */}
      <div className="app-theme-toggle">
        <ThemeToggle />
      </div>

      {/* Header */}
      <header className="app-header">
        <div className="app-header__icon">
          <Timer size={40} style={{ color: 'var(--primary)' }} />
        </div>
        <h1 className="app-header__title" style={{ color: 'var(--text)' }}>
          Pomodoro Timer
        </h1>
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
        <button
          type="button"
          className="app-settings-button"
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Open settings"
          data-testid="settings-button"
        >
          <Settings size={18} aria-hidden="true" />
          <span>Settings</span>
        </button>
        
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
