/**
 * Weights — Science-Backed Periodization, Mechanical Load & Rep-Window Engine
 *
 * Implements Phase Potentiation (Issurin, 2010; DeWeese et al., 2015; Bohm et al., 2015;
 * Refalo et al., 2023; Schoenfeld et al., 2017; Murphy & Koehler, 2022):
 * - Climber 8-Week Macrocycle:
 *   - Block 1 (W1–W4): W1–W2 8–10 rep structural/myofibrillar base -> W3 6–8 rep heavy tendon-stiffening
 *     week (~77–80% 1RM) -> W4 real deload (-45% sets, -10% load). Lean legs capped at 2 sets.
 *   - Block 2 (W5–W8): Max Neural Force Realization (5–7 -> 4–6 -> 3–5 compound reps with 2-step warm-ups,
 *     lean legs kept at 2 sets, single-joint/cuff/lumbar/core protected at 10–15 reps) -> W8 taper/deload.
 * - Non-Climber 4-Week Mesocycle (W1 Base -> W2 Build -> W3 Push -> W4 Deload).
 * - Mechanical Load & Step-Aware Double Progression:
 *   - Models sled/bar tare mass (`tareKg + 2 * perSideKg`) + smooth monotonic Epley 1RM + exact inverse,
 *     with step-aware progression state so zero machines ever stall in rounding dead zones.
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
    priorityMovements: ['vert_pull', 'horiz_pull', 'knee_flex', 'squat', 'hinge', 'core', 'horiz_push', 'scapular', 'calf'],
  },
  body_focus: {
    id: 'body_focus',
    name: 'Target Body Parts',
    short: 'Body Focus',
    tagline: 'Extra sets on chosen areas (4w cycle)',
    compoundRestSec: 115,
    posteriorRestSec: 90,
    isolationRestSec: 70,
    priorityMovements: ['hinge', 'squat', 'vert_pull', 'horiz_pull', 'horiz_push', 'knee_flex', 'core', 'scapular'],
  },
  fat_loss: {
    id: 'fat_loss',
    name: 'Lean & Conditioning',
    short: 'Weight Loss',
    tagline: 'Preserve muscle · Heavy lifts + Zone 2',
    compoundRestSec: 120,
    posteriorRestSec: 90,
    isolationRestSec: 65,
    priorityMovements: ['squat', 'vert_pull', 'horiz_push', 'horiz_pull', 'hinge', 'knee_flex', 'core'],
  },
  hypertrophy: {
    id: 'hypertrophy',
    name: 'Muscle Growth',
    short: 'Build Muscle',
    tagline: '8–12 reps · Balanced volume (4w cycle)',
    compoundRestSec: 120,
    posteriorRestSec: 95,
    isolationRestSec: 75,
    priorityMovements: ['squat', 'horiz_push', 'vert_pull', 'horiz_pull', 'hinge', 'knee_flex', 'knee_ext', 'pec_fly', 'core', 'calf'],
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
 * 8-Week 2-Block Climber Macrocycle:
 * - Weeks 1–4 = Block 1 (W1–W2 8–10 Structural Base -> W3 6–8 Heavy Tendon Strain -> W4 Deload)
 * - Weeks 5–8 = Block 2 (W5 5–7 Bridge -> W6 4–6 Force -> W7 3–5 Neural Peak -> W8 Deload)
 */
