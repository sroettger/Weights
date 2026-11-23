/**
 * Weights — Manegg Motion Machine Catalog & 2D Floor Plan (28m × 18m)
 * Plain-English names + German gym stickers + target muscle tags + 4-tier biomechanics.
 */

export const FLOOR_DIMS = { width: 28, height: 18 };

export const FLOOR_ZONES = [
  { id: 'cardio', code: 'A', name: 'Cardio Deck', x: 0.8, y: 0.8, w: 26.4, h: 4.0 },
  { id: 'lower', code: 'B', name: 'Lower Body Area', x: 0.8, y: 5.4, w: 12.8, h: 6.0 },
  { id: 'core', code: 'C', name: 'Core & Turf Area', x: 14.4, y: 5.4, w: 12.8, h: 6.0 },
  { id: 'pull', code: 'D', name: 'Back & Cable Area', x: 0.8, y: 12.0, w: 12.8, h: 5.2 },
  { id: 'push', code: 'E', name: 'Chest & Racks Area', x: 14.4, y: 12.0, w: 12.8, h: 5.2 },
];

/**
 * Complete Manegg Motion equipment inventory.
 * - name: Clear plain-English name
 * - gymLabel: German / Matrix sticker label on the physical machine
 * - muscleTag: Plain-English body part worked
 * - tier: 't1_upper' | 't2_lean_legs' | 't3_posterior' | 't4_isolation' | 'cardio'
 */
