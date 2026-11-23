/**
 * Weights — Manegg Motion Architectural Floor Plan & Machine Catalog (28m × 18m)
 *
 * Section 1 (x = 0.8..17.2m) is photogrammetrically mapped from on-site reference photos:
 * - Top Wall (y = 0.8m): Corner exit door -> Matrix Power Rack -> Women/Men WC doors -> Entrance corridor
 * - Free-Weight Bay (y = 1.5..7.2m): Fixed Barbell Rack, Flat Bench, Preacher Curl, 3-Tier Dumbbell Rack + 2 Benches
 * - Central Partition Wall (x = 7.6..14.8m, y = 7.4m): Double-sided full-height mirrors
 * - Left Courtyard Window Wall (x = 0.8m -> steps to 1.8m at y = 11.4m):
 *   45° Back Extension -> Angled Smith Machine -> 45° Sled Leg Press -> Plate-Loaded Press -> Incline Barbell Bench + Glass Exit Doors
 * - Bottom Courtyard Window Wall (y = 17.0m, "MANEGG MOTION" glass):
 *   Standing Leverage Platform -> Glute-Ham Bench (GHD) -> Matrix Ultra Pec Fly & Seated Leg Curl (Section 2 seam)
 * - Center Cable Island (x = 6.4..11.6m, y = 9.5..12.2m):
 *   Matrix 4-Stack Multi-Tower (Lat Pulldown, Close Neutral Pulldown, Footplate Low Row, Hi-Lo Pulley #1–18) + Dual Cable Crossover
 *
 * Section 2 & Cardio Wing (x = 17.6..27.2m) is held in a dashed "Awaiting Photos" region until mapped.
 */

export const FLOOR_DIMS = { width: 28, height: 18 };

export const FLOOR_ZONES = [
  { id: 'racks_db', code: '1A', name: 'Racks & Dumbbells (Sec 1)', x: 0.8, y: 0.8, w: 16.4, h: 6.6 },
  { id: 'window_plate', code: '1B', name: 'Window Wall · Sled & Smith', x: 0.8, y: 4.5, w: 4.2, h: 12.5 },
  { id: 'pull', code: '1C', name: '4-Stack Cable Island', x: 5.4, y: 8.4, w: 7.0, h: 5.2 },
  { id: 'ultra_seam', code: '2A', name: 'Matrix Console Row', x: 11.8, y: 13.4, w: 5.4, h: 3.6 },
  { id: 'push', code: '2A', name: 'Section 2 · Press', x: 17.8, y: 8.2, w: 9.4, h: 4.2 },
  { id: 'lower', code: '2B', name: 'Section 2 · Lower Body', x: 17.8, y: 12.6, w: 9.4, h: 4.4 },
  { id: 'core', code: '2C', name: 'Section 2 · Core & Mat', x: 17.8, y: 6.4, w: 9.4, h: 4.4 },
  { id: 'cardio', code: '2D', name: 'Cardio Deck (Unmapped)', x: 17.8, y: 1.0, w: 9.4, h: 5.0 },
];

/**
 * Architectural Section 1 fixtures (free-weight racks, benches, GHD, cable frames) rendered on the floor blueprint
 * so every physical landmark around the athlete is immediately recognizable.
 */
export const FLOOR_FIXTURES = [
  { id: 'fx_hyper', label: '45° Back', x: 1.5, y: 2.0, w: 1.3, h: 1.1 },
  { id: 'fx_rack', label: 'Power Rack', x: 3.7, y: 1.1, w: 2.0, h: 1.9 },
  { id: 'fx_bb_tree', label: 'Barbells', x: 4.0, y: 3.9, w: 1.4, h: 1.1 },
  { id: 'fx_flat_bench', label: 'Flat Bench', x: 6.8, y: 1.8, w: 1.4, h: 1.6 },
  { id: 'fx_preacher', label: 'Scott Curl', x: 6.8, y: 4.1, w: 1.2, h: 1.1 },
  { id: 'fx_db_b1', label: '', x: 8.8, y: 4.6, w: 1.1, h: 0.7 },
  { id: 'fx_db_b2', label: '', x: 10.7, y: 4.6, w: 1.1, h: 0.7 },
  { id: 'fx_db_rack', label: 'Dumbbells (3-Tier)', x: 8.3, y: 6.0, w: 5.2, h: 1.0 },
  { id: 'fx_pl_press', label: 'Plate Press', x: 2.1, y: 11.9, w: 1.7, h: 1.5 },
  { id: 'fx_inc_bb', label: 'Incline Bar', x: 2.4, y: 14.3, w: 1.7, h: 1.4 },
  { id: 'fx_platform', label: 'Leverage', x: 5.0, y: 15.2, w: 1.6, h: 1.3 },
  { id: 'fx_ghd', label: 'GHD', x: 8.0, y: 15.2, w: 1.6, h: 1.3 },
  { id: 'fx_4stack', label: '4-Stack', x: 7.3, y: 10.2, w: 1.6, h: 1.6 },
];

