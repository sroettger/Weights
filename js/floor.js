/**
 * Weights — Manegg Motion Architectural Floor Plan & Machine Catalog (28m × 18m)
 *
 * Triple-checked 360° photogrammetric reconstruction of Section 1 (North = Top, aligned to floor planks):
 * - North Wall (y = 0.8m, x = 0.8..10.6m):
 *   Corner door (1.9m) -> Matrix Power Rack (4.5m) -> WC Women (6.6m) -> WC Men (8.1m) -> Grey column (9.4m)
 *   -> NE Hallway opening (x = 10.6..16.4m, y = 0.8..2.7m)
 * - East Building Core & West-Facing Mirrors:
 *   - Mirror Wall 1 (x = 10.6m, y = 2.8..8.6m): 3-Tier Dumbbell Rack running North–South + 2 Adjustable Benches in front
 *   - 0.6m Eastward jog at mustard switch-box corner (y = 8.6m) -> Mirror Wall 2 (x = 11.2m, y = 8.6..12.1m)
 *   - Raw Concrete Column + wipe bin (x = 11.1m, y = 12.2m), then WIDE 5m South-East opening (y = 12.2..17.2m) into Section 2!
 * - West Courtyard Window Wall (x = 0.8m for y = 0.8..10.4m, stepping 0.8m East to x = 1.6m for y = 10.4..17.2m):
 *   45° Back Ext (2.0m) -> Angled Smith Machine (5.0m) -> Wipe bin/column (6.7m) -> 45° Sled Leg Press (8.6m)
 *   -> [0.8m inward wall step at y = 10.4m] -> Plate-Loaded Converging Press (12.0m) -> Plate tree (13.6m)
 *   -> Incline Barbell Bench (15.0m) + Double Glass Courtyard Exit Doors (y = 14.5..16.8m)
 * - South Courtyard Window Wall (y = 17.2m, x = 1.6..17.0m+):
 *   Standing Leverage ("MANEGG MOTION" glass, x = 3.5m) -> GHD Bench (x = 5.9m) -> Column (7.3m)
 *   -> Matrix Ultra Console 1 (x = 9.6m) -> Matrix Ultra Console 2 (x = 12.4m, continuing East into Section 2)
 * - Center-South 4-Stack Cable Island (centered at x = 7.8m, y = 10.3m):
 *   - West face (<-): Seated Low Cable Row (bench extending East–West to x = 5.5m)
 *   - East face (->): Lat Pulldown (seat & thigh-roller pad extending East to x = 9.0m)
 *   - North face (^): Triceps Pushdown + back pad
 *   - South face (v): Hi-Lo Pulley #1–18 + North–South overhead bridge to 2nd Hi-Lo Crossover Column at (x = 7.8m, y = 13.6m)
 */

export const FLOOR_DIMS = { width: 28, height: 18 };

export const FLOOR_ZONES = [
  { id: 'racks_db', code: '1A', name: 'Free Weights & Racks', x: 0.8, y: 0.8, w: 9.8, h: 7.8 },
  { id: 'window_plate', code: '1B', name: 'West Window · Sled & Smith', x: 0.8, y: 3.6, w: 3.6, h: 13.6 },
  { id: 'pull', code: '1C', name: '4-Stack Cable & Crossover', x: 5.0, y: 9.0, w: 5.2, h: 5.6 },
  { id: 'ultra_seam', code: '2A', name: 'South Window · Console Row', x: 8.6, y: 14.2, w: 6.4, h: 3.0 },
  { id: 'push', code: '2A', name: 'Section 2 · Press', x: 16.8, y: 8.6, w: 10.4, h: 4.0 },
  { id: 'lower', code: '2B', name: 'Section 2 · Lower Body', x: 16.8, y: 12.8, w: 10.4, h: 4.4 },
  { id: 'core', code: '2C', name: 'Section 2 · Core & Mat', x: 16.8, y: 5.4, w: 10.4, h: 3.2 },
  { id: 'cardio', code: '2D', name: 'Cardio Deck (Unmapped)', x: 16.8, y: 0.8, w: 10.4, h: 4.4 },
];

