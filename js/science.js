/**
 * Weights — Science-Backed Exercise Physiology & Periodization Engine
 *
 * Grounded in:
 * - Maximal neural strength vs. hypertrophy: Schoenfeld et al. (2017, 2021); Suchomel et al. (2018);
 *   Pareja-Blanco et al. (2017) on velocity loss / RIR cutoffs to maximize strength without mass bloat.
 * - Inter-set rest & HR autoregulation: Singer et al. (2024) Bayesian meta-analysis; Buskard et al. (2017);
 *   Piirainen et al. (2011) — local ATP-PCr time floor + asymmetric systemic HR ceiling.
 * - Polarized cardiovascular health: Seiler (2010); Stöggl & Sperlich (2014) — Zone 2 base + Z4 VO2max intervals.
 */

export const GOAL_PROFILES = {
  max_strength: {
    id: 'max_strength',
    name: 'Max Strength · Climber',
    short: 'Max Strength',
    tagline: 'Neural force · Low rep · No bulk',
    compoundReps: 4,
    isolationReps: 6,
    compoundPct1RM: 0.85,
    isolationPct1RM: 0.78,
    baseRir: 2, // Stop 1-2 reps shy of failure to preserve bar speed & CNS, limit sarcoplasmic bloat
    compoundSets: 3,
    isolationSets: 3,
    compoundRestSec: 150,
    isolationRestSec: 85,
    needsWarmupRamp: true,
    priorityMovements: ['vert_pull', 'horiz_pull', 'squat', 'knee_flex', 'core', 'horiz_push', 'scapular', 'calf'],
  },
  body_focus: {
    id: 'body_focus',
    name: 'Target Body Parts',
    short: 'Body Focus',
    tagline: 'Extra volume on chosen zones',
    compoundReps: 9,
    isolationReps: 12,
    compoundPct1RM: 0.74,
    isolationPct1RM: 0.68,
    baseRir: 1,
    compoundSets: 3,
    isolationSets: 3,
    compoundRestSec: 110,
    isolationRestSec: 75,
    needsWarmupRamp: false,
    priorityMovements: ['hinge', 'squat', 'core', 'horiz_pull', 'vert_pull', 'horiz_push', 'knee_flex'],
  },
  fat_loss: {
    id: 'fat_loss',
    name: 'Lean & Conditioning',
    short: 'Weight Loss',
    tagline: 'Retain muscle · High density + cardio',
    compoundReps: 8,
    isolationReps: 12,
    compoundPct1RM: 0.76,
    isolationPct1RM: 0.7,
    baseRir: 2,
    compoundSets: 3,
    isolationSets: 2,
    compoundRestSec: 85,
    isolationRestSec: 60,
    needsWarmupRamp: false,
    priorityMovements: ['squat', 'horiz_pull', 'horiz_push', 'hinge', 'vert_pull', 'core'],
  },
  hypertrophy: {
    id: 'hypertrophy',
    name: 'Muscle Growth',
    short: 'Hypertrophy',
    tagline: '8–12 reps · High tension',
    compoundReps: 9,
    isolationReps: 12,
    compoundPct1RM: 0.75,
    isolationPct1RM: 0.69,
    baseRir: 1,
    compoundSets: 3,
    isolationSets: 3,
    compoundRestSec: 120,
    isolationRestSec: 80,
    needsWarmupRamp: false,
    priorityMovements: ['squat', 'horiz_push', 'vert_pull', 'horiz_pull', 'knee_flex', 'pec_fly', 'core'],
  },
};

export const FOCUS_AREAS = [
  { id: 'pull', label: 'Back & Pull', muscles: ['lats', 'upper_back', 'biceps', 'forearms'] },
  { id: 'core', label: 'Core Tension', muscles: ['core', 'lower_back'] },
  { id: 'glutes', label: 'Glutes / Butt', muscles: ['glutes', 'hamstrings'] },
  { id: 'legs', label: 'Quads & Calves', muscles: ['quads', 'calves'] },
  { id: 'push', label: 'Chest & Shoulders', muscles: ['chest', 'shoulders', 'rear_delt'] },
];

