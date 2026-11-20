/**
 * Weights — Data Layer & Persistence (Manegg Motion)
 */

export const STORAGE_KEY = 'weights_manegg_coach_v3';

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function formatWeight(val) {
  const num = Number(val);
  if (!Number.isFinite(num)) return '0';
  return Number.isInteger(num) ? String(num) : num.toFixed(2).replace(/\.?0+$/, '');
}

export function formatLoadDisplay(machine, unit = 'kg') {
  if (machine.loadType === 'bodyweight') {
    return { primary: 'Bodyweight', sub: 'Yoga mat', badge: 'BW' };
  }
  if (machine.loadType === 'cardio') {
    const mode = machine.cardioMode === 'stairs' ? 'Onyx ClimbMill · Stairs' : 'Onyx Treadmill · Run';
    return {
      primary: `${formatWeight(machine.weight)} min`,
      sub: mode,
      badge: machine.cardioMode === 'stairs' ? 'Stairs' : 'Run',
    };
  }
  if (machine.loadType === 'plate_per_side') {
    const perSide = formatWeight(machine.weight);
    const totalPlates = formatWeight(Number(machine.weight) * 2);
    return {
      primary: `${perSide} ${unit}/side`,
      sub: `2×${perSide} ${unit} plates (${totalPlates} ${unit})`,
      badge: `${perSide} ${unit}/side`,
    };
  }
  return {
    primary: `${formatWeight(machine.weight)} ${unit}`,
    sub: `Stack · ±${formatWeight(machine.step || 2.5)} ${unit}`,
    badge: `${formatWeight(machine.weight)} ${unit}`,
  };
}

export function formatRest(seconds) {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  if (s === 0) return '—';
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  if (mins === 0) return `${rem}s`;
  if (rem === 0) return `${mins}m`;
  return `${mins}:${String(rem).padStart(2, '0')}`;
}

