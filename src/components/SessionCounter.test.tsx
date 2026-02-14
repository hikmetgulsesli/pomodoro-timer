import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SessionCounter } from './SessionCounter';

describe('SessionCounter', () => {
  const STORAGE_KEY = 'pomodoro-sessions';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('rendering', () => {
    it('renders the session counter component', () => {
      render(<SessionCounter sessionCount={0} />);
      
      expect(screen.getByTestId('session-counter')).toBeInTheDocument();
    });

    it('displays integer count', () => {
      render(<SessionCounter sessionCount={5} />);
      
      const countElement = screen.getByTestId('session-counter-count');
      expect(countElement).toHaveTextContent('5');
    });

    it('displays zero when no sessions completed', () => {
      render(<SessionCounter sessionCount={0} />);
      
      const countElement = screen.getByTestId('session-counter-count');
      expect(countElement).toHaveTextContent('0');
    });

    it('displays encouraging message for zero sessions', () => {
      render(<SessionCounter sessionCount={0} />);
      
      expect(screen.getByText('Start your first pomodoro!')).toBeInTheDocument();
    });

    it('displays correct message for single session', () => {
      render(<SessionCounter sessionCount={1} />);
      
      expect(screen.getByText('1 pomodoro completed')).toBeInTheDocument();
    });

    it('displays correct message for multiple sessions', () => {
      render(<SessionCounter sessionCount={3} />);
      
      expect(screen.getByText('3 pomodoros completed')).toBeInTheDocument();
    });

    it('displays motivational message for 4+ sessions', () => {
      render(<SessionCounter sessionCount={5} />);
      
      expect(screen.getByText('5 pomodoros completed - Great focus!')).toBeInTheDocument();
    });

    it('displays high achievement message for 8+ sessions', () => {
      render(<SessionCounter sessionCount={10} />);
      
      expect(screen.getByText('10 pomodoros completed - Amazing productivity!')).toBeInTheDocument();
    });
  });

  describe('localStorage persistence', () => {
    it('loads count from LocalStorage on mount', async () => {
      localStorage.setItem(STORAGE_KEY, '7');
      
      render(<SessionCounter sessionCount={0} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('session-counter-count')).toHaveTextContent('7');
      });
    });

    it('uses LocalStorage key "pomodoro-sessions"', () => {
      localStorage.setItem(STORAGE_KEY, '3');
      
      render(<SessionCounter sessionCount={0} />);
      
      expect(localStorage.getItem(STORAGE_KEY)).toBe('3');
    });

    it('persists count to LocalStorage when session completes', async () => {
      const { rerender } = render(<SessionCounter sessionCount={0} />);
      
      // Simulate a session completion by incrementing the prop
      rerender(<SessionCounter sessionCount={1} />);
      
      await waitFor(() => {
        expect(localStorage.getItem(STORAGE_KEY)).toBe('1');
      });
    });

    it('persists across page reloads via LocalStorage', async () => {
      // First render with some sessions
      const { unmount } = render(<SessionCounter sessionCount={5} />);
      
      // Manually set localStorage to simulate persistence
      localStorage.setItem(STORAGE_KEY, '5');
      
      unmount();
      
      // Re-render (simulating page reload)
      render(<SessionCounter sessionCount={0} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('session-counter-count')).toHaveTextContent('5');
      });
    });

    it('handles missing LocalStorage gracefully', async () => {
      // Simulate localStorage being unavailable
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn(() => {
        throw new Error('localStorage not available');
      });
      
      render(<SessionCounter sessionCount={0} />);
      
      // Should still render with count 0
      await waitFor(() => {
        expect(screen.getByTestId('session-counter-count')).toHaveTextContent('0');
      });
      
      localStorage.getItem = originalGetItem;
    });

    it('handles invalid stored values gracefully', async () => {
      localStorage.setItem(STORAGE_KEY, 'not-a-number');
      
      render(<SessionCounter sessionCount={0} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('session-counter-count')).toHaveTextContent('0');
      });
    });

    it('handles negative stored values gracefully', async () => {
      localStorage.setItem(STORAGE_KEY, '-5');
      
      render(<SessionCounter sessionCount={0} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('session-counter-count')).toHaveTextContent('0');
      });
    });
  });

  describe('counter increment behavior', () => {
    it('counter increments when work session completes', async () => {
      const { rerender } = render(<SessionCounter sessionCount={0} />);
      
      // Initial state
      await waitFor(() => {
        expect(screen.getByTestId('session-counter-count')).toHaveTextContent('0');
      });
      
      // Simulate session completion
      rerender(<SessionCounter sessionCount={1} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('session-counter-count')).toHaveTextContent('1');
      });
    });

    it('updates LocalStorage on each completion', async () => {
      const { rerender } = render(<SessionCounter sessionCount={0} />);
      
      rerender(<SessionCounter sessionCount={1} />);
      await waitFor(() => {
        expect(localStorage.getItem(STORAGE_KEY)).toBe('1');
      });
      
      rerender(<SessionCounter sessionCount={2} />);
      await waitFor(() => {
        expect(localStorage.getItem(STORAGE_KEY)).toBe('2');
      });
    });

    it('calls onSessionComplete callback when count increments', async () => {
      const onSessionComplete = vi.fn();
      const { rerender } = render(
        <SessionCounter sessionCount={0} onSessionComplete={onSessionComplete} />
      );
      
      rerender(<SessionCounter sessionCount={1} onSessionComplete={onSessionComplete} />);
      
      await waitFor(() => {
        expect(onSessionComplete).toHaveBeenCalledWith(1);
      });
    });

    it('does not decrement when sessionCount decreases', async () => {
      const { rerender } = render(<SessionCounter sessionCount={5} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('session-counter-count')).toHaveTextContent('5');
      });
      
      // Try to decrease (should not affect display)
      rerender(<SessionCounter sessionCount={3} />);
      
      // Count should remain at 5
      expect(screen.getByTestId('session-counter-count')).toHaveTextContent('5');
    });
  });

  describe('accessibility', () => {
    it('has aria-live for screen reader announcements', () => {
      render(<SessionCounter sessionCount={0} />);
      
      const counter = screen.getByTestId('session-counter');
      expect(counter).toHaveAttribute('aria-live', 'polite');
    });

    it('has aria-label on count for screen readers', async () => {
      render(<SessionCounter sessionCount={3} />);
      
      await waitFor(() => {
        const countElement = screen.getByTestId('session-counter-count');
        expect(countElement).toHaveAttribute('aria-label', '3 pomodoros completed');
      });
    });

    it('marks icon as aria-hidden', () => {
      render(<SessionCounter sessionCount={0} />);
      
      const icon = document.querySelector('.session-counter__icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('visual elements', () => {
    it('renders CheckCircle2 icon', () => {
      render(<SessionCounter sessionCount={0} />);
      
      const icon = document.querySelector('.session-counter__icon');
      expect(icon).toBeInTheDocument();
    });

    it('has hover state styles', () => {
      render(<SessionCounter sessionCount={0} />);
      
      const counter = screen.getByTestId('session-counter');
      expect(counter).toHaveClass('session-counter');
    });
  });
});
