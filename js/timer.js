/**
 * Weights — Drift-Free Phase Timer (Rest + Warmup + Cardio + Asymmetric HR Brake)
 * Uses wall-clock timestamps so locking your phone screen never causes drift.
 */

export class RestTimer {
  constructor(getTimerState, onChange, onCountdownTick, onComplete, checkHrBrake = null) {
    this.getTimerState = getTimerState;
    this.onChange = onChange;
    this.onCountdownTick = onCountdownTick;
    this.onComplete = onComplete;
    this.checkHrBrake = checkHrBrake;
    this.intervalId = null;
    this.lastCountdownSec = null;
  }

  init() {
    const t = this.getTimerState();
    if (t.running && !t.paused && t.endTime) {
      this.ensureLoop();
    }
    this.onChange(this.getSnapshot(), false);
  }

  start(seconds, label = 'Rest', mode = 'rest') {
    const dur = Math.max(5, Math.round(Number(seconds) || 60));
    const now = Date.now();
    const t = this.getTimerState();
    t.running = true;
    t.paused = false;
    t.mode = mode;
    t.startedAt = now;
    t.durationSec = dur;
    t.endTime = now + dur * 1000;
    t.pausedRemainingMs = null;
    t.label = label;
    t.hrExtensions = 0;
    t.hrReason = '';
    t.notifiedComplete = false;
    this.lastCountdownSec = null;
    this.ensureLoop();
    this.onChange(this.getSnapshot(), true);
  }

  adjust(deltaSec) {
    const t = this.getTimerState();
    if (!t.running) return;
    const deltaMs = deltaSec * 1000;
    if (t.paused) {
      const next = Math.max(1000, (t.pausedRemainingMs || 0) + deltaMs);
      t.pausedRemainingMs = next;
      t.durationSec = Math.max(t.durationSec, Math.ceil(next / 1000));
    } else {
      const now = Date.now();
      const base = t.endTime > now ? t.endTime : now;
      t.endTime = Math.max(now + 1000, base + deltaMs);
      const remainingSec = Math.ceil((t.endTime - now) / 1000);
      if (remainingSec > t.durationSec) t.durationSec = remainingSec;
      if (remainingSec > 0) t.notifiedComplete = false;
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
      t.pausedRemainingMs = Math.max(0, t.endTime - Date.now());
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
    t.hrExtensions = 0;
    t.hrReason = '';
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
        mode: t.mode || 'rest',
        overtime: false,
        remainingSec: 0,
        overtimeSec: 0,
        elapsedSec: 0,
        durationSec: t.durationSec || 90,
        progress: 0,
        label: t.label || '',
        hrExtensions: 0,
        hrReason: '',
      };
    }

    const now = Date.now();
    const remainingMs = t.paused ? (t.pausedRemainingMs ?? 0) : t.endTime - now;
    const overtime = remainingMs <= 0;
    const remainingSec = overtime ? 0 : Math.ceil(remainingMs / 1000);
    const overtimeSec = overtime ? Math.floor(Math.abs(remainingMs) / 1000) : 0;
    const elapsedSec = t.startedAt ? Math.max(0, Math.round((now - t.startedAt) / 1000)) : 0;
    const totalMs = Math.max(1000, (t.durationSec || 60) * 1000);
    const progress = overtime ? 1 : Math.min(1, Math.max(0, 1 - remainingMs / totalMs));

    return {
      running: true,
      paused: Boolean(t.paused),
      mode: t.mode || 'rest',
      overtime,
      remainingSec,
      overtimeSec,
      elapsedSec,
      durationSec: t.durationSec || 60,
      progress,
      label: t.label || 'Rest',
      hrExtensions: t.hrExtensions || 0,
      hrReason: t.hrReason || '',
    };
  }

  ensureLoop() {
    if (this.intervalId) return;
    this.intervalId = window.setInterval(() => this.tick(), 250);
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

    // Asymmetric HR recovery brake when rest timer hits 0
    if (
      t.mode === 'rest' &&
      snap.remainingSec <= 1 &&
      !t.notifiedComplete &&
      typeof this.checkHrBrake === 'function'
    ) {
      const brake = this.checkHrBrake(snap);
      if (brake && brake.extendSec > 0) {
        const now = Date.now();
        t.endTime = Math.max(now, t.endTime) + brake.extendSec * 1000;
        t.durationSec += brake.extendSec;
        t.hrExtensions = (t.hrExtensions || 0) + 1;
        t.hrReason = brake.reason || '+15s HR recovery';
        this.lastCountdownSec = null;
        this.onChange(this.getSnapshot(), true);
        return;
      }
    }

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
