/**
 * Weights — AI Dynamic Session Director & Partner Co-Location Scheduler
 */

import {
  GYM_MACHINES,
  getMachineById,
  distanceMeters,
  getZoneInfo,
  findBestSubstitute,
} from './floor.js';
import {
  GOAL_PROFILES,
  CARDIO_PROFILES,
  FOCUS_AREAS,
  getMesocyclePhase,
  evaluateReadiness,
  estimate1RM,
  roundToStep,
  getHrBand,
  prescribeStation,
  formatRelativeDays,
  formatLoad,
  formatDurationShort,
} from './science.js';

export const SPLIT_TEMPLATES = {
  pull_posterior: {
    id: 'pull_posterior',
    name: 'Max Pull, Posterior & Core',
    short: 'Pull + Posterior',
    candidates: ['m_lat_pull', 'm_low_row', 'm_leg_curl', 'm_hip_thrust', 'm_lower_back', 'm_abs_mat', 'm_cable_pull'],
    cardioMode: 'zone2',
  },
  lower_push: {
    id: 'lower_push',
    name: 'Heavy Legs, Push & Core',
    short: 'Legs + Push',
    candidates: ['m_leg_press', 'm_smith_incline', 'm_ab_crunch', 'm_leg_ext', 'm_calf', 'm_butterfly'],
    cardioMode: 'zone2',
  },
  full_force_vo2: {
    id: 'full_force_vo2',
    name: 'Peak Force + VO₂max 4×3m',
    short: 'Force + VO₂max',
    candidates: ['m_leg_press', 'm_pullup', 'm_chest_press', 'm_leg_curl', 'm_abs_mat'],
    cardioMode: 'vo2_4x3',
  },
  cardio_core: {
    id: 'cardio_core',
    name: 'Cardio Conditioning & Core',
    short: 'Cardio + Core',
    candidates: ['m_abs_mat', 'm_cable_pull', 'm_calf'],
    cardioMode: 'dedicated',
  },
};

const SPLIT_ROTATION = ['lower_push', 'pull_posterior', 'full_force_vo2'];

/**
 * Automatically pick today's best split from workout history, recency, goal & readiness.
 */
export function recommendTodaySplit(athlete, readiness, now = Date.now()) {
  if (readiness.tier === 'recover' || readiness.hoursSince < 20) {
    return {
      splitId: 'cardio_core',
      reason: readiness.hoursSince < 20 ? 'Lifted <20h ago · Active recovery' : 'Low readiness · Zone 2 & Core',
    };
  }

  // Check if focus-area specialization prefers glutes/legs
  if (athlete.goal === 'body_focus' && (athlete.focusAreas || []).includes('glutes') && athlete.lastSplitId !== 'lower_push') {
    return {
      splitId: 'lower_push',
      reason: 'Glute & Lower priority',
    };
  }

  const lastIdx = SPLIT_ROTATION.indexOf(athlete.lastSplitId);
  const nextSplit = SPLIT_ROTATION[(lastIdx + 1) % SPLIT_ROTATION.length];

  const reasonMap = {
    pull_posterior: `Pull & posterior fresh (${formatRelativeDays(athlete.lastWorkoutAt, now)})`,
    lower_push: `Legs & push fresh (${formatRelativeDays(athlete.lastWorkoutAt, now)})`,
    full_force_vo2: 'Full-body force + weekly VO₂max stimulus',
  };

  return {
    splitId: nextSplit,
    reason: reasonMap[nextSplit] || 'Next in mesocycle',
  };
}

function isJointFlagActive(athlete, machine, now = Date.now()) {
  const flags = athlete.jointFlags || {};
  for (const [joint, ts] of Object.entries(flags)) {
    if (ts && now - ts < 7 * 86400000) {
      if ((machine.jointStress?.[joint] || 0) > 0.3) return joint;
    }
  }
  return null;
}

/**
 * Order stations with compounds first (CNS freshness) and minimal walking distance within each tier.
 */
function orderStationsSpatially(stations, startMachine, floorOverrides = {}) {
  const compounds = stations.filter((s) => s.compound);
  const accessories = stations.filter((s) => !s.compound);

  const greedyPath = (list, fromNode) => {
    const pool = [...list];
    const ordered = [];
    let cur = fromNode;
    while (pool.length) {
      pool.sort((a, b) => distanceMeters(cur, a, floorOverrides) - distanceMeters(cur, b, floorOverrides));
      const next = pool.shift();
      ordered.push(next);
      cur = next;
    }
    return ordered;
  };

  const orderedCompounds = greedyPath(compounds, startMachine);
  const lastComp = orderedCompounds[orderedCompounds.length - 1] || startMachine;
  const orderedAccessories = greedyPath(accessories, lastComp);
  return [...orderedCompounds, ...orderedAccessories];
}

function pickWarmupMachine(athlete, firstLift, floorOverrides = {}, now = Date.now()) {
  const options = ['c_rower', 'c_treadmill', 'c_climbmill', 'c_bike']
    .map((id) => getMachineById(id))
    .filter((m) => m && !isJointFlagActive(athlete, m, now));

  const pool = options.length ? options : [getMachineById('c_bike')];
  if (athlete.goal === 'max_strength' && pool.some((m) => m.id === 'c_rower')) {
    return pool.find((m) => m.id === 'c_rower');
  }
  pool.sort((a, b) => distanceMeters(a, firstLift, floorOverrides) - distanceMeters(b, firstLift, floorOverrides));
  return pool[0];
}

function pickCardioMachine(athlete, mode, floorOverrides = {}, now = Date.now()) {
  const preferIds = mode === 'vo2_4x3' ? ['c_treadmill', 'c_climbmill', 'c_bike'] : ['c_climbmill', 'c_treadmill', 'c_bike'];
  for (const id of preferIds) {
    const m = getMachineById(id);
    if (m && !isJointFlagActive(athlete, m, now)) return m;
  }
  return getMachineById('c_bike');
}