export const FLOOR_FIXTURES = [
  // North & Free-Weight Bay
  { id: 'fx_hyper', label: '45° Back', x: 1.3, y: 1.5, w: 1.3, h: 1.1 },
  { id: 'fx_rack', label: 'Power Rack', x: 3.6, y: 1.0, w: 2.0, h: 1.8 },
  { id: 'fx_bb_tree', label: 'Barbells', x: 3.9, y: 3.8, w: 1.4, h: 1.2 },
  { id: 'fx_flat_bench', label: 'Flat Bench', x: 6.8, y: 1.8, w: 1.5, h: 1.4 },
  { id: 'fx_preacher', label: 'Scott Curl', x: 6.8, y: 3.9, w: 1.3, h: 1.1 },
  { id: 'fx_db_b1', label: '', x: 6.4, y: 5.7, w: 1.4, h: 0.65 },
  { id: 'fx_db_b2', label: '', x: 8.1, y: 6.0, w: 0.75, h: 1.25 },
  { id: 'fx_db_rack', label: 'Dumbbells', x: 9.55, y: 3.3, w: 0.9, h: 4.9 },
  // West & South Courtyard Window Walls
  { id: 'fx_pl_press', label: 'Plate Press', x: 2.0, y: 11.2, w: 1.6, h: 1.6 },
  { id: 'fx_inc_bb', label: 'Incline Bar', x: 2.8, y: 14.1, w: 1.6, h: 1.2 },
  { id: 'fx_platform', label: 'Leverage', x: 2.6, y: 15.8, w: 1.7, h: 1.1 },
  { id: 'fx_ghd', label: 'GHD', x: 5.1, y: 15.8, w: 1.7, h: 1.1 },
  // Center 4-Stack Core Frame
  { id: 'fx_4stack', label: '4-Stack', x: 7.15, y: 9.65, w: 1.3, h: 1.3 },
];