export const CARDIO_PROFILES = {
  cardio_health: {
    id: 'cardio_health',
    name: 'VO₂max & Heart Health',
    short: 'VO₂ + Z2',
    finisherMin: 12,
    dedicatedMin: 24,
  },
  fat_burn: {
    id: 'fat_burn',
    name: 'Zone 2 Fat Burn',
    short: 'Zone 2',
    finisherMin: 15,
    dedicatedMin: 28,
  },
  minimal: {
    id: 'minimal',
    name: 'Warm-up Only',
    short: 'Minimal',
    finisherMin: 0,
    dedicatedMin: 20,
  },
};

export const PAIN_LOCATIONS = [
  { id: 'fingers', label: 'Fingers / Forearm' },
  { id: 'shoulder', label: 'Shoulder' },
  { id: 'lower_back', label: 'Lower Back' },
  { id: 'knee', label: 'Knee' },
];

/**
 * 4-Week Autoregulated Mesocycle (prevents starting from scratch; cycles load + deload).
 */
export const MESOCYCLE_WEEKS = {
  1: { week: 1, name: 'Base', pctDelta: -0.02, setMult: 1.0, rirDelta: 0 },
  2: { week: 2, name: 'Build', pctDelta: 0.015, setMult: 1.0, rirDelta: 0 },
  3: { week: 3, name: 'Peak', pctDelta: 0.04, setMult: 1.0, rirDelta: -1 },
  4: { week: 4, name: 'Deload', pctDelta: -0.09, setMult: 0.66, rirDelta: 2 },
};

export function getMesocyclePhase(weekNum = 1) {
  const w = (((Math.max(1, Math.round(weekNum)) - 1) % 4) + 1);
  return MESOCYCLE_WEEKS[w];
}

/**
 * Estimate 1RM from working weight, reps completed, and estimated RIR.
 * Uses Epley/Brzycki blend calibrated for 1–15 reps.
 */
export function estimate1RM(weightKg, reps, rir = 1) {
  const w = Number(weightKg) || 0;
  if (w <= 0) return 0;
  const effReps = Math.max(1, Math.min(18, (Number(reps) || 1) + Math.max(0, Number(rir) || 0)));
  if (effReps === 1) return w;
  const epley = w * (1 + effReps / 30);
  const brzycki = effReps < 15 ? w * (36 / (37 - effReps)) : epley;
  return Math.round(((epley + brzycki) / 2) * 10) / 10;
}

/**
 * Round load to physical gym plate / stack increment (e.g. 2.5 kg).
 */
export function roundToStep(valueKg, stepKg = 2.5) {
  const step = Number(stepKg) > 0 ? Number(stepKg) : 2.5;
  return Math.max(step, Math.round(valueKg / step) * step);
}

/**
 * Evaluate autonomic & muscular readiness using RHR, HRV (RMSSD), and hours since last session.
 */
