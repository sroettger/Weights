/**
 * Weights — Persistent AI Coach State (Athletes, Mesocycle, Floor Calibration, Wearables)
 */

import { GYM_MACHINES } from './floor.js';
import { estimate1RM } from './science.js';

export const STORAGE_KEY = 'weights_ai_coach_v5';

function buildSeedLifts(now) {
  const day = 86400000;
  // Calibrated directly to the user's actual Manegg Motion working loads
  const seed = {
    m_calf: { weight: 5, reps: 15, daysAgo: 3 },
    m_leg_ext: { weight: 36, reps: 12, daysAgo: 3 },
    m_leg_press: { weight: 10, reps: 10, daysAgo: 3 },
    m_lower_back: { weight: 25, reps: 12, daysAgo: 3 },
    m_low_row: { weight: 35, reps: 10, daysAgo: 5 },
    m_lat_pull: { weight: 40, reps: 10, daysAgo: 5 },
    m_smith_incline: { weight: 5, reps: 10, daysAgo: 5 },
    m_butterfly: { weight: 30, reps: 12, daysAgo: 5 },
  };

  const lifts = {};
  for (const m of GYM_MACHINES) {
    if (m.loadType === 'cardio' || m.loadType === 'bodyweight') continue;
    const s = seed[m.id];
    if (s) {
      const e1rm = estimate1RM(s.weight, s.reps, 2);
      const ts = now - s.daysAgo * day;
      lifts[m.id] = {
        e1rm,
        lastWeight: s.weight,
        lastReps: [s.reps, s.reps, s.reps],
        lastAt: ts,
        history: [{ date: ts, e1rm, weightKg: s.weight }],
      };
    }
  }
  return lifts;
}

export function createDefaultState(now = Date.now()) {
  const day = 86400000;
  return {
    version: 5,
    gymName: 'Manegg Motion',
    settings: {
      unit: 'kg',
      theme: 'dark',
      sound: true,
      wakeLock: true,
      hrAutoExtendRest: true,
    },
    athlete: {
      name: 'You',
      goal: 'max_strength', // Climber: neural max strength without hypertrophy mass bloat
      cardioGoal: 'cardio_health', // VO2max + Zone 2 cardiovascular health
      focusAreas: ['pull', 'core'],
      daysPerWeek: 3,
      targetMinutes: 45,
      baselineRhr: 58,
      todayRhr: 58,
      baselineHrv: 58,
      todayHrv: null,
      maxHr: 188,
      lastWorkoutAt: now - 3 * day,
      lastSplitId: 'lower_push',
      jointFlags: {},
      formNotes: {},
      mesocycle: {
        week: 1,
        sessionInWeek: 2,
        totalCompleted: 1,
      },
      lifts: buildSeedLifts(now),
    },
    partner: {
      enabled: false,
      name: 'Partner',
      goal: 'body_focus',
      focusAreas: ['glutes', 'core'],
      cardioGoal: 'fat_burn',
      baselineRhr: 62,
      todayRhr: 62,
      maxHr: 190,
      jointFlags: {},
      mesocycle: { week: 1, sessionInWeek: 1, totalCompleted: 0 },
      lifts: {},
    },
    wearable: {
      deviceType: 'garmin_venu_4s',
      restingHr: 58,
      maxHr: 188,
      googleHealthClientId: '',
      googleHealthSummary: null,
    },
    floorOverrides: {},
    activeSession: null,
    history: [
      {
        id: 'hist_seed_1',
        date: now - 3 * day,
        splitName: 'Heavy Legs, Push & Core',
        mesoWeek: 1,
        mesoName: 'Base',
        durationMin: 41,
        totalSets: 15,
        avgBpm: 124,
        peakBpm: 154,
        estKcal: 295,
        highlights: [
          { name: 'Leg Press', summary: '3×10 @ 10 kg', e1rmGain: 0 },
          { name: 'Leg Ext', summary: '3×12 @ 36 kg', e1rmGain: 0 },
          { name: 'Back Ext', summary: '3×12 @ 25 kg', e1rmGain: 0 },
        ],
      },
    ],
    timer: {
      running: false,
      paused: false,
      mode: 'rest', // 'rest' | 'warmup' | 'cardio'
      startedAt: null,
      durationSec: 120,
      endTime: null,
      pausedRemainingMs: null,
      label: '',
      hrExtensions: 0,
      hrReason: '',
      notifiedComplete: false,
    },
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw);
    const defaults = createDefaultState();
    return {
      ...defaults,
      ...parsed,
      settings: { ...defaults.settings, ...(parsed.settings || {}) },
      athlete: {
        ...defaults.athlete,
        ...(parsed.athlete || {}),
        mesocycle: { ...defaults.athlete.mesocycle, ...(parsed.athlete?.mesocycle || {}) },
        lifts: { ...defaults.athlete.lifts, ...(parsed.athlete?.lifts || {}) },
        jointFlags: { ...(parsed.athlete?.jointFlags || {}) },
        formNotes: { ...(parsed.athlete?.formNotes || {}) },
      },
      partner: {
        ...defaults.partner,
        ...(parsed.partner || {}),
      },
      wearable: {
        ...defaults.wearable,
        ...(parsed.wearable || {}),
      },
      floorOverrides: { ...(parsed.floorOverrides || {}) },
      timer: { ...defaults.timer, ...(parsed.timer || {}) },
    };
  } catch {
    return createDefaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}