function buildLiftSets(machine, rx) {
  const sets = [];
  if (rx.needsWarmupSet) {
    const warmKg = roundToStep(rx.weightKg * 0.55, machine.stepKg || 2.5);
    sets.push({
      kind: 'warmup',
      targetReps: Math.min(6, rx.reps + 1),
      weightKg: warmKg,
      rir: 4,
      restSec: 60,
      done: false,
      actualReps: null,
      effort: null,
    });
  }
  for (let i = 0; i < rx.sets; i++) {
    sets.push({
      kind: 'work',
      setIndex: i + 1,
      targetReps: rx.reps,
      weightKg: rx.weightKg,
      rir: rx.rir,
      restSec: rx.restSec,
      done: false,
      actualReps: null,
      effort: null,
    });
  }
  return sets;
}

/**
 * Pair a second athlete onto nearby stations for each step with matched block duration.
 */
function attachPartnerAssignments(steps, primaryAthlete, partner, floorOverrides = {}, now = Date.now()) {
  if (!partner?.enabled) return;
  const partnerReadiness = evaluateReadiness(partner, null, now);
  const usedIds = new Set();

  // Score all strength machines for partner's goal
  const partnerPool = GYM_MACHINES.filter(
    (m) => m.loadType !== 'cardio' && !isJointFlagActive(partner, m, now)
  );

  for (const step of steps) {
    const primaryMachine = getMachineById(step.stationId);
    if (step.type === 'warmup') {
      const altWarm = primaryMachine.id === 'c_treadmill' ? getMachineById('c_climbmill') : getMachineById('c_treadmill');
      const dist = distanceMeters(primaryMachine, altWarm, floorOverrides);
      step.partner = {
        name: partner.name || 'Partner',
        stationId: altWarm.id,
        stationName: altWarm.name,
        distanceM: dist,
        prescription: '5m Z1–Z2 warm-up',
      };
      continue;
    }

    if (step.type === 'cardio') {
      const altCardio = primaryMachine.id === 'c_climbmill' ? getMachineById('c_treadmill') : getMachineById('c_climbmill');
      const dist = distanceMeters(primaryMachine, altCardio, floorOverrides);
      const z2 = getHrBand(partner, 0.6, 0.7);
      step.partner = {
        name: partner.name || 'Partner',
        stationId: altCardio.id,
        stationName: altCardio.name,
        distanceM: dist,
        prescription: `${Math.round(step.durationSec / 60)}m · ${z2.min}–${z2.max} bpm`,
      };
      continue;
    }

    // Strength step: estimate primary block duration in seconds
    const primarySec = step.sets.reduce((acc, s) => acc + 32 + (s.restSec || 90), 0);

    let bestM = null;
    let bestScore = -Infinity;
    for (const cand of partnerPool) {
      if (cand.id === primaryMachine.id) continue;
      if (usedIds.has(cand.id)) continue;

      let s = 0;
      const goal = GOAL_PROFILES[partner.goal] || GOAL_PROFILES.body_focus;
      const movRank = goal.priorityMovements.indexOf(cand.movement);
      if (movRank >= 0) s += (10 - movRank) * 4;

      const focusHit = (partner.focusAreas || []).some((areaId) => {
        const area = FOCUS_AREAS.find((f) => f.id === areaId);
        return area?.muscles.some((mus) => (cand.muscles?.[mus] || 0) >= 0.5);
      });
      if (focusHit) s += 26;

      // Strong proximity preference so partners stay close on the floor
      const dist = distanceMeters(primaryMachine, cand, floorOverrides);
      s -= dist * 2.4;

      if (s > bestScore) {
        bestScore = s;
        bestM = cand;
      }
    }

    if (bestM) {
      usedIds.add(bestM.id);
      const rx = prescribeStation(bestM, partner, partnerReadiness, { now });
      // Match partner's set count so block duration matches primary athlete within ~35s
      const perSetSec = 35 + rx.restSec;
      const matchedSets = Math.max(2, Math.min(4, Math.round(primarySec / perSetSec)));
      const loadStr = formatLoad(bestM, rx.weightKg, 'kg').primary;
      step.partner = {
        name: partner.name || 'Partner',
        stationId: bestM.id,
        stationName: bestM.name,
        setup: bestM.setup,
        distanceM: distanceMeters(primaryMachine, bestM, floorOverrides),
        weightKg: rx.weightKg,
        sets: matchedSets,
        reps: rx.reps,
        restSec: rx.restSec,
        prescription: `${matchedSets}×${rx.reps} @ ${loadStr}`,
      };
    }
  }
}

/**
 * Generate a complete, science-backed dynamic workout session.
 */
