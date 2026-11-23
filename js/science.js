/**
 * Weights — Science-Backed 8-Week Block Periodization & Rep-Window Engine
 *
 * Implements Phase Potentiation (Issurin, 2010; DeWeese et al., 2015; Bohm et al., 2015):
 * - Block 1 (Weeks 1–4): Structural, Tendon & Selective Hypertrophy Base (8–10 compound reps,
 *   2-set lean-leg cap for climbers, 12–15 core/cuff/isolation reps).
 * - Block 2 (Weeks 5–8): Max Neural Force Realization (6 -> 5 -> 3–4 compound reps with
 *   2-step warm-up ramps, while keeping core/cuff/single-joint lifts at safe 10–15 reps).
 * - Universal Set Rule: Push until speed noticeably slows (~1–2 reps before failure) and
 *   tap completed rep count — rep count directly drives load autoregulation without subjective Easy/Hard buttons.
 */

export const GOAL_PROFILES = {
  max_strength: {
    id: 'max_strength',
    name: 'Max Strength · Climber',
    short: 'Climber Strength',
    tagline: '8w Base → Max Neural · Lean legs',
    compoundRestSec: 150,
    posteriorRestSec: 105,
    isolationRestSec: 75,
    priorityMovements: ['vert_pull', 'horiz_pull', 'knee_flex', 'squat', 'hinge', 'core', 'horiz_push', 'scapular'],
  },
  body_focus: {
    id: 'body_focus',
    name: 'Target Body Parts',
    short: 'Body Focus',
    tagline: 'Extra volume on chosen areas',
    compoundRestSec: 110,
    posteriorRestSec: 90,
    isolationRestSec: 70,
    priorityMovements: ['hinge', 'squat', 'core', 'horiz_pull', 'vert_pull', 'horiz_push', 'knee_flex'],
  },
  fat_loss: {
    id: 'fat_loss',
    name: 'Lean & Conditioning',
    short: 'Weight Loss',
    tagline: 'Keep muscle · Brisk pace + cardio',
    compoundRestSec: 85,
    posteriorRestSec: 75,
    isolationRestSec: 60,
    priorityMovements: ['squat', 'horiz_pull', 'horiz_push', 'hinge', 'vert_pull', 'core'],
  },
  hypertrophy: {
    id: 'hypertrophy',
    name: 'Muscle Growth',
    short: 'Build Muscle',
    tagline: '8–12 reps across all muscles',
    compoundRestSec: 120,
    posteriorRestSec: 95,
    isolationRestSec: 75,
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
    name: 'Heart Health & VO₂max',
    short: 'VO₂ + Zone 2',
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
    short: 'Warm-up Only',
    finisherMin: 0,
    dedicatedMin: 20,
  },
};

export const PAIN_LOCATIONS = [
  { id: 'fingers', label: 'Fingers / Forearms' },
  { id: 'shoulder', label: 'Shoulder' },
  { id: 'lower_back', label: 'Lower Back' },
  { id: 'knee', label: 'Knee' },
];

/**
 * 8-Week 2-Block Macrocycle:
 * - Weeks 1–4 = Block 1 (Structural & Selective Hypertrophy Base)
 * - Weeks 5–8 = Block 2 (Max Neural Force Realization)
 */
export const MESOCYCLE_WEEKS = {
  1: { week: 1, block: 1, blockName: 'Base Phase', name: 'Base W1', headerTag: 'Base · W1/8', summary: '8–10 rep structural & tendon base', compoundWindow: [8, 10], posteriorWindow: [10, 12], isolationWindow: [12, 15], loadDelta: -0.02, setMult: 1.0, rir: 2, deload: false },
  2: { week: 2, block: 1, blockName: 'Base Phase', name: 'Build W2', headerTag: 'Base · W2/8', summary: '8–10 rep progressive base', compoundWindow: [8, 10], posteriorWindow: [10, 12], isolationWindow: [12, 15], loadDelta: 0.01, setMult: 1.0, rir: 2, deload: false },
  3: { week: 3, block: 1, blockName: 'Base Phase', name: 'Push W3', headerTag: 'Base · W3/8', summary: '8–10 rep top structural week', compoundWindow: [8, 10], posteriorWindow: [10, 12], isolationWindow: [12, 15], loadDelta: 0.03, setMult: 1.0, rir: 1, deload: false },
  4: { week: 4, block: 1, blockName: 'Base Deload', name: 'Deload W4', headerTag: 'Deload · W4/8', summary: 'Light recovery week (−35% sets)', compoundWindow: [8, 10], posteriorWindow: [8, 10], isolationWindow: [12, 14], loadDelta: -0.08, setMult: 0.66, rir: 3, deload: true },
  5: { week: 5, block: 2, blockName: 'Neural Strength', name: 'Bridge W5', headerTag: 'Neural · W5/8', summary: '5–7 rep heavy strength bridge', compoundWindow: [5, 7], posteriorWindow: [6, 8], isolationWindow: [10, 12], loadDelta: 0.0, setMult: 1.0, rir: 2, deload: false },
  6: { week: 6, block: 2, blockName: 'Neural Strength', name: 'Force W6', headerTag: 'Neural · W6/8', summary: '4–6 rep high-force recruitment', compoundWindow: [4, 6], posteriorWindow: [6, 8], isolationWindow: [10, 12], loadDelta: 0.02, setMult: 1.0, rir: 2, deload: false },
  7: { week: 7, block: 2, blockName: 'Neural Peak', name: 'Peak W7', headerTag: 'Peak · W7/8', summary: '3–5 rep peak neural force', compoundWindow: [3, 5], posteriorWindow: [6, 8], isolationWindow: [10, 12], loadDelta: 0.04, setMult: 1.0, rir: 2, deload: false },
  8: { week: 8, block: 2, blockName: 'Neural Deload', name: 'Deload W8', headerTag: 'Deload · W8/8', summary: 'Fast neural taper & reset', compoundWindow: [5, 6], posteriorWindow: [8, 10], isolationWindow: [10, 12], loadDelta: -0.09, setMult: 0.66, rir: 3, deload: true },
};

