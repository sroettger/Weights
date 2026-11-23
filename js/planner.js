/**
 * Weights — AI Dynamic Session Director (8-Week Periodization + 1-Tap Rep Autoregulation)
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
  formatRepRange,
  formatDurationShort,
} from './science.js';

export const SPLIT_TEMPLATES = {
  upper_push_pull: {
    id: 'upper_push_pull',
    code: 'A',
    name: 'Upper Pull, Chest & Core',
    short: 'A · Upper + Core',
    candidates: ['m_lat_pull', 'm_chest_press', 'm_low_row', 'm_abs_mat', 'm_cable_pull', 'm_butterfly'],
    cardioMode: 'zone2',
  },
  finger_safe_lower: {
    id: 'finger_safe_lower',
    code: 'B',
    name: 'Legs, Heel-Hook & Shoulders',
    short: 'B · Legs + Cuff',
    candidates: ['m_leg_press', 'm_leg_curl', 'm_cable_pull', 'm_calf', 'm_lower_back', 'm_leg_ext'],
    cardioMode: 'zone2',
  },
  power_vo2: {
    id: 'power_vo2',
    code: 'C',
    name: 'Full-Body Power + VO₂max',
    short: 'C · Power + VO₂',
    candidates: ['m_pullup', 'm_hip_thrust', 'm_smith_incline', 'm_abs_mat', 'm_leg_curl'],
    cardioMode: 'vo2_4x3',
  },
  cardio_core: {
    id: 'cardio_core',
    code: 'R',
    name: 'Active Recovery · Cardio & Core',
    short: 'Recovery',
    candidates: ['m_abs_mat', 'm_cable_pull', 'm_calf'],
    cardioMode: 'dedicated',
  },
};

const SPLIT_ROTATION = ['finger_safe_lower', 'upper_push_pull', 'power_vo2'];

function normalizeSplitId(id) {
  if (SPLIT_TEMPLATES[id]) return id;
  if (id === 'pull_posterior') return 'upper_push_pull';
  if (id === 'lower_push') return 'finger_safe_lower';
  if (id === 'full_force_vo2') return 'power_vo2';
  return null;
}

export function recommendTodaySplit(athlete, readiness, now = Date.now()) {
  if (readiness.tier === 'recover' || readiness.hoursSince < 20) {
    return {
      splitId: 'cardio_core',
      reason: readiness.hoursSince < 20 ? 'Trained <20h ago · Light recovery day' : 'Low recovery · Zone 2 & Core',
    };
  }

  // If fingers are flagged (e.g. climbed yesterday), prefer Finger-Safe Session B
  if (athlete.jointFlags?.fingers && now - athlete.jointFlags.fingers < 36 * 3600000) {
    return {
      splitId: 'finger_safe_lower',
      reason: 'Finger-safe session (grip resting)',
    };
  }

  if (
    athlete.goal === 'body_focus' &&
    (athlete.focusAreas || []).includes('glutes') &&
    normalizeSplitId(athlete.lastSplitId) !== 'finger_safe_lower'
  ) {
    return {
      splitId: 'finger_safe_lower',
      reason: 'Glutes & lower-body priority',
    };
  }

  const normLast = normalizeSplitId(athlete.lastSplitId);
  const lastIdx = SPLIT_ROTATION.indexOf(normLast);
  const nextSplit = SPLIT_ROTATION[(lastIdx + 1) % SPLIT_ROTATION.length];

  const reasonMap = {
    upper_push_pull: `Last workout ${formatRelativeDays(athlete.lastWorkoutAt, now)} · Upper body fresh`,
    finger_safe_lower: `Last workout ${formatRelativeDays(athlete.lastWorkoutAt, now)} · Finger-safe legs & shoulders`,
    power_vo2: `Full-body strength + weekly VO₂max intervals`,
  };

  return {
    splitId: nextSplit,
    reason: reasonMap[nextSplit] || 'Next in rotation',
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

function pickWarmupMachine(athlete, splitId, firstLift, floorOverrides = {}, now = Date.now()) {
  if (splitId === 'finger_safe_lower') {
    const bike = getMachineById('c_bike');
    if (bike && !isJointFlagActive(athlete, bike, now)) return bike;
  }
  const options = ['c_rower', 'c_bike', 'c_treadmill', 'c_climbmill']
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
  const preferIds =
    mode === 'vo2_4x3' ? ['c_treadmill', 'c_climbmill', 'c_bike'] : ['c_climbmill', 'c_bike', 'c_treadmill'];
  for (const id of preferIds) {
    const m = getMachineById(id);
    if (m && !isJointFlagActive(athlete, m, now)) return m;
  }
  return getMachineById('c_bike');
}

export function buildLiftSets(machine, rx) {
  const sets = [];
  const stepInc = machine.stepKg || 2.5;

  if (rx.warmupCount >= 2) {
    sets.push({
      kind: 'warmup',
      warmupIndex: 1,
      warmupTotal: 2,
      targetReps: 8,
      repMin: 8,
      repMax: 8,
      weightKg: roundToStep(rx.weightKg * 0.5, stepInc),
      rir: 5,
      restSec: 45,
      done: false,
      actualReps: null,
    });
    sets.push({
      kind: 'warmup',
      warmupIndex: 2,
      warmupTotal: 2,
      targetReps: 4,
      repMin: 4,
      repMax: 4,
      weightKg: roundToStep(rx.weightKg * 0.75, stepInc),
      rir: 4,
      restSec: 60,
      done: false,
      actualReps: null,
    });
  } else if (rx.warmupCount === 1) {
    sets.push({
      kind: 'warmup',
      warmupIndex: 1,
      warmupTotal: 1,
      targetReps: 8,
      repMin: 8,
      repMax: 8,
      weightKg: roundToStep(rx.weightKg * 0.55, stepInc),
      rir: 4,
      restSec: 50,
      done: false,
      actualReps: null,
    });
  }

  for (let i = 0; i < rx.sets; i += 1) {
    sets.push({
      kind: 'work',
      setIndex: i + 1,
      targetReps: rx.reps,
      repMin: rx.repMin,
      repMax: rx.repMax,
      weightKg: rx.weightKg,
      rir: rx.rir,
      restSec: rx.restSec,
      done: false,
      actualReps: null,
    });
  }
  return sets;
}

function attachPartnerAssignments(steps, primaryAthlete, partner, floorOverrides = {}, now = Date.now()) {
  if (!partner?.enabled) return;
  const partnerReadiness = evaluateReadiness(partner, null, now);
  const usedIds = new Set();

  const partnerPool = GYM_MACHINES.filter(
    (m) => m.loadType !== 'cardio' && !isJointFlagActive(partner, m, now)
  );

  for (const step of steps) {
    const primaryMachine = getMachineById(step.stationId);
    if (step.type === 'warmup') {
      const altWarm = primaryMachine.id === 'c_treadmill' ? getMachineById('c_climbmill') : getMachineById('c_treadmill');
      step.partner = {
        name: partner.name || 'Partner',
        stationId: altWarm.id,
        stationName: altWarm.name,
        distanceM: distanceMeters(primaryMachine, altWarm, floorOverrides),
        prescription: '5 min warm-up',
      };
      continue;
    }

    if (step.type === 'cardio') {
      const altCardio = primaryMachine.id === 'c_climbmill' ? getMachineById('c_treadmill') : getMachineById('c_climbmill');
      const z2 = getHrBand(partner, 0.6, 0.7);
      step.partner = {
        name: partner.name || 'Partner',
        stationId: altCardio.id,
        stationName: altCardio.name,
        distanceM: distanceMeters(primaryMachine, altCardio, floorOverrides),
        prescription: `${Math.round(step.durationSec / 60)}m · ${z2.min}–${z2.max} bpm`,
      };
      continue;
    }

    const primarySec = step.sets.reduce((acc, s) => acc + 35 + (s.restSec || 90), 0);
    let bestM = null;
    let bestScore = -Infinity;

    for (const cand of partnerPool) {
      if (cand.id === primaryMachine.id || usedIds.has(cand.id)) continue;
      let s = 0;
      const goal = GOAL_PROFILES[partner.goal] || GOAL_PROFILES.body_focus;
      const movRank = goal.priorityMovements.indexOf(cand.movement);
      if (movRank >= 0) s += (10 - movRank) * 4;

      const focusHit = (partner.focusAreas || []).some((areaId) => {
        const area = FOCUS_AREAS.find((f) => f.id === areaId);
        return area?.muscles.some((mus) => (cand.muscles?.[mus] || 0) >= 0.5);
      });
      if (focusHit) s += 26;

      s -= distanceMeters(primaryMachine, cand, floorOverrides) * 2.4;
      if (s > bestScore) {
        bestScore = s;
        bestM = cand;
      }
    }

    if (bestM) {
      usedIds.add(bestM.id);
      const rx = prescribeStation(bestM, partner, partnerReadiness, { now });
      const matchedSets = Math.max(2, Math.min(4, Math.round(primarySec / (35 + rx.restSec))));
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
        prescription: `${matchedSets} × ${formatRepRange(rx.repMin, rx.repMax, rx.reps)} @ ${loadStr}`,
      };
    }
  }
}

export function createDynamicSession(state, options = {}) {
  const now = options.now || Date.now();
  const athlete = state.athlete;
  const floorOverrides = state.floorOverrides || {};
  const readiness = evaluateReadiness(athlete, options.liveWearable || null, now);
  const rec = recommendTodaySplit(athlete, readiness, now);

  const requestedSplit = normalizeSplitId(options.splitOverride) || rec.splitId;
  const split = SPLIT_TEMPLATES[requestedSplit] || SPLIT_TEMPLATES.upper_push_pull;
  const targetMinutes = Number(options.durationMin || athlete.targetMinutes) || 45;
  const cardioProfile = CARDIO_PROFILES[athlete.cardioGoal] || CARDIO_PROFILES.cardio_health;
  const meso = getMesocyclePhase(athlete.mesocycle?.week || 1);

  const cardioMin =
    split.cardioMode === 'dedicated'
      ? Math.max(15, Math.min(targetMinutes - 14, cardioProfile.dedicatedMin))
      : cardioProfile.finisherMin > 0
      ? split.cardioMode === 'vo2_4x3' && targetMinutes >= 42
        ? 16
        : targetMinutes <= 32
        ? 8
        : Math.min(12, cardioProfile.finisherMin)
      : 0;

  const warmupMin = targetMinutes <= 32 ? 4 : 5;
  const liftBudgetMin = Math.max(10, targetMinutes - warmupMin - cardioMin);
  const stationMinutesAvg = meso.block === 2 && athlete.goal === 'max_strength' ? 8.2 : 6.8;
  const maxLiftCount =
    split.cardioMode === 'dedicated'
      ? 2
      : Math.max(2, Math.min(5, Math.round(liftBudgetMin / stationMinutesAvg)));

  const chosenMachines = [];
  const usedIds = new Set();

  let candidateIds = [...split.candidates];
  if (athlete.goal === 'body_focus' && split.cardioMode !== 'dedicated') {
    const focusFirst = GYM_MACHINES.filter(
      (m) =>
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
      m = findBestSubstitute(m, {
        excludeIds: [...usedIds],
        painJoint: flaggedJoint,
        floorOverrides,
      });
    }

    if (m && !usedIds.has(m.id)) {
      usedIds.add(m.id);
      chosenMachines.push(m);
    }
  }

  const warmupSeed = chosenMachines[0] || getMachineById('m_abs_mat');
  const warmupMachine = pickWarmupMachine(athlete, split.id, warmupSeed, floorOverrides, now);
  const orderedLifts = orderStationsSpatially(chosenMachines, warmupMachine, floorOverrides);

  const steps = [];
  const z12 = getHrBand(athlete, 0.45, 0.62);

  steps.push({
    id: 'step_warmup',
    type: 'warmup',
    stationId: warmupMachine.id,
    zoneCode: getZoneInfo(warmupMachine.zone).code,
    walkMeters: 0,
    durationSec: warmupMin * 60,
    hrBand: z12,
    setup: warmupMachine.setup,
    cue: athlete.formNotes?.[warmupMachine.id]?.pinnedCue || `Easy progressive pace (${z12.min}–${z12.max} bpm) to warm joints`,
    done: false,
  });

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
          ? `4 rounds: 3 min hard (${hrBand.min}–${hrBand.max} bpm) + 2 min easy`
          : `Steady conversational pace (${hrBand.min}–${hrBand.max} bpm)`,
      done: false,
    });
  }

  attachPartnerAssignments(steps, athlete, state.partner, floorOverrides, now);

  const estSec = steps.reduce((sum, st) => {
    if (st.type === 'warmup' || st.type === 'cardio') return sum + st.durationSec;
    return sum + st.sets.reduce((sAcc, s) => sAcc + 35 + (s.restSec || 90), 0);
  }, 0);

  return {
    id: `sess_${now}`,
    createdAt: now,
    startedAt: null,
    phase: 'briefing',
    splitId: split.id,
    splitCode: split.code,
    splitName: split.name,
    splitReason: options.splitOverride ? meso.summary : rec.reason,
    mesoWeek: meso.week,
    mesoBlock: meso.block,
    mesoName: meso.name,
    mesoSummary: meso.summary,
    readiness,
    durationTargetMin: targetMinutes,
    estimatedMin: Math.max(15, Math.round(estSec / 60)),
    currentStepIndex: 0,
    busyIds: [],
    adaptations: [],
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
  const workNumber = current.kind === 'work' ? workSets.indexOf(current) + 1 : 0;
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
 * 1-Tap Rep-Count Set Logger & Live Weight Autoregulator:
 * Since the user always stops ~1–2 reps before failure (when speed slows),
 * completed rep count relative to [repMin, repMax] automatically drives weight adjustments.
 */
