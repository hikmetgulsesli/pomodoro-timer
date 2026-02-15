import { useCallback, useRef, useEffect } from 'react';

export type SoundType = 'workComplete' | 'breakComplete';

export interface UseSoundReturn {
  playWorkComplete: () => void;
  playBreakComplete: () => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
}

const STORAGE_KEY = 'pomodoro-sound-volume';
const DEFAULT_VOLUME = 0.5;

/**
 * Generate a pleasant bell-like tone using Web Audio API
 * Higher pitch for work completion, lower for break completion
 */
function createBellSound(
  audioContext: AudioContext,
  baseFrequency: number,
  volume: number
): void {
  const now = audioContext.currentTime;
  
  // Create oscillator for the main tone
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  // Set up the oscillator
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(baseFrequency, now);
  
  // Add harmonics for a richer bell sound
  const harmonic1 = audioContext.createOscillator();
  const harmonic1Gain = audioContext.createGain();
  harmonic1.type = 'sine';
  harmonic1.frequency.setValueAtTime(baseFrequency * 2, now);
  harmonic1Gain.gain.setValueAtTime(volume * 0.15, now);
  
  const harmonic2 = audioContext.createOscillator();
  const harmonic2Gain = audioContext.createGain();
  harmonic2.type = 'sine';
  harmonic2.frequency.setValueAtTime(baseFrequency * 3, now);
  harmonic2Gain.gain.setValueAtTime(volume * 0.08, now);
  
  // Create envelope for bell-like decay
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume * 0.8, now + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(volume * 0.3, now + 0.3);
  gainNode.gain.exponentialRampToValueAtTime(volume * 0.1, now + 1.0);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
  
  // Connect nodes
  oscillator.connect(gainNode);
  harmonic1.connect(harmonic1Gain);
  harmonic2.connect(harmonic2Gain);
  harmonic1Gain.connect(gainNode);
  harmonic2Gain.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Play the sound
  oscillator.start(now);
  harmonic1.start(now);
  harmonic2.start(now);
  
  oscillator.stop(now + 2.5);
  harmonic1.stop(now + 2.5);
  harmonic2.stop(now + 2.5);
}

/**
 * Create a gentle chime for break completion
 */
function createChimeSound(
  audioContext: AudioContext,
  volume: number
): void {
  const now = audioContext.currentTime;
  
  // Two-note chime for break
  const frequencies = [523.25, 659.25]; // C5, E5
  
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, now + index * 0.15);
    
    // Gentle envelope
    const noteStart = now + index * 0.15;
    gainNode.gain.setValueAtTime(0, noteStart);
    gainNode.gain.linearRampToValueAtTime(volume * 0.6, noteStart + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.2, noteStart + 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.001, noteStart + 1.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(noteStart);
    oscillator.stop(noteStart + 1.5);
  });
}

export function useSound(): UseSoundReturn {
  const audioContextRef = useRef<AudioContext | null>(null);
  const volumeRef = useRef<number>(DEFAULT_VOLUME);

  // Load volume from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          volumeRef.current = parsed;
        }
      }
    } catch {
      // Ignore localStorage errors (e.g., private browsing mode)
    }
  }, []);

  const getAudioContext = useCallback((): AudioContext => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    // Resume if suspended (browser policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playWorkComplete = useCallback(() => {
    const audioContext = getAudioContext();
    // Higher pitch bell (880 Hz = A5) for work completion
    createBellSound(audioContext, 880, volumeRef.current);
  }, [getAudioContext]);

  const playBreakComplete = useCallback(() => {
    const audioContext = getAudioContext();
    // Gentle chime for break completion
    createChimeSound(audioContext, volumeRef.current);
  }, [getAudioContext]);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    volumeRef.current = clampedVolume;
    try {
      localStorage.setItem(STORAGE_KEY, clampedVolume.toString());
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const getVolume = useCallback((): number => {
    return volumeRef.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  return {
    playWorkComplete,
    playBreakComplete,
    setVolume,
    getVolume,
  };
}

export default useSound;
