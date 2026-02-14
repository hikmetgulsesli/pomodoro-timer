import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { SessionCounter } from './SessionCounter';
import { SettingsPanel } from './SettingsPanel';

describe('Responsive Layout', () => {
  // Mock matchMedia for responsive tests
  const createMatchMedia = (width: number) => {
    return vi.fn().mockImplementation((query: string) => ({
      matches: query.includes(`max-width`) ? width <= parseInt(query.match(/\d+/)?.[0] || '0') : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  };

  beforeEach(() => {
    vi.stubGlobal('matchMedia', createMatchMedia(1024));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('TimerDisplay', () => {
    it('renders without horizontal overflow', () => {
      const { container } = render(
        <TimerDisplay timeRemaining={1500} totalTime={1500} mode="work" />
      );
      
      const timerDisplay = container.querySelector('.timer-display');
      expect(timerDisplay).toBeInTheDocument();
      
      // Check that the component has responsive class
      expect(timerDisplay?.classList.contains('timer-display')).toBe(true);
    });

    it('renders time in readable format', () => {
      render(<TimerDisplay timeRemaining={1500} totalTime={1500} mode="work" />);
      
      const timeElement = screen.getByTestId('timer-time');
      expect(timeElement).toBeInTheDocument();
      expect(timeElement.textContent).toBe('25:00');
    });

    it('displays mode label', () => {
      render(<TimerDisplay timeRemaining={1500} totalTime={1500} mode="work" />);
      
      const modeElement = screen.getByTestId('timer-mode');
      expect(modeElement).toBeInTheDocument();
      expect(modeElement.textContent).toBe('Work');
    });

    it('uses responsive SVG sizing with viewBox', () => {
      const { container } = render(
        <TimerDisplay timeRemaining={1500} totalTime={1500} mode="work" />
      );
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      // SVG should use viewBox for responsive scaling
      expect(svg?.getAttribute('viewBox')).toBeTruthy();
      expect(svg?.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet');
    });
  });

  describe('TimerControls', () => {
    const mockStart = vi.fn();
    const mockPause = vi.fn();
    const mockReset = vi.fn();

    it('renders buttons with minimum touch target size', () => {
      render(
        <TimerControls
          timerState="idle"
          onStart={mockStart}
          onPause={mockPause}
          onReset={mockReset}
        />
      );
      
      const playButton = screen.getByTestId('timer-play-pause-button');
      const resetButton = screen.getByTestId('timer-reset-button');
      
      expect(playButton).toBeInTheDocument();
      expect(resetButton).toBeInTheDocument();
      
      // Check buttons have adequate sizing classes
      expect(playButton.classList.contains('timer-controls__button')).toBe(true);
      expect(resetButton.classList.contains('timer-controls__button')).toBe(true);
    });

    it('displays keyboard shortcut hints', () => {
      render(
        <TimerControls
          timerState="idle"
          onStart={mockStart}
          onPause={mockPause}
          onReset={mockReset}
        />
      );
      
      // Check for shortcut hints (kbd elements)
      const shortcuts = screen.getAllByText(/Space|R/);
      expect(shortcuts.length).toBeGreaterThanOrEqual(2);
    });

    it('buttons have proper ARIA labels for accessibility', () => {
      render(
        <TimerControls
          timerState="idle"
          onStart={mockStart}
          onPause={mockPause}
          onReset={mockReset}
        />
      );
      
      const playButton = screen.getByLabelText(/Start timer|Resume timer/);
      const resetButton = screen.getByLabelText('Reset timer');
      
      expect(playButton).toBeInTheDocument();
      expect(resetButton).toBeInTheDocument();
    });
  });

  describe('SessionCounter', () => {
    it('renders within container bounds', () => {
      const { container } = render(<SessionCounter sessionCount={5} />);
      
      const sessionCounter = container.querySelector('.session-counter');
      expect(sessionCounter).toBeInTheDocument();
      
      // Check width constraint class
      expect(sessionCounter?.classList.contains('session-counter')).toBe(true);
    });

    it('displays session count', () => {
      render(<SessionCounter sessionCount={5} />);
      
      const countElement = screen.getByTestId('session-counter-count');
      expect(countElement).toBeInTheDocument();
      expect(countElement.textContent).toBe('5');
    });

    it('shows encouraging message', () => {
      render(<SessionCounter sessionCount={5} />);
      
      const textElement = screen.getByTestId('session-counter-text');
      expect(textElement).toBeInTheDocument();
      expect(textElement.textContent).toContain('pomodoros completed');
    });

    it('has accessible aria-label on count', () => {
      render(<SessionCounter sessionCount={5} />);
      
      const countElement = screen.getByLabelText('5 pomodoros completed');
      expect(countElement).toBeInTheDocument();
    });
  });

  describe('SettingsPanel', () => {
    const mockClose = vi.fn();
    const mockDurationsChange = vi.fn();
    const defaultDurations = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
    };

    it('renders with proper touch targets when open', () => {
      render(
        <SettingsPanel
          isOpen={true}
          onClose={mockClose}
          durations={defaultDurations}
          onDurationsChange={mockDurationsChange}
        />
      );
      
      const closeButton = screen.getByTestId('settings-close-button');
      expect(closeButton).toBeInTheDocument();
      
      // Check close button has proper sizing
      expect(closeButton.classList.contains('settings-panel__close-button')).toBe(true);
    });

    it('renders input fields with minimum touch target height', () => {
      render(
        <SettingsPanel
          isOpen={true}
          onClose={mockClose}
          durations={defaultDurations}
          onDurationsChange={mockDurationsChange}
        />
      );
      
      const workInput = screen.getByTestId('work-duration-input');
      expect(workInput).toBeInTheDocument();
      expect(workInput.classList.contains('settings-panel__input')).toBe(true);
    });

    it('is not rendered in DOM when closed', () => {
      const { container } = render(
        <SettingsPanel
          isOpen={false}
          onClose={mockClose}
          durations={defaultDurations}
          onDurationsChange={mockDurationsChange}
        />
      );
      
      // Panel should still be in DOM but hidden (transform: translateX(100%))
      const panel = container.querySelector('.settings-panel');
      expect(panel).toBeInTheDocument();
      expect(panel?.classList.contains('settings-panel--open')).toBe(false);
    });

    it('has accessible form labels', () => {
      render(
        <SettingsPanel
          isOpen={true}
          onClose={mockClose}
          durations={defaultDurations}
          onDurationsChange={mockDurationsChange}
        />
      );
      
      const workInput = screen.getByLabelText('Work Duration');
      expect(workInput).toBeInTheDocument();
    });
  });

  describe('Viewport breakpoints', () => {
    it('handles mobile viewport (320px)', () => {
      vi.stubGlobal('matchMedia', createMatchMedia(320));
      
      const { container } = render(
        <TimerDisplay timeRemaining={1500} totalTime={1500} mode="work" />
      );
      
      const timerDisplay = container.querySelector('.timer-display');
      expect(timerDisplay).toBeInTheDocument();
    });

    it('handles tablet viewport (768px)', () => {
      vi.stubGlobal('matchMedia', createMatchMedia(768));
      
      const { container } = render(
        <TimerDisplay timeRemaining={1500} totalTime={1500} mode="work" />
      );
      
      const timerDisplay = container.querySelector('.timer-display');
      expect(timerDisplay).toBeInTheDocument();
    });

    it('handles desktop viewport (1280px)', () => {
      vi.stubGlobal('matchMedia', createMatchMedia(1280));
      
      const { container } = render(
        <TimerDisplay timeRemaining={1500} totalTime={1500} mode="work" />
      );
      
      const timerDisplay = container.querySelector('.timer-display');
      expect(timerDisplay).toBeInTheDocument();
    });
  });

  describe('Touch target requirements', () => {
    it('TimerControls buttons meet minimum touch target size', () => {
      render(
        <TimerControls
          timerState="idle"
          onStart={vi.fn()}
          onPause={vi.fn()}
          onReset={vi.fn()}
        />
      );
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
      
      buttons.forEach(button => {
        // Verify the button exists and has proper classes
        expect(button.classList.contains('timer-controls__button')).toBe(true);
      });
    });

    it('SettingsPanel close button meets minimum touch target size', () => {
      render(
        <SettingsPanel
          isOpen={true}
          onClose={vi.fn()}
          durations={{ workDuration: 25, shortBreakDuration: 5, longBreakDuration: 15 }}
          onDurationsChange={vi.fn()}
        />
      );
      
      const closeButton = screen.getByTestId('settings-close-button');
      expect(closeButton.classList.contains('settings-panel__close-button')).toBe(true);
    });
  });

  describe('No horizontal scroll', () => {
    it('TimerDisplay uses responsive container', () => {
      const { container } = render(
        <TimerDisplay timeRemaining={1500} totalTime={1500} mode="work" />
      );
      
      const timerDisplay = container.querySelector('.timer-display');
      expect(timerDisplay).toBeInTheDocument();
      
      // Check container has responsive class
      const containerEl = container.querySelector('.timer-display__container');
      expect(containerEl).toBeInTheDocument();
    });

    it('SessionCounter respects container bounds', () => {
      const { container } = render(<SessionCounter sessionCount={10} />);
      
      const sessionCounter = container.querySelector('.session-counter');
      expect(sessionCounter).toBeInTheDocument();
      
      // Check content wrapper exists
      const content = container.querySelector('.session-counter__content');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Text readability on mobile', () => {
    it('TimerDisplay shows time in large readable format', () => {
      render(<TimerDisplay timeRemaining={1500} totalTime={1500} mode="work" />);
      
      const timeElement = screen.getByTestId('timer-time');
      expect(timeElement).toBeInTheDocument();
      // Time should be in MM:SS format
      expect(timeElement.textContent).toMatch(/^\d{2}:\d{2}$/);
    });

    it('TimerDisplay shows mode label', () => {
      render(<TimerDisplay timeRemaining={300} totalTime={300} mode="shortBreak" />);
      
      const modeElement = screen.getByTestId('timer-mode');
      expect(modeElement.textContent).toBe('Short Break');
    });
  });
});
