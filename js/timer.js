/**
 * Weights — Drift-Free Rest Timer Engine
 * Uses wall-clock timestamps so locking your phone screen never causes drift.
 */

export class RestTimer {
  constructor(getTimerState, onChange, onCountdownTick, onComplete) {
    this.getTimerState = getTimerState;
    this.onChange = onChange;
    this.onCountdownTick = onCountdownTick;
    this.onComplete = onComplete;
    this.intervalId = null;
    this.lastCountdownSec = null;
  }

  init() {
    const t = this.getTimerState();
    if (t.running && !t.paused && t.endTime) {
      this.ensureLoop();
    }
    this.onChange(this.getSnapshot());
  }

  start(seconds, label = 'Rest') {
    const dur = Math.max(5, Math.round(Number(seconds) || 60));
    const t = this.getTimerState();
    t.running = true;
    t.paused = false;
    t.durationSec = dur;
    t.endTime = Date.now() + dur * 1000;
    t.pausedRemainingMs = null;
    t.label = label;
    t.notifiedComplete = false;
    this.lastCountdownSec = null;
    this.ensureLoop();
    this.onChange(this.getSnapshot(), true);
  }

  adjust(deltaSec) {
    const t = this.getTimerState();
    if (!t.running) {
      this.start(Math.max(15, 60 + deltaSec), 'Rest');
      return;
    }
    const deltaMs = deltaSec * 1000;
    if (t.paused) {
      const next = Math.max(0, (t.pausedRemainingMs || 0) + deltaMs);
      t.pausedRemainingMs = next;
      t.durationSec = Math.max(t.durationSec, Math.ceil(next / 1000));
    } else {
      const now = Date.now();
      const base = t.endTime > now ? t.endTime : now;
      t.endTime = Math.max(now + 1000, base + deltaMs);
      const remainingSec = Math.ceil((t.endTime - now) / 1000);
      if (remainingSec > t.durationSec) {
        t.durationSec = remainingSec;
      }
      if (remainingSec > 0) {
        t.notifiedComplete = false;
      }
    }
    this.onChange(this.getSnapshot(), true);
  }

  togglePause() {
    const t = this.getTimerState();
    if (!t.running) return;
    if (t.paused) {
      t.paused = false;
      t.endTime = Date.now() + (t.pausedRemainingMs ?? 0);
      t.pausedRemainingMs = null;
      this.ensureLoop();
    } else {
      t.paused = true;
      t.pausedRemainingMs = t.endTime - Date.now();
      this.stopLoop();
    }
    this.onChange(this.getSnapshot(), true);
  }

  stop() {
    const t = this.getTimerState();
    t.running = false;
    t.paused = false;
    t.endTime = null;
    t.pausedRemainingMs = null;
    t.notifiedComplete = false;
    this.lastCountdownSec = null;
    this.stopLoop();
    this.onChange(this.getSnapshot(), true);
  }

  getSnapshot() {
    const t = this.getTimerState();
    if (!t.running) {
      return {
        running: false,
        paused: false,
        overtime: false,
        remainingSec: 0,
        overtimeSec: 0,
        durationSec: t.durationSec || 90,
        progress: 0,
        label: t.label || '',
      };
    }

    const remainingMs = t.paused ? (t.pausedRemainingMs ?? 0) : (t.endTime - Date.now());
    const overtime = remainingMs <= 0;
    const remainingSec = overtime ? 0 : Math.ceil(remainingMs / 1000);
    const overtimeSec = overtime ? Math.floor(Math.abs(remainingMs) / 1000) : 0;
    const totalMs = Math.max(1000, (t.durationSec || 60) * 1000);
    const progress = overtime ? 1 : Math.min(1, Math.max(0, 1 - remainingMs / totalMs));

    return {
      running: true,
      paused: Boolean(t.paused),
      overtime,
      remainingSec,
      overtimeSec,
      durationSec: t.durationSec || 60,
      progress,
      label: t.label || 'Rest',
    };
  }

  ensureLoop() {
    if (this.intervalId) return;
    this.intervalId = window.setInterval(() => this.tick(), 200);
  }

  stopLoop() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  tick() {
    const t = this.getTimerState();
    if (!t.running || t.paused) {
      this.stopLoop();
      return;
    }

    const snap = this.getSnapshot();

    if (!snap.overtime && snap.remainingSec <= 3 && snap.remainingSec >= 1) {
      if (this.lastCountdownSec !== snap.remainingSec) {
        this.lastCountdownSec = snap.remainingSec;
        this.onCountdownTick(snap.remainingSec);
      }
    }

    if (snap.overtime && !t.notifiedComplete) {
      t.notifiedComplete = true;
      this.onComplete(snap);
      this.onChange(snap, true);
      return;
    }

    this.onChange(snap, false);
  }
}