export const MESOCYCLE_WEEKS = {
  1: { week: 1, totalWeeks: 8, block: 1, blockName: 'Base Phase', name: 'Base W1', headerTag: 'Base · W1/8', summary: '8–10 rep structural & muscle base', compoundWindow: [8, 10], posteriorWindow: [10, 12], isolationWindow: [12, 15], loadDelta: 0.0, setMult: 1.0, rir: 2, deload: false },
  2: { week: 2, totalWeeks: 8, block: 1, blockName: 'Base Phase', name: 'Build W2', headerTag: 'Base · W2/8', summary: '8–10 rep progressive base', compoundWindow: [8, 10], posteriorWindow: [10, 12], isolationWindow: [12, 15], loadDelta: 0.02, setMult: 1.0, rir: 2, deload: false },
  3: { week: 3, totalWeeks: 8, block: 1, blockName: 'Base Phase', name: 'Tendon W3', headerTag: 'Tendon · W3/8', summary: '6–8 rep heavy tendon-stiffening week', compoundWindow: [6, 8], posteriorWindow: [8, 10], isolationWindow: [12, 15], loadDelta: 0.02, setMult: 1.0, rir: 1, deload: false },
  4: { week: 4, totalWeeks: 8, block: 1, blockName: 'Base Deload', name: 'Deload W4', headerTag: 'Deload · W4/8', summary: 'Light recovery week (−45% sets, −10% load)', compoundWindow: [8, 8], posteriorWindow: [8, 10], isolationWindow: [12, 12], loadDelta: -0.10, setMult: 0.5, rir: 3, deload: true },
  5: { week: 5, totalWeeks: 8, block: 2, blockName: 'Neural Strength', name: 'Bridge W5', headerTag: 'Neural · W5/8', summary: '5–7 rep heavy strength bridge', compoundWindow: [5, 7], posteriorWindow: [6, 8], isolationWindow: [10, 12], loadDelta: 0.0, setMult: 1.0, rir: 2, deload: false },
  6: { week: 6, totalWeeks: 8, block: 2, blockName: 'Neural Strength', name: 'Force W6', headerTag: 'Neural · W6/8', summary: '4–6 rep high-force recruitment', compoundWindow: [4, 6], posteriorWindow: [6, 8], isolationWindow: [10, 12], loadDelta: 0.02, setMult: 1.0, rir: 2, deload: false },
  7: { week: 7, totalWeeks: 8, block: 2, blockName: 'Neural Peak', name: 'Peak W7', headerTag: 'Peak · W7/8', summary: '3–5 rep peak neural force', compoundWindow: [3, 5], posteriorWindow: [6, 8], isolationWindow: [10, 12], loadDelta: 0.03, setMult: 1.0, rir: 1, deload: false },
  8: { week: 8, totalWeeks: 8, block: 2, blockName: 'Neural Deload', name: 'Deload W8', headerTag: 'Deload · W8/8', summary: 'Fast neural taper & reset (−45% sets)', compoundWindow: [5, 5], posteriorWindow: [8, 8], isolationWindow: [10, 12], loadDelta: -0.12, setMult: 0.5, rir: 3, deload: true },
};

/**
 * 4-Week Standard Mesocycle for Hypertrophy, Body Focus, and Weight Loss goals.
 */
export const STANDARD_MESO_WEEKS = {
  1: { week: 1, totalWeeks: 4, block: 1, blockName: 'Standard Cycle', name: 'Base W1', headerTag: 'Base · W1/4', summary: '8–12 rep baseline volume', compoundWindow: [8, 10], posteriorWindow: [10, 12], isolationWindow: [12, 15], loadDelta: 0.0, setMult: 1.0, rir: 2, deload: false },
  2: { week: 2, totalWeeks: 4, block: 1, blockName: 'Standard Cycle', name: 'Build W2', headerTag: 'Build · W2/4', summary: 'Progressive overload week', compoundWindow: [8, 10], posteriorWindow: [10, 12], isolationWindow: [12, 15], loadDelta: 0.02, setMult: 1.0, rir: 2, deload: false },
  3: { week: 3, totalWeeks: 4, block: 1, blockName: 'Standard Cycle', name: 'Push W3', headerTag: 'Push · W3/4', summary: 'Peak volume & effort before deload', compoundWindow: [8, 10], posteriorWindow: [10, 12], isolationWindow: [12, 15], loadDelta: 0.03, setMult: 1.0, rir: 1, deload: false },
  4: { week: 4, totalWeeks: 4, block: 1, blockName: 'Recovery Deload', name: 'Deload W4', headerTag: 'Deload · W4/4', summary: 'Recovery deload (−45% sets, −10% load)', compoundWindow: [8, 8], posteriorWindow: [10, 10], isolationWindow: [12, 12], loadDelta: -0.10, setMult: 0.5, rir: 3, deload: true },
};

export function getMesocyclePhase(weekNum = 1, goalId = 'max_strength') {
  if (goalId && goalId !== 'max_strength') {
    const w4 = ((Math.max(1, Math.round(weekNum)) - 1) % 4) + 1;
    return STANDARD_MESO_WEEKS[w4];
  }
  const w8 = ((Math.max(1, Math.round(weekNum)) - 1) % 8) + 1;
  return MESOCYCLE_WEEKS[w8];
}