export function createDynamicSession(state, options = {}) {
  const now = options.now || Date.now();
  const athlete = state.athlete;
  const floorOverrides = state.floorOverrides || {};
  const readiness = evaluateReadiness(athlete, options.liveWearable || null, now);
  const rec = recommendTodaySplit(athlete, readiness, now);

  const splitId = options.splitOverride || rec.splitId;
  const split = SPLIT_TEMPLATES[splitId] || SPLIT_TEMPLATES.pull_posterior;
  const targetMinutes = Number(options.durationMin || athlete.targetMinutes) || 45;
  const cardioProfile = CARDIO_PROFILES[athlete.cardioGoal] || CARDIO_PROFILES.cardio_health;
  const meso = getMesocyclePhase(athlete.mesocycle?.week || 1);

  // Determine how many strength stations fit cleanly inside targetMinutes
  const cardioMin =
    split.cardioMode === 'dedicated'
      ? Math.max(15, Math.min(targetMinutes - 14, cardioProfile.dedicatedMin))
      : cardioProfile.finisherMin > 0
      ? targetMinutes <= 32
        ? 8
        : Math.min(12, cardioProfile.finisherMin)
      : 0;

  const warmupMin = targetMinutes <= 32 ? 4 : 5;
  const liftBudgetMin = Math.max(10, targetMinutes - warmupMin - cardioMin);
  const stationMinutesAvg = athlete.goal === 'max_strength' ? 9.2 : 6.8;
  const maxLiftCount =
    split.cardioMode === 'dedicated'
      ? 2
      : Math.max(2, Math.min(6, Math.round(liftBudgetMin / stationMinutesAvg)));

  // Select candidate machines, substituting any joint-flagged ones automatically
  const chosenMachines = [];
  const usedIds = new Set();

  // If body_focus, prepend top focus machines not already in split
  let candidateIds = [...split.candidates];
  if (athlete.goal === 'body_focus' && split.cardioMode !== 'dedicated') {
    const focusFirst = GYM_MACHINES.filter((m) =>
      m.loadType !== 'cardio' &&
      (athlete.focusAreas || []).some((aId) => {
        const area = FOCUS_AREAS.find((f) => f.id === aId);
        return area?.muscles.some((mus) => (m.muscles?.[mus] || 0) >= 0.7);
      })
    ).map((m) => m.id);
    candidateIds = [...new Set([...focusFirst, ...candidateIds])];
  }

  for (const id of candidateIds) {
    if (chosenMachines.length >= maxLiftCount) break;
    const prefSwap = athlete.formNotes?.[id]?.preferSwapId;
    let m = getMachineById(prefSwap || id) || getMachineById(id);
    if (!m) continue;

    const flaggedJoint = isJointFlagActive(athlete, m, now);
    if (flaggedJoint) {
      const safeSub = findBestSubstitute(m, {
        excludeIds: [...usedIds],
        painJoint: flaggedJoint,
        floorOverrides,
      });
      m = safeSub;
    }

    if (m && !usedIds.has(m.id)) {
      usedIds.add(m.id);
      chosenMachines.push(m);
    }
  }

  const warmupSeed = chosenMachines[0] || getMachineById('m_abs_mat');
  const warmupMachine = pickWarmupMachine(athlete, warmupSeed, floorOverrides, now);
  const orderedLifts = orderStationsSpatially(chosenMachines, warmupMachine, floorOverrides);

  const steps = [];
  const z12 = getHrBand(athlete, 0.45, 0.62);

  // 1. Guided Warm-up
  steps.push({
    id: 'step_warmup',
    type: 'warmup',
    stationId: warmupMachine.id,
    zoneCode: getZoneInfo(warmupMachine.zone).code,
    walkMeters: 0,
    durationSec: warmupMin * 60,
    hrBand: z12,
    setup: warmupMachine.setup,
    cue: athlete.formNotes?.[warmupMachine.id]?.pinnedCue || `5 min progressive ramp (${z12.min}–${z12.max} bpm) + shoulder/hip circles`,
    done: false,
  });

  // 2. Strength Stations
  let prevMachine = warmupMachine;
  orderedLifts.forEach((m, idx) => {
    const rx = prescribeStation(m, athlete, readiness, { now });
    const sets = buildLiftSets(m, rx);
    const walkM = distanceMeters(prevMachine, m, floorOverrides);
    const pinnedCue = athlete.formNotes?.[m.id]?.pinnedCue || '';
    steps.push({
      id: `step_lift_${idx}_${m.id}`,
      type: 'lift',
      stationId: m.id,
      zoneCode: getZoneInfo(m.zone).code,
      walkMeters: walkM,
      prevStationId: prevMachine.id,
      setup: m.setup,
      cue: pinnedCue || m.cue,
      pct1RM: rx.pct1RM,
      seedE1rm: rx.e1rm,
      sets,
      liveNote: pinnedCue ? `Pinned cue: ${pinnedCue}` : '',
      done: false,
    });
    prevMachine = m;
  });

  // 3. Guided Cardiovascular Block (Zone 2 or VO2max 4×3m)
  if (cardioMin >= 6) {
    const cMode = split.cardioMode === 'vo2_4x3' ? 'vo2_4x3' : 'zone2';
    const cardioM = pickCardioMachine(athlete, cMode, floorOverrides, now);
    const walkM = distanceMeters(prevMachine, cardioM, floorOverrides);
    const hrBand =
      cMode === 'vo2_4x3' ? getHrBand(athlete, 0.82, 0.92) : getHrBand(athlete, 0.6, 0.7);

    steps.push({
      id: 'step_cardio',
      type: 'cardio',
      protocol: cMode,
      stationId: cardioM.id,
      zoneCode: getZoneInfo(cardioM.zone).code,
      walkMeters: walkM,
      prevStationId: prevMachine.id,
      durationSec: cardioMin * 60,
      hrBand,
      setup: cardioM.setup,
      cue:
        cMode === 'vo2_4x3'
          ? `4 × 3m hard (${hrBand.min}–${hrBand.max} bpm) w/ 2m easy recovery`
          : `Steady Zone 2 (${hrBand.min}–${hrBand.max} bpm) · Nasal breathing`,
      done: false,
    });
  }

  attachPartnerAssignments(steps, athlete, state.partner, floorOverrides, now);

  // Estimate total minutes
  const estSec = steps.reduce((sum, st) => {
    if (st.type === 'warmup' || st.type === 'cardio') return sum + st.durationSec;
    return sum + st.sets.reduce((sAcc, s) => sAcc + 35 + (s.restSec || 90), 0);
  }, 0);

  return {
    id: `sess_${now}`,
    createdAt: now,
    startedAt: null,
    phase: 'briefing', // 'briefing' | 'active' | 'resting' | 'summary'
    splitId: split.id,
    splitName: split.name,
    splitReason: options.splitOverride ? 'Selected manually' : rec.reason,
    mesoWeek: meso.week,
    mesoName: meso.name,
    readiness,
    durationTargetMin: targetMinutes,
    estimatedMin: Math.max(15, Math.round(estSec / 60)),
    currentStepIndex: 0,
    busyIds: [],
    adaptations: [], // crisp log of live coaching adjustments
    steps,
  };
}

export function getActiveStep(session) {
  if (!session?.steps?.length) return null;
  const idx = Math.max(0, Math.min(session.steps.length - 1, session.currentStepIndex || 0));
  return session.steps[idx] || null;
}

export function getCurrentSetInfo(step) {
  if (!step || step.type !== 'lift') return null;
  const idx = step.sets.findIndex((s) => !s.done);
  if (idx === -1) return null;
  const workSets = step.sets.filter((s) => s.kind === 'work');
  const current = step.sets[idx];
  const workNumber =
    current.kind === 'work'
      ? workSets.indexOf(current) + 1
      : 0;
  return {
    arrayIndex: idx,
    set: current,
    isWarmup: current.kind === 'warmup',
    workNumber,
    totalWorkSets: workSets.length,
    isLastSetOfStep: idx === step.sets.length - 1,
  };
}

function recomputeWalkDistances(session, floorOverrides = {}) {
  let prev = null;
  for (const st of session.steps) {
    const m = getMachineById(st.stationId);
    if (prev && m) {
      st.walkMeters = distanceMeters(prev, m, floorOverrides);
      st.prevStationId = prev.id;
    } else {
      st.walkMeters = 0;
    }
    if (m) prev = m;
  }
}