export function recordLiftSetAndAdapt(session, athlete, { actualReps }, unit = 'kg') {
  const step = getActiveStep(session);
  const info = getCurrentSetInfo(step);
  if (!step || !info) return null;

  const machine = getMachineById(step.stationId);
  const s = info.set;
  const repsDone = Math.max(1, Number(actualReps) || s.targetReps || 8);
  s.done = true;
  s.actualReps = repsDone;

  let restSec = s.restSec || 90;
  let coachBanner = '';

  const remainingWork = step.sets.slice(info.arrayIndex + 1).filter((x) => x.kind === 'work' && !x.done);
  const stepInc = machine.stepKg || 2.5;
  const repMin = s.repMin || Math.max(1, s.targetReps - 1);
  const repMax = s.repMax || s.targetReps + 1;

  if (info.isWarmup) {
    const nextSet = step.sets[info.arrayIndex + 1];
    const nextLoad = nextSet ? formatLoad(machine, nextSet.weightKg, unit).primary : '';
    coachBanner = nextLoad ? `Warm-up done · Set pin/plates to ${nextLoad}` : 'Warm-up done';
    restSec = s.restSec || 50;
  } else if (machine.loadType !== 'bodyweight') {
    if (repsDone > repMax && remainingWork.length > 0) {
      for (const rem of remainingWork) {
        rem.weightKg = Math.round((rem.weightKg + stepInc) * 10) / 10;
      }
      const nextStr = formatLoad(machine, remainingWork[0].weightKg, unit).primary;
      coachBanner = `${repsDone} reps → Bumped to ${nextStr} for next set`;
      step.liveNote = coachBanner;
      session.adaptations.push(`${machine.shortName}: +${stepInc} kg (${repsDone} reps)`);
    } else if (repsDone <= repMin - 2 && remainingWork.length > 0) {
      for (const rem of remainingWork) {
        rem.weightKg = Math.max(stepInc, Math.round((rem.weightKg - stepInc) * 10) / 10);
      }
      restSec = Math.min(240, restSec + 20);
      const nextStr = formatLoad(machine, remainingWork[0].weightKg, unit).primary;
      coachBanner = `${repsDone} reps → Eased to ${nextStr} to stay in ${repMin}–${repMax}`;
      step.liveNote = coachBanner;
      session.adaptations.push(`${machine.shortName}: −${stepInc} kg (${repsDone} reps)`);
    } else if (repsDone < repMin && remainingWork.length > 0) {
      restSec = Math.min(240, restSec + 15);
      coachBanner = `${repsDone} reps · Added +15s rest for next set`;
      step.liveNote = coachBanner;
    } else {
      coachBanner = `Set ${info.workNumber} of ${info.totalWorkSets} done · Weight is spot on`;
    }
  } else {
    if (repsDone > repMax && remainingWork.length > 0) {
      for (const rem of remainingWork) {
        rem.repMin += 2;
        rem.repMax += 2;
        rem.targetReps += 2;
      }
      coachBanner = `${repsDone} reps → Goal nudged up +2 reps`;
      step.liveNote = coachBanner;
    } else {
      coachBanner = `Set ${info.workNumber} of ${info.totalWorkSets} done`;
    }
  }

  if (info.isLastSetOfStep) {
    step.done = true;
    updateAthleteLiftFromStep(athlete, step);
    const nextIdx = session.steps.findIndex((st, i) => i > session.currentStepIndex && !st.done);
    if (nextIdx !== -1) {
      session.currentStepIndex = nextIdx;
      const nextStep = session.steps[nextIdx];
      const nextM = getMachineById(nextStep.stationId);
      coachBanner = `${machine.shortName} complete → Walk to ${nextM.name}`;
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
  if (!machine || machine.loadType === 'cardio' || machine.loadType === 'bodyweight') return;
  const workDone = step.sets.filter((s) => s.kind === 'work' && s.done);
  if (!workDone.length) return;

  let bestE1rm = 0;
  for (const s of workDone) {
    const reps = s.actualReps || s.targetReps;
    const est = estimate1RM(s.weightKg, reps, s.rir || 1.5);
    if (est > bestE1rm) bestE1rm = est;
  }

  // Double Progression: if athlete hit top of rep window on every working set, nudge e1RM so next session progresses cleanly
  const hitTopOnAll = workDone.every((s) => (s.actualReps || 0) >= (s.repMax || s.targetReps + 1));
  if (hitTopOnAll) {
    bestE1rm = Math.round((bestE1rm * 1.035) * 10) / 10;
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

export function rerouteBusyStation(session, athlete, floorOverrides = {}) {
  const idx = session.currentStepIndex;
  const curStep = session.steps[idx];
  if (!curStep) return null;

  const curMachine = getMachineById(curStep.stationId);
  if (!session.busyIds.includes(curStep.stationId)) {
    session.busyIds.push(curStep.stationId);
  }

  const candidatesAhead = session.steps
    .map((st, i) => ({ st, i }))
    .filter(
      ({ st, i }) =>
        i > idx && !st.done && st.type === 'lift' && !session.busyIds.includes(st.stationId)
    );

  if (candidatesAhead.length > 0) {
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
    const msg = `Machine busy → Go to ${nextM.name} first (${curMachine.shortName} saved for after)`;
    session.adaptations.push(msg);
    return msg;
  }

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
    const msg = `Swapped to ${sub.name}`;
    session.adaptations.push(msg);
    return msg;
  }

  return `${curMachine.shortName} busy · No open alternative`;
}

export function applyPainProtection(session, athlete, jointId, floorOverrides = {}) {
  if (!athlete.jointFlags) athlete.jointFlags = {};
  athlete.jointFlags[jointId] = Date.now();

  const usedIds = new Set(session.steps.map((s) => s.stationId));
  let swappedCount = 0;

  for (let i = session.currentStepIndex; i < session.steps.length; i += 1) {
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

  const cur = getActiveStep(session);
  if (cur?.done) {
    const nextIdx = session.steps.findIndex((s, i) => i >= session.currentStepIndex && !s.done);
    if (nextIdx !== -1) session.currentStepIndex = nextIdx;
    else session.phase = 'summary';
  } else if (session.phase !== 'briefing') {
    session.phase = 'active';
  }

  const msg = `Protected ${jointId.replace('_', ' ')} · Swapped ${swappedCount} exercise${swappedCount === 1 ? '' : 's'}`;
  session.adaptations.push(msg);
  return msg;
}

export function compressRemainingSession(session) {
  let trimmedSets = 0;
  for (let i = session.currentStepIndex; i < session.steps.length; i += 1) {
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
  const msg = `Shortened workout: −${trimmedSets} sets & faster rest`;
  session.adaptations.push(msg);
  return msg;
}

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
      if (session.phase !== 'briefing') session.phase = 'active';
      const msg = `Swapped to ${sub.name}${rememberSwap ? ' (saved for next time)' : ''}`;
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
    step.liveNote = `Form reminder: ${pinCue}`;
  }

  if (dropLoad && step.type === 'lift' && origMachine && origMachine.loadType !== 'bodyweight') {
    const inc = origMachine.stepKg || 2.5;
    for (const s of step.sets) {
      if (!s.done) {
        s.weightKg = Math.max(inc, Math.round((s.weightKg - inc) * 10) / 10);
      }
    }
    session.adaptations.push(`${origMachine.shortName}: −${inc} kg for cleaner form`);
    return `Saved form tip & lowered −${inc} kg`;
  }

  return 'Form reminder saved';
}

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

  // Advance persistent 8-week 2-block cycle (W1–W4 Base -> W5–W8 Max Neural)
  const targetDays = Math.max(2, Number(athlete.daysPerWeek) || 3);
  const meso = athlete.mesocycle || { week: 1, sessionInWeek: 1, totalCompleted: 0 };
  meso.totalCompleted = (meso.totalCompleted || 0) + 1;
  if (meso.sessionInWeek >= targetDays) {
    meso.sessionInWeek = 1;
    if (athlete.inSeasonNeuralOnly && meso.week >= 8) {
      meso.week = 5;
    } else {
      meso.week = (meso.week % 8) + 1;
    }
  } else {
    meso.sessionInWeek += 1;
  }
  athlete.mesocycle = meso;
  athlete.lastWorkoutAt = now;
  athlete.lastSplitId = session.splitId;

  const durationSec = session.startedAt
    ? Math.max(300, Math.round((now - session.startedAt) / 1000))
    : session.estimatedMin * 60;

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
        name: m.name,
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

export function removeBriefingStep(state, session, stepIndex) {
  if (session.steps.length <= 2) return 'Minimum 2 blocks kept';
  const [removed] = session.steps.splice(stepIndex, 1);
  const m = getMachineById(removed?.stationId);
  recomputeSessionMeta(state, session);
  session.feedbackNote = `Removed ${m?.shortName || 'block'} · ${session.estimatedMin} min`;
  return session.feedbackNote;
}

export function applyPreWorkoutFeedback(state, session, rawInput, liveWearable = null) {
  const text = String(rawInput || '').trim();
  if (!text) return null;
  const q = text.toLowerCase();
  const athlete = state.athlete;
  const notes = [];

  const timeMatch = q.match(/\b(\d{2})\s*(?:m|min|mins|minutes)\b/);
  if (timeMatch || q.includes('quick') || q.includes('hurry') || q.includes('short')) {
    const mins = timeMatch ? Math.max(20, Math.min(75, parseInt(timeMatch[1], 10))) : 30;
    const rebuilt = createDynamicSession(state, {
      splitOverride: session.splitId,
      durationMin: mins,
      liveWearable,
    });
    Object.assign(session, rebuilt);
    notes.push(`${mins}m workout`);
  }

  // Climbed yesterday -> switch to Finger-Safe Session B or swap grip-heavy stations
  if (q.includes('climb') || q.includes('boulder') || q.includes('finger') || q.includes('forearm') || q.includes('grip') || q.includes('skin')) {
    if (session.splitId !== 'finger_safe_lower' && !q.includes('upper')) {
      const rebuilt = createDynamicSession(state, {
        splitOverride: 'finger_safe_lower',
        durationMin: session.durationTargetMin,
        liveWearable,
      });
      Object.assign(session, rebuilt);
      notes.push('Switched to Finger-Safe Legs & Cuff');
    } else {
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
      notes.push('Finger-safe exercises');
    }
  }

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

  if (q.includes('no leg') || q.includes('skip leg') || q.includes('legs sore') || q.includes('sore legs')) {
    const rebuilt = createDynamicSession(state, {
      splitOverride: 'upper_push_pull',
      durationMin: session.durationTargetMin,
      liveWearable,
    });
    Object.assign(session, rebuilt);
    notes.push('Upper & Core only (skipped legs)');
  }

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
      notes.push('Added Hip Thrust');
    }
  }

  if (q.includes('higher rep') || q.includes('more rep')) {
    for (const st of session.steps) {
      if (st.type !== 'lift') continue;
      const m = getMachineById(st.stationId);
      for (const s of st.sets) {
        if (s.kind === 'work') {
          s.repMin = Math.max(10, s.repMin + 2);
          s.repMax = Math.max(12, s.repMax + 2);
          s.targetReps = Math.round((s.repMin + s.repMax) / 2);
          if (s.weightKg > 0) s.weightKg = roundToStep(s.weightKg * 0.9, m?.stepKg || 2.5);
        }
      }
    }
    notes.push('Higher reps (10–12+) & lighter load');
  } else if (q.includes('tired') || q.includes('sleep') || q.includes('slept') || q.includes('low energy') || q.includes('easy') || q.includes('light') || q.includes('exhaust')) {
    for (const st of session.steps) {
      if (st.type !== 'lift') continue;
      const m = getMachineById(st.stationId);
      const workSets = st.sets.filter((s) => s.kind === 'work');
      if (workSets.length >= 3) st.sets.pop();
      for (const s of st.sets) {
        if (s.weightKg > 0) s.weightKg = roundToStep(s.weightKg * 0.92, m?.stepKg || 2.5);
      }
    }
    notes.push('−8% weight & −1 set per exercise');
  } else if (q.includes('strong') || q.includes('fresh') || q.includes('heavy') || q.includes('push hard') || /\bmax\b/.test(q)) {
    for (const st of session.steps) {
      if (st.type !== 'lift') continue;
      const m = getMachineById(st.stationId);
      if (m?.compound && m.loadType !== 'bodyweight') {
        const inc = m.stepKg || 2.5;
        for (const s of st.sets) {
          if (s.kind === 'work') s.weightKg = Math.round((s.weightKg + inc) * 10) / 10;
        }
      }
    }
    notes.push('+Weight on main lifts');
  }

  if (q.includes('no cardio') || q.includes('skip cardio') || q.includes('weights only')) {
    const before = session.steps.length;
    session.steps = session.steps.filter((s) => s.type !== 'cardio');
    if (session.steps.length < before) notes.push('Skipped cardio');
  } else if (q.includes('only cardio')) {
    const rebuilt = createDynamicSession(state, { splitOverride: 'cardio_core', liveWearable });
    Object.assign(session, rebuilt);
    notes.push('Switched to Recovery Cardio & Core');
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
      notes.push('Stair Climber');
    } else if (q.includes('run') || q.includes('treadmill')) {
      card.stationId = 'c_treadmill';
      card.setup = getMachineById('c_treadmill').setup;
      notes.push('Treadmill');
    }
    if (q.includes('vo2') || q.includes('interval')) {
      const hb = getHrBand(athlete, 0.82, 0.92);
      card.protocol = 'vo2_4x3';
      card.durationSec = 960;
      card.hrBand = hb;
      card.cue = `4 rounds: 3 min hard (${hb.min}–${hb.max} bpm) + 2 min easy`;
      notes.push('VO₂max 4×3m');
    } else if (q.includes('more cardio')) {
      card.durationSec = Math.min(2100, card.durationSec + 360);
      notes.push('+6m cardio');
    }
  }

  const findMatchingStepIdx = () =>
    session.steps.findIndex((st) => {
      const m = getMachineById(st.stationId);
      if (!m) return false;
      const tokens = `${m.name} ${m.gymLabel || ''} ${m.shortName}`.toLowerCase().split(/\W+/).filter((t) => t.length >= 3);
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

  if (!notes.length) notes.push('Noted · Plan ready');

  recomputeSessionMeta(state, session);
  session.feedbackNote = notes.join(' · ');
  return session.feedbackNote;
}

export { formatDurationShort };
