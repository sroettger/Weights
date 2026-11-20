/**
 * Weights — Web Audio Chimes, Haptic Vibration & Screen Wake Lock
 * Zero external audio files — works 100% offline.
 */

class GymFeedback {
  constructor() {
    this.ctx = null;
    this.wakeLockSentinel = null;
    this.wakeLockEnabled = false;

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.wakeLockEnabled) {
        this.requestWakeLock();
      }
    });
  }

  ensureAudio() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playTone(freq, duration = 0.12, startOffset = 0, gainPeak = 0.14, type = 'sine') {
    const ctx = this.ensureAudio();
    if (!ctx) return;

    const now = ctx.currentTime + startOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playSetComplete(soundEnabled) {
    this.vibrate(25);
    if (!soundEnabled) return;
    this.playTone(587.33, 0.09, 0, 0.09, 'triangle');
    this.playTone(880, 0.12, 0.06, 0.1, 'sine');
  }

  playCountdownTick(soundEnabled) {
    if (!soundEnabled) return;
    this.playTone(660, 0.07, 0, 0.08, 'sine');
  }

  playRestDone(soundEnabled) {
    this.vibrate([180, 90, 180, 90, 260]);
    if (!soundEnabled) return;
    // Crisp unmistakable 3-note athletic chime
    this.playTone(783.99, 0.18, 0.0, 0.2, 'triangle');
    this.playTone(1046.5, 0.22, 0.16, 0.22, 'triangle');
    this.playTone(1318.5, 0.42, 0.34, 0.24, 'sine');
  }

  vibrate(pattern) {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore on unsupported platforms
      }
    }
  }

  async setWakeLock(enabled) {
    this.wakeLockEnabled = Boolean(enabled);
    if (!enabled) {
      if (this.wakeLockSentinel) {
        try {
          await this.wakeLockSentinel.release();
        } catch {
          // Ignore
        }
        this.wakeLockSentinel = null;
      }
      return false;
    }
    return this.requestWakeLock();
  }

  async requestWakeLock() {
    if (!('wakeLock' in navigator)) return false;
    try {
      this.wakeLockSentinel = await navigator.wakeLock.request('screen');
      return true;
    } catch {
      return false;
    }
  }
}

export const feedback = new GymFeedback();
