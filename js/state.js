/**
 * Weights — Persistent AI Coach State (v6: 8-Week Block Periodization + Clean Rep Windows)
 */

import { GYM_MACHINES } from './floor.js';
import { estimate1RM } from './science.js';

export const STORAGE_KEY = 'weights_ai_coach_v6';
const LEGACY_KEYS = ['weights_ai_coach_v5'];

function buildSeedLifts(now) {
  const day = 86400000;
  const seed = {
    m_calf: { weight: 5, reps: 15, daysAgo: 3 },
    m_leg_ext: { weight: 35, reps: 12, daysAgo: 3 },
    m_leg_press: { weight: 12.5, reps: 8, daysAgo: 3 },
    m_leg_curl: { weight: 35, reps: 10, daysAgo: 3 },
    m_lower_back: { weight: 25, reps: 12, daysAgo: 3 },
    m_low_row: { weight: 35, reps: 10, daysAgo: 5 },
    m_lat_pull: { weight: 40, reps: 10, daysAgo: 5 },
    m_chest_press: { weight: 35, reps: 10, daysAgo: 5 },
    m_smith_incline: { weight: 7.5, reps: 8, daysAgo: 5 },
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
    version: 6,
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
      goal: 'max_strength',
      cardioGoal: 'cardio_health',
      focusAreas: ['pull', 'core'],
      daysPerWeek: 3,
      targetMinutes: 45,
      baselineRhr: 58,
      todayRhr: 58,
      baselineHrv: 58,
      todayHrv: null,
      maxHr: 188,
      inSeasonNeuralOnly: false,
      lastWorkoutAt: now - 3 * day,
      lastSplitId: 'finger_safe_lower',
      jointFlags: {},
      formNotes: {},
      mesocycle: {
        week: 1, // Starts in Block 1 · Week 1 (8–10 rep Structural Base)
        sessionInWeek: 1,
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
      deviceType: 'fitbit_air',
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
        splitName: 'Legs, Heel-Hook & Shoulders',
        mesoWeek: 1,
        mesoName: 'Base W1',
        durationMin: 42,
        totalSets: 11,
        avgBpm: 124,
        peakBpm: 152,
        estKcal: 285,
        highlights: [
          { name: 'Seated Leg Press', summary: '2×9 @ 12.5 kg', e1rmGain: 0 },
          { name: 'Seated Leg Curl', summary: '3×10 @ 35 kg', e1rmGain: 0 },
        ],
      },
    ],
    timer: {
      running: false,
      paused: false,
      mode: 'rest',
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
    const defaults = createDefaultState();
    let raw = localStorage.getItem(STORAGE_KEY);

    // Migrate lift history, floor calibration, and wearable settings from v5 while resetting stale 4-rep activeSession
    if (!raw) {
      for (const oldKey of LEGACY_KEYS) {
        const legacyRaw = localStorage.getItem(oldKey);
        if (legacyRaw) {
          const legacy = JSON.parse(legacyRaw);
          return {
            ...defaults,
            settings: { ...defaults.settings, ...(legacy.settings || {}) },
            athlete: {
              ...defaults.athlete,
              ...(legacy.athlete || {}),
              mesocycle: { week: 1, sessionInWeek: 1, totalCompleted: legacy.athlete?.mesocycle?.totalCompleted || 1 },
              lifts: { ...defaults.athlete.lifts, ...(legacy.athlete?.lifts || {}) },
              jointFlags: { ...(legacy.athlete?.jointFlags || {}) },
              formNotes: { ...(legacy.athlete?.formNotes || {}) },
            },
            partner: { ...defaults.partner, ...(legacy.partner || {}) },
            wearable: { ...defaults.wearable, ...(legacy.wearable || {}) },
            floorOverrides: { ...(legacy.floorOverrides || {}) },
            history: Array.isArray(legacy.history) ? legacy.history : defaults.history,
            activeSession: null, // Force fresh 8–10 rep Block 1 session generation
          };
        }
      }
      return defaults;
    }

    const parsed = JSON.parse(raw);
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
      partner: { ...defaults.partner, ...(parsed.partner || {}) },
      wearable: { ...defaults.wearable, ...(parsed.wearable || {}) },
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
