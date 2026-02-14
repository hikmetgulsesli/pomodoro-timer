import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimerControls } from './TimerControls';
import type { TimerState } from '../hooks/useTimer';

describe('TimerControls', () => {
  const defaultProps = {
    timerState: 'idle' as TimerState,
    onStart: vi.fn(),
    onPause: vi.fn(),
    onReset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the component', () => {
      render(<TimerControls {...defaultProps} />);
      expect(screen.getByTestId('timer-controls')).toBeInTheDocument();
    });

    it('renders play/pause button', () => {
      render(<TimerControls {...defaultProps} />);
      expect(screen.getByTestId('play-pause-button')).toBeInTheDocument();
    });

    it('renders reset button', () => {
      render(<TimerControls {...defaultProps} />);
      expect(screen.getByTestId('reset-button')).toBeInTheDocument();
    });
  });

  describe('Play/Pause Button States', () => {
    it('shows Play icon and "Start" label when idle', () => {
      render(<TimerControls {...defaultProps} timerState="idle" />);
      
      const button = screen.getByTestId('play-pause-button');
      expect(button).toHaveAttribute('aria-label', 'Start timer');
      expect(button).toHaveTextContent('Start');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('shows Play icon and "Resume" label when paused', () => {
      render(<TimerControls {...defaultProps} timerState="paused" />);
      
      const button = screen.getByTestId('play-pause-button');
      expect(button).toHaveAttribute('aria-label', 'Start timer');
      expect(button).toHaveTextContent('Resume');
    });

    it('shows Pause icon and "Pause" label when running', () => {
      render(<TimerControls {...defaultProps} timerState="running" />);
      
      const button = screen.getByTestId('play-pause-button');
      expect(button).toHaveAttribute('aria-label', 'Pause timer');
      expect(button).toHaveTextContent('Pause');
    });
  });

  describe('Button Interactions', () => {
    it('calls onStart when play button clicked while idle', () => {
      render(<TimerControls {...defaultProps} timerState="idle" />);
      
      fireEvent.click(screen.getByTestId('play-pause-button'));
      expect(defaultProps.onStart).toHaveBeenCalledTimes(1);
      expect(defaultProps.onPause).not.toHaveBeenCalled();
    });

    it('calls onStart when play button clicked while paused', () => {
      render(<TimerControls {...defaultProps} timerState="paused" />);
      
      fireEvent.click(screen.getByTestId('play-pause-button'));
      expect(defaultProps.onStart).toHaveBeenCalledTimes(1);
      expect(defaultProps.onPause).not.toHaveBeenCalled();
    });

    it('calls onPause when pause button clicked while running', () => {
      render(<TimerControls {...defaultProps} timerState="running" />);
      
      fireEvent.click(screen.getByTestId('play-pause-button'));
      expect(defaultProps.onPause).toHaveBeenCalledTimes(1);
      expect(defaultProps.onStart).not.toHaveBeenCalled();
    });

    it('calls onReset when reset button clicked', () => {
      render(<TimerControls {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('reset-button'));
      expect(defaultProps.onReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Reset Button', () => {
    it('shows rotate-left icon', () => {
      render(<TimerControls {...defaultProps} />);
      
      const button = screen.getByTestId('reset-button');
      expect(button).toHaveAttribute('aria-label', 'Reset timer');
      expect(button).toHaveTextContent('Reset');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('calls onReset when clicked in any state', () => {
      const states: TimerState[] = ['idle', 'running', 'paused'];
      
      states.forEach((state) => {
        const onReset = vi.fn();
        const { unmount } = render(
          <TimerControls {...defaultProps} timerState={state} onReset={onReset} />
        );
        
        fireEvent.click(screen.getByTestId('reset-button'));
        expect(onReset).toHaveBeenCalledTimes(1);
        
        unmount();
      });
    });
  });

  describe('Keyboard Shortcuts Display', () => {
    it('displays Space shortcut hint on play/pause button', () => {
      render(<TimerControls {...defaultProps} />);
      
      const button = screen.getByTestId('play-pause-button');
      expect(button).toHaveTextContent('Space');
    });

    it('displays R shortcut hint on reset button', () => {
      render(<TimerControls {...defaultProps} />);
      
      const button = screen.getByTestId('reset-button');
      expect(button).toHaveTextContent('R');
    });
  });

  describe('Accessibility', () => {
    it('has correct aria-label for play button', () => {
      const { rerender } = render(<TimerControls {...defaultProps} timerState="idle" />);
      
      expect(screen.getByTestId('play-pause-button')).toHaveAttribute('aria-label', 'Start timer');
      
      rerender(<TimerControls {...defaultProps} timerState="running" />);
      expect(screen.getByTestId('play-pause-button')).toHaveAttribute('aria-label', 'Pause timer');
    });

    it('has correct aria-label for reset button', () => {
      render(<TimerControls {...defaultProps} />);
      
      expect(screen.getByTestId('reset-button')).toHaveAttribute('aria-label', 'Reset timer');
    });

    it('icons have aria-hidden attribute', () => {
      render(<TimerControls {...defaultProps} />);
      
      const icons = document.querySelectorAll('svg');
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('buttons are focusable', () => {
      render(<TimerControls {...defaultProps} />);
      
      const playButton = screen.getByTestId('play-pause-button');
      const resetButton = screen.getByTestId('reset-button');
      
      playButton.focus();
      expect(document.activeElement).toBe(playButton);
      
      resetButton.focus();
      expect(document.activeElement).toBe(resetButton);
    });
  });
});