export function getMesocyclePhase(weekNum = 1) {
  const w = (((Math.max(1, Math.round(weekNum)) - 1) % 8) + 1);
  return MESOCYCLE_WEEKS[w];
}

/**
 * Estimate 1RM from working weight, reps completed, and estimated reps in reserve.
 */
export function estimate1RM(weightKg, reps, rir = 1.5) {
  const w = Number(weightKg) || 0;
  if (w <= 0) return 0;
  const effReps = Math.max(1, Math.min(18, (Number(reps) || 1) + Math.max(0, Number(rir) || 0)));
  if (effReps === 1) return w;
  const epley = w * (1 + effReps / 30);
  const brzycki = effReps < 15 ? w * (36 / (37 - effReps)) : epley;
  return Math.round(((epley + brzycki) / 2) * 10) / 10;
}

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

  const rhrDiff = todayRhr - baseRhr;
  if (rhrDiff <= -2) {
    score += 6;
    reasons.push(`RHR ${todayRhr}`);
  } else if (rhrDiff >= 7) {
    score -= 24;
    reasons.push(`RHR +${rhrDiff}`);
  } else if (rhrDiff >= 4) {
    score -= 12;
    reasons.push(`RHR +${rhrDiff}`);
  } else {
    reasons.push(`RHR ${todayRhr}`);
  }

  if (liveHrv && baseHrv > 0) {
    const ratio = liveHrv / baseHrv;
    if (ratio >= 1.05) {
      score += 6;
      reasons.push(`HRV ${liveHrv}ms`);
    } else if (ratio <= 0.74) {
      score -= 22;
      reasons.push(`HRV low`);
    } else if (ratio <= 0.86) {
      score -= 10;
      reasons.push(`HRV ${liveHrv}ms`);
    } else {
      reasons.push(`HRV ${liveHrv}ms`);
    }
  }

  const lastAt = athlete.lastWorkoutAt || null;
  const hoursSince = lastAt ? Math.max(0, (now - lastAt) / 3600000) : 72;
  if (hoursSince < 18) score -= 18;

  score = Math.max(30, Math.min(99, Math.round(score)));

  if (score >= 85) {
    return { score, tier: 'prime', label: 'Fresh', loadMult: 1.0, setMult: 1.0, summary: reasons.join(' · '), hoursSince };
  }
  if (score >= 70) {
    return { score, tier: 'ready', label: 'Ready', loadMult: 1.0, setMult: 1.0, summary: reasons.join(' · '), hoursSince };
  }
  if (score >= 55) {
    return { score, tier: 'fatigued', label: 'Slightly Tired', loadMult: 0.95, setMult: 0.85, summary: reasons.join(' · '), hoursSince };
  }
  return { score, tier: 'recover', label: 'Low Recovery', loadMult: 0.88, setMult: 0.7, summary: reasons.join(' · '), hoursSince };
}

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
 * Prescribe working weight, rep window [repMin, repMax], sets, warm-ups, and rest
 * using the 4 Movement Tiers + 8-Week Block Periodization.
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
      repMin: 12,
      repMax: 15,
      reps: 12,
      weightKg: 0,
      rir: 0,
      restSec: 0,
      pct1RM: 0,
      hrBand: z2,
      warmupCount: 0,
    };
  }

  const tier = machine.tier || (machine.compound ? 't1_upper' : 't4_isolation');
  const isFocusMatch = (athlete.focusAreas || []).some((areaId) => {
    const area = FOCUS_AREAS.find((f) => f.id === areaId);
    return area?.muscles.some((m) => (machine.muscles?.[m] || 0) >= 0.5);
  });

  // Determine rep window & base set count by goal and movement tier
  let repMin = 8;
  let repMax = 10;
  let rawSets = 3;

  if (athlete.goal === 'max_strength') {
    if (tier === 't1_upper') {
      [repMin, repMax] = meso.compoundWindow;
      rawSets = 3;
    } else if (tier === 't2_lean_legs') {
      [repMin, repMax] = meso.compoundWindow;
      // Cap Block 1 lower-body volume at 2 working sets so climbers build tendon/groove without leg bulk
      rawSets = meso.block === 1 ? 2 : 3;
    } else if (tier === 't3_posterior') {
      // Back extension stays 10–12 for spine safety; Seated Leg Curl drops to 6–8 in Block 2 for heel-hooks
      if (machine.id === 'm_lower_back') {
        [repMin, repMax] = [10, 12];
        rawSets = 2;
      } else {
        [repMin, repMax] = meso.posteriorWindow;
        rawSets = 3;
      }
    } else {
      // Tier 4: Scapular cuff, core, calves, single-joint — NEVER drop below 10 reps!
      [repMin, repMax] = machine.id === 'm_cable_pull' ? [12, 15] : meso.isolationWindow;
      rawSets = machine.id === 'm_cable_pull' || machine.movement === 'core' ? 3 : 2;
    }
  } else {
    // Non-climber goals (Body Focus, Hypertrophy, Weight Loss): steady 8–12 / 12–15 windows
    if (tier === 't1_upper' || tier === 't2_lean_legs') {
      [repMin, repMax] = [8, 10];
      rawSets = 3;
    } else if (tier === 't3_posterior') {
      [repMin, repMax] = [10, 12];
      rawSets = 3;
    } else {
      [repMin, repMax] = [12, 15];
      rawSets = athlete.goal === 'fat_loss' ? 2 : 3;
    }
    if (athlete.goal === 'body_focus') {
      rawSets = isFocusMatch ? 4 : 2;
    }
  }

  if (machine.loadType === 'bodyweight') {
    repMin = Math.max(10, repMin);
    repMax = Math.max(14, repMax);
  }

  const targetReps = Math.round((repMin + repMax) / 2);
  const rir = meso.rir;

  const sets = Math.max(
    meso.deload ? 2 : rawSets === 2 ? 2 : 2,
    Math.min(5, Math.round(rawSets * meso.setMult * (readiness?.setMult || 1)))
  );

  const seedE1rm = estimate1RM(machine.baselineWorkKg, machine.baselineReps, 2);
  const currentE1rm = liftRec?.e1rm > 0 ? liftRec.e1rm : seedE1rm;

  const daysSinceLift = liftRec?.lastAt ? (now - liftRec.lastAt) / 86400000 : 4;
  const rustMult = daysSinceLift > 12 ? 0.96 : 1.0;

  let weightKg = 0;
  let pct1RM = 0.75;

  if (machine.loadType !== 'bodyweight' && currentE1rm > 0) {
    const effReps = targetReps + rir;
    const rawFromE1rm = (currentE1rm / (1 + effReps / 30)) * (1 + meso.loadDelta * 0.5);
    const adjusted = rawFromE1rm * (readiness?.loadMult || 1) * rustMult;
    weightKg = roundToStep(adjusted, machine.stepKg || 2.5);
    pct1RM = Math.min(0.92, Math.round((weightKg / currentE1rm) * 100) / 100);
  }

  let restSec =
    tier === 't1_upper' || tier === 't2_lean_legs'
      ? goal.compoundRestSec
      : tier === 't3_posterior'
      ? goal.posteriorRestSec
      : goal.isolationRestSec;

  // Slightly shorter rest needed in 8–10 rep Block 1 than 3–5 rep Block 2 neural peak
  if (athlete.goal === 'max_strength' && meso.block === 1 && (tier === 't1_upper' || tier === 't2_lean_legs')) {
    restSec = 120;
  }
  if (meso.deload) restSec = Math.max(60, restSec - 25);

  // Warm-up sets: 1 warm-up set on compounds in Block 1; 2 progressive warm-up sets on heavy Block 2 compounds
  let warmupCount = 0;
  if (machine.compound && machine.loadType !== 'bodyweight' && weightKg >= 10) {
    warmupCount = athlete.goal === 'max_strength' && meso.block === 2 && weightKg >= 20 ? 2 : 1;
  }

  return {
    sets,
    repMin,
    repMax,
    reps: targetReps,
    weightKg,
    rir,
    restSec,
    pct1RM,
    e1rm: currentE1rm,
    warmupCount,
  };
}