export function evaluateReadiness(athlete, liveWearable = null, now = Date.now()) {
  const baseRhr = Number(athlete.baselineRhr) || 58;
  const todayRhr = Number(athlete.todayRhr) || baseRhr;
  const baseHrv = Number(athlete.baselineHrv) || 56;
  const liveHrv = liveWearable?.hrvMs || athlete.todayHrv || null;

  let score = 86;
  const reasons = [];

  // RHR deviation
  const rhrDiff = todayRhr - baseRhr;
  if (rhrDiff <= -2) {
    score += 6;
    reasons.push(`RHR ${todayRhr}`);
  } else if (rhrDiff >= 7) {
    score -= 24;
    reasons.push(`RHR +${rhrDiff} bpm`);
  } else if (rhrDiff >= 4) {
    score -= 12;
    reasons.push(`RHR +${rhrDiff}`);
  } else {
    reasons.push(`RHR ${todayRhr}`);
  }

  // HRV deviation (if available from Venu 4s / Google Health / manual)
  if (liveHrv && baseHrv > 0) {
    const ratio = liveHrv / baseHrv;
    if (ratio >= 1.05) {
      score += 6;
      reasons.push(`HRV ${liveHrv}ms`);
    } else if (ratio <= 0.74) {
      score -= 22;
      reasons.push(`HRV low (${liveHrv}ms)`);
    } else if (ratio <= 0.86) {
      score -= 10;
      reasons.push(`HRV ${liveHrv}ms`);
    } else {
      reasons.push(`HRV ${liveHrv}ms`);
    }
  }

  // Recency since last workout
  const lastAt = athlete.lastWorkoutAt || null;
  const hoursSince = lastAt ? Math.max(0, (now - lastAt) / 3600000) : 72;
  if (hoursSince < 18) {
    score -= 18;
  }

  score = Math.max(30, Math.min(99, Math.round(score)));

  if (score >= 85) {
    return {
      score,
      tier: 'prime',
      label: 'Prime',
      loadMult: 1.0,
      setMult: 1.0,
      summary: reasons.join(' · '),
      hoursSince,
    };
  }
  if (score >= 70) {
    return {
      score,
      tier: 'ready',
      label: 'Ready',
      loadMult: 1.0,
      setMult: 1.0,
      summary: reasons.join(' · '),
      hoursSince,
    };
  }
  if (score >= 55) {
    return {
      score,
      tier: 'fatigued',
      label: 'Fatigued (−5% load)',
      loadMult: 0.95,
      setMult: 0.85,
      summary: reasons.join(' · '),
      hoursSince,
    };
  }
  return {
    score,
    tier: 'recover',
    label: 'Low Recovery',
    loadMult: 0.88,
    setMult: 0.7,
    summary: reasons.join(' · '),
    hoursSince,
  };
}

/**
 * Compute Karvonen Heart Rate Reserve target band.
 */
export function getHrBand(athlete, lowHrrPct, highHrrPct) {
  const rhr = Number(athlete?.todayRhr || athlete?.baselineRhr) || 58;
  const mhr = Math.max(rhr + 50, Number(athlete?.maxHr) || 188);
  const reserve = mhr - rhr;
  return {
    min: Math.round(rhr + reserve * lowHrrPct),
    max: Math.round(rhr + reserve * highHrrPct),
  };
}

/**
 * Prescribe working weight, reps, sets, and rest for a station given athlete state & mesocycle.
 */