export const GYM_MACHINES = [
  // Zone A — Cardio Deck (Matrix Onyx)
  {
    id: 'c_treadmill',
    name: 'Treadmill',
    gymLabel: 'Laufband · Matrix Onyx',
    shortName: 'Treadmill',
    muscleTag: 'Cardio · Running / Incline Walk',
    tier: 'cardio',
    zone: 'cardio',
    pos: { x: 4.2, y: 2.8 },
    loadType: 'cardio',
    movement: 'cardio_run',
    compound: false,
    stepKg: 0,
    baselineWorkKg: 0,
    baselineReps: 15,
    setup: '1.5–2% incline · Light quick steps',
    cue: 'Steady nasal breathing in Zone 2; strong drive on intervals',
    muscles: { cardio: 1.0, calves: 0.3, legs: 0.3 },
    jointStress: { fingers: 0, shoulder: 0, lower_back: 0.2, knee: 0.45 },
  },
  {
    id: 'c_climbmill',
    name: 'Stair Climber',
    gymLabel: 'Treppensteiger · ClimbMill',
    shortName: 'Stairs',
    muscleTag: 'Cardio · Glutes & Legs',
    tier: 'cardio',
    zone: 'cardio',
    pos: { x: 9.8, y: 2.8 },
    loadType: 'cardio',
    movement: 'cardio_stairs',
    compound: false,
    stepKg: 0,
    baselineWorkKg: 0,
    baselineReps: 15,
    setup: 'Level 6–8 · Tall posture, light fingertips on rails',
    cue: 'Step whole foot onto each stair — do not lean weight on rails',
    muscles: { cardio: 1.0, glutes: 0.5, quads: 0.4, calves: 0.3 },
    jointStress: { fingers: 0, shoulder: 0, lower_back: 0.15, knee: 0.35 },
  },
  {
    id: 'c_rower',
    name: 'Rowing Machine',
    gymLabel: 'Rudergerät · Ergometer',
    shortName: 'Rower',
    muscleTag: 'Full-Body Warm-up & Cardio',
    tier: 'cardio',
    zone: 'cardio',
    pos: { x: 16.5, y: 2.8 },
    loadType: 'cardio',
    movement: 'cardio_row',
    compound: false,
    stepKg: 0,
    baselineWorkKg: 0,
    baselineReps: 10,
    setup: 'Side damper 4–5 · Foot strap across mid-shoe',
    cue: 'Push legs first, then lean back, then pull handle to ribs',
    muscles: { cardio: 1.0, back: 0.4, legs: 0.4 },
    jointStress: { fingers: 0.35, shoulder: 0.15, lower_back: 0.35, knee: 0.2 },
  },
  {
    id: 'c_bike',
    name: 'Stationary Bike',
    gymLabel: 'Fahrrad · Matrix Onyx Bike',
    shortName: 'Bike',
    muscleTag: 'Low-Impact Cardio',
    tier: 'cardio',
    zone: 'cardio',
    pos: { x: 22.8, y: 2.8 },
    loadType: 'cardio',
    movement: 'cardio_bike',
    compound: false,
    stepKg: 0,
    baselineWorkKg: 0,
    baselineReps: 15,
    setup: 'Saddle at hip height · Smooth 80–90 rpm spin',
    cue: 'Relax shoulders and keep a lively cadence',
    muscles: { cardio: 1.0, quads: 0.35 },
    jointStress: { fingers: 0, shoulder: 0, lower_back: 0.05, knee: 0.15 },
  },

  // Zone B — Lower Body
  {
    id: 'm_leg_press',
    name: 'Seated Leg Press',
    gymLabel: 'Beinpresse',
    shortName: 'Leg Press',
    muscleTag: 'Quads & Glutes',
    tier: 't2_lean_legs',
    zone: 'lower',
    pos: { x: 3.6, y: 7.4 },
    loadType: 'plate_per_side',
    movement: 'squat',
    compound: true,
    stepKg: 2.5,
    baselineWorkKg: 12.5,
    baselineReps: 8,
    setup: 'Seat 3 · Feet shoulder-width in middle of footplate',
    cue: 'Lower 2s to ~90° knees · Push through whole foot without locking knees',
    muscles: { quads: 1.0, glutes: 0.75, adductors: 0.4 },
    jointStress: { fingers: 0, shoulder: 0, lower_back: 0.2, knee: 0.65 },
  },
  {
    id: 'm_leg_ext',
    name: 'Seated Leg Extension',
    gymLabel: 'Beinstrecker',
    shortName: 'Leg Ext',
    muscleTag: 'Front of Thighs (Quads)',
    tier: 't4_isolation',
    zone: 'lower',
    pos: { x: 8.2, y: 7.4 },
    loadType: 'stack',
    movement: 'knee_ext',
    compound: false,
    stepKg: 2.5,
    baselineWorkKg: 35,
    baselineReps: 12,
    setup: 'Back pad 4 · Pad rests on front of ankles above shoes',
    cue: 'Kick legs straight up · Hold 1s at top, lower under control',
    muscles: { quads: 1.0 },
    jointStress: { fingers: 0, shoulder: 0, lower_back: 0, knee: 0.7 },
  },
  {
    id: 'm_leg_curl',
    name: 'Seated Leg Curl',
    gymLabel: 'Beinbeuger',
    shortName: 'Leg Curl',
    muscleTag: 'Back of Thighs · Heel-Hook Power',
    tier: 't3_posterior',
    zone: 'lower',
    pos: { x: 8.2, y: 9.9 },
    loadType: 'stack',
    movement: 'knee_flex',
    compound: false,
    stepKg: 2.5,
    baselineWorkKg: 35,
    baselineReps: 10,
    setup: 'Back pad 4 · Roller behind ankles · Lock thigh pad tight on lap',
    cue: 'Pull heels all the way under the seat (builds heel-hook strength)',
    muscles: { hamstrings: 1.0, calves: 0.2 },
    jointStress: { fingers: 0, shoulder: 0, lower_back: 0.05, knee: 0.25 },
  },
  {
    id: 'm_calf',
    name: 'Seated Calf Raise',
    gymLabel: 'Wadenheben · Calf Raise',
    shortName: 'Calves',
    muscleTag: 'Calves & Slab Footwork',
    tier: 't4_isolation',
    zone: 'lower',
    pos: { x: 3.6, y: 9.9 },
    loadType: 'plate_per_side',
    movement: 'calf',
    compound: false,
    stepKg: 2.5,
    baselineWorkKg: 7.5,
    baselineReps: 12,
    setup: 'Balls of feet on step edge · Knee pad locked snug',
    cue: 'Pause 2s in deep bottom stretch · Press high onto big toes',
    muscles: { calves: 1.0 },
    jointStress: { fingers: 0, shoulder: 0, lower_back: 0.05, knee: 0.05 },
  },
  {
    id: 'm_hip_thrust',
    name: 'Hip Thrust Machine',
    gymLabel: 'Glute Drive · Padded Hip Belt',
    shortName: 'Hip Thrust',
    muscleTag: 'Glutes & Hip Tension',
    tier: 't2_lean_legs',
    zone: 'lower',
    pos: { x: 11.6, y: 8.6 },
    loadType: 'plate_per_side',
    movement: 'hinge',
    compound: true,
    stepKg: 5,
    baselineWorkKg: 15,
    baselineReps: 8,
    setup: 'Upper back on pad · Buckle belt across hips · Feet flat',
    cue: 'Keep chin tucked · Drive hips up flat and squeeze glutes 1s',
    muscles: { glutes: 1.0, hamstrings: 0.5, lower_back: 0.25 },
    jointStress: { fingers: 0, shoulder: 0, lower_back: 0.2, knee: 0.15 },
  },

  // Zone C — Core & Turf
  {
    id: 'm_lower_back',
    name: 'Seated Back Extension',
    gymLabel: 'Rückenstrecker · Lower Back',
    shortName: 'Back Ext',
    muscleTag: 'Lower Back Posture',
    tier: 't3_posterior',
    zone: 'core',
    pos: { x: 16.8, y: 7.4 },
    loadType: 'stack',
    movement: 'hinge',
    compound: false,
    stepKg: 2.5,
    baselineWorkKg: 25,
    baselineReps: 12,
    setup: 'Roller across shoulder blades · Feet braced on platform',
    cue: 'Brace abs · Hinge back to upright posture (do not arch past straight)',
    muscles: { lower_back: 1.0, glutes: 0.4, hamstrings: 0.3 },
    jointStress: { fingers: 0, shoulder: 0, lower_back: 0.75, knee: 0 },
  },
  {
    id: 'm_abs_mat',
    name: 'Floor Mat · Hollow Leg Lowers',
    gymLabel: 'Mattenbereich · Turf Mat',
    shortName: 'Mat Core',
    muscleTag: 'Deep Core Tension',
    tier: 't4_isolation',
    zone: 'core',
    pos: { x: 22.8, y: 8.4 },
    loadType: 'bodyweight',
    movement: 'core',
    compound: false,
    stepKg: 0,
    baselineWorkKg: 0,
    baselineReps: 12,
    setup: 'Lie flat on yoga mat · Press lower back firmly into floor',
    cue: 'Slowly lower legs for 3s only as far as lower back stays glued down',
    muscles: { core: 1.0 },
    jointStress: { fingers: 0, shoulder: 0.05, lower_back: 0.15, knee: 0 },
  },
  {
    id: 'm_ab_crunch',
    name: 'Seated Ab Crunch',
    gymLabel: 'Bauchpresse · Matrix Ab Crunch',
    shortName: 'Ab Crunch',
    muscleTag: 'Upper & Mid Abs',
    tier: 't4_isolation',
    zone: 'core',
    pos: { x: 16.8, y: 9.9 },
    loadType: 'stack',
    movement: 'core',
    compound: false,
    stepKg: 2.5,
    baselineWorkKg: 27.5,
    baselineReps: 12,
    setup: 'Seat 3 · Elbows on pads · Open palms (do not grip handles)',
    cue: 'Exhale hard and curl ribs down toward pelvis — zero arm pull',
    muscles: { core: 1.0 },
    jointStress: { fingers: 0.1, shoulder: 0.1, lower_back: 0.25, knee: 0 },
  },

  // Zone D — Back & Cable Area
  {
    id: 'm_lat_pull',
    name: 'Lat Pulldown',
    gymLabel: 'Latzug · Overhead Bar',
    shortName: 'Lat Pull',
    muscleTag: 'Upper Back & Lats',
    tier: 't1_upper',
    zone: 'pull',
    pos: { x: 3.6, y: 13.8 },
    loadType: 'stack',
    movement: 'vert_pull',
    compound: true,
    stepKg: 2.5,
    baselineWorkKg: 40,
    baselineReps: 10,
    setup: 'Lock thighs snug under pad · Grip slightly wider than shoulders',
    cue: 'Pull shoulders down away from ears first, then drive bar to chest',
    muscles: { lats: 1.0, upper_back: 0.6, biceps: 0.55, forearms: 0.4 },
    jointStress: { fingers: 0.55, shoulder: 0.35, lower_back: 0.05, knee: 0 },
  },
  {
    id: 'm_pullup',
    name: 'Assisted / Weighted Pull-Up',
    gymLabel: 'Klimmzugstation · Pull-Up Tower',
    shortName: 'Pull-Up',
    muscleTag: 'Lats, Lock-Off & Core',
    tier: 't1_upper',
    zone: 'pull',
    pos: { x: 7.8, y: 13.8 },
    loadType: 'stack',
    movement: 'vert_pull',
    compound: true,
    stepKg: 2.5,
    baselineWorkKg: 15,
    baselineReps: 8,
    setup: 'Parallel neutral handles · Counterweight knee pad (or belt)',
    cue: 'Start from active hang · Pull chest to bar with zero swinging',
    muscles: { lats: 1.0, biceps: 0.65, core: 0.4, forearms: 0.55 },
    jointStress: { fingers: 0.65, shoulder: 0.45, lower_back: 0, knee: 0 },
  },
  {
    id: 'm_low_row',
    name: 'Seated Cable Row',
    gymLabel: 'Ruderzug · Chest-Pad Row',
    shortName: 'Cable Row',
    muscleTag: 'Mid-Back & Scapulae',
    tier: 't1_upper',
    zone: 'pull',
    pos: { x: 3.6, y: 15.9 },
    loadType: 'stack',
    movement: 'horiz_pull',
    compound: true,
    stepKg: 2.5,
    baselineWorkKg: 35,
    baselineReps: 10,
    setup: 'Seat 4 · Chest resting against front pad · Vertical handles',
    cue: 'Keep chest glued to pad · Drive elbows back and squeeze blades 1s',
    muscles: { upper_back: 1.0, lats: 0.7, rear_delt: 0.5, biceps: 0.5 },
    jointStress: { fingers: 0.5, shoulder: 0.2, lower_back: 0.1, knee: 0 },
  },
  {
    id: 'm_cable_pull',
    name: 'Cable Rope Face Pull',
    gymLabel: 'Kabelturm · High Pulley Rope',
    shortName: 'Face Pull',
    muscleTag: 'Rear Shoulders & Rotator Cuff',
    tier: 't4_isolation',
    zone: 'pull',
    pos: { x: 10.8, y: 15.0 },
    loadType: 'stack',
    movement: 'scapular',
    compound: false,
    stepKg: 2.5,
    baselineWorkKg: 15,
    baselineReps: 14,
    setup: 'Set cable pulley at eye level · Attach double-rope handle',
    cue: 'Pull rope toward forehead while rotating thumbs backward',
    muscles: { rear_delt: 1.0, upper_back: 0.7 },
    jointStress: { fingers: 0.25, shoulder: 0.1, lower_back: 0.05, knee: 0 },
  },

  // Zone E — Chest & Racks Area
  {
    id: 'm_smith_incline',
    name: 'Incline Smith Press',
    gymLabel: 'Multipresse · 30° Guided Barbell',
    shortName: 'Incline Press',
    muscleTag: 'Upper Chest & Shoulders',
    tier: 't1_upper',
    zone: 'push',
    pos: { x: 16.8, y: 14.0 },
    loadType: 'plate_per_side',
    movement: 'horiz_push',
    compound: true,
    stepKg: 2.5,
    baselineWorkKg: 7.5,
    baselineReps: 8,
    setup: '30° angled bench under guided barbell · Safety stops at chest',
    cue: 'Lower bar to upper chest with elbows at 45° · Press up smoothly',
    muscles: { chest: 1.0, shoulders: 0.65, triceps: 0.55 },
    jointStress: { fingers: 0.15, shoulder: 0.6, lower_back: 0.1, knee: 0 },
  },
  {
    id: 'm_chest_press',
    name: 'Seated Chest Press',
    gymLabel: 'Brustpresse · Matrix Press',
    shortName: 'Chest Press',
    muscleTag: 'Chest & Triceps (Shoulder-Safe)',
    tier: 't1_upper',
    zone: 'push',
    pos: { x: 21.0, y: 14.0 },
    loadType: 'stack',
    movement: 'horiz_push',
    compound: true,
    stepKg: 2.5,
    baselineWorkKg: 35,
    baselineReps: 10,
    setup: 'Seat 4 (handles at mid-chest) · Use vertical neutral grips',
    cue: 'Keep shoulder blades pinned to pad · Press forward smoothly',
    muscles: { chest: 1.0, triceps: 0.6, shoulders: 0.45 },
    jointStress: { fingers: 0.1, shoulder: 0.25, lower_back: 0, knee: 0 },
  },
  {
    id: 'm_butterfly',
    name: 'Pec Deck · Butterfly',
    gymLabel: 'Butterfly',
    shortName: 'Butterfly',
    muscleTag: 'Chest Isolation',
    tier: 't4_isolation',
    zone: 'push',
    pos: { x: 24.8, y: 15.2 },
    loadType: 'stack',
    movement: 'pec_fly',
    compound: false,
    stepKg: 2.5,
    baselineWorkKg: 30,
    baselineReps: 12,
    setup: 'Seat 4 (hands below shoulders) · Arms set 1 notch forward',
    cue: 'Soft bend in elbows · Sweep arms together in a wide hug',
    muscles: { chest: 1.0, shoulders: 0.3 },
    jointStress: { fingers: 0.05, shoulder: 0.5, lower_back: 0, knee: 0 },
  },
];