/**
 * Convert displayed machine weight (stack pin kg or single-side plate kg) into
 * total mechanical system load (including carriage/bar tare mass on plate-loaded machines).
 */
export function totalMechanicalKg(machine, displayedKg) {
  if (!machine || machine.loadType === 'cardio' || machine.loadType === 'bodyweight') return 0;
  const d = Math.max(0, Number(displayedKg) || 0);
  if (machine.loadType === 'plate_per_side') {
    return (Number(machine.tareKg) || 0) + 2 * d;
  }
  return d;
}

/**
 * Convert total mechanical system load back to displayed machine weight (per-side plate kg or stack kg).
 */
export function displayedFromTotalKg(machine, totalKg) {
  if (!machine || machine.loadType === 'cardio' || machine.loadType === 'bodyweight') return 0;
  const t = Math.max(0, Number(totalKg) || 0);
  if (machine.loadType === 'plate_per_side') {
    return Math.max(0, (t - (Number(machine.tareKg) || 0)) / 2);
  }
  return t;
}

/**
 * Continuous, strictly monotonic Epley 1RM estimator (smooth through 1–25 effective reps).
 */
export function estimate1RM(weightKg, reps, rir = 2) {
  const w = Number(weightKg) || 0;
  if (w <= 0) return 0;
  const r = Number.isFinite(Number(rir)) ? Math.max(0, Number(rir)) : 2;
  const effReps = Math.max(1, Math.min(25, (Number(reps) || 1) + r));
  if (effReps === 1) return Math.round(w * 100) / 100;
  return Math.round(w * (1 + effReps / 30) * 100) / 100;
}

/**
 * Exact analytical inverse of `estimate1RM` (0.0% round-trip drift).
 */
export function inverseEpleyKg(e1rm, reps, rir = 2) {
  const oneRm = Number(e1rm) || 0;
  if (oneRm <= 0) return 0;
  const r = Number.isFinite(Number(rir)) ? Math.max(0, Number(rir)) : 2;
  const effReps = Math.max(1, Math.min(25, (Number(reps) || 1) + r));
  if (effReps === 1) return oneRm;
  return oneRm / (1 + effReps / 30);
}

export function roundToStep(valueKg, stepKg = 2.5, allowZero = false) {
  const step = Number(stepKg) > 0 ? Number(stepKg) : 2.5;
  const rounded = Math.round((Number(valueKg) || 0) / step) * step;
  return allowZero ? Math.max(0, rounded) : Math.max(step, rounded);
}

/**
 * Unit-aware load step metadata & clean gym-increment nudger (`2.5 kg` in kg mode; `5 lb` stack / `2.5 lb` plate in lb mode).
 */
export function getStepLabel(machine, unit = 'kg') {
  if (unit === 'lb') {
    const stepLb = machine?.loadType === 'plate_per_side' ? 2.5 : 5;
    return `${stepLb} lb`;
  }
  return `${machine?.stepKg || 2.5} kg`;
}

export function nudgeWeightKg(machine, currentKg, direction = 1, unit = 'kg') {
  const dir = direction >= 0 ? 1 : -1;
  if (unit === 'lb') {
    const stepLb = machine?.loadType === 'plate_per_side' ? 2.5 : 5;
    const curLb = Math.round((Number(currentKg) || 0) * 2.20462 * 2) / 2;
    let nextLb;
    if (Math.abs(curLb % stepLb) > 0.05) {
      nextLb = dir > 0 ? Math.ceil(curLb / stepLb) * stepLb : Math.floor(curLb / stepLb) * stepLb;
    } else {
      nextLb = curLb + dir * stepLb;
    }
    nextLb = Math.max(stepLb, nextLb);
    return Math.round((nextLb / 2.20462) * 1000) / 1000;
  }
  const stepKg = machine?.stepKg || 2.5;
  return Math.max(stepKg, Math.round(((Number(currentKg) || 0) + dir * stepKg) * 100) / 100);
}

/**
 * Evaluate autonomic & muscular readiness using RHR, resting HRV (RMSSD), and hours since last session.
 */