/**
 * Record set completion + immediately adapt remaining sets in the current workout.
 */
export function recordLiftSetAndAdapt(session, athlete, { actualReps, effort }, unit = 'kg') {
  const step = getActiveStep(session);
  const info = getCurrentSetInfo(step);
  if (!step || !info) return null;

  const machine = getMachineById(step.stationId);
  const s = info.set;
  const repsDone = Math.max(1, Number(actualReps) || s.targetReps);
  s.done = true;
  s.actualReps = repsDone;
  s.effort = effort; // 'easy' | 'solid' | 'hard'

  let restSec = s.restSec;
  let coachBanner = '';

  // Intra-session live weight adjustment on remaining working sets
  const remainingWork = step.sets.slice(info.arrayIndex + 1).filter((x) => x.kind === 'work' && !x.done);
  const stepInc = machine.stepKg || 2.5;

  if (info.isWarmup) {
    coachBanner = `Warm-up done · Load working weight`;
    restSec = 60;
  } else if (machine.loadType !== 'bodyweight') {
    if (effort === 'easy' && repsDone >= s.targetReps && remainingWork.length > 0) {
      for (const rem of remainingWork) {
        rem.weightKg = Math.round((rem.weightKg + stepInc) * 10) / 10;
      }
      const nextStr = formatLoad(machine, remainingWork[0].weightKg, unit).primary;
      coachBanner = `Easy → +${stepInc} ${unit} (${nextStr}) for next set`;
      step.liveNote = coachBanner;
      session.adaptations.push(`${machine.shortName}: +${stepInc} kg mid-session`);
    } else if ((effort === 'hard' || repsDone < s.targetReps) && remainingWork.length > 0) {
      for (const rem of remainingWork) {
        rem.weightKg = Math.max(stepInc, Math.round((rem.weightKg - stepInc) * 10) / 10);
      }
      restSec = Math.min(240, restSec + 25);
      const nextStr = formatLoad(machine, remainingWork[0].weightKg, unit).primary;
      coachBanner = `Hard → ${nextStr} next set · +25s rest`;
      step.liveNote = coachBanner;
      session.adaptations.push(`${machine.shortName}: −${stepInc} kg +25s rest`);
    } else {
      coachBanner = `Set ${info.workNumber}/${info.totalWorkSets} logged · Hold load`;
    }
  } else {
    if (effort === 'easy' && remainingWork.length > 0) {
      for (const rem of remainingWork) rem.targetReps += 2;
      coachBanner = `+2 reps added for next set`;
      step.liveNote = coachBanner;
    } else if (effort === 'hard' && remainingWork.length > 0) {
      for (const rem of remainingWork) rem.targetReps = Math.max(6, rem.targetReps - 2);
      restSec += 20;
      coachBanner = `−2 reps next set · +20s rest`;
      step.liveNote = coachBanner;
    }
  }

  // If station finished, update athlete's persistent e1RM & advance step pointer
  if (info.isLastSetOfStep) {
    step.done = true;
    updateAthleteLiftFromStep(athlete, step);
    const nextIdx = session.steps.findIndex((st, i) => i > session.currentStepIndex && !st.done);
    if (nextIdx !== -1) {
      session.currentStepIndex = nextIdx;
      const nextStep = session.steps[nextIdx];
      const nextM = getMachineById(nextStep.stationId);
      coachBanner = `${machine.shortName} complete → Go to ${nextM.name} (${nextStep.walkMeters}m)`;
    } else {
      session.phase = 'summary';
      return { finishedSession: true, restSec: 0, coachBanner: 'Workout complete' };
    }
  }

  session.phase = restSec > 0 ? 'resting' : 'active';
  return { finishedSession: false, restSec, coachBanner };
}

function updateAthleteLiftFromStep(athlete, step) {
  const machine = getMachineById(step.stationId);
  if (!machine || machine.loadType === 'cardio') return;
  const workDone = step.sets.filter((s) => s.kind === 'work' && s.done);
  if (!workDone.length) return;

  let bestE1rm = 0;
  for (const s of workDone) {
    const rirEst = s.effort === 'easy' ? 3 : s.effort === 'hard' ? 0 : s.rir || 1;
    const est = estimate1RM(s.weightKg, s.actualReps || s.targetReps, rirEst);
    if (est > bestE1rm) bestE1rm = est;
  }

  const prev = athlete.lifts?.[machine.id] || { e1rm: 0, history: [] };
  const lastSet = workDone[workDone.length - 1];
  const blendedE1rm =
    bestE1rm > 0
      ? prev.e1rm > 0
        ? Math.round((prev.e1rm * 0.35 + bestE1rm * 0.65) * 10) / 10
        : bestE1rm
      : prev.e1rm;

  if (!athlete.lifts) athlete.lifts = {};
  athlete.lifts[machine.id] = {
    e1rm: blendedE1rm,
    lastWeight: lastSet.weightKg,
    lastReps: workDone.map((x) => x.actualReps || x.targetReps),
    lastAt: Date.now(),
    history: [...(prev.history || []).slice(-11), { date: Date.now(), e1rm: blendedE1rm, weightKg: lastSet.weightKg }],
  };

  if (prev.e1rm > 0 && blendedE1rm > prev.e1rm + 0.4) {
    step.e1rmGain = Math.round((blendedE1rm - prev.e1rm) * 10) / 10;
  }
}

/**
 * Mark current machine as Busy:
 * 1) If another unfinished lift step is nearby on the floor, route there now and defer busy machine right after.
 * 2) Otherwise swap to the closest biomechanically matching open station on the floor.
 */