/**
 * Build the 6-button 1-tap rep picker options centered on [repMin, repMax].
 */
export function buildRepChoices(repMin, repMax) {
  const lo = Math.max(1, Number(repMin) || 8);
  const hi = Math.max(lo + 1, Number(repMax) || lo + 2);
  const span = hi - lo;

  if (span === 2) {
    // e.g. [8, 10] -> ≤6, 7, 8, 9, 10, 11+  |  [4, 6] -> ≤2, 3, 4, 5, 6, 7+
    const under2 = Math.max(1, lo - 2);
    const under1 = Math.max(1, lo - 1);
    return [
      { label: under2 <= 1 ? '1' : `≤${under2}`, reps: under2, zone: 'low' },
      { label: `${under1}`, reps: under1, zone: 'near' },
      { label: `${lo}`, reps: lo, zone: 'target' },
      { label: `${lo + 1}`, reps: lo + 1, zone: 'target' },
      { label: `${hi}`, reps: hi, zone: 'target' },
      { label: `${hi + 1}+`, reps: hi + 1, zone: 'high' },
    ];
  }

  if (span >= 3) {
    // e.g. [12, 15] -> ≤10, 11, 12, 13–14, 15, 16+
    const under = Math.max(1, lo - 2);
    return [
      { label: `≤${under}`, reps: under, zone: 'low' },
      { label: `${lo - 1}`, reps: Math.max(1, lo - 1), zone: 'near' },
      { label: `${lo}`, reps: lo, zone: 'target' },
      { label: `${lo + 1}`, reps: lo + 1, zone: 'target' },
      { label: `${hi}`, reps: hi, zone: 'target' },
      { label: `${hi + 1}+`, reps: hi + 1, zone: 'high' },
    ];
  }

  // span === 1 (e.g. [5, 6])
  const under2 = Math.max(1, lo - 2);
  const under1 = Math.max(1, lo - 1);
  return [
    { label: `≤${under2}`, reps: under2, zone: 'low' },
    { label: `${under1}`, reps: under1, zone: 'near' },
    { label: `${lo}`, reps: lo, zone: 'target' },
    { label: `${hi}`, reps: hi, zone: 'target' },
    { label: `${hi + 1}`, reps: hi + 1, zone: 'near' },
    { label: `${hi + 2}+`, reps: hi + 2, zone: 'high' },
  ];
}