export function prescribeStation(machine, athlete, readiness, opts = {}) {
  const goal = GOAL_PROFILES[athlete.goal] || GOAL_PROFILES.max_strength;
  const meso = getMesocyclePhase(athlete.mesocycle?.week || 1);
  const liftRec = athlete.lifts?.[machine.id] || null;
  const now = opts.now || Date.now();

  if (machine.loadType === 'cardio') {
    const z2 = getHrBand(athlete, 0.6, 0.7);
    return {
      sets: 1,
      reps: 12,
      weightKg: 0,
      rir: 0,
      restSec: 0,
      pct1RM: 0,
      hrBand: z2,
      needsWarmupSet: false,
    };
  }

  const isFocusMatch = (athlete.focusAreas || []).some((areaId) => {
    const area = FOCUS_AREAS.find((f) => f.id === areaId);
    return area?.muscles.some((m) => (machine.muscles?.[m] || 0) >= 0.5);
  });

  const targetReps = machine.compound ? goal.compoundReps : goal.isolationReps;
  const basePct = machine.compound ? goal.compoundPct1RM : goal.isolationPct1RM;
  const rir = Math.max(1, Math.min(4, goal.baseRir + meso.rirDelta));

  let rawSets = machine.compound ? goal.compoundSets : goal.isolationSets;
  if (athlete.goal === 'body_focus' && isFocusMatch) rawSets += 1;
  if (athlete.goal === 'body_focus' && !isFocusMatch) rawSets = Math.max(2, rawSets - 1);

  const sets = Math.max(
    2,
    Math.min(5, Math.round(rawSets * meso.setMult * (readiness?.setMult || 1)))
  );

  // Determine e1RM (either learned from athlete history or seeded from machine baseline)
  const seedE1rm = estimate1RM(machine.baselineWorkKg, machine.baselineReps, 2);
  const currentE1rm = liftRec?.e1rm > 0 ? liftRec.e1rm : seedE1rm;

  // Rust-breaker: if >10 days since last trained this specific lift, ease -4%
  const daysSinceLift = liftRec?.lastAt ? (now - liftRec.lastAt) / 86400000 : 4;
  const rustMult = daysSinceLift > 10 ? 0.96 : 1.0;

  let weightKg = 0;
  let pct1RM = Math.min(0.92, Math.max(0.6, basePct + meso.pctDelta));

  if (machine.loadType !== 'bodyweight' && currentE1rm > 0) {
    // Invert Epley for target (reps + rir)
    const effReps = targetReps + rir;
    const rawFromE1rm = (currentE1rm / (1 + effReps / 30)) * (1 + meso.pctDelta * 0.5);
    const adjusted = rawFromE1rm * (readiness?.loadMult || 1) * rustMult;
    weightKg = roundToStep(adjusted, machine.stepKg || 2.5);
    pct1RM = Math.min(0.94, Math.round((weightKg / currentE1rm) * 100) / 100);
  }

  let restSec = machine.compound ? goal.compoundRestSec : goal.isolationRestSec;
  if (meso.week === 4) restSec = Math.max(60, restSec - 20);

  return {
    sets,
    reps: machine.loadType === 'bodyweight' ? Math.max(10, targetReps * 2) : targetReps,
    weightKg,
    rir,
    restSec,
    pct1RM,
    e1rm: currentE1rm,
    needsWarmupSet: Boolean(goal.needsWarmupRamp && machine.compound && weightKg >= 10),
  };
}

/**
 * Asymmetric HR rest brake:
 * - Never shortens below local ATP-PCr time floor
 * - Ignores first 15s (wrist PPG optical lag)
 * - Extends +15s when clock hits 0 if HR is still > 60% HRR (up to +60s max)
 */
export function evaluateHrRestBrake({ liveBpm, athlete, elapsedSec, extensionsSoFar = 0 }) {
  if (!liveBpm || liveBpm <= 0) return null;
  if (elapsedSec < 15) return null;
  if (extensionsSoFar >= 4) return null;

  const band = getHrBand(athlete, 0, 0.6);
  const ceilingBpm = band.max; // 60% HRR recovery threshold
  if (liveBpm > ceilingBpm) {
    return {
      extendSec: 15,
      ceilingBpm,
      reason: `HR ${liveBpm} > ${ceilingBpm} · +15s recovery`,
    };
  }
  return null;
}

export function formatRelativeDays(timestamp, now = Date.now()) {
  if (!timestamp) return 'First session';
  const hours = Math.max(0, (now - timestamp) / 3600000);
  if (hours < 6) return 'Today';
  if (hours < 30) return 'Yesterday';
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function formatLoad(machine, weightKg, unit = 'kg') {
  if (!machine || machine.loadType === 'bodyweight') {
    return { primary: 'Bodyweight', sub: 'Controlled tempo' };
  }
  if (machine.loadType === 'cardio') {
    return { primary: 'Cardio', sub: 'HR Zone guided' };
  }
  const factor = unit === 'lb' ? 2.20462 : 1;
  const raw = Math.round(weightKg * factor * 10) / 10;
  const numStr = Number.isInteger(raw) ? String(raw) : raw.toFixed(1);
  if (machine.loadType === 'plate_per_side') {
    return { primary: `${numStr} ${unit}`, sub: 'per side' };
  }
  return { primary: `${numStr} ${unit}`, sub: 'pin stack' };
}

export function formatDurationShort(sec) {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r === 0 ? `${m}m` : `${m}m${String(r).padStart(2, '0')}`;
}
