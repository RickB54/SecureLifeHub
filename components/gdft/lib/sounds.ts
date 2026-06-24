
// Persistent AudioContext
let audioCtx: AudioContext | null = null;

/**
 * Initializes or returns the existing AudioContext.
 * Browsers require this to be created or resumed within a user gesture.
 */
const getAudioContext = () => {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  return audioCtx;
};

export const playWebSound = async (type: 'chime' | 'bell') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Explicitly resume in case it's suspended
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const now = ctx.currentTime;
    
    // Create a master gain for volume control
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(0.8, now);

    if (type === 'chime') {
      // Simple, loud two-tone chime
      // Tone 1: 880Hz (A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(masterGain);
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(1.0, now);
      gain1.gain.setTargetAtTime(0, now, 0.1);
      osc1.start(now);
      osc1.stop(now + 1.0);

      // Tone 2: 1108.73Hz (C#6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(masterGain);
      osc2.frequency.setValueAtTime(1108.73, now + 0.15);
      gain2.gain.setValueAtTime(1.0, now + 0.15);
      gain2.gain.setTargetAtTime(0, now + 0.15, 0.1);
      osc2.start(now + 0.15);
      osc2.stop(now + 1.15);
    } else {
      // Loud Bell: 1320Hz (E6)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(masterGain);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1320, now);
      gain.gain.setValueAtTime(1.0, now);
      gain.gain.setTargetAtTime(0, now, 0.2);
      osc.start(now);
      osc.stop(now + 2.0);
    }

    console.log(`[Sounds] Played ${type}. Context state: ${ctx.state}`);
  } catch (err) {
    console.warn('[Sounds] Playback failed:', err);
  }
};

export const unlockAudio = async () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Silently resume the AudioContext to satisfy browser autoplay policies.
    // Do NOT play any audible sound here — this is only to prime the audio engine.
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    console.log('[Sounds] Audio context unlocked silently.');
  } catch (e) {
    console.warn('[Sounds] Initialization error:', e);
  }
};