/**
 * Asymmetric HR rest brake (local muscle recovery floor + wrist-PPG-safe HR extension).
 */
export function evaluateHrRestBrake({ liveBpm, athlete, elapsedSec, extensionsSoFar = 0 }) {
  if (!liveBpm || liveBpm <= 0) return null;
  if (elapsedSec < 15) return null;
  if (extensionsSoFar >= 4) return null;

  const band = getHrBand(athlete, 0, 0.6);
  const ceilingBpm = band.max;
  if (liveBpm > ceilingBpm) {
    return {
      extendSec: 15,
      ceilingBpm,
      reason: `Heart rate still ${liveBpm} bpm · Added +15s rest`,
    };
  }
  return null;
}

export function formatRelativeDays(timestamp, now = Date.now()) {
  if (!timestamp) return 'First workout';
  const hours = Math.max(0, (now - timestamp) / 3600000);
  if (hours < 6) return 'Earlier today';
  if (hours < 30) return 'Yesterday';
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function formatLoad(machine, weightKg, unit = 'kg') {
  if (!machine || machine.loadType === 'bodyweight') {
    return { primary: 'Bodyweight', sub: 'Floor mat' };
  }
  if (machine.loadType === 'cardio') {
    return { primary: 'Cardio', sub: 'Heart rate guided' };
  }
  const factor = unit === 'lb' ? 2.20462 : 1;
  const raw = Math.round(weightKg * factor * 10) / 10;
  const numStr = Number.isInteger(raw) ? String(raw) : raw.toFixed(1);
  if (machine.loadType === 'plate_per_side') {
    return { primary: `${numStr} ${unit}`, sub: 'plates per side' };
  }
  return { primary: `${numStr} ${unit}`, sub: 'weight stack pin' };
}

export function formatRepRange(repMin, repMax, fallbackReps = 8) {
  if (repMin && repMax && repMin !== repMax) return `${repMin}–${repMax}`;
  return `${repMin || fallbackReps}`;
}

export function formatDurationShort(sec) {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r === 0 ? `${m}m` : `${m}m${String(r).padStart(2, '0')}`;
}