export function rerouteBusyStation(session, athlete, floorOverrides = {}) {
  const idx = session.currentStepIndex;
  const curStep = session.steps[idx];
  if (!curStep) return null;

  const curMachine = getMachineById(curStep.stationId);
  if (!session.busyIds.includes(curStep.stationId)) {
    session.busyIds.push(curStep.stationId);
  }

  // Look for unfinished lift steps ahead that haven't been marked busy
  const candidatesAhead = session.steps
    .map((st, i) => ({ st, i }))
    .filter(
      ({ st, i }) =>
        i > idx &&
        !st.done &&
        st.type === 'lift' &&
        !session.busyIds.includes(st.stationId)
    );

  if (candidatesAhead.length > 0) {
    // Pick nearest station on the floor plan
    candidatesAhead.sort(
      (a, b) =>
        distanceMeters(curMachine, getMachineById(a.st.stationId), floorOverrides) -
        distanceMeters(curMachine, getMachineById(b.st.stationId), floorOverrides)
    );
    const chosen = candidatesAhead[0];
    const [pickedStep] = session.steps.splice(chosen.i, 1);
    session.steps.splice(idx, 0, pickedStep);
    recomputeWalkDistances(session, floorOverrides);
    session.phase = 'active';
    const nextM = getMachineById(pickedStep.stationId);
    const dist = distanceMeters(curMachine, nextM, floorOverrides);
    const msg = `Busy → Rerouted ${dist}m to ${nextM.name} (${curMachine.shortName} next)`;
    session.adaptations.push(msg);
    return msg;
  }

  // No later lift steps available — substitute equivalent free machine on the floor
  const usedIds = session.steps.map((s) => s.stationId);
  const sub = findBestSubstitute(curMachine, {
    excludeIds: [...usedIds, ...session.busyIds],
    fromMachine: curMachine,
    floorOverrides,
  });

  if (sub) {
    const rx = prescribeStation(sub, athlete, session.readiness);
    curStep.stationId = sub.id;
    curStep.zoneCode = getZoneInfo(sub.zone).code;
    curStep.setup = sub.setup;
    curStep.cue = sub.cue;
    curStep.sets = buildLiftSets(sub, rx);
    recomputeWalkDistances(session, floorOverrides);
    session.phase = 'active';
    const dist = distanceMeters(curMachine, sub, floorOverrides);
    const msg = `Swapped to ${sub.name} (${dist}m away)`;
    session.adaptations.push(msg);
    return msg;
  }

  return `${curMachine.shortName} busy · No free substitute`;
}

/**
 * Joint Pain / Discomfort protection:
 * Flags joint on athlete and immediately swaps all remaining high-stress stations in today's session.
 */
export function applyPainProtection(session, athlete, jointId, floorOverrides = {}) {
  if (!athlete.jointFlags) athlete.jointFlags = {};
  athlete.jointFlags[jointId] = Date.now();

  const usedIds = new Set(session.steps.map((s) => s.stationId));
  let swappedCount = 0;

  for (let i = session.currentStepIndex; i < session.steps.length; i++) {
    const st = session.steps[i];
    if (st.done) continue;
    const m = getMachineById(st.stationId);
    if (!m || (m.jointStress?.[jointId] || 0) <= 0.3) continue;

    const sub = findBestSubstitute(m, {
      excludeIds: [...usedIds],
      painJoint: jointId,
      fromMachine: m,
      floorOverrides,
    });

    if (sub) {
      usedIds.add(sub.id);
      st.stationId = sub.id;
      st.zoneCode = getZoneInfo(sub.zone).code;
      st.setup = sub.setup;
      st.cue = sub.cue;
      if (st.type === 'lift') {
        const rx = prescribeStation(sub, athlete, session.readiness);
        st.sets = buildLiftSets(sub, rx);
      }
      swappedCount += 1;
    } else if (st.type === 'lift') {
      st.done = true;
      swappedCount += 1;
    }
  }

  recomputeWalkDistances(session, floorOverrides);

  // Advance if current step was marked done
  const cur = getActiveStep(session);
  if (cur?.done) {
    const nextIdx = session.steps.findIndex((s, i) => i >= session.currentStepIndex && !s.done);
    if (nextIdx !== -1) session.currentStepIndex = nextIdx;
    else session.phase = 'summary';
  } else {
    session.phase = 'active';
  }

  const msg = `Protected ${jointId.replace('_', ' ')} · Adjusted ${swappedCount} station${swappedCount === 1 ? '' : 's'}`;
  session.adaptations.push(msg);
  return msg;
}

/**
 * Compress remaining workout when user taps "Short on Time (-10m)".
 */
export function compressRemainingSession(session) {
  let trimmedSets = 0;
  for (let i = session.currentStepIndex; i < session.steps.length; i++) {
    const st = session.steps[i];
    if (st.done) continue;
    if (st.type === 'lift') {
      const undoneWork = st.sets.filter((s) => s.kind === 'work' && !s.done);
      if (undoneWork.length >= 3) {
        st.sets.pop();
        trimmedSets += 1;
      }
      for (const s of st.sets) {
        if (!s.done) s.restSec = Math.max(60, s.restSec - 20);
      }
    } else if (st.type === 'cardio') {
      st.durationSec = Math.max(360, Math.round(st.durationSec * 0.65));
    }
  }
  const msg = `Time-saver: −${trimmedSets} accessory sets & tighter rest`;
  session.adaptations.push(msg);
  return msg;
}

/**
 * Apply a form-coaching fix (pin personal cue, optionally drop 1 weight step, or swap to a better-fitting station).
 */
export function applyFormAdjustment(
  session,
  athlete,
  { pinCue = '', dropLoad = false, swapToId = null, rememberSwap = false },
  floorOverrides = {}
) {
  const step = getActiveStep(session);
  if (!step) return null;
  if (!athlete.formNotes) athlete.formNotes = {};

  const origId = step.stationId;
  const origMachine = getMachineById(origId);
  const existingNote = athlete.formNotes[origId] || {};

  if (swapToId) {
    const sub = getMachineById(swapToId);
    if (sub) {
      athlete.formNotes[origId] = {
        ...existingNote,
        seenGuide: true,
        ...(rememberSwap ? { preferSwapId: sub.id } : {}),
      };
      step.stationId = sub.id;
      step.zoneCode = getZoneInfo(sub.zone).code;
      step.setup = sub.setup;
      step.cue = athlete.formNotes[sub.id]?.pinnedCue || sub.cue;
      step.liveNote = '';
      if (step.type === 'lift') {
        const rx = prescribeStation(sub, athlete, session.readiness);
        step.sets = buildLiftSets(sub, rx);
      }
      recomputeWalkDistances(session, floorOverrides);
      session.phase = 'active';
      const msg = `Swapped to ${sub.name}${rememberSwap ? ' (saved for future)' : ''}`;
      session.adaptations.push(msg);
      return msg;
    }
  }

  if (pinCue) {
    athlete.formNotes[origId] = {
      ...existingNote,
      seenGuide: true,
      pinnedCue: pinCue,
    };
    step.cue = pinCue;
    step.liveNote = `Form fix: ${pinCue}`;
  }

  if (dropLoad && step.type === 'lift' && origMachine && origMachine.loadType !== 'bodyweight') {
    const inc = origMachine.stepKg || 2.5;
    for (const s of step.sets) {
      if (!s.done) {
        s.weightKg = Math.max(inc, Math.round((s.weightKg - inc) * 10) / 10);
      }
    }
    session.adaptations.push(`${origMachine.shortName}: −${inc} kg for clean form`);
    return `Pinned cue & −${inc} kg for clean form`;
  }

  return 'Form cue pinned to station';
}

