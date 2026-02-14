import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts, type UseKeyboardShortcutsOptions } from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  const mockOnStart = vi.fn();
  const mockOnPause = vi.fn();
  const mockOnReset = vi.fn();

  const defaultOptions: UseKeyboardShortcutsOptions = {
    timerState: 'idle',
    onStart: mockOnStart,
    onPause: mockOnPause,
    onReset: mockOnReset,
    enabled: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any event listeners
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should return isActive as true when enabled', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(defaultOptions));
      expect(result.current.isActive).toBe(true);
    });

    it('should return isActive as false when disabled', () => {
      const { result } = renderHook(() =>
        useKeyboardShortcuts({ ...defaultOptions, enabled: false })
      );
      expect(result.current.isActive).toBe(false);
    });
  });

  describe('Space key - start/pause toggle', () => {
    it('should call onStart when Space is pressed and timer is idle', () => {
      renderHook(() => useKeyboardShortcuts({ ...defaultOptions, timerState: 'idle' }));
      
      const event = new KeyboardEvent('keydown', { key: ' ' });
      window.dispatchEvent(event);
      
      expect(mockOnStart).toHaveBeenCalledTimes(1);
      expect(mockOnPause).not.toHaveBeenCalled();
    });

    it('should call onStart when Space is pressed and timer is paused', () => {
      renderHook(() => useKeyboardShortcuts({ ...defaultOptions, timerState: 'paused' }));
      
      const event = new KeyboardEvent('keydown', { key: ' ' });
      window.dispatchEvent(event);
      
      expect(mockOnStart).toHaveBeenCalledTimes(1);
      expect(mockOnPause).not.toHaveBeenCalled();
    });

    it('should call onPause when Space is pressed and timer is running', () => {
      renderHook(() => useKeyboardShortcuts({ ...defaultOptions, timerState: 'running' }));
      
      const event = new KeyboardEvent('keydown', { key: ' ' });
      window.dispatchEvent(event);
      
      expect(mockOnPause).toHaveBeenCalledTimes(1);
      expect(mockOnStart).not.toHaveBeenCalled();
    });

    it('should prevent default on Space to avoid page scroll', () => {
      renderHook(() => useKeyboardShortcuts(defaultOptions));
      
      const event = new KeyboardEvent('keydown', { key: ' ', cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should handle "spacebar" key for legacy IE compatibility', () => {
      renderHook(() => useKeyboardShortcuts({ ...defaultOptions, timerState: 'idle' }));
      
      const event = new KeyboardEvent('keydown', { key: 'spacebar' });
      window.dispatchEvent(event);
      
      expect(mockOnStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('R key - reset timer', () => {
    it('should call onReset when R is pressed', () => {
      renderHook(() => useKeyboardShortcuts(defaultOptions));
      
      const event = new KeyboardEvent('keydown', { key: 'r' });
      window.dispatchEvent(event);
      
      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it('should call onReset when uppercase R is pressed', () => {
      renderHook(() => useKeyboardShortcuts(defaultOptions));
      
      const event = new KeyboardEvent('keydown', { key: 'R' });
      window.dispatchEvent(event);
      
      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it('should prevent default on R key', () => {
      renderHook(() => useKeyboardShortcuts(defaultOptions));
      
      const event = new KeyboardEvent('keydown', { key: 'r', cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('input field focus handling', () => {
    it('should not trigger shortcuts when input element is focused', () => {
      // Create and focus an input element
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      renderHook(() => useKeyboardShortcuts(defaultOptions));
      
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      window.dispatchEvent(spaceEvent);
      
      const rEvent = new KeyboardEvent('keydown', { key: 'r' });
      window.dispatchEvent(rEvent);
      
      expect(mockOnStart).not.toHaveBeenCalled();
      expect(mockOnReset).not.toHaveBeenCalled();

      // Cleanup
      document.body.removeChild(input);
    });

    it('should not trigger shortcuts when textarea is focused', () => {
      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.focus();

      renderHook(() => useKeyboardShortcuts(defaultOptions));
      
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      window.dispatchEvent(spaceEvent);
      
      expect(mockOnStart).not.toHaveBeenCalled();

      // Cleanup
      document.body.removeChild(textarea);
    });

    it('should not trigger shortcuts when select is focused', () => {
      const select = document.createElement('select');
      document.body.appendChild(select);
      select.focus();

      renderHook(() => useKeyboardShortcuts(defaultOptions));
      
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      window.dispatchEvent(spaceEvent);
      
      expect(mockOnStart).not.toHaveBeenCalled();

      // Cleanup
      document.body.removeChild(select);
    });

    it('should not trigger shortcuts when contenteditable element is focused', () => {
      const div = document.createElement('div');
      div.setAttribute('contenteditable', 'true');
      document.body.appendChild(div);
      div.focus();

      renderHook(() => useKeyboardShortcuts(defaultOptions));
      
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      window.dispatchEvent(spaceEvent);
      
      expect(mockOnStart).not.toHaveBeenCalled();

      // Cleanup
      document.body.removeChild(div);
    });

    it('should trigger shortcuts when non-input element is focused', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);
      button.focus();

      renderHook(() => useKeyboardShortcuts(defaultOptions));
      
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      window.dispatchEvent(spaceEvent);
      
      expect(mockOnStart).toHaveBeenCalledTimes(1);

      // Cleanup
      document.body.removeChild(button);
    });
  });

  describe('enabled/disabled state', () => {
    it('should not trigger shortcuts when disabled', () => {
      renderHook(() =>
        useKeyboardShortcuts({ ...defaultOptions, enabled: false })
      );
      
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      window.dispatchEvent(spaceEvent);
      
      const rEvent = new KeyboardEvent('keydown', { key: 'r' });
      window.dispatchEvent(rEvent);
      
      expect(mockOnStart).not.toHaveBeenCalled();
      expect(mockOnReset).not.toHaveBeenCalled();
    });
  });

  describe('other keys', () => {
    it('should ignore keys other than Space and R', () => {
      renderHook(() => useKeyboardShortcuts(defaultOptions));
      
      const keys = ['a', 'b', 'c', 'Enter', 'Escape', 'Tab', 'ArrowUp', '1', '2'];
      
      keys.forEach(key => {
        const event = new KeyboardEvent('keydown', { key });
        window.dispatchEvent(event);
      });
      
      expect(mockOnStart).not.toHaveBeenCalled();
      expect(mockOnPause).not.toHaveBeenCalled();
      expect(mockOnReset).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHook(() => useKeyboardShortcuts(defaultOptions));
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});