export const FLOOR_PILLARS = [
  { x: 0.85, y: 3.25, w: 0.5, h: 0.5 }, // West wall pilaster 1
  { x: 0.85, y: 6.55, w: 0.5, h: 0.5 }, // West wall pilaster 2 (+ wipe bin)
  { x: 9.2, y: 1.8, w: 0.55, h: 0.55 }, // NE grey column by WC/corridor
  { x: 7.2, y: 16.65, w: 0.5, h: 0.5 }, // South window pilaster
  { x: 10.95, y: 12.05, w: 0.65, h: 0.65 }, // Raw concrete column at Section 2 entrance
];

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
    pos: { x: 2.2, y: 5.0 },
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
    pos: { x: 2.3, y: 8.6 },
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
    id: 'm_low_row',
    name: 'Seated Low Cable Row',
    gymLabel: 'Ruderzug · West Side of 4-Stack',
    shortName: 'Cable Row',
    muscleTag: 'Mid-Back & Scapulae',
    tier: 't1_upper',
    zone: 'pull',
    sectionMapped: true,
    labelAnchor: 'above',
    pos: { x: 5.7, y: 10.3 },
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
    id: 'm_lat_pull',
    name: 'Lat Pulldown · Wide Bar',
    gymLabel: 'Latzug · East Side of 4-Stack',
    shortName: 'Lat Pull',
    muscleTag: 'Upper Back & Lats',
    tier: 't1_upper',
    zone: 'pull',
    sectionMapped: true,
    labelAnchor: 'above',
    pos: { x: 9.2, y: 9.7 },
    loadType: 'stack',
    movement: 'vert_pull',
    compound: true,
    stepKg: 2.5,
    baselineWorkKg: 40,
    baselineReps: 10,
    setup: 'East seat of 4-Stack Tower · Yellow pin locks thigh rollers snug · Wide angled bar',
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
    pos: { x: 9.2, y: 11.1 },
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
    id: 'm_cable_pull',
    name: 'Cable Rope Face Pull',
    gymLabel: 'Hi-Lo Pulley #15–16 · Crossover',
    shortName: 'Face Pull',
    muscleTag: 'Rear Shoulders & Rotator Cuff',
    tier: 't4_isolation',
    zone: 'pull',
    sectionMapped: true,
    pos: { x: 7.8, y: 13.5 },
    loadType: 'stack',
    movement: 'scapular',
    compound: false,
    stepKg: 2.5,
    baselineWorkKg: 15,
    baselineReps: 14,
    setup: 'Set numbered chrome pulley column (#1–18) to #15–16 (eye level) · Rope or dual straps',
    cue: 'Pull toward forehead while rotating thumbs & wrists backward',
    muscles: { rear_delt: 1.0, upper_back: 0.7 },
    jointStress: { fingers: 0.25, shoulder: 0.1, lower_back: 0.05, knee: 0 },
  },

  // === SECTION 1 -> 2 SEAM (VISIBLE ALONG SOUTH WINDOWS IN PXL_080650 / 080701) ===
  {
    id: 'm_butterfly',
    name: 'Pec Fly · Butterfly',
    gymLabel: 'Butterfly · Matrix Console',
    shortName: 'Butterfly',
    muscleTag: 'Chest Isolation',
    tier: 't4_isolation',
    zone: 'ultra_seam',
    sectionMapped: true,
    labelAnchor: 'above',
    pos: { x: 9.7, y: 16.0 },
    loadType: 'stack',
    movement: 'pec_fly',
    compound: false,
    stepKg: 2.5,
    baselineWorkKg: 30,
    baselineReps: 12,
    setup: 'Matrix console station by South window · Seat so hands sit below shoulder height',
    cue: 'Soft bend in elbows · Sweep arms together in a wide hug',
    muscles: { chest: 1.0, shoulders: 0.3 },
    jointStress: { fingers: 0.05, shoulder: 0.5, lower_back: 0, knee: 0 },
  },
  {
    id: 'm_leg_curl',
    name: 'Seated Leg Curl',
    gymLabel: 'Beinbeuger · Matrix Console',
    shortName: 'Leg Curl',
    muscleTag: 'Back of Thighs · Heel-Hook Power',
    tier: 't3_posterior',
    zone: 'ultra_seam',
    sectionMapped: true,
    labelAnchor: 'above',
    pos: { x: 12.6, y: 15.2 },
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
    pos: { x: 18.6, y: 11.4 },
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
    pos: { x: 18.6, y: 15.2 },
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
    pos: { x: 22.2, y: 15.2 },
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
    pos: { x: 22.2, y: 11.4 },
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
    pos: { x: 25.6, y: 11.4 },
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
    pos: { x: 21.8, y: 7.6 },
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
    pos: { x: 25.6, y: 7.6 },
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
    pos: { x: 18.6, y: 3.4 },
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
    pos: { x: 21.0, y: 3.4 },
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
    pos: { x: 23.5, y: 3.4 },
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
    pos: { x: 26.0, y: 3.4 },
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
 * Renders the triple-checked 2D architectural floor plan of Manegg Motion:
 * - Section 1 wraps around the Central WC/Core block (with West-facing Dumbbell Mirror + 0.6m jog + 2nd West-facing Mirror),
 *   connecting Eastward via BOTH the NE Hallway (top) and the wide South-East opening past the Raw Concrete Column!
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

  // Exact Section 1 mapped floor polygon (including NE hallway & SE wide opening around the central building core)
  const sec1Pts = [
    [0.8, 0.8],
    [16.0, 0.8],
    [16.0, 2.7],
    [10.6, 2.7],
    [10.6, 8.6],
    [11.2, 8.6],
    [11.2, 12.2],
    [16.0, 12.2],
    [16.0, 17.2],
    [1.6, 17.2],
    [1.6, 10.4],
    [0.8, 10.4],
  ]
    .map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`)
    .join(' ');

  // Central WC / Building Core polygon (behind the WC doors and East Mirror walls)
  const corePts = [
    [10.6, 2.7],
    [16.0, 2.7],
    [16.0, 12.2],
    [11.2, 12.2],
    [11.2, 8.6],
    [10.6, 8.6],
  ]
    .map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`)
    .join(' ');

  const archSvg = `
    <!-- Section 1 Mapped Floor + Central Core + Section 2 Unmapped Wing -->
    <polygon points="${sec1Pts}" class="fp-sec1-bg" />
    <polygon points="${corePts}" class="fp-mirror-wall" opacity="0.45" />
    <rect x="${sx(16.4).toFixed(1)}" y="${sy(0.8).toFixed(1)}" width="${sx(10.8).toFixed(1)}" height="${sy(16.4).toFixed(1)}" rx="8" class="fp-sec2-bg" />

    <!-- North Wall + Stepped West Window Wall + South Window Wall -->
    <polyline points="${sx(10.6)},${sy(0.8)} ${sx(0.8)},${sy(0.8)} ${sx(0.8)},${sy(10.4)} ${sx(1.6)},${sy(10.4)} ${sx(1.6)},${sy(17.2)} ${sx(16.0)},${sy(17.2)}" class="fp-wall" />

    <!-- East Core Wall (Dumbbell Mirror -> 0.6m Mustard Jog -> 2nd Mirror to Concrete Column) -->
    <polyline points="${sx(10.6)},${sy(2.7)} ${sx(10.6)},${sy(8.6)} ${sx(11.2)},${sy(8.6)} ${sx(11.2)},${sy(12.1)}" class="fp-wall" />
    <line x1="${sx(10.42)}" y1="${sy(2.9)}" x2="${sx(10.42)}" y2="${sy(8.45)}" class="fp-mirror-glass" />
    <line x1="${sx(11.02)}" y1="${sy(8.8)}" x2="${sx(11.02)}" y2="${sy(11.9)}" class="fp-mirror-glass" />

    <!-- Courtyard Window Bays (West Wall + South Wall) -->
    <line x1="${sx(0.8)}" y1="${sy(1.4)}" x2="${sx(0.8)}" y2="${sy(3.1)}" class="fp-window" />
    <line x1="${sx(0.8)}" y1="${sy(3.9)}" x2="${sx(0.8)}" y2="${sy(6.4)}" class="fp-window" />
    <line x1="${sx(0.8)}" y1="${sy(7.2)}" x2="${sx(0.8)}" y2="${sy(10.1)}" class="fp-window" />
    <line x1="${sx(1.6)}" y1="${sy(10.8)}" x2="${sx(1.6)}" y2="${sy(13.8)}" class="fp-window" />
    <line x1="${sx(2.4)}" y1="${sy(17.2)}" x2="${sx(4.7)}" y2="${sy(17.2)}" class="fp-window" />
    <line x1="${sx(5.1)}" y1="${sy(17.2)}" x2="${sx(7.0)}" y2="${sy(17.2)}" class="fp-window" />
    <line x1="${sx(7.8)}" y1="${sy(17.2)}" x2="${sx(10.6)}" y2="${sy(17.2)}" class="fp-window" />
    <line x1="${sx(11.1)}" y1="${sy(17.2)}" x2="${sx(15.8)}" y2="${sy(17.2)}" class="fp-window" />

    <!-- Doors (NW Door, 2 WC Doors on North Wall, Double Glass Exit Doors at SW of West Wall) -->
    <line x1="${sx(1.5)}" y1="${sy(0.8)}" x2="${sx(2.4)}" y2="${sy(0.8)}" class="fp-door" />
    <line x1="${sx(6.3)}" y1="${sy(0.8)}" x2="${sx(7.2)}" y2="${sy(0.8)}" class="fp-door" />
    <line x1="${sx(7.8)}" y1="${sy(0.8)}" x2="${sx(8.7)}" y2="${sy(0.8)}" class="fp-door" />
    <line x1="${sx(1.6)}" y1="${sy(14.5)}" x2="${sx(1.6)}" y2="${sy(16.7)}" class="fp-door" />

    <!-- Structural Columns -->
    ${FLOOR_PILLARS.map(
      (p) =>
        `<rect x="${sx(p.x).toFixed(1)}" y="${sy(p.y).toFixed(1)}" width="${sx(p.w).toFixed(1)}" height="${sy(p.h).toFixed(1)}" rx="1.5" class="fp-pillar" />`
    ).join('')}

    <!-- North–South Overhead Cable Crossover Bridge (4-Stack Tower -> 2nd Hi-Lo Column) -->
    <line x1="${sx(7.8)}" y1="${sy(10.95)}" x2="${sx(7.8)}" y2="${sy(13.5)}" stroke="var(--border-strong)" stroke-width="2.6" />

    ${
      !compact
        ? `
      <text x="${sx(7.5)}" y="${sy(1.48)}" text-anchor="middle" class="fp-arch-label">WC</text>
      <text x="${sx(13.3)}" y="${sy(1.95)}" text-anchor="middle" class="fp-arch-label">Hallway →</text>
      <text x="${sx(13.5)}" y="${sy(7.6)}" text-anchor="middle" class="fp-arch-label">Core / Mirrors</text>
      <text x="${sx(14.2)}" y="${sy(13.4)}" text-anchor="middle" class="fp-arch-label">Sec 2 →</text>
      <text x="${sx(21.8)}" y="${sy(1.85)}" text-anchor="middle" class="fp-zone-label">Sec 2 &amp; Cardio (Next Photos)</text>
      <line x1="${sx(17.0)}" y1="${sy(5.4)}" x2="${sx(26.6)}" y2="${sy(5.4)}" stroke="var(--border)" stroke-dasharray="4 4" />
    `
        : ''
    }
  `;

  const fixturesSvg = !compact
    ? FLOOR_FIXTURES.map((fx) => {
        const isVert = fx.h > fx.w * 2;
        const cx = sx(fx.x + fx.w / 2).toFixed(1);
        const cy = sy(fx.y + fx.h / 2).toFixed(1);
        return `
      <g class="fp-fixture">
        <rect x="${sx(fx.x).toFixed(1)}" y="${sy(fx.y).toFixed(1)}" width="${sx(fx.w).toFixed(1)}" height="${sy(fx.h).toFixed(1)}" rx="2.5" />
        ${
          fx.label
            ? `<text x="${cx}" y="${(Number(cy) + 2.4).toFixed(1)}" text-anchor="middle" ${
                isVert ? `transform="rotate(-90 ${cx} ${cy})"` : ''
              } class="fp-fixture-label">${fx.label}</text>`
            : ''
        }
      </g>`;
      }).join('')
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
