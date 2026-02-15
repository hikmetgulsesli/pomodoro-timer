import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimerControls } from './TimerControls';
import type { TimerState } from '../hooks/useTimer';

describe('TimerControls', () => {
  const mockOnStart = vi.fn();
  const mockOnPause = vi.fn();
  const mockOnReset = vi.fn();

  const renderTimerControls = (timerState: TimerState) => {
    return render(
      <TimerControls
        timerState={timerState}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onReset={mockOnReset}
      />
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Play/Pause Button', () => {
    it('renders Play icon and "Start" label when timer is idle', () => {
      renderTimerControls('idle');

      const playPauseButton = screen.getByTestId('timer-play-pause-button');
      expect(playPauseButton).toBeInTheDocument();
      expect(playPauseButton).toHaveTextContent('Start');
      expect(playPauseButton).toHaveAttribute('aria-label', 'Start timer');
      
      // Check for keyboard shortcut hint
      expect(playPauseButton).toHaveTextContent('Space');
    });

    it('renders Play icon and "Resume" label when timer is paused', () => {
      renderTimerControls('paused');

      const playPauseButton = screen.getByTestId('timer-play-pause-button');
      expect(playPauseButton).toBeInTheDocument();
      expect(playPauseButton).toHaveTextContent('Resume');
      expect(playPauseButton).toHaveAttribute('aria-label', 'Start timer');
    });

    it('renders Pause icon and "Pause" label when timer is running', () => {
      renderTimerControls('running');

      const playPauseButton = screen.getByTestId('timer-play-pause-button');
      expect(playPauseButton).toBeInTheDocument();
      expect(playPauseButton).toHaveTextContent('Pause');
      expect(playPauseButton).toHaveAttribute('aria-label', 'Pause timer');
    });

    it('calls onStart when clicked while idle', () => {
      renderTimerControls('idle');

      const playPauseButton = screen.getByTestId('timer-play-pause-button');
      fireEvent.click(playPauseButton);

      expect(mockOnStart).toHaveBeenCalledTimes(1);
      expect(mockOnPause).not.toHaveBeenCalled();
    });

    it('calls onStart when clicked while paused', () => {
      renderTimerControls('paused');

      const playPauseButton = screen.getByTestId('timer-play-pause-button');
      fireEvent.click(playPauseButton);

      expect(mockOnStart).toHaveBeenCalledTimes(1);
      expect(mockOnPause).not.toHaveBeenCalled();
    });

    it('calls onPause when clicked while running', () => {
      renderTimerControls('running');

      const playPauseButton = screen.getByTestId('timer-play-pause-button');
      fireEvent.click(playPauseButton);

      expect(mockOnPause).toHaveBeenCalledTimes(1);
      expect(mockOnStart).not.toHaveBeenCalled();
    });

    it('toggles correctly when state changes', () => {
      const { rerender } = renderTimerControls('idle');

      const playPauseButton = screen.getByTestId('timer-play-pause-button');
      expect(playPauseButton).toHaveTextContent('Start');

      // Change to running
      rerender(
        <TimerControls
          timerState="running"
          onStart={mockOnStart}
          onPause={mockOnPause}
          onReset={mockOnReset}
        />
      );
      expect(playPauseButton).toHaveTextContent('Pause');

      // Change to paused
      rerender(
        <TimerControls
          timerState="paused"
          onStart={mockOnStart}
          onPause={mockOnPause}
          onReset={mockOnReset}
        />
      );
      expect(playPauseButton).toHaveTextContent('Resume');
    });
  });

  describe('Reset Button', () => {
    it('renders Reset button with rotate-left icon', () => {
      renderTimerControls('idle');

      const resetButton = screen.getByTestId('timer-reset-button');
      expect(resetButton).toBeInTheDocument();
      expect(resetButton).toHaveTextContent('Reset');
      expect(resetButton).toHaveAttribute('aria-label', 'Reset timer');
      
      // Check for keyboard shortcut hint
      expect(resetButton).toHaveTextContent('R');
    });

    it('calls onReset when clicked', () => {
      renderTimerControls('running');

      const resetButton = screen.getByTestId('timer-reset-button');
      fireEvent.click(resetButton);

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it('calls onReset when clicked while idle', () => {
      renderTimerControls('idle');

      const resetButton = screen.getByTestId('timer-reset-button');
      fireEvent.click(resetButton);

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it('calls onReset when clicked while paused', () => {
      renderTimerControls('paused');

      const resetButton = screen.getByTestId('timer-reset-button');
      fireEvent.click(resetButton);

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has correct button types', () => {
      renderTimerControls('idle');

      const playPauseButton = screen.getByTestId('timer-play-pause-button');
      const resetButton = screen.getByTestId('timer-reset-button');

      expect(playPauseButton).toHaveAttribute('type', 'button');
      expect(resetButton).toHaveAttribute('type', 'button');
    });

    it('has aria-labels for screen readers', () => {
      renderTimerControls('idle');

      const playPauseButton = screen.getByTestId('timer-play-pause-button');
      const resetButton = screen.getByTestId('timer-reset-button');

      expect(playPauseButton).toHaveAttribute('aria-label');
      expect(resetButton).toHaveAttribute('aria-label');
    });

    it('hides icons from screen readers with aria-hidden', () => {
      renderTimerControls('idle');

      // Lucide icons are SVG elements with aria-hidden attribute
      const svgs = document.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgs.length).toBeGreaterThan(0);
      svgs.forEach(svg => {
        expect(svg).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Styling', () => {
    it('has primary button styling for play/pause', () => {
      renderTimerControls('idle');

      const playPauseButton = screen.getByTestId('timer-play-pause-button');
      expect(playPauseButton).toHaveClass('timer-controls__button--primary');
    });

    it('has secondary button styling for reset', () => {
      renderTimerControls('idle');

      const resetButton = screen.getByTestId('timer-reset-button');
      expect(resetButton).toHaveClass('timer-controls__button--secondary');
    });
  });
});