/**
 * Advance current timed step (warmup or cardio) or skip current step.
 */
export function completeCurrentStep(session, athlete) {
  const step = getActiveStep(session);
  if (!step) return;
  step.done = true;
  if (step.type === 'lift') {
    updateAthleteLiftFromStep(athlete, step);
  }
  const nextIdx = session.steps.findIndex((st, i) => i > session.currentStepIndex && !st.done);
  if (nextIdx !== -1) {
    session.currentStepIndex = nextIdx;
    session.phase = 'active';
  } else {
    session.phase = 'summary';
  }
}

/**
 * Finalize session, advance persistent 4-week mesocycle, and store workout log.
 */
export function finalizeSessionToPlan(state, session, wearableSnap = null) {
  const now = Date.now();
  const athlete = state.athlete;

  const completedLifts = session.steps.filter(
    (st) => st.type === 'lift' && st.sets.some((s) => s.kind === 'work' && s.done)
  );
  const totalSets = completedLifts.reduce(
    (sum, st) => sum + st.sets.filter((s) => s.kind === 'work' && s.done).length,
    0
  );

  // Advance persistent 4-week mesocycle
  const targetDays = Math.max(2, Number(athlete.daysPerWeek) || 3);
  const meso = athlete.mesocycle || { week: 1, sessionInWeek: 1, totalCompleted: 0 };
  meso.totalCompleted = (meso.totalCompleted || 0) + 1;
  if (meso.sessionInWeek >= targetDays) {
    meso.sessionInWeek = 1;
    meso.week = (meso.week % 4) + 1;
  } else {
    meso.sessionInWeek += 1;
  }
  athlete.mesocycle = meso;
  athlete.lastWorkoutAt = now;
  athlete.lastSplitId = session.splitId;

  const durationSec = session.startedAt ? Math.max(300, Math.round((now - session.startedAt) / 1000)) : session.estimatedMin * 60;

  state.history.unshift({
    id: session.id,
    date: now,
    splitName: session.splitName,
    mesoWeek: session.mesoWeek,
    mesoName: session.mesoName,
    durationMin: Math.round(durationSec / 60),
    totalSets,
    avgBpm: wearableSnap?.avgBpm || null,
    peakBpm: wearableSnap?.peakBpm || null,
    estKcal: wearableSnap?.estKcal ? Math.round(wearableSnap.estKcal) : null,
    highlights: completedLifts.map((st) => {
      const m = getMachineById(st.stationId);
      const doneSets = st.sets.filter((s) => s.kind === 'work' && s.done);
      const topW = Math.max(...doneSets.map((s) => s.weightKg || 0));
      return {
        name: m.shortName,
        summary: `${doneSets.length}×${doneSets[0]?.actualReps || doneSets[0]?.targetReps} @ ${formatLoad(m, topW, state.settings.unit).primary}`,
        e1rmGain: st.e1rmGain || 0,
      };
    }),
  });
  state.history = state.history.slice(0, 40);
  state.activeSession = null;
}

function recomputeSessionMeta(state, session) {
  recomputeWalkDistances(session, state.floorOverrides || {});
  if (state.partner?.enabled) {
    attachPartnerAssignments(session.steps, state.athlete, state.partner, state.floorOverrides || {});
  }
  const estSec = session.steps.reduce((sum, st) => {
    if (st.type === 'warmup' || st.type === 'cardio') return sum + st.durationSec;
    return sum + st.sets.reduce((sAcc, s) => sAcc + 35 + (s.restSec || 90), 0);
  }, 0);
  session.estimatedMin = Math.max(12, Math.round(estSec / 60));
}

/**
 * Swap a single planned station in the pre-workout briefing summary.
 */
export function swapBriefingStep(state, session, stepIndex) {
  const step = session.steps[stepIndex];
  if (!step) return null;
  const curM = getMachineById(step.stationId);
  const usedIds = session.steps.map((s) => s.stationId);
  const sub = findBestSubstitute(curM, {
    excludeIds: usedIds,
    fromMachine: curM,
    floorOverrides: state.floorOverrides || {},
  });
  if (!sub) return null;

  step.stationId = sub.id;
  step.zoneCode = getZoneInfo(sub.zone).code;
  step.setup = sub.setup;
  step.cue = state.athlete.formNotes?.[sub.id]?.pinnedCue || sub.cue;
  if (step.type === 'lift') {
    const rx = prescribeStation(sub, state.athlete, session.readiness);
    step.pct1RM = rx.pct1RM;
    step.sets = buildLiftSets(sub, rx);
  }
  recomputeSessionMeta(state, session);
  session.feedbackNote = `Swapped ${curM.shortName} → ${sub.shortName}`;
  return session.feedbackNote;
}

/**
 * Remove a single non-essential step from the pre-workout briefing summary.
 */
export function removeBriefingStep(state, session, stepIndex) {
  if (session.steps.length <= 2) return 'Minimum 2 blocks kept';
  const [removed] = session.steps.splice(stepIndex, 1);
  const m = getMachineById(removed?.stationId);
  recomputeSessionMeta(state, session);
  session.feedbackNote = `Removed ${m?.shortName || 'block'} · ${session.estimatedMin}m`;
  return session.feedbackNote;
}

/**
 * Parse natural-language or chip feedback before starting a workout and dynamically reshape the session.
 */
