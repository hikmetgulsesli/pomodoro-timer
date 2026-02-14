import { useEffect, useCallback, useRef } from 'react';
import type { TimerState } from './useTimer';

export interface UseKeyboardShortcutsOptions {
  /** Current timer state to determine appropriate actions */
  timerState: TimerState;
  /** Callback to start the timer */
  onStart: () => void;
  /** Callback to pause the timer */
  onPause: () => void;
  /** Callback to reset the timer */
  onReset: () => void;
  /** Whether keyboard shortcuts are enabled (default: true) */
  enabled?: boolean;
}

export interface UseKeyboardShortcutsReturn {
  /** Whether keyboard shortcuts are currently active */
  isActive: boolean;
}

/**
 * Hook that provides global keyboard shortcuts for the Pomodoro timer.
 * 
 * Shortcuts:
 * - Space: Toggle between start and pause
 * - R: Reset timer to current mode's initial time
 * 
 * Shortcuts are disabled when the user is focused on input elements
 * to prevent interference with typing.
 */
export function useKeyboardShortcuts(
  options: UseKeyboardShortcutsOptions
): UseKeyboardShortcutsReturn {
  const { enabled = true } = options;

  // Use refs to avoid re-attaching listeners on every render
  const optionsRef = useRef(options);
  
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const isInputElement = useCallback((element: Element | null): boolean => {
    if (!element) return false;
    
    const tagName = element.tagName.toLowerCase();
    const inputTypes = ['input', 'textarea', 'select'];
    const isContentEditable = element.getAttribute('contenteditable') === 'true';
    
    return inputTypes.includes(tagName) || isContentEditable;
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { timerState, onStart, onPause, onReset, enabled } = optionsRef.current;
    
    if (!enabled) return;
    
    // Don't trigger shortcuts when user is typing in an input field
    if (isInputElement(document.activeElement)) {
      return;
    }

    const key = event.key.toLowerCase();

    switch (key) {
      case ' ': // Space key
      case 'spacebar': // Legacy IE
        event.preventDefault(); // Prevent page scroll
        if (timerState === 'running') {
          onPause();
        } else {
          onStart();
        }
        break;

      case 'r':
        event.preventDefault();
        onReset();
        break;

      default:
        // Ignore other keys
        break;
    }
  }, [isInputElement]);

  useEffect(() => {
    if (!enabled) return;

    // Add global keydown listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount or when disabled
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return {
    isActive: enabled,
  };
}

export default useKeyboardShortcuts;
