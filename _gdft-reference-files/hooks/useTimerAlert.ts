import { useCallback } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

/**
 * Plays a beep using the Web Audio API.
 * Works on all modern browsers without needing an audio file.
 */
const playBeep = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Create a short triple-beep sequence
    const beeps = [0, 0.18, 0.36];
    beeps.forEach((startOffset) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + startOffset); // A5

      gainNode.gain.setValueAtTime(0.6, ctx.currentTime + startOffset);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + 0.14);

      oscillator.start(ctx.currentTime + startOffset);
      oscillator.stop(ctx.currentTime + startOffset + 0.14);
    });

    // Close context after sounds are done
    setTimeout(() => ctx.close(), 1500);
  } catch (err) {
    console.warn('Web Audio API not available:', err);
  }
};

/**
 * Triggers device vibration if supported.
 * Pattern: short-short-long (notification style)
 */
const triggerVibration = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate([100, 80, 100, 80, 300]);
  }
};

/**
 * useTimerAlert — call `fireAlert()` when any timer finishes.
 * It automatically respects the timerSound and timerVibration settings.
 */
export const useTimerAlert = () => {
  const { timerSound, timerVibration } = useSettings();

  const fireAlert = useCallback(() => {
    if (timerSound) {
      playBeep();
    }
    if (timerVibration) {
      triggerVibration();
    }
  }, [timerSound, timerVibration]);

  return { fireAlert };
};