export function getMachineById(id) {
  return GYM_MACHINES.find((m) => m.id === id) || null;
}

export function getEffectivePos(machine, floorOverrides = {}) {
  if (!machine) return { x: 14, y: 9 };
  const ov = floorOverrides?.[machine.id];
  if (ov && Number.isFinite(ov.x) && Number.isFinite(ov.y)) {
    return { x: ov.x, y: ov.y };
  }
  return machine.pos;
}

export function distanceMeters(mA, mB, floorOverrides = {}) {
  if (!mA || !mB || mA.id === mB.id) return 0;
  const a = getEffectivePos(mA, floorOverrides);
  const b = getEffectivePos(mB, floorOverrides);
  return Math.round(Math.hypot(a.x - b.x, a.y - b.y) * 10) / 10;
}

export function getZoneInfo(zoneId) {
  return FLOOR_ZONES.find((z) => z.id === zoneId) || FLOOR_ZONES[0];
}

/**
 * Find best substitute station on the floor considering movement pattern,
 * muscle overlap, joint pain exclusions, busy stations, and walking distance.
 */
export function findBestSubstitute(targetMachine, opts = {}) {
  const {
    excludeIds = [],
    painJoint = null,
    fromMachine = targetMachine,
    floorOverrides = {},
  } = opts;
  const blocked = new Set([targetMachine.id, ...excludeIds]);

  const candidates = GYM_MACHINES.filter((m) => {
    if (blocked.has(m.id)) return false;
    if ((targetMachine.loadType === 'cardio') !== (m.loadType === 'cardio')) return false;
    if (painJoint && (m.jointStress?.[painJoint] || 0) > 0.3) return false;
    return true;
  });

  if (!candidates.length) return null;

  const targetMuscles = Object.keys(targetMachine.muscles || {});
  let best = null;
  let bestScore = -Infinity;

  for (const c of candidates) {
    let score = 0;
    if (c.movement === targetMachine.movement) score += 50;
    if (c.zone === targetMachine.zone) score += 12;
    for (const mus of targetMuscles) {
      if (c.muscles?.[mus]) {
        score += 30 * Math.min(targetMachine.muscles[mus], c.muscles[mus]);
      }
    }
    if (painJoint) {
      score -= (c.jointStress?.[painJoint] || 0) * 60;
    }
    const dist = distanceMeters(fromMachine, c, floorOverrides);
    score -= dist * 0.8;

    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }

  return best;
}