export function applyPreWorkoutFeedback(state, session, rawInput, liveWearable = null) {
  const text = String(rawInput || '').trim();
  if (!text) return null;
  const q = text.toLowerCase();
  const athlete = state.athlete;
  const notes = [];

  // 1. Time budget mention (e.g. "30 min", "25m", "quick")
  const timeMatch = q.match(/\b(\d{2})\s*(?:m|min|mins|minutes)\b/);
  if (timeMatch || q.includes('quick') || q.includes('hurry') || q.includes('short')) {
    const mins = timeMatch ? Math.max(20, Math.min(75, parseInt(timeMatch[1], 10))) : 30;
    const rebuilt = createDynamicSession(state, {
      splitOverride: session.splitId,
      durationMin: mins,
      liveWearable,
    });
    Object.assign(session, rebuilt);
    notes.push(`${mins}m budget`);
  }

  // 2. Post-climbing / finger / forearm fatigue
  if (q.includes('climb') || q.includes('boulder') || q.includes('finger') || q.includes('forearm') || q.includes('grip') || q.includes('skin')) {
    const used = new Set(session.steps.map((s) => s.stationId));
    for (const st of session.steps) {
      const m = getMachineById(st.stationId);
      if ((m?.jointStress?.fingers || 0) > 0.3) {
        const sub = findBestSubstitute(m, {
          excludeIds: [...used],
          painJoint: 'fingers',
          fromMachine: m,
          floorOverrides: state.floorOverrides || {},
        });
        if (sub) {
          used.add(sub.id);
          st.stationId = sub.id;
          st.zoneCode = getZoneInfo(sub.zone).code;
          st.setup = sub.setup;
          st.cue = sub.cue;
          if (st.type === 'lift') {
            const rx = prescribeStation(sub, athlete, session.readiness);
            st.pct1RM = rx.pct1RM;
            st.sets = buildLiftSets(sub, rx);
          }
        }
      }
    }
    notes.push('Finger/grip-safe stations');
  }

  // 3. Joint soreness / pain mentions
  if (q.includes('shoulder')) {
    applyPainProtection(session, athlete, 'shoulder', state.floorOverrides);
    session.phase = 'briefing';
    notes.push('Shoulder-safe swaps');
  } else if (q.includes('knee')) {
    applyPainProtection(session, athlete, 'knee', state.floorOverrides);
    session.phase = 'briefing';
    notes.push('Knee-safe swaps');
  } else if (q.includes('lower back') || q.includes('lumbar') || q.includes('back hurt') || q.includes('back sore')) {
    applyPainProtection(session, athlete, 'lower_back', state.floorOverrides);
    session.phase = 'briefing';
    notes.push('Back-safe swaps');
  }

  // 4. Muscle exclusions ("no legs", "skip arms / upper")
  if (q.includes('no leg') || q.includes('skip leg') || q.includes('legs sore') || q.includes('sore legs')) {
    const upperIds = ['m_lat_pull', 'm_low_row', 'm_smith_incline', 'm_abs_mat', 'm_cable_pull'];
    const liftCount = Math.max(3, session.steps.filter((s) => s.type === 'lift').length);
    const warm = session.steps.find((s) => s.type === 'warmup');
    const card = session.steps.find((s) => s.type === 'cardio');
    const newLifts = upperIds.slice(0, liftCount).map((id, i) => {
      const m = getMachineById(id);
      const rx = prescribeStation(m, athlete, session.readiness);
      return {
        id: `step_lift_upper_${i}_${m.id}`,
        type: 'lift',
        stationId: m.id,
        zoneCode: getZoneInfo(m.zone).code,
        walkMeters: 0,
        setup: m.setup,
        cue: athlete.formNotes?.[m.id]?.pinnedCue || m.cue,
        pct1RM: rx.pct1RM,
        seedE1rm: rx.e1rm,
        sets: buildLiftSets(m, rx),
        liveNote: '',
        done: false,
      };
    });
    if (warm) warm.stationId = 'c_rower';
    session.splitName = 'Upper Pull, Push & Core';
    session.steps = [...(warm ? [warm] : []), ...newLifts, ...(card ? [card] : [])];
    notes.push('Upper & Core only (skipped legs)');
  } else if (q.includes('no upper') || q.includes('skip arm') || q.includes('no arm') || q.includes('skip upper')) {
    const lowerIds = ['m_leg_press', 'm_leg_curl', 'm_hip_thrust', 'm_calf', 'm_abs_mat'];
    const liftCount = Math.max(3, session.steps.filter((s) => s.type === 'lift').length);
    const warm = session.steps.find((s) => s.type === 'warmup');
    const card = session.steps.find((s) => s.type === 'cardio');
    const newLifts = lowerIds.slice(0, liftCount).map((id, i) => {
      const m = getMachineById(id);
      const rx = prescribeStation(m, athlete, session.readiness);
      return {
        id: `step_lift_lower_${i}_${m.id}`,
        type: 'lift',
        stationId: m.id,
        zoneCode: getZoneInfo(m.zone).code,
        walkMeters: 0,
        setup: m.setup,
        cue: athlete.formNotes?.[m.id]?.pinnedCue || m.cue,
        pct1RM: rx.pct1RM,
        seedE1rm: rx.e1rm,
        sets: buildLiftSets(m, rx),
        liveNote: '',
        done: false,
      };
    });
    if (warm) warm.stationId = 'c_bike';
    session.splitName = 'Lower Body & Core';
    session.steps = [...(warm ? [warm] : []), ...newLifts, ...(card ? [card] : [])];
    notes.push('Legs & Core only');
  }

  // 5. Add focus stations ("core / abs", "glutes / butt")
  if (q.includes('core') || q.includes('abs')) {
    const hasCore = session.steps.some((s) => getMachineById(s.stationId)?.movement === 'core');
    if (!hasCore) {
      const coreM = getMachineById(athlete.formNotes?.m_ab_crunch?.preferSwapId || 'm_abs_mat');
      const rx = prescribeStation(coreM, athlete, session.readiness);
      const insertAt = Math.max(1, session.steps.length - (session.steps[session.steps.length - 1]?.type === 'cardio' ? 1 : 0));
      session.steps.splice(insertAt, 0, {
        id: `step_added_core_${Date.now()}`,
        type: 'lift',
        stationId: coreM.id,
        zoneCode: getZoneInfo(coreM.zone).code,
        walkMeters: 0,
        setup: coreM.setup,
        cue: coreM.cue,
        pct1RM: rx.pct1RM,
        sets: buildLiftSets(coreM, rx),
        liveNote: '',
        done: false,
      });
      notes.push(`Added ${coreM.shortName}`);
    } else {
      for (const st of session.steps) {
        if (getMachineById(st.stationId)?.movement === 'core' && st.type === 'lift') {
          const last = st.sets[st.sets.length - 1];
          if (last && st.sets.length < 5) st.sets.push({ ...last, setIndex: st.sets.length + 1 });
        }
      }
      notes.push('+1 Core set');
    }
  }

  if (q.includes('glute') || q.includes('butt') || q.includes('hip thrust')) {
    if (!session.steps.some((s) => s.stationId === 'm_hip_thrust')) {
      const gm = getMachineById('m_hip_thrust');
      const rx = prescribeStation(gm, athlete, session.readiness);
      session.steps.splice(1, 0, {
        id: `step_added_glute_${Date.now()}`,
        type: 'lift',
        stationId: gm.id,
        zoneCode: getZoneInfo(gm.zone).code,
        walkMeters: 0,
        setup: gm.setup,
        cue: gm.cue,
        pct1RM: rx.pct1RM,
        sets: buildLiftSets(gm, rx),
        liveNote: '',
        done: false,
      });
      notes.push('Added Glute Drive');
    }
  }

  // 6. Energy / Readiness modulation ("low energy / tired / slept poorly" vs "strong / heavy")
  if (q.includes('tired') || q.includes('sleep') || q.includes('slept') || q.includes('low energy') || q.includes('easy') || q.includes('light') || q.includes('exhaust')) {
    for (const st of session.steps) {
      if (st.type !== 'lift') continue;
      const m = getMachineById(st.stationId);
      const workSets = st.sets.filter((s) => s.kind === 'work');
      if (workSets.length >= 3) st.sets.pop();
      for (const s of st.sets) {
        if (s.weightKg > 0) {
          s.weightKg = roundToStep(s.weightKg * 0.92, m?.stepKg || 2.5);
        }
        s.rir = Math.min(4, (s.rir || 2) + 1);
      }
    }
    notes.push('−8% load & −1 set per lift');
  } else if (q.includes('strong') || q.includes('fresh') || q.includes('heavy') || q.includes('push hard') || /\bmax\b/.test(q)) {
    for (const st of session.steps) {
      if (st.type !== 'lift') continue;
      const m = getMachineById(st.stationId);
      if (m?.compound && m.loadType !== 'bodyweight') {
        const inc = m.stepKg || 2.5;
        for (const s of st.sets) {
          if (s.kind === 'work') {
            s.weightKg = Math.round((s.weightKg + inc) * 10) / 10;
            s.rir = Math.max(1, (s.rir || 2) - 1);
          }
        }
      }
    }
    notes.push('+Load on compounds (RIR 1)');
  }

  // 7. Cardio adjustments ("skip cardio", "more cardio", "stairs", "run", "vo2")
  if (q.includes('no cardio') || q.includes('skip cardio') || q.includes('weights only')) {
    const before = session.steps.length;
    session.steps = session.steps.filter((s) => s.type !== 'cardio');
    if (session.steps.length < before) notes.push('Skipped cardio');
  } else if (q.includes('only cardio')) {
    const rebuilt = createDynamicSession(state, { splitOverride: 'cardio_core', liveWearable });
    Object.assign(session, rebuilt);
    notes.push('Switched to Cardio + Core');
  } else if (q.includes('vo2') || q.includes('interval') || q.includes('more cardio') || q.includes('stairs') || q.includes('treadmill') || q.includes('run')) {
    let card = session.steps.find((s) => s.type === 'cardio');
    if (!card) {
      const hb = getHrBand(athlete, 0.6, 0.7);
      card = {
        id: 'step_cardio_added',
        type: 'cardio',
        protocol: 'zone2',
        stationId: 'c_climbmill',
        zoneCode: 'A',
        walkMeters: 0,
        durationSec: 720,
        hrBand: hb,
        setup: getMachineById('c_climbmill').setup,
        cue: `Steady Zone 2 (${hb.min}–${hb.max} bpm)`,
        done: false,
      };
      session.steps.push(card);
    }
    if (q.includes('stairs') || q.includes('climbmill')) {
      card.stationId = 'c_climbmill';
      card.setup = getMachineById('c_climbmill').setup;
      notes.push('ClimbMill stairs');
    } else if (q.includes('run') || q.includes('treadmill')) {
      card.stationId = 'c_treadmill';
      card.setup = getMachineById('c_treadmill').setup;
      notes.push('Onyx Treadmill');
    }
    if (q.includes('vo2') || q.includes('interval')) {
      const hb = getHrBand(athlete, 0.82, 0.92);
      card.protocol = 'vo2_4x3';
      card.durationSec = 1080;
      card.hrBand = hb;
      card.cue = `4 × 3m hard (${hb.min}–${hb.max} bpm) w/ 2m easy`;
      notes.push('VO₂max 4×3m');
    } else if (q.includes('more cardio')) {
      card.durationSec = Math.min(2100, card.durationSec + 360);
      notes.push('+6m cardio');
    }
  }

  // 8. Swap or remove specific named station ("swap lat", "remove row", etc.)
  const findMatchingStepIdx = () =>
    session.steps.findIndex((st) => {
      const m = getMachineById(st.stationId);
      if (!m) return false;
      const tokens = `${m.name} ${m.shortName}`.toLowerCase().split(/\W+/).filter((t) => t.length >= 3);
      return tokens.some((tok) => q.includes(tok));
    });

  if (q.includes('swap') || q.includes('replace') || q.includes('change')) {
    const idx = findMatchingStepIdx();
    if (idx !== -1) {
      const res = swapBriefingStep(state, session, idx);
      if (res) notes.push(res);
    }
  } else if ((q.includes('remove') || q.includes('drop') || q.includes('skip ')) && !notes.length) {
    const idx = findMatchingStepIdx();
    if (idx !== -1) {
      const res = removeBriefingStep(state, session, idx);
      if (res) notes.push(res);
    }
  }

  if (!notes.length) {
    notes.push('Noted · Plan ready');
  }

  recomputeSessionMeta(state, session);
  session.feedbackNote = notes.join(' · ');
  return session.feedbackNote;
}

export { formatDurationShort };
