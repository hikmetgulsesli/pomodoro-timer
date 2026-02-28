import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTheme, THEME_STORAGE_KEY } from './useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    // Reset document theme attribute
    document.documentElement.removeAttribute('data-theme');
    
    // Reset localStorage mock to default behavior
    const store: Record<string, string> = {};
    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          Object.keys(store).forEach(key => delete store[key]);
        }),
        length: 0,
        key: vi.fn(),
      },
    });
    
    // Reset matchMedia mock
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('defaults to light theme', async () => {
      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });
    });

    it('loads theme from localStorage', async () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');

      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
      });
    });

    it('respects system dark mode preference', async () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
      });
    });

    it('prefers localStorage over system preference', async () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light');

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });
    });

    it('falls back to light on localStorage error', async () => {
      // Mock localStorage.getItem to throw
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });
    });
  });

  describe('theme toggling', () => {
    it('toggles from light to dark', async () => {
      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });

    it('toggles from dark to light', async () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');

      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.isDark).toBe(false);
    });

    it('setTheme sets theme directly', async () => {
      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
    });
  });

  describe('localStorage persistence', () => {
    it('saves theme to localStorage when toggled', async () => {
      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    });

    it('saves theme to localStorage when setTheme is called', async () => {
      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    });

    it('gracefully handles localStorage save errors', async () => {
      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      // Mock localStorage.setItem to throw
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage error');
      });

      // Should not throw
      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');
    });

    it('ignores invalid stored theme values', async () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'invalid-theme');

      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        // Should fall back to system preference or light
        expect(['light', 'dark']).toContain(result.current.theme);
      });
    });
  });

  describe('DOM integration', () => {
    it('sets data-theme attribute on document element for dark mode', async () => {
      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      act(() => {
        result.current.toggleTheme();
      });

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });
    });

    it('removes data-theme attribute for light mode', async () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');

      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });

      act(() => {
        result.current.toggleTheme();
      });

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBeNull();
      });
    });
  });

  describe('system preference changes', () => {
    it('listens for system preference changes', async () => {
      const addEventListenerMock = vi.fn();
      const removeEventListenerMock = vi.fn();

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addEventListener: addEventListenerMock,
          removeEventListener: removeEventListenerMock,
          dispatchEvent: vi.fn(),
        })),
      });

      const { unmount } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
      });

      unmount();

      expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('updates theme when system preference changes and no user preference stored', async () => {
      let changeHandler: ((e: { matches: boolean }) => void) | null = null;

      // Create a mock localStorage that returns null for getItem (no stored preference)
      const mockGetItem = vi.fn(() => null);
      const mockSetItem = vi.fn();

      Object.defineProperty(window, 'localStorage', {
        writable: true,
        value: {
          getItem: mockGetItem,
          setItem: mockSetItem,
          removeItem: vi.fn(),
          clear: vi.fn(),
          length: 0,
          key: vi.fn(),
        },
      });

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addEventListener: (event: string, handler: (e: { matches: boolean }) => void) => {
            if (event === 'change') {
              changeHandler = handler;
            }
          },
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      // Simulate system preference change to dark
      // The handler should update theme since getItem returns null (no stored preference)
      act(() => {
        if (changeHandler) {
          changeHandler({ matches: true });
        }
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
      });
    });

    it('does not update theme on system change if user preference is stored', async () => {
      // Create a mock localStorage that returns 'light' for getItem (user preference stored)
      const mockGetItem = vi.fn((key: string) => {
        if (key === THEME_STORAGE_KEY) return 'light';
        return null;
      });
      const mockSetItem = vi.fn();

      Object.defineProperty(window, 'localStorage', {
        writable: true,
        value: {
          getItem: mockGetItem,
          setItem: mockSetItem,
          removeItem: vi.fn(),
          clear: vi.fn(),
          length: 0,
          key: vi.fn(),
        },
      });

      let changeHandler: ((e: { matches: boolean }) => void) | null = null;

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addEventListener: (event: string, handler: (e: { matches: boolean }) => void) => {
            if (event === 'change') {
              changeHandler = handler;
            }
          },
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      // Simulate system preference change to dark
      act(() => {
        if (changeHandler) {
          changeHandler({ matches: true });
        }
      });

      // Should remain light because user preference is stored
      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });
    });
  });

  describe('theme-toggle tests', () => {
    it('theme toggle button visible in UI - hook provides theme state', async () => {
      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.theme).toBeDefined();
        expect(result.current.toggleTheme).toBeDefined();
        expect(result.current.isDark).toBeDefined();
      });
    });

    it('sun icon shows in light mode, moon in dark mode - isDark reflects correctly', async () => {
      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      expect(result.current.isDark).toBe(false);

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.isDark).toBe(true);
    });

    it('clicking toggles between light and dark themes', async () => {
      // Reset document theme
      document.documentElement.removeAttribute('data-theme');
      localStorage.clear();
      
      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
    });

    it('theme persists across page reloads via LocalStorage', async () => {
      // Create a mock localStorage that actually stores values
      const store: Record<string, string> = {};
      const mockGetItem = vi.fn((key: string) => store[key] || null);
      const mockSetItem = vi.fn((key: string, value: string) => {
        store[key] = value;
      });

      Object.defineProperty(window, 'localStorage', {
        writable: true,
        value: {
          getItem: mockGetItem,
          setItem: mockSetItem,
          removeItem: vi.fn(),
          clear: vi.fn(),
          length: 0,
          key: vi.fn(),
        },
      });

      // Reset document theme
      document.documentElement.removeAttribute('data-theme');
      
      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(mockSetItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'dark');
      expect(store[THEME_STORAGE_KEY]).toBe('dark');

      // Simulate page reload by creating a new hook instance
      // Reset document theme to simulate fresh page load
      document.documentElement.removeAttribute('data-theme');
      
      const { result: result2 } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result2.current.theme).toBe('dark');
      });
    });

    it('dark mode colors use proper CSS variables - data-theme attribute set', async () => {
      // Reset document theme
      document.documentElement.removeAttribute('data-theme');
      localStorage.clear();
      
      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      expect(document.documentElement.getAttribute('data-theme')).toBeNull();

      act(() => {
        result.current.toggleTheme();
      });

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });
    });

    it('respects system preference on first visit', async () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
      });
    });
  });
});