/**
 * Renders a schematic SVG floor plan of Manegg Motion.
 */
export function renderFloorPlanSvg({
  activeId = null,
  prevId = null,
  partnerId = null,
  routeIds = [],
  completedIds = [],
  busyIds = [],
  floorOverrides = {},
  compact = false,
  interactive = false,
} = {}) {
  const W = 560;
  const H = 360;
  const sx = (x) => (x / FLOOR_DIMS.width) * W;
  const sy = (y) => (y / FLOOR_DIMS.height) * H;

  const completedSet = new Set(completedIds);
  const busySet = new Set(busyIds);
  const routeSet = new Set(routeIds);

  const zonesSvg = FLOOR_ZONES.map(
    (z) => `
      <g class="fp-zone">
        <rect x="${sx(z.x).toFixed(1)}" y="${sy(z.y).toFixed(1)}" width="${sx(z.w).toFixed(1)}" height="${sy(z.h).toFixed(1)}" rx="10" />
        <text x="${(sx(z.x) + 10).toFixed(1)}" y="${(sy(z.y) + 16).toFixed(1)}" class="fp-zone-label">${z.code} · ${z.name}</text>
      </g>
    `
  ).join('');

  let pathSvg = '';
  if (prevId && activeId && prevId !== activeId) {
    const pM = getMachineById(prevId);
    const aM = getMachineById(activeId);
    if (pM && aM) {
      const p1 = getEffectivePos(pM, floorOverrides);
      const p2 = getEffectivePos(aM, floorOverrides);
      pathSvg += `<line x1="${sx(p1.x).toFixed(1)}" y1="${sy(p1.y).toFixed(1)}" x2="${sx(p2.x).toFixed(1)}" y2="${sy(p2.y).toFixed(1)}" class="fp-walk-line" />`;
    }
  } else if (routeIds.length >= 2) {
    const pts = routeIds
      .map((id) => getMachineById(id))
      .filter(Boolean)
      .map((m) => {
        const p = getEffectivePos(m, floorOverrides);
        return `${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`;
      })
      .join(' ');
    pathSvg += `<polyline points="${pts}" class="fp-route-line" />`;
  }

  if (activeId && partnerId && activeId !== partnerId) {
    const aM = getMachineById(activeId);
    const bM = getMachineById(partnerId);
    if (aM && bM) {
      const p1 = getEffectivePos(aM, floorOverrides);
      const p2 = getEffectivePos(bM, floorOverrides);
      pathSvg += `<line x1="${sx(p1.x).toFixed(1)}" y1="${sy(p1.y).toFixed(1)}" x2="${sx(p2.x).toFixed(1)}" y2="${sy(p2.y).toFixed(1)}" class="fp-partner-line" />`;
    }
  }

  const pinsSvg = GYM_MACHINES.map((m) => {
    const p = getEffectivePos(m, floorOverrides);
    const cx = sx(p.x).toFixed(1);
    const cy = sy(p.y).toFixed(1);
    const isActive = m.id === activeId;
    const isPartner = m.id === partnerId;
    const isDone = completedSet.has(m.id);
    const isBusy = busySet.has(m.id);
    const inRoute = routeSet.has(m.id);

    if (compact && !isActive && !isPartner && !inRoute && m.id !== prevId) {
      return `<circle cx="${cx}" cy="${cy}" r="3.2" class="fp-pin-muted" />`;
    }

    let cls = 'fp-pin';
    if (isActive) cls += ' is-active';
    else if (isPartner) cls += ' is-partner';
    else if (isBusy) cls += ' is-busy';
    else if (isDone) cls += ' is-done';
    else if (inRoute) cls += ' is-route';

    const r = isActive || isPartner ? 9.5 : inRoute ? 6.5 : 5;
    const stepOrder = routeIds.indexOf(m.id);
    const badge = stepOrder >= 0 && !compact ? `${stepOrder + 1}` : '';

    return `
      <g class="${cls}" ${interactive ? `data-fp-machine="${m.id}" style="cursor:grab;"` : ''}>
        ${isActive ? `<circle cx="${cx}" cy="${cy}" r="16" class="fp-pin-halo" />` : ''}
        <circle cx="${cx}" cy="${cy}" r="${r}" class="fp-pin-dot" />
        ${badge ? `<text x="${cx}" y="${(Number(cy) + 3.2).toFixed(1)}" text-anchor="middle" class="fp-pin-num">${badge}</text>` : ''}
        ${
          !compact || isActive || isPartner
            ? `<text x="${cx}" y="${(Number(cy) + r + 11).toFixed(1)}" text-anchor="middle" class="fp-pin-label ${isActive ? 'is-active' : ''}">${m.shortName}</text>`
            : ''
        }
      </g>
    `;
  }).join('');

  return `
    <svg viewBox="0 0 ${W} ${H}" class="floor-svg ${compact ? 'is-compact' : ''}" role="img" aria-label="Manegg Motion floor plan">
      ${zonesSvg}
      ${pathSvg}
      ${pinsSvg}
    </svg>
  `;
}