export function formatClock(totalSeconds) {
  const abs = Math.max(0, Math.floor(Math.abs(totalSeconds)));
  const mins = Math.floor(abs / 60);
  const secs = abs % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function getRelativeDate(timestamp) {
  if (!timestamp) return 'New';
  const diffDays = Math.floor((Date.now() - timestamp) / 86400000);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const BODY_GROUPS = [
  { id: 'legs', label: 'Legs' },
  { id: 'core', label: 'Core' },
  { id: 'pull', label: 'Pull' },
  { id: 'push', label: 'Push' },
  { id: 'cardio', label: 'Cardio' },
];

export function createDefaultState() {
  const now = Date.now();
  const dayMs = 86400000;

  const machines = [
    {
      id: 'm_calves',
      name: 'Calf Raise',
      subtitle: 'Wadenheben',
      muscle: 'Calves',
      group: 'legs',
      tags: ['legs', 'lower'],
      loadType: 'plate_per_side',
      weight: 5,
      step: 2.5,
      sets: 3,
      reps: 15,
      restSec: 60,
      setupNote: '5 kg/side · Full stretch · 1s top pause',
      coachNote: 'Last: 15/15/14 · Hold 5 kg/side',
      prWeight: 5,
      lastTrainedAt: now - 3 * dayMs,
      lastReps: [15, 15, 14],
      weightLog: [{ date: now - 3 * dayMs, weight: 5 }],
      swaps: [
        { name: 'Leg Press Calf Press', setupNote: 'Toes on sled bottom edge' },
        { name: 'Single-Leg Calf Raise', setupNote: 'Step · BW or 1 dumbbell · 12–15/leg' },
      ],
    },
    {
      id: 'm_beinstrecker',
      name: 'Beinstrecker',
      subtitle: 'Leg Extension',
      muscle: 'Quads',
      group: 'legs',
      tags: ['legs', 'lower'],
      loadType: 'stack',
      weight: 36,
      step: 2.5,
      sets: 3,
      reps: 12,
      restSec: 75,
      setupNote: 'Back 4 · Ankle 3 · Knee on pivot',
      coachNote: 'Last: 12/12/11 · Hold 36 kg',
      prWeight: 36,
      lastTrainedAt: now - 3 * dayMs,
      lastReps: [12, 12, 11],
      weightLog: [
        { date: now - 10 * dayMs, weight: 31.5 },
        { date: now - 3 * dayMs, weight: 36 },
      ],
      swaps: [
        { name: 'Bulgarian Split Squat', setupNote: 'Bench · 10 reps/leg' },
        { name: 'Goblet Squat', setupNote: 'Dumbbell at chest · Controlled' },
      ],
    },
    {
      id: 'm_beinpresse',
      name: 'Beinpresse',
      subtitle: 'Leg Press',
      muscle: 'Quads & Glutes',
      group: 'legs',
      tags: ['legs', 'lower'],
      loadType: 'plate_per_side',
      weight: 10,
      step: 5,
      sets: 3,
      reps: 10,
      restSec: 120,
      setupNote: '10 kg/side · Backrest 2 · Mid-plate',
      coachNote: 'Last: 10/10/10 · 2m rest',
      prWeight: 10,
      lastTrainedAt: now - 3 * dayMs,
      lastReps: [10, 10, 10],
      weightLog: [{ date: now - 3 * dayMs, weight: 10 }],
      swaps: [
        { name: 'Smith Machine Squat', setupNote: 'Feet slightly forward · 10 kg/side' },
        { name: 'Walking Lunges', setupNote: '10 steps/leg' },
      ],
    },
    {
      id: 'm_lower_back',
      name: 'Lower Back',
      subtitle: 'Rückenstrecker',
      muscle: 'Lower Back',
      group: 'core',
      tags: ['core', 'back'],
      loadType: 'stack',
      weight: 25,
      step: 2.5,
      sets: 3,
      reps: 12,
      restSec: 60,
      setupNote: 'Seat 3 · Footplate 2 · Neutral spine',
      coachNote: 'Last: 12/12/12 · Slow hinge',
      prWeight: 25,
      lastTrainedAt: now - 3 * dayMs,
      lastReps: [12, 12, 12],
      weightLog: [{ date: now - 3 * dayMs, weight: 25 }],
      swaps: [
        { name: 'Roman Chair Extension', setupNote: 'Pad below hips · BW or 5 kg' },
        { name: 'Glute Bridge (Mat)', setupNote: 'Yoga mat · 2s top squeeze' },
      ],
    },
    {
      id: 'm_abs_mat',
      name: 'Abs · Yoga Mat',
      subtitle: 'Bauch',
      muscle: 'Core',
      group: 'core',
      tags: ['core'],
      loadType: 'bodyweight',
      weight: 0,
      step: 0,
      sets: 3,
      reps: 15,
      restSec: 45,
      setupNote: 'Yoga mat · Dead bugs / leg raises · Flat back',
      coachNote: 'Last: 15/15/15 · 45s rest',
      prWeight: 0,
      lastTrainedAt: now - 3 * dayMs,
      lastReps: [15, 15, 15],
      weightLog: [],
      swaps: [
        { name: 'Matrix Ab Crunch', setupNote: 'Pin stack · Slow curl' },
        { name: 'Forearm Plank', setupNote: 'Yoga mat · 45–60s hold' },
      ],
    },
    {
      id: 'm_low_row',
      name: 'Low Row',
      subtitle: 'Seated Row',
      muscle: 'Mid Back',
      group: 'pull',
      tags: ['pull', 'upper', 'arms'],
      loadType: 'stack',
      weight: 35,
      step: 2.5,
      sets: 3,
      reps: 10,
      restSec: 90,
      setupNote: 'Seat 4 · Chest pad 3 · Elbows to ribs',
      coachNote: 'Baseline 35 kg · Squeeze 1s',
      prWeight: 35,
      lastTrainedAt: null,
      lastReps: null,
      weightLog: [{ date: now - 7 * dayMs, weight: 32.5 }],
      swaps: [
        { name: 'Cable Row (V-Grip)', setupNote: 'Low pulley · Tall torso' },
        { name: '1-Arm Dumbbell Row', setupNote: 'Bench · 10/arm' },
      ],
    },
    {
      id: 'm_lat_pulldown',
      name: 'Lat Pulldown',
      subtitle: 'Latzug',
      muscle: 'Lats',
      group: 'pull',
      tags: ['pull', 'upper', 'arms'],
      loadType: 'stack',
      weight: 40,
      step: 2.5,
      sets: 3,
      reps: 10,
      restSec: 90,
      setupNote: 'Thigh pad 3 · Wide grip · To upper chest',
      coachNote: 'Baseline 40 kg · Elbows down',
      prWeight: 40,
      lastTrainedAt: null,
      lastReps: null,
      weightLog: [{ date: now - 7 * dayMs, weight: 37.5 }],
      swaps: [
        { name: 'Assisted Pull-Up', setupNote: 'Counterweight stack · Full ROM' },
        { name: 'Straight-Arm Pulldown', setupNote: 'High pulley + rope' },
      ],
    },
    {
      id: 'm_smith_incline',
      name: 'Smith Incline Press',
      subtitle: 'Angled Bench',
      muscle: 'Upper Chest',
      group: 'push',
      tags: ['push', 'upper', 'arms'],
      loadType: 'plate_per_side',
      weight: 5,
      step: 2.5,
      sets: 3,
      reps: 10,
      restSec: 90,
      setupNote: 'Bench 35° · 5 kg/side · Push straight up',
      coachNote: 'Check safety stops · 5 kg/side',
      prWeight: 5,
      lastTrainedAt: null,
      lastReps: null,
      weightLog: [{ date: now - 7 * dayMs, weight: 5 }],
      swaps: [
        { name: 'Matrix Chest Press', setupNote: 'Seat 4 · Back pad 2' },
        { name: 'Incline DB Press', setupNote: 'Bench 30° · 45° elbows' },
      ],
    },
    {
      id: 'm_butterfly',
      name: 'Butterfly',
      subtitle: 'Pec Deck',
      muscle: 'Chest',
      group: 'push',
      tags: ['push', 'upper', 'arms'],
      loadType: 'stack',
      weight: 30,
      step: 2.5,
      sets: 3,
      reps: 12,
      restSec: 60,
      setupNote: 'Seat 4 · Arm pin 2 · Soft elbows',
      coachNote: 'Baseline 30 kg · 1s center squeeze',
      prWeight: 30,
      lastTrainedAt: null,
      lastReps: null,
      weightLog: [{ date: now - 7 * dayMs, weight: 27.5 }],
      swaps: [
        { name: 'Cable Chest Fly', setupNote: 'Dual cables · Chest height' },
        { name: 'DB Chest Fly', setupNote: 'Flat bench · Wide arc' },
      ],
    },
    {
      id: 'm_cardio',
      name: 'Cardio Finisher',
      subtitle: 'Matrix Onyx',
      muscle: 'Cardio',
      group: 'cardio',
      tags: ['cardio'],
      loadType: 'cardio',
      cardioMode: 'running',
      weight: 15,
      step: 5,
      sets: 1,
      reps: 15,
      restSec: 0,
      setupNote: 'Onyx Treadmill 2% incline · Steady pace',
      coachNote: 'Target 15 min · Z2–Z3 pace',
      prWeight: 15,
      lastTrainedAt: now - 3 * dayMs,
      lastReps: [15],
      weightLog: [],
      swaps: [
        { name: 'Onyx ClimbMill (Stairs)', setupNote: 'Level 5–7 · Upright posture' },
        { name: 'Onyx Treadmill (Run)', setupNote: 'Incline 2% · Steady pace' },
      ],
    },
  ];

  return {
    version: 3,
    gymName: 'Manegg Motion',
    settings: {
      unit: 'kg',
      theme: 'dark',
      sound: true,
      autoStartRest: true,
      wakeLock: false,
    },
    wearable: {
      restingHr: 58,
      maxHr: 188,
      googleHealthClientId: '',
      googleHealthSummary: null,
    },
    machines,
    todayPlan: {
      startedAt: null,
      queue: machines.map((m) => m.id),
      activeMachineId: machines[0].id,
      skippedIds: [],
      busyIds: [],
      excludedGroups: [],
      excludedTags: [],
      completedSets: {},
      finishedMachineIds: [],
      sessionAdjustments: {},
      coachMessage: '',
    },
    history: [
      {
        id: 'hist_initial_1',
        date: now - 3 * dayMs,
        title: 'Manegg Motion · Lower & Core',
        durationSec: 2340,
        totalSets: 15,
        unit: 'kg',
        entries: [
          { name: 'Calf Raise', loadText: '5 kg/side', sets: 3, repsList: [15, 15, 14] },
          { name: 'Beinstrecker', loadText: '36 kg', sets: 3, repsList: [12, 12, 11] },
          { name: 'Beinpresse', loadText: '10 kg/side', sets: 3, repsList: [10, 10, 10] },
          { name: 'Lower Back', loadText: '25 kg', sets: 3, repsList: [12, 12, 12] },
          { name: 'Abs · Yoga Mat', loadText: 'BW', sets: 3, repsList: [15, 15, 15] },
        ],
      },
    ],
    timer: {
      running: false,
      paused: false,
      durationSec: 90,
      endTime: null,
      pausedRemainingMs: null,
      label: '',
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
    const machines = Array.isArray(parsed.machines) && parsed.machines.length
      ? parsed.machines
      : defaults.machines;

    const tp = parsed.todayPlan || {};
    const validIds = new Set(machines.map((m) => m.id));
    let queue = Array.isArray(tp.queue) ? tp.queue.filter((id) => validIds.has(id)) : [];
    for (const m of machines) {
      if (!queue.includes(m.id)) queue.push(m.id);
    }

    return {
      ...defaults,
      ...parsed,
      settings: { ...defaults.settings, ...(parsed.settings || {}) },
      wearable: { ...defaults.wearable, ...(parsed.wearable || {}) },
      machines,
      todayPlan: {
        ...defaults.todayPlan,
        ...tp,
        queue,
        activeMachineId: validIds.has(tp.activeMachineId) ? tp.activeMachineId : queue[0] || null,
        skippedIds: Array.isArray(tp.skippedIds) ? tp.skippedIds.filter((id) => validIds.has(id)) : [],
        busyIds: Array.isArray(tp.busyIds) ? tp.busyIds.filter((id) => validIds.has(id)) : [],
        excludedGroups: Array.isArray(tp.excludedGroups) ? tp.excludedGroups : [],
        excludedTags: Array.isArray(tp.excludedTags) ? tp.excludedTags : [],
        completedSets: tp.completedSets || {},
        finishedMachineIds: Array.isArray(tp.finishedMachineIds) ? tp.finishedMachineIds : [],
        sessionAdjustments: tp.sessionAdjustments || {},
      },
      history: Array.isArray(parsed.history) ? parsed.history : [],
      timer: { ...defaults.timer, ...(parsed.timer || {}) },
    };
  } catch {
    return createDefaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Unable to save state:', err);
  }
}

export function convertAllWeights(state, newUnit) {
  if (state.settings.unit === newUnit) return;
  const factor = newUnit === 'lb' ? 2.20462 : 1 / 2.20462;
  const roundTo = newUnit === 'lb' ? 2.5 : 1.25;
  const roundWeight = (w) => Math.max(0, Math.round((w * factor) / roundTo) * roundTo);

  state.machines.forEach((m) => {
    if (m.loadType === 'bodyweight' || m.loadType === 'cardio') return;
    m.weight = roundWeight(m.weight);
    m.prWeight = roundWeight(m.prWeight || m.weight);
    m.step = newUnit === 'lb' ? (m.step >= 5 ? 10 : 5) : (m.step >= 10 ? 5 : 2.5);
    if (Array.isArray(m.weightLog)) {
      m.weightLog = m.weightLog.map((pt) => ({ ...pt, weight: roundWeight(pt.weight) }));
    }
  });
  state.settings.unit = newUnit;
}
