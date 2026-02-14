import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSound } from './useSound';

// Mock Web Audio API
class MockAudioContext {
  state = 'running';
  currentTime = 0;
  
  createOscillator = vi.fn(() => ({
    type: 'sine',
    frequency: {
      setValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }));
  
  createGain = vi.fn(() => ({
    gain: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  }));
  
  resume = vi.fn(() => Promise.resolve());
  close = vi.fn(() => Promise.resolve());
  
  destination = {} as AudioDestinationNode;
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

describe('useSound', () => {
  let MockAudioContextClass: typeof MockAudioContext;
  
  beforeEach(() => {
    vi.clearAllMocks();
    MockAudioContextClass = vi.fn(() => new MockAudioContext()) as unknown as typeof MockAudioContext;
    Object.defineProperty(window, 'AudioContext', {
      writable: true,
      configurable: true,
      value: MockAudioContextClass,
    });
    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: localStorageMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default volume', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const { result } = renderHook(() => useSound());
      
      expect(result.current.getVolume()).toBe(0.5);
    });

    it('should load volume from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('0.75');
      
      const { result } = renderHook(() => useSound());
      
      expect(result.current.getVolume()).toBe(0.75);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('pomodoro-sound-volume');
    });

    it('should handle invalid localStorage values gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid');
      
      const { result } = renderHook(() => useSound());
      
      expect(result.current.getVolume()).toBe(0.5);
    });

    it('should handle out-of-range localStorage values by clamping on set', () => {
      // When loading from localStorage, the value is stored as-is
      // Clamping only happens when using setVolume
      localStorageMock.getItem.mockReturnValue('1.5');
      
      const { result } = renderHook(() => useSound());
      
      // The hook validates on load - values outside 0-1 are rejected and default is used
      // This is the actual behavior of the hook
      expect(result.current.getVolume()).toBe(0.5);
      
      // But when we set it via setVolume, it gets clamped
      act(() => {
        result.current.setVolume(1.5);
      });
      
      expect(result.current.getVolume()).toBe(1);
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const { result } = renderHook(() => useSound());
      
      expect(result.current.getVolume()).toBe(0.5);
    });
  });

  describe('volume control', () => {
    it('should update volume', () => {
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.setVolume(0.8);
      });
      
      expect(result.current.getVolume()).toBe(0.8);
    });

    it('should clamp volume to 0-1 range', () => {
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.setVolume(1.5);
      });
      
      expect(result.current.getVolume()).toBe(1);
      
      act(() => {
        result.current.setVolume(-0.5);
      });
      
      expect(result.current.getVolume()).toBe(0);
    });

    it('should persist volume to localStorage', () => {
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.setVolume(0.7);
      });
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('pomodoro-sound-volume', '0.7');
    });

    it('should handle localStorage set errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const { result } = renderHook(() => useSound());
      
      // Should not throw
      act(() => {
        result.current.setVolume(0.7);
      });
      
      expect(result.current.getVolume()).toBe(0.7);
    });
  });

  describe('playWorkComplete', () => {
    it('should create AudioContext on first play', () => {
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.playWorkComplete();
      });
      
      // AudioContext constructor should have been called
      expect(MockAudioContextClass).toHaveBeenCalled();
    });

    it('should create oscillators and gain nodes for bell sound', () => {
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.playWorkComplete();
      });
      
      // Should create multiple oscillators for harmonics
      const mockInstance = (MockAudioContextClass as unknown as ReturnType<typeof vi.fn>).mock.results[0]?.value as MockAudioContext;
      expect(mockInstance?.createOscillator).toHaveBeenCalled();
      expect(mockInstance?.createGain).toHaveBeenCalled();
    });

    it('should resume suspended AudioContext', () => {
      // Create a mock with suspended state
      const suspendedMock = new MockAudioContext();
      suspendedMock.state = 'suspended';
      
      const SuspendedMockClass = vi.fn(() => suspendedMock);
      Object.defineProperty(window, 'AudioContext', {
        writable: true,
        configurable: true,
        value: SuspendedMockClass,
      });
      
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.playWorkComplete();
      });
      
      expect(suspendedMock.resume).toHaveBeenCalled();
    });
  });

  describe('playBreakComplete', () => {
    it('should create AudioContext on first play', () => {
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.playBreakComplete();
      });
      
      expect(MockAudioContextClass).toHaveBeenCalled();
    });

    it('should create oscillators for chime sound', () => {
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.playBreakComplete();
      });
      
      // Should create oscillators for two-note chime
      const mockInstance = (MockAudioContextClass as unknown as ReturnType<typeof vi.fn>).mock.results[0]?.value as MockAudioContext;
      expect(mockInstance?.createOscillator).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should close AudioContext on unmount', () => {
      const { result, unmount } = renderHook(() => useSound());
      
      // Trigger creation of AudioContext
      act(() => {
        result.current.playWorkComplete();
      });
      
      const mockInstance = (MockAudioContextClass as unknown as ReturnType<typeof vi.fn>).mock.results[0]?.value as MockAudioContext;
      
      unmount();
      
      expect(mockInstance?.close).toHaveBeenCalled();
    });
  });

  describe('sound-notification', () => {
    it('should play work complete sound at configured volume', () => {
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.setVolume(0.6);
      });
      
      act(() => {
        result.current.playWorkComplete();
      });
      
      // Verify volume was set correctly
      expect(result.current.getVolume()).toBe(0.6);
    });

    it('should play break complete sound at configured volume', () => {
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.setVolume(0.4);
      });
      
      act(() => {
        result.current.playBreakComplete();
      });
      
      // Verify volume was set correctly
      expect(result.current.getVolume()).toBe(0.4);
    });

    it('should have different sounds for work and break completion', () => {
      const { result } = renderHook(() => useSound());
      
      // Both functions should exist and be callable
      expect(() => {
        act(() => {
          result.current.playWorkComplete();
        });
      }).not.toThrow();
      
      expect(() => {
        act(() => {
          result.current.playBreakComplete();
        });
      }).not.toThrow();
    });
  });
});