export function evaluateReadiness(athlete, liveWearable = null, now = Date.now()) {
  const baseRhr = Number(athlete.baselineRhr) || 58;
  const todayRhr = Number(athlete.todayRhr) || baseRhr;
  const baseHrv = Number(athlete.baselineHrv) || 58;
  // Use resting HRV only (never live exercising RMSSD, which drops during vagal withdrawal)
  const restHrv = Number(athlete.todayHrv) || null;

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

  if (restHrv && baseHrv > 0) {
    const ratio = restHrv / baseHrv;
    if (ratio >= 1.05) {
      score += 6;
      reasons.push(`HRV ${restHrv}ms`);
    } else if (ratio <= 0.74) {
      score -= 22;
      reasons.push(`HRV low`);
    } else if (ratio <= 0.86) {
      score -= 10;
      reasons.push(`HRV ${restHrv}ms`);
    } else {
      reasons.push(`HRV ${restHrv}ms`);
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

/**
 * Karvonen Heart Rate Reserve band anchored to chronic baselineRhr (so acute illness/fatigue never raises target HR).
 */
export function getHrBand(athlete, lowHrrPct, highHrrPct) {
  const rhr = Number(athlete?.baselineRhr || athlete?.todayRhr) || 58;
  const mhr = Math.max(rhr + 50, Number(athlete?.maxHr) || 188);
  const reserve = mhr - rhr;
  return {
    min: Math.round(rhr + reserve * lowHrrPct),
    max: Math.round(rhr + reserve * highHrrPct),
  };
}

/**
 * Resolve stored mechanical e1RM for a machine, upgrading legacy single-side plate records if needed.
 */
export function resolveMachineE1rm(machine, liftRec) {
  const seedTotalKg = totalMechanicalKg(machine, machine.baselineWorkKg);
  const seedE1rm = estimate1RM(seedTotalKg, machine.baselineReps, 2);
  if (!liftRec || !(liftRec.e1rm > 0)) return seedE1rm;

  if (machine.loadType === 'plate_per_side' && liftRec.e1rm <= (Number(machine.tareKg) || 0) + 2) {
    const migratedTotal = totalMechanicalKg(machine, liftRec.lastWeight ?? machine.baselineWorkKg);
    const migratedReps = liftRec.lastReps?.[0] || machine.baselineReps || 8;
    return estimate1RM(migratedTotal, migratedReps, 2);
  }
  return liftRec.e1rm;
}

/**
 * Prescribe working weight, rep window [repMin, repMax], sets, warm-ups, and rest
 * using the 4 Movement Tiers + Block Periodization + Step-Aware Double Progression.
 */
export function prescribeStation(machine, athlete, readiness, opts = {}) {
  const goal = GOAL_PROFILES[athlete.goal] || GOAL_PROFILES.max_strength;
  const meso = getMesocyclePhase(athlete.mesocycle?.week || 1, athlete.goal);
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
      isDiscounted: false,
    };
  }

  const tier = machine.tier || (machine.compound ? 't1_upper' : 't4_isolation');
  const isFocusMatch = (athlete.focusAreas || []).some((areaId) => {
    const area = FOCUS_AREAS.find((f) => f.id === areaId);
    return area?.muscles.some((m) => (machine.muscles?.[m] || 0) >= 0.5);
  });

  let repMin = 8;
  let repMax = 10;
  let rawSets = 3;

  if (athlete.goal === 'max_strength') {
    if (tier === 't1_upper') {
      [repMin, repMax] = meso.compoundWindow;
      rawSets = 3;
    } else if (tier === 't2_lean_legs') {
      [repMin, repMax] = meso.compoundWindow;
      // Keep lean-leg cap at 2 working sets across BOTH Block 1 and Block 2 (1 set on deloads)
      rawSets = 2;
    } else if (tier === 't3_posterior') {
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
    // Hypertrophy, Body Focus, Weight Loss (with 4-week progressive + deload cycle)
    if (tier === 't1_upper' || tier === 't2_lean_legs') {
      [repMin, repMax] = meso.deload ? [8, 8] : athlete.goal === 'hypertrophy' ? [8, 12] : [8, 10];
      rawSets = athlete.goal === 'hypertrophy' && (athlete.targetMinutes || 45) >= 45 ? 4 : 3;
    } else if (tier === 't3_posterior') {
      [repMin, repMax] = meso.deload ? [10, 10] : [10, 12];
      rawSets = 3;
    } else {
      [repMin, repMax] = meso.deload ? [12, 12] : [12, 15];
      rawSets = athlete.goal === 'fat_loss' ? 2 : 3;
    }
    if (athlete.goal === 'body_focus') {
      rawSets = isFocusMatch ? 4 : 2;
    }
    // Enforce 2-set lumbar safety cap across ALL goals
    if (machine.id === 'm_lower_back') {
      rawSets = Math.min(2, rawSets);
    }
  }

  if (machine.loadType === 'bodyweight') {
    repMin = Math.max(10, repMin);
    repMax = Math.max(meso.deload ? 10 : 14, repMax);
  }

  const targetReps = Math.round((repMin + repMax) / 2);
  const rir = meso.rir;

  const scaledSets = Math.round(rawSets * meso.setMult * (readiness?.setMult || 1));
  const sets = meso.deload
    ? Math.max(1, Math.min(2, scaledSets))
    : Math.max(readiness?.tier === 'recover' ? 1 : 2, Math.min(5, scaledSets));

  const currentE1rm = resolveMachineE1rm(machine, liftRec);
  const daysSinceLift = liftRec?.lastAt ? (now - liftRec.lastAt) / 86400000 : 4;
  const rustMult = daysSinceLift > 14 ? 0.96 : 1.0;
  const loadMult = readiness?.loadMult || 1.0;
  const isDiscounted = Boolean(meso.deload || loadMult < 1.0 || rustMult < 1.0);

  let weightKg = 0;
  let pct1RM = 0.75;
  const stepInc = machine.stepKg || 2.5;

  if (machine.loadType !== 'bodyweight' && currentE1rm > 0) {
    const rawTotalKg =
      inverseEpleyKg(currentE1rm, targetReps, rir) * (1 + meso.loadDelta * 0.6) * loadMult * rustMult;
    const rawDisplayedKg = displayedFromTotalKg(machine, rawTotalKg);
    weightKg = roundToStep(rawDisplayedKg, stepInc);

    // Step-aware Double Progression (eliminates rounding dead zones & yo-yo drops)
    const lastWorkKg = Number(liftRec?.lastWorkingKg ?? liftRec?.lastWeight) || 0;
    const lastRepMax = Number(liftRec?.lastRepMax) || repMax;
    const progState = liftRec?.progressionState || null;

    if (!isDiscounted && lastWorkKg > 0 && repMax <= lastRepMax) {
      if (progState === 'step_up') {
        const minStepped = roundToStep(lastWorkKg + stepInc, stepInc);
        if (weightKg < minStepped) weightKg = minStepped;
      } else if (progState === 'hold' && repMax === lastRepMax) {
        if (weightKg < lastWorkKg) weightKg = lastWorkKg;
      } else if (progState === 'step_down' && repMax === lastRepMax) {
        const steppedDown = roundToStep(lastWorkKg - stepInc, stepInc);
        if (weightKg > steppedDown) weightKg = steppedDown;
      }
    }

    const finalTotalKg = totalMechanicalKg(machine, weightKg);
    pct1RM = Math.min(0.94, Math.round((finalTotalKg / currentE1rm) * 100) / 100);
  }

  let restSec =
    tier === 't1_upper' || tier === 't2_lean_legs'
      ? goal.compoundRestSec
      : tier === 't3_posterior'
      ? goal.posteriorRestSec
      : goal.isolationRestSec;

  if (athlete.goal === 'max_strength' && meso.block === 1 && meso.week <= 2 && (tier === 't1_upper' || tier === 't2_lean_legs')) {
    restSec = 120;
  }
  if (meso.deload) restSec = Math.max(60, restSec - 25);

  // Warm-up sets scaled across all goals by total mechanical load & intensity
  const totalWorkKg = totalMechanicalKg(machine, weightKg);
  let warmupCount = 0;
  if (machine.loadType !== 'bodyweight' && weightKg > 0) {
    if (meso.deload) {
      warmupCount = machine.compound && totalWorkKg >= 30 ? 1 : 0;
    } else if (machine.compound && (repMax <= 7 || totalWorkKg >= 65)) {
      warmupCount = 2;
    } else if ((machine.compound && totalWorkKg >= 25) || (machine.id === 'm_leg_curl' && repMax <= 8)) {
      warmupCount = 1;
    }
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
    isDiscounted,
  };
}

/**
 * Build the 6-button 1-tap rep picker options centered on [repMin, repMax].
 * Guarantees every integer in 2- and 3-rep-span windows (including `14` on `12–15`!) is directly tappable.
 */
export function buildRepChoices(repMin, repMax) {
  const lo = Math.max(1, Number(repMin) || 8);
  const hi = Math.max(lo, Number(repMax) || lo);
  const span = hi - lo;

  if (span === 0) {
    // Exact target rep (e.g. Deload 8 or 5 reps)
    const under2 = Math.max(1, lo - 2);
    const under1 = Math.max(1, lo - 1);
    return [
      { label: under2 <= 1 ? '1' : `≤${under2}`, reps: under2, zone: 'low' },
      { label: `${under1}`, reps: under1, zone: 'near' },
      { label: `${lo}`, reps: lo, zone: 'target' },
      { label: `${lo + 1}`, reps: lo + 1, zone: 'near' },
      { label: `${lo + 2}`, reps: lo + 2, zone: 'near' },
      { label: `${lo + 3}+`, reps: lo + 3, zone: 'high' },
    ];
  }

  if (span === 2) {
    // e.g. [8, 10] -> ≤6, 7, 8, 9, 10, 11+  |  [3, 5] -> 1, 2, 3, 4, 5, 6+
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

  if (span === 3) {
    // e.g. [12, 15] -> ≤10, 12, 13, 14, 15, 16+ (all 4 target reps including 14 present!)
    const under2 = Math.max(1, lo - 2);
    return [
      { label: under2 <= 1 ? '1' : `≤${under2}`, reps: under2, zone: 'low' },
      { label: `${lo}`, reps: lo, zone: 'target' },
      { label: `${lo + 1}`, reps: lo + 1, zone: 'target' },
      { label: `${lo + 2}`, reps: lo + 2, zone: 'target' },
      { label: `${hi}`, reps: hi, zone: 'target' },
      { label: `${hi + 1}+`, reps: hi + 1, zone: 'high' },
    ];
  }

  if (span >= 4) {
    // e.g. [8, 12] -> ≤6, 8, 9, 10, 12, 13+
    const under2 = Math.max(1, lo - 2);
    const mid = Math.round((lo + hi) / 2);
    return [
      { label: under2 <= 1 ? '1' : `≤${under2}`, reps: under2, zone: 'low' },
      { label: `${lo}`, reps: lo, zone: 'target' },
      { label: `${lo + 1}`, reps: lo + 1, zone: 'target' },
      { label: `${mid}`, reps: mid, zone: 'target' },
      { label: `${hi}`, reps: hi, zone: 'target' },
      { label: `${hi + 1}+`, reps: hi + 1, zone: 'high' },
    ];
  }

  // span === 1 (e.g. [5, 6])
  const under2 = Math.max(1, lo - 2);
  const under1 = Math.max(1, lo - 1);
  return [
    { label: under2 <= 1 ? '1' : `≤${under2}`, reps: under2, zone: 'low' },
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
  if ((Number(weightKg) || 0) <= 0 && machine.loadType === 'plate_per_side') {
    const tare = Number(machine.tareKg) || 15;
    const tareDisp = unit === 'lb' ? `${Math.round(tare * 2.20462)} lb` : `${tare} kg`;
    return { primary: `0 ${unit}`, sub: `empty bar/sled (${tareDisp})` };
  }
  const factor = unit === 'lb' ? 2.20462 : 1;
  const rawVal = (Number(weightKg) || 0) * factor;
  // Snap close half-pound / integer values cleanly in lb mode
  const raw =
    unit === 'lb'
      ? Math.abs(rawVal - Math.round(rawVal * 2) / 2) < 0.12
        ? Math.round(rawVal * 2) / 2
        : Math.round(rawVal * 10) / 10
      : Math.round(rawVal * 10) / 10;
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