export const FLOOR_PILLARS = [
  { x: 0.85, y: 4.1, w: 0.55, h: 0.55 },
  { x: 0.85, y: 7.4, w: 0.55, h: 0.55 },
  { x: 9.4, y: 1.9, w: 0.6, h: 0.6 },
  { x: 10.4, y: 16.35, w: 0.6, h: 0.6 },
  { x: 14.3, y: 16.35, w: 0.6, h: 0.6 },
];

/**
 * Complete Manegg Motion coached equipment inventory.
 * - sectionMapped: true = verified from Section 1 photos; false = awaiting Section 2/Cardio photos.
 */
export const GYM_MACHINES = [
  // === SECTION 1: PHOTO-VERIFIED STATIONS ===
  {
    id: 'm_smith_incline',
    name: 'Angled Smith Press',
    gymLabel: 'Multipresse · Matrix Guided Bar',
    shortName: 'Smith Press',
    muscleTag: 'Upper Chest & Shoulders',
    tier: 't1_upper',
    zone: 'window_plate',
    sectionMapped: true,
    pos: { x: 2.5, y: 5.8 },
    loadType: 'plate_per_side',
    tareKg: 20,
    movement: 'horiz_push',
    compound: true,
    stepKg: 2.5,
    baselineWorkKg: 7.5,
    baselineReps: 8,
    setup: '30° bench inside Matrix angled Smith frame · Hook safety catches at chest height',
    cue: 'Lower bar to upper chest with elbows ~45° · Press up and rotate hooks to rack',
    muscles: { chest: 1.0, shoulders: 0.65, triceps: 0.55 },
    jointStress: { fingers: 0.15, shoulder: 0.6, lower_back: 0.1, knee: 0 },
  },
  {
    id: 'm_leg_press',
    name: '45° Sled Leg Press',
    gymLabel: '45° Beinpresse · Matrix Sled',
    shortName: '45° Leg Press',
    muscleTag: 'Quads & Glutes',
    tier: 't2_lean_legs',
    zone: 'window_plate',
    sectionMapped: true,
    pos: { x: 2.7, y: 9.5 },
    loadType: 'plate_per_side',
    tareKg: 48,
    movement: 'squat',
    compound: true,
    stepKg: 2.5,
    baselineWorkKg: 12.5,
    baselineReps: 8,
    setup: 'Feet shoulder-width mid-sled · Press up & rotate side safety handles outward',
    cue: 'Lower sled 2s to ~90° knees (keep tailbone glued down) · Drive without locking knees',
    muscles: { quads: 1.0, glutes: 0.75, adductors: 0.4 },
    jointStress: { fingers: 0, shoulder: 0, lower_back: 0.2, knee: 0.65 },
  },
  {
    id: 'm_lat_pull',
    name: 'Lat Pulldown · Wide Bar',
    gymLabel: 'Latzug · 4-Stack Cable Tower',
    shortName: 'Lat Pull',
    muscleTag: 'Upper Back & Lats',
    tier: 't1_upper',
    zone: 'pull',
    sectionMapped: true,
    labelAnchor: 'above',
    pos: { x: 6.9, y: 9.6 },
    loadType: 'stack',
    movement: 'vert_pull',
    compound: true,
    stepKg: 2.5,
    baselineWorkKg: 40,
    baselineReps: 10,
    setup: '4-Stack Tower · Yellow pin locks thigh rollers snug · Wide angled overhead bar',
    cue: 'Pull shoulders down away from ears first, then drive bar to upper chest',
    muscles: { lats: 1.0, upper_back: 0.6, biceps: 0.55, forearms: 0.4 },
    jointStress: { fingers: 0.55, shoulder: 0.35, lower_back: 0.05, knee: 0 },
  },
  {
    id: 'm_pullup',
    name: 'Lat Pulldown · Close Neutral',
    gymLabel: 'Latzug · Chrome V-Handle (4-Stack)',
    shortName: 'Close Pull',
    muscleTag: 'Lats, Lock-Off & Arms',
    tier: 't1_upper',
    zone: 'pull',
    sectionMapped: true,
    labelAnchor: 'above',
    pos: { x: 9.3, y: 9.6 },
    loadType: 'stack',
    movement: 'vert_pull',
    compound: true,
    stepKg: 2.5,
    baselineWorkKg: 40,
    baselineReps: 8,
    setup: 'Clip chrome V-parallel handle (at base of 4-Stack Tower) · Lock thighs under rollers',
    cue: 'Lean back 10° · Drive elbows tight past ribs to lower chest (lock-off power)',
    muscles: { lats: 1.0, biceps: 0.7, upper_back: 0.55, forearms: 0.45 },
    jointStress: { fingers: 0.5, shoulder: 0.25, lower_back: 0.05, knee: 0 },
  },
  {
    id: 'm_low_row',
    name: 'Seated Low Cable Row',
    gymLabel: 'Ruderzug · Footplate Bench (4-Stack)',
    shortName: 'Cable Row',
    muscleTag: 'Mid-Back & Scapulae',
    tier: 't1_upper',
    zone: 'pull',
    sectionMapped: true,
    pos: { x: 6.4, y: 12.1 },
    loadType: 'stack',
    movement: 'horiz_pull',
    compound: true,
    stepKg: 2.5,
    baselineWorkKg: 35,
    baselineReps: 10,
    setup: 'Plant feet on angled Matrix footplate · Knees slightly bent · Sit tall with braced abs',
    cue: 'Keep torso still (no swinging) · Pull dual handles to lower ribs & squeeze blades 1s',
    muscles: { upper_back: 1.0, lats: 0.7, rear_delt: 0.5, biceps: 0.5 },
    jointStress: { fingers: 0.5, shoulder: 0.2, lower_back: 0.2, knee: 0 },
  },
  {
    id: 'm_cable_pull',
    name: 'Cable Rope Face Pull',
    gymLabel: 'Hi-Lo Pulley #15–16 · Cable Tower',
    shortName: 'Face Pull',
    muscleTag: 'Rear Shoulders & Rotator Cuff',
    tier: 't4_isolation',
    zone: 'pull',
    sectionMapped: true,
    pos: { x: 11.4, y: 10.8 },
    loadType: 'stack',
    movement: 'scapular',
    compound: false,
    stepKg: 2.5,
    baselineWorkKg: 15,
    baselineReps: 14,
    setup: 'Set numbered chrome pulley column to #15–16 (eye level) · Attach rope or dual straps',
    cue: 'Pull toward forehead while rotating thumbs & wrists backward',
    muscles: { rear_delt: 1.0, upper_back: 0.7 },
    jointStress: { fingers: 0.25, shoulder: 0.1, lower_back: 0.05, knee: 0 },
  },

  // === SECTION 1 -> 2 SEAM (VISIBLE IN BACKGROUND OF PXL_080701) ===
  {
    id: 'm_butterfly',
    name: 'Pec Fly · Butterfly',
    gymLabel: 'Butterfly · Matrix Ultra Console',
    shortName: 'Butterfly',
    muscleTag: 'Chest Isolation',
    tier: 't4_isolation',
    zone: 'ultra_seam',
    sectionMapped: true,
    labelAnchor: 'above',
    pos: { x: 13.0, y: 15.2 },
    loadType: 'stack',
    movement: 'pec_fly',
    compound: false,
    stepKg: 2.5,
    baselineWorkKg: 30,
    baselineReps: 12,
    setup: 'Matrix console machine by window · Seat so hands sit just below shoulder height',
    cue: 'Soft bend in elbows · Sweep arms together in a wide hug',
    muscles: { chest: 1.0, shoulders: 0.3 },
    jointStress: { fingers: 0.05, shoulder: 0.5, lower_back: 0, knee: 0 },
  },
  {
    id: 'm_leg_curl',
    name: 'Seated Leg Curl',
    gymLabel: 'Beinbeuger · Matrix Ultra Console',
    shortName: 'Leg Curl',
    muscleTag: 'Back of Thighs · Heel-Hook Power',
    tier: 't3_posterior',
    zone: 'ultra_seam',
    sectionMapped: true,
    labelAnchor: 'above',
    pos: { x: 15.8, y: 15.2 },
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

  // === SECTION 2 & CARDIO WING (AWAITING NEXT PHOTOS) ===
  {
    id: 'm_chest_press',
    name: 'Seated Chest Press',
    gymLabel: 'Brustpresse · Matrix Press',
    shortName: 'Chest Press',
    muscleTag: 'Chest & Triceps (Shoulder-Safe)',
    tier: 't1_upper',
    zone: 'push',
    sectionMapped: false,
    pos: { x: 19.4, y: 10.6 },
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
    id: 'm_leg_ext',
    name: 'Seated Leg Extension',
    gymLabel: 'Beinstrecker',
    shortName: 'Leg Ext',
    muscleTag: 'Front of Thighs (Quads)',
    tier: 't4_isolation',
    zone: 'lower',
    sectionMapped: false,
    pos: { x: 19.4, y: 14.8 },
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
    id: 'm_calf',
    name: 'Seated Calf Raise',
    gymLabel: 'Wadenheben · Calf Raise',
    shortName: 'Calves',
    muscleTag: 'Calves & Slab Footwork',
    tier: 't4_isolation',
    zone: 'lower',
    sectionMapped: false,
    pos: { x: 22.8, y: 14.8 },
    loadType: 'plate_per_side',
    tareKg: 10,
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
    sectionMapped: false,
    pos: { x: 22.8, y: 11.8 },
    loadType: 'plate_per_side',
    tareKg: 15,
    movement: 'hinge',
    compound: true,
    stepKg: 2.5,
    baselineWorkKg: 15,
    baselineReps: 8,
    setup: 'Upper back on pad · Buckle belt across hips · Feet flat',
    cue: 'Keep chin tucked · Drive hips up flat and squeeze glutes 1s',
    muscles: { glutes: 1.0, hamstrings: 0.5, lower_back: 0.25 },
    jointStress: { fingers: 0, shoulder: 0, lower_back: 0.2, knee: 0.15 },
  },
  {
    id: 'm_lower_back',
    name: 'Seated Back Extension',
    gymLabel: 'Rückenstrecker · Lower Back',
    shortName: 'Back Ext',
    muscleTag: 'Lower Back Posture',
    tier: 't3_posterior',
    zone: 'core',
    sectionMapped: false,
    pos: { x: 25.8, y: 11.8 },
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
    sectionMapped: false,
    pos: { x: 22.8, y: 8.2 },
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
    sectionMapped: false,
    pos: { x: 25.8, y: 8.2 },
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
  {
    id: 'c_treadmill',
    name: 'Treadmill',
    gymLabel: 'Laufband · Matrix Onyx',
    shortName: 'Treadmill',
    muscleTag: 'Cardio · Running / Incline Walk',
    tier: 'cardio',
    zone: 'cardio',
    sectionMapped: false,
    pos: { x: 19.0, y: 3.6 },
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
    sectionMapped: false,
    pos: { x: 21.4, y: 3.6 },
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
    sectionMapped: false,
    pos: { x: 23.8, y: 3.6 },
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
    sectionMapped: false,
    pos: { x: 26.2, y: 3.6 },
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
 * Find best substitute station on the floor requiring true biomechanical / muscle overlap
 * (unless target is cardio, where any cardio machine is valid).
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
    let bioScore = 0;
    if (c.movement === targetMachine.movement) bioScore += 50;
    for (const mus of targetMuscles) {
      if (c.muscles?.[mus]) {
        bioScore += 30 * Math.min(targetMachine.muscles[mus], c.muscles[mus]);
      }
    }
    if (targetMachine.loadType !== 'cardio' && bioScore < 15) continue;

    let score = bioScore + (c.zone === targetMachine.zone ? 8 : 0);
    if (painJoint) {
      score -= (c.jointStress?.[painJoint] || 0) * 60;
    }
    score -= distanceMeters(fromMachine, c, floorOverrides) * 0.8;

    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }

  return best;
}

/**
 * Renders the architectural 2D SVG floor plan of Manegg Motion:
 * - Left (x = 0.8..17.2m): Photo-verified Section 1 (stepped window wall, glass exit, WCs, columns, mirror partition, racks & 4-stack cable tower)
 * - Right (x = 17.6..27.2m): Dashed "Section 2 & Cardio · Next Photos" region
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

  // 1. Section 1 mapped floor polygon (includes exact 1.0m inward wall step at y = 11.4m from PXL_080645)
  const sec1Pts = [
    [0.8, 0.8],
    [17.2, 0.8],
    [17.2, 17.0],
    [1.8, 17.0],
    [1.8, 11.4],
    [0.8, 11.4],
  ]
    .map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`)
    .join(' ');

  const archSvg = `
    <!-- Section 1 (Mapped) & Section 2 (Pending Photos) Floor Surfaces -->
    <polygon points="${sec1Pts}" class="fp-sec1-bg" />
    <rect x="${sx(17.6).toFixed(1)}" y="${sy(0.8).toFixed(1)}" width="${sx(9.6).toFixed(1)}" height="${sy(16.2).toFixed(1)}" rx="8" class="fp-sec2-bg" />

    <!-- Section 1 Solid Architectural Walls (Top WC/Rack wall, stepped Left window wall, Bottom window wall) -->
    <polyline points="${sx(10.6)},${sy(0.8)} ${sx(0.8)},${sy(0.8)} ${sx(0.8)},${sy(11.4)} ${sx(1.8)},${sy(11.4)} ${sx(1.8)},${sy(17.0)} ${sx(17.2)},${sy(17.0)}" class="fp-wall" />

    <!-- Courtyard Window Bays (Teal) -->
    <line x1="${sx(0.8)}" y1="${sy(1.7)}" x2="${sx(0.8)}" y2="${sy(3.9)}" class="fp-window" />
    <line x1="${sx(0.8)}" y1="${sy(4.8)}" x2="${sx(0.8)}" y2="${sy(7.2)}" class="fp-window" />
    <line x1="${sx(0.8)}" y1="${sy(8.1)}" x2="${sx(0.8)}" y2="${sy(11.1)}" class="fp-window" />
    <line x1="${sx(1.8)}" y1="${sy(11.7)}" x2="${sx(1.8)}" y2="${sy(14.3)}" class="fp-window" />
    <line x1="${sx(4.3)}" y1="${sy(17.0)}" x2="${sx(7.2)}" y2="${sy(17.0)}" class="fp-window" />
    <line x1="${sx(7.7)}" y1="${sy(17.0)}" x2="${sx(10.2)}" y2="${sy(17.0)}" class="fp-window" />
    <line x1="${sx(11.2)}" y1="${sy(17.0)}" x2="${sx(14.1)}" y2="${sy(17.0)}" class="fp-window" />
    <line x1="${sx(15.1)}" y1="${sy(17.0)}" x2="${sx(17.1)}" y2="${sy(17.0)}" class="fp-window" />

    <!-- Doors (Corner door, 2 WC doors, Glass Courtyard Exit) -->
    <line x1="${sx(1.5)}" y1="${sy(0.8)}" x2="${sx(2.4)}" y2="${sy(0.8)}" class="fp-door" />
    <line x1="${sx(6.6)}" y1="${sy(0.8)}" x2="${sx(7.4)}" y2="${sy(0.8)}" class="fp-door" />
    <line x1="${sx(8.0)}" y1="${sy(0.8)}" x2="${sx(8.8)}" y2="${sy(0.8)}" class="fp-door" />
    <line x1="${sx(1.8)}" y1="${sy(14.8)}" x2="${sx(1.8)}" y2="${sy(16.5)}" class="fp-door" />

    <!-- Central Double-Sided Mirror Partition Wall -->
    <rect x="${sx(7.7)}" y="${sy(7.3)}" width="${sx(7.1)}" height="${sy(0.42)}" rx="2" class="fp-mirror-wall" />
    <line x1="${sx(7.8)}" y1="${sy(7.22)}" x2="${sx(14.7)}" y2="${sy(7.22)}" class="fp-mirror-glass" />
    <line x1="${sx(7.8)}" y1="${sy(7.8)}" x2="${sx(14.7)}" y2="${sy(7.8)}" class="fp-mirror-glass" />

    <!-- Structural Concrete Columns -->
    ${FLOOR_PILLARS.map(
      (p) =>
        `<rect x="${sx(p.x).toFixed(1)}" y="${sy(p.y).toFixed(1)}" width="${sx(p.w).toFixed(1)}" height="${sy(p.h).toFixed(1)}" rx="1.5" class="fp-pillar" />`
    ).join('')}

    <!-- Overhead Cable Bridge (4-Stack Tower <-> Dual Cable Crossover) -->
    <line x1="${sx(8.1)}" y1="${sy(10.9)}" x2="${sx(11.4)}" y2="${sy(10.8)}" stroke="var(--border-strong)" stroke-width="2.4" />

    ${
      !compact
        ? `
      <text x="${sx(7.7)}" y="${sy(1.55)}" text-anchor="middle" class="fp-arch-label">WC</text>
      <text x="${sx(12.2)}" y="${sy(1.55)}" text-anchor="middle" class="fp-arch-label"> Corridor ↗</text>
      <text x="${sx(11.2)}" y="${sy(8.45)}" text-anchor="middle" class="fp-arch-label">Mirror Partition</text>
      <text x="${sx(2.7)}" y="${sy(16.65)}" class="fp-arch-label">Exit</text>
      <text x="${sx(22.4)}" y="${sy(1.75)}" text-anchor="middle" class="fp-zone-label">Sec 2 &amp; Cardio (Next Photos →)</text>
      <line x1="${sx(18.2)}" y1="${sy(6.2)}" x2="${sx(26.6)}" y2="${sy(6.2)}" stroke="var(--border)" stroke-dasharray="4 4" />
    `
        : ''
    }
  `;

  const fixturesSvg = !compact
    ? FLOOR_FIXTURES.map(
        (fx) => `
      <g class="fp-fixture">
        <rect x="${sx(fx.x).toFixed(1)}" y="${sy(fx.y).toFixed(1)}" width="${sx(fx.w).toFixed(1)}" height="${sy(fx.h).toFixed(1)}" rx="3" />
        ${
          fx.label
            ? `<text x="${sx(fx.x + fx.w / 2).toFixed(1)}" y="${(sy(fx.y + fx.h / 2) + 2.6).toFixed(1)}" text-anchor="middle" class="fp-fixture-label">${fx.label}</text>`
            : ''
        }
      </g>`
      ).join('')
    : '';

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
      return `<circle cx="${cx}" cy="${cy}" r="3.0" class="fp-pin-muted" />`;
    }

    let cls = 'fp-pin';
    if (isActive) cls += ' is-active';
    else if (isPartner) cls += ' is-partner';
    else if (isBusy) cls += ' is-busy';
    else if (isDone) cls += ' is-done';
    else if (inRoute) cls += ' is-route';

    const r = isActive || isPartner ? 9.0 : inRoute ? 6.2 : 4.8;
    const stepOrder = routeIds.indexOf(m.id);
    const badge = stepOrder >= 0 && !compact ? `${stepOrder + 1}` : '';
    const labelY =
      m.labelAnchor === 'above'
        ? (Number(cy) - r - 4.5).toFixed(1)
        : (Number(cy) + r + 10.5).toFixed(1);

    return `
      <g class="${cls}" ${interactive ? `data-fp-machine="${m.id}" style="cursor:grab;"` : ''}>
        ${isActive ? `<circle cx="${cx}" cy="${cy}" r="15" class="fp-pin-halo" />` : ''}
        <circle cx="${cx}" cy="${cy}" r="${r}" class="fp-pin-dot" />
        ${badge ? `<text x="${cx}" y="${(Number(cy) + 3.1).toFixed(1)}" text-anchor="middle" class="fp-pin-num">${badge}</text>` : ''}
        ${
          !compact || isActive || isPartner
            ? `<text x="${cx}" y="${labelY}" text-anchor="middle" class="fp-pin-label ${isActive ? 'is-active' : ''}">${m.shortName}</text>`
            : ''
        }
      </g>
    `;
  }).join('');

  return `
    <svg viewBox="0 0 ${W} ${H}" class="floor-svg ${compact ? 'is-compact' : ''}" role="img" aria-label="Manegg Motion architectural floor plan">
      ${archSvg}
      ${fixturesSvg}
      ${pathSvg}
      ${pinsSvg}
    </svg>
  `;
}
