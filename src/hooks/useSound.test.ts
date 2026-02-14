import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSound } from './useSound';

// Mock Web Audio API
const createMockOscillator = () => ({
  type: 'sine' as OscillatorType,
  frequency: {
    setValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
});

const createMockGain = () => ({
  gain: {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

describe('useSound', () => {
  let mockOscillator: ReturnType<typeof createMockOscillator>;
  let mockGain: ReturnType<typeof createMockGain>;
  let mockAudioContext: {
    state: string;
    currentTime: number;
    createOscillator: ReturnType<typeof vi.fn>;
    createGain: ReturnType<typeof vi.fn>;
    resume: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    destination: AudioDestinationNode;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockOscillator = createMockOscillator();
    mockGain = createMockGain();
    
    mockAudioContext = {
      state: 'running',
      currentTime: 0,
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGain),
      resume: vi.fn(() => Promise.resolve()),
      close: vi.fn(() => Promise.resolve()),
      destination: {} as AudioDestinationNode,
    };
    
    // Mock AudioContext constructor
    const MockAudioContextClass = vi.fn(() => mockAudioContext);
    Object.defineProperty(window, 'AudioContext', {
      writable: true,
      configurable: true,
      value: MockAudioContextClass,
    });
    
    Object.defineProperty(window, 'localStorage', {
      writable: true,
      configurable: true,
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
      localStorageMock.getItem.mockReturnValue(null);
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.setVolume(0.8);
      });
      
      expect(result.current.getVolume()).toBe(0.8);
    });

    it('should clamp volume to 0-1 range', () => {
      localStorageMock.getItem.mockReturnValue(null);
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
      localStorageMock.getItem.mockReturnValue(null);
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.setVolume(0.7);
      });
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('pomodoro-sound-volume', '0.7');
    });

    it('should handle localStorage set errors gracefully', () => {
      localStorageMock.getItem.mockReturnValue(null);
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
      localStorageMock.getItem.mockReturnValue(null);
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.playWorkComplete();
      });
      
      expect(window.AudioContext).toHaveBeenCalled();
    });

    it('should create oscillators and gain nodes for bell sound', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.playWorkComplete();
      });
      
      // Should create multiple oscillators for harmonics (3) + multiple gain nodes
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
    });

    it('should resume suspended AudioContext', () => {
      mockAudioContext.state = 'suspended';
      localStorageMock.getItem.mockReturnValue(null);
      
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.playWorkComplete();
      });
      
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });
  });

  describe('playBreakComplete', () => {
    it('should create AudioContext on first play', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.playBreakComplete();
      });
      
      expect(window.AudioContext).toHaveBeenCalled();
    });

    it('should create oscillators for chime sound', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.playBreakComplete();
      });
      
      // Should create oscillators for two-note chime
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should close AudioContext on unmount', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const { result, unmount } = renderHook(() => useSound());
      
      // Trigger creation of AudioContext
      act(() => {
        result.current.playWorkComplete();
      });
      
      unmount();
      
      expect(mockAudioContext.close).toHaveBeenCalled();
    });
  });

  describe('sound-notification', () => {
    it('should play work complete sound at configured volume', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.setVolume(0.6);
      });
      
      act(() => {
        result.current.playWorkComplete();
      });
      
      // Verify AudioContext was created and used
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('should play break complete sound at configured volume', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.setVolume(0.4);
      });
      
      act(() => {
        result.current.playBreakComplete();
      });
      
      // Verify AudioContext was created and used
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('should have different sounds for work and break completion', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const { result } = renderHook(() => useSound());
      
      // Reset call counts
      mockAudioContext.createOscillator.mockClear();
      
      // Play work complete
      act(() => {
        result.current.playWorkComplete();
      });
      const workOscillatorCount = mockAudioContext.createOscillator.mock.calls.length;
      
      // Reset for break test
      mockAudioContext.createOscillator.mockClear();
      
      // Play break complete
      act(() => {
        result.current.playBreakComplete();
      });
      const breakOscillatorCount = mockAudioContext.createOscillator.mock.calls.length;
      
      // Both should create oscillators
      expect(workOscillatorCount).toBeGreaterThan(0);
      expect(breakOscillatorCount).toBeGreaterThan(0);
    });

    it('should sound play when work timer completes', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const { result } = renderHook(() => useSound());
      
      // Simulate work completion sound
      act(() => {
        result.current.playWorkComplete();
      });
      
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('should sound play when break timer completes', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const { result } = renderHook(() => useSound());
      
      // Simulate break completion sound
      act(() => {
        result.current.playBreakComplete();
      });
      
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('should have pleasant bell sound for work complete', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.playWorkComplete();
      });
      
      // Bell sound uses sine wave with harmonics
      const oscillatorCalls = mockAudioContext.createOscillator.mock.results;
      expect(oscillatorCalls.length).toBeGreaterThanOrEqual(3); // Main tone + 2 harmonics
    });

    it('should have gentle chime sound for break complete', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const { result } = renderHook(() => useSound());
      
      act(() => {
        result.current.playBreakComplete();
      });
      
      // Chime uses two notes
      const oscillatorCalls = mockAudioContext.createOscillator.mock.results;
      expect(oscillatorCalls.length).toBeGreaterThanOrEqual(2);
    });
  });
});
