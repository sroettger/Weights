/**
 * Weights — Manegg Motion Architectural Floor Plan & Official Matrix Fitness Catalog Mapping (28m × 18m)
 *
 * Triple-checked 360° photogrammetric reconstruction of Section 1 + Online Matrix Fitness model verification
 * (`world.matrixfitness.com` — Magnum Plate-Loaded `MG-PL`, Magnum Racks/Benches `MG-MR`/`MG-A`/`MG-5STACK`, Ultra `G7-S`):
 * - North Wall (y = 0.8m, x = 0.8..10.6m):
 *   Corner door (1.9m) -> MG-MR47 MEGA Power Rack (4.5m) -> WC Women (6.6m) -> WC Men (8.1m) -> Grey column (9.4m)
 *   -> NE Hallway opening (x = 10.6..16.4m, y = 0.8..2.7m)
 * - East Building Core & West-Facing Mirrors:
 *   - Mirror Wall 1 (x = 10.6m, y = 2.8..8.6m): MG-A538 3-Tier Dumbbell Rack + 2 × MG-A85 Multi-Adjustable Benches
 *   - 0.6m Eastward jog at mustard switch-box corner (y = 8.6m) -> Mirror Wall 2 (x = 11.2m, y = 8.6..12.1m)
 *   - Raw Concrete Column + wipe bin (x = 11.1m, y = 12.2m), then WIDE 5m South-East opening (y = 12.2..17.2m) into Section 2!
 * - West Courtyard Window Wall (x = 0.8m for y = 0.8..10.4m, stepping 0.8m East to x = 1.6m for y = 10.4..17.2m):
 *   MG-A52 45° Back Ext (2.0m) -> MG-PL62 Smith Machine (5.0m, 11.3kg bar) -> Wipe bin/column (6.7m) -> MG-PL70 45° Leg Press (8.6m, 75.7kg sled)
 *   -> [0.8m inward wall step at y = 10.4m] -> MG-PL12 Vertical Bench Press (12.0m) -> MG-A94 Weight Tree (13.6m)
 *   -> MG-A79 Olympic Incline Bench (14.8m) + Double Glass Courtyard Exit Doors (y = 14.5..16.8m)
 * - South Courtyard Window Wall (y = 17.2m, x = 1.6..17.0m+):
 *   MG-PL76 Standing Calf ("MANEGG MOTION" glass, x = 3.5m, 30.4kg tare) -> MG-A96 Glute Ham Bench (x = 5.9m) -> Column (7.3m)
 *   -> G7-S78 Standing Glute Kickback (x = 9.6m) -> G7-S74/75 Hip Adductor/Abductor (x = 12.2m, continuing East into Section 2)
 * - Center-South 4-Stack Cable Island (MG-5STACK centered at x = 7.8m, y = 10.3m + MG-924 Crossover Column at x = 7.8m, y = 13.5m)
 */

import { getMatrixModel } from './matrix-catalog.js';

export const FLOOR_DIMS = {
  width: 28,
  height: 18,
  sec1Width: 10.6,
  sec1Depth: 17.2,
  westStepY: 10.4,
  westStepIn: 0.8,
};

export const FLOOR_ZONES = [
  { id: 'racks_db', code: '1A', name: 'Free Weights & Racks', x: 0.8, y: 0.8, w: 9.8, h: 7.8 },
  { id: 'window_plate', code: '1B', name: 'West & South Window · Magnum Plate-Loaded', x: 0.8, y: 3.6, w: 4.0, h: 13.6 },
  { id: 'pull', code: '1C', name: '4-Stack Cable & Crossover', x: 5.0, y: 9.0, w: 5.2, h: 5.6 },
  { id: 'ultra_seam', code: '2A', name: 'South Window · Ultra Console Row', x: 8.6, y: 14.2, w: 6.4, h: 3.0 },
  { id: 'push', code: '2A', name: 'Section 2 · Press & Fly', x: 16.8, y: 8.6, w: 10.4, h: 4.0 },
  { id: 'lower', code: '2B', name: 'Section 2 · Lower Body', x: 16.8, y: 12.8, w: 10.4, h: 4.4 },
  { id: 'core', code: '2C', name: 'Section 2 · Core & Mat', x: 16.8, y: 5.4, w: 10.4, h: 3.2 },
  { id: 'cardio', code: '2D', name: 'Cardio Deck (Unmapped)', x: 16.8, y: 0.8, w: 10.4, h: 4.4 },
];

export const FLOOR_FIXTURES = [
  // North & Free-Weight Bay (Verified Matrix Magnum Racks & Benches)
  { id: 'fx_hyper', matrixCode: 'MG-A52', label: '45° Back', x: 1.25, y: 1.45, w: 1.34, h: 0.76 },
  { id: 'fx_rack', matrixCode: 'MG-MR47', label: 'Power Rack', x: 3.55, y: 0.95, w: 2.07, h: 2.06 },
  { id: 'fx_bb_tree', matrixCode: 'MG-A98', label: 'Barbells', x: 3.85, y: 3.85, w: 1.52, h: 0.85 },
  { id: 'fx_flat_bench', matrixCode: 'MG-A78', label: 'Flat Bench', x: 6.75, y: 1.75, w: 1.28, h: 1.73 },
  { id: 'fx_preacher', matrixCode: 'MG-A62', label: 'Scott Curl', x: 6.85, y: 3.95, w: 0.94, h: 1.22 },
  { id: 'fx_db_b1', matrixCode: 'MG-A85', label: '', x: 6.4, y: 5.7, w: 1.35, h: 0.75 },
  { id: 'fx_db_b2', matrixCode: 'MG-A85', label: '', x: 8.1, y: 6.0, w: 0.75, h: 1.35 },
  { id: 'fx_db_rack', matrixCode: 'MG-A538', label: 'Dumbbells', x: 9.6, y: 3.35, w: 0.85, h: 4.8 },
  // West & South Courtyard Window Walls (Verified Matrix Magnum & Ultra)
  { id: 'fx_pl_press', matrixCode: 'MG-PL12', label: 'Vert Press', x: 1.95, y: 11.15, w: 1.47, h: 1.69 },
  { id: 'fx_wt_tree', matrixCode: 'MG-A94', label: '', x: 2.0, y: 13.25, w: 0.68, h: 0.68 },
  { id: 'fx_inc_bb', matrixCode: 'MG-A79', label: 'Incline Bar', x: 2.75, y: 14.1, w: 1.75, h: 1.28 },
  { id: 'fx_ghd', matrixCode: 'MG-A96', label: 'GHD', x: 5.05, y: 15.9, w: 1.73, h: 0.85 },
  { id: 'fx_glute_kick', matrixCode: 'G7-S78', label: 'Glute Kick', x: 9.15, y: 15.65, w: 0.9, h: 1.32 },
  { id: 'fx_hip_abd', matrixCode: 'G7-S75', label: 'Hip Abd/Add', x: 11.35, y: 15.15, w: 1.73, h: 1.82 },
  // Center 4-Stack Core Frame
  { id: 'fx_4stack', matrixCode: 'MG-5STACK', label: '4-Stack', x: 7.15, y: 9.65, w: 1.3, h: 1.3 },
];

export const FLOOR_PILLARS = [
  { x: 0.85, y: 3.25, w: 0.5, h: 0.5 }, // West wall pilaster 1
  { x: 0.85, y: 6.55, w: 0.5, h: 0.5 }, // West wall pilaster 2 (+ wipe bin)
  { x: 9.2, y: 1.8, w: 0.55, h: 0.55 }, // NE grey column by WC/corridor
  { x: 7.2, y: 16.65, w: 0.5, h: 0.5 }, // South window pilaster
  { x: 10.95, y: 12.05, w: 0.65, h: 0.65 }, // Raw concrete column at Section 2 entrance
];

export const GYM_MACHINES = [
  // === SECTION 1: PHOTO-VERIFIED MATRIX FITNESS STATIONS ===
  {
    id: 'm_smith_incline',
    matrixCode: 'MG-PL62',
    name: 'Smith Incline Press',
    gymLabel: 'Multipresse · Matrix MG-PL62',
    shortName: 'Smith Press',
    muscleTag: 'Upper Chest & Shoulders',
    tier: 't1_upper',
    zone: 'window_plate',
    sectionMapped: true,
    pos: { x: 2.2, y: 5.0 },
    widthM: 1.11,
    depthM: 2.31,
    facingDeg: 90,
    loadType: 'plate_per_side',
    tareKg: 11.3,
    movement: 'horiz_push',
    compound: true,
    stepKg: 2.5,
    baselineWorkKg: 7.5,
    baselineReps: 8,
    setup: '30° bench inside Matrix MG-PL62 Smith frame (11.3 kg counterbalanced bar) · Hook safety catches',
    cue: 'Lower bar to upper chest with elbows ~45° · Press up and rotate hooks to rack',
    muscles: { chest: 1.0, shoulders: 0.65, triceps: 0.55 },
    jointStress: { fingers: 0.15, shoulder: 0.6, lower_back: 0.1, knee: 0 },
  },
  {
    id: 'm_leg_press',
    matrixCode: 'MG-PL70',
    name: '45° Sled Leg Press',
    gymLabel: '45° Beinpresse · Matrix MG-PL70',
    shortName: '45° Leg Press',
    muscleTag: 'Quads & Glutes',
    tier: 't2_lean_legs',
    zone: 'window_plate',
    sectionMapped: true,
    pos: { x: 2.3, y: 8.6 },
    widthM: 2.29,
    depthM: 1.71,
    facingDeg: 90,
    loadType: 'plate_per_side',
    tareKg: 75.7,
    movement: 'squat',
    compound: true,
    stepKg: 2.5,
    baselineWorkKg: 12.5,
    baselineReps: 8,
    setup: 'Feet shoulder-width mid-sled (75.7 kg empty sled) · Press up & rotate side safety handles outward',
    cue: 'Lower sled 2s to ~90° knees (keep tailbone glued down) · Drive without locking knees',
    muscles: { quads: 1.0, glutes: 0.75, adductors: 0.4 },
    jointStress: { fingers: 0, shoulder: 0, lower_back: 0.2, knee: 0.65 },
  },
  {
    id: 'm_calf',
    matrixCode: 'MG-PL76',
    name: 'Standing Calf Raise',
    gymLabel: 'Wadenheben · Matrix MG-PL76',
    shortName: 'Stand Calf',
    muscleTag: 'Calves & Slab Footwork',
    tier: 't4_isolation',
    zone: 'window_plate',
    sectionMapped: true,
    labelAnchor: 'above',
    pos: { x: 3.5, y: 16.2 },
    widthM: 0.89,
    depthM: 1.38,
    facingDeg: 180,
    loadType: 'plate_per_side',
    tareKg: 30.4,
    movement: 'calf',
    compound: false,
    stepKg: 2.5,
    baselineWorkKg: 7.5,
    baselineReps: 12,
    setup: 'Shoulders snug under pads (30.4 kg empty lever) · Forefoot on angled diamond footplate',
    cue: 'Pause 2s in deep straight-knee stretch · Drive high onto big toes',
    muscles: { calves: 1.0 },
    jointStress: { fingers: 0, shoulder: 0, lower_back: 0.05, knee: 0.05 },
  },
  {
    id: 'm_low_row',
    matrixCode: 'MG-5STACK',
    name: 'Seated Low Cable Row',
    gymLabel: 'Ruderzug · West Side of MG-5STACK',
    shortName: 'Cable Row',
    muscleTag: 'Mid-Back & Scapulae',
    tier: 't1_upper',
    zone: 'pull',
    sectionMapped: true,
    labelAnchor: 'above',
    pos: { x: 5.7, y: 10.3 },
    widthM: 2.1,
    depthM: 0.9,
    facingDeg: 90,
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
    matrixCode: 'MG-5STACK',
    name: 'Lat Pulldown · Wide Bar',
    gymLabel: 'Latzug · East Side of MG-5STACK',
    shortName: 'Lat Pull',
    muscleTag: 'Upper Back & Lats',
    tier: 't1_upper',
    zone: 'pull',
    sectionMapped: true,
    labelAnchor: 'above',
    pos: { x: 9.2, y: 9.7 },
    widthM: 1.2,
    depthM: 1.1,
    facingDeg: 270,
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
    matrixCode: 'MG-5STACK',
    name: 'Lat Pulldown · Close Neutral',
    gymLabel: 'Latzug · V-Handle (MG-5STACK)',
    shortName: 'Close Pull',
    muscleTag: 'Lats, Lock-Off & Arms',
    tier: 't1_upper',
    zone: 'pull',
    sectionMapped: true,
    pos: { x: 9.2, y: 11.1 },
    widthM: 1.2,
    depthM: 1.1,
    facingDeg: 270,
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
    matrixCode: 'MG-924',
    name: 'Cable Rope Face Pull',
    gymLabel: 'Hi-Lo Pulley #15–16 · MG-924',
    shortName: 'Face Pull',
    muscleTag: 'Rear Shoulders & Rotator Cuff',
    tier: 't4_isolation',
    zone: 'pull',
    sectionMapped: true,
    pos: { x: 7.8, y: 13.5 },
    widthM: 1.1,
    depthM: 0.95,
    facingDeg: 0,
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

  // === SECTION 2 & CARDIO WING (MATRIX ULTRA G7-S & ONYX — AWAITING SECTION 2 PHOTOS) ===
  {
    id: 'm_butterfly',
    matrixCode: 'G7-S22',
    name: 'Pec Fly · Butterfly',
    gymLabel: 'Butterfly · Matrix G7-S22',
    shortName: 'Butterfly',
    muscleTag: 'Chest Isolation',
    tier: 't4_isolation',
    zone: 'push',
    sectionMapped: false,
    labelAnchor: 'above',
    pos: { x: 18.2, y: 9.6 },
    widthM: 1.74,
    depthM: 1.44,
    facingDeg: 270,
    loadType: 'stack',
    movement: 'pec_fly',
    compound: false,
    stepKg: 2.5,
    baselineWorkKg: 30,
    baselineReps: 12,
    setup: 'Matrix G7-S22 console station · Seat so hands sit slightly below shoulder height',
    cue: 'Soft bend in elbows · Sweep arms together in a wide hug',
    muscles: { chest: 1.0, shoulders: 0.3 },
    jointStress: { fingers: 0.05, shoulder: 0.5, lower_back: 0, knee: 0 },
  },
  {
    id: 'm_chest_press',
    matrixCode: 'G7-S13',
    name: 'Seated Chest Press',
    gymLabel: 'Brustpresse · Matrix G7-S13',
    shortName: 'Chest Press',
    muscleTag: 'Chest & Triceps (Shoulder-Safe)',
    tier: 't1_upper',
    zone: 'push',
    sectionMapped: false,
    pos: { x: 18.2, y: 11.8 },
    widthM: 1.41,
    depthM: 1.4,
    facingDeg: 270,
    loadType: 'stack',
    movement: 'horiz_push',
    compound: true,
    stepKg: 2.5,
    baselineWorkKg: 35,
    baselineReps: 10,
    setup: 'Seat 4 (handles at mid-chest) · Use vertical neutral grips on Matrix G7-S13',
    cue: 'Keep shoulder blades pinned to pad · Press forward smoothly',
    muscles: { chest: 1.0, triceps: 0.6, shoulders: 0.45 },
    jointStress: { fingers: 0.1, shoulder: 0.25, lower_back: 0, knee: 0 },
  },
  {
    id: 'm_leg_curl',
    matrixCode: 'G7-S72',
    name: 'Seated Leg Curl',
    gymLabel: 'Beinbeuger · Matrix G7-S72',
    shortName: 'Leg Curl',
    muscleTag: 'Back of Thighs · Heel-Hook Power',
    tier: 't3_posterior',
    zone: 'lower',
    sectionMapped: false,
    labelAnchor: 'above',
    pos: { x: 15.2, y: 15.6 },
    widthM: 1.17,
    depthM: 1.49,
    facingDeg: 0,
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
    id: 'm_leg_ext',
    matrixCode: 'G7-S71',
    name: 'Seated Leg Extension',
    gymLabel: 'Beinstrecker · Matrix G7-S71',
    shortName: 'Leg Ext',
    muscleTag: 'Front of Thighs (Quads)',
    tier: 't4_isolation',
    zone: 'lower',
    sectionMapped: false,
    pos: { x: 18.2, y: 15.6 },
    widthM: 1.26,
    depthM: 1.22,
    facingDeg: 0,
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
    id: 'm_hip_thrust',
    matrixCode: 'MG-PL78',
    name: 'Hip Thrust Machine',
    gymLabel: 'Glute Trainer · Matrix MG-PL78',
    shortName: 'Hip Thrust',
    muscleTag: 'Glutes & Hip Tension',
    tier: 't2_lean_legs',
    zone: 'lower',
    sectionMapped: false,
    pos: { x: 22.0, y: 15.2 },
    widthM: 1.33,
    depthM: 1.68,
    facingDeg: 0,
    loadType: 'plate_per_side',
    tareKg: 22.7,
    movement: 'hinge',
    compound: true,
    stepKg: 2.5,
    baselineWorkKg: 15,
    baselineReps: 8,
    setup: 'Upper back on pad (22.7 kg starting resistance) · Buckle belt across hips · Feet flat',
    cue: 'Keep chin tucked · Drive hips up flat and squeeze glutes 1s',
    muscles: { glutes: 1.0, hamstrings: 0.5, lower_back: 0.25 },
    jointStress: { fingers: 0, shoulder: 0, lower_back: 0.2, knee: 0.15 },
  },
  {
    id: 'm_lower_back',
    matrixCode: 'G7-S52',
    name: 'Seated Back Extension',
    gymLabel: 'Rückenstrecker · Matrix G7-S52',
    shortName: 'Back Ext',
    muscleTag: 'Lower Back Posture',
    tier: 't3_posterior',
    zone: 'core',
    sectionMapped: false,
    pos: { x: 25.4, y: 11.8 },
    widthM: 1.2,
    depthM: 1.28,
    facingDeg: 270,
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
    matrixCode: 'TURF-MAT',
    name: 'Floor Mat · Hollow Leg Lowers',
    gymLabel: 'Mattenbereich · Turf Mat',
    shortName: 'Mat Core',
    muscleTag: 'Deep Core Tension',
    tier: 't4_isolation',
    zone: 'core',
    sectionMapped: false,
    pos: { x: 21.8, y: 7.6 },
    widthM: 1.0,
    depthM: 1.8,
    facingDeg: 0,
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
    matrixCode: 'G7-S51',
    name: 'Seated Ab Crunch',
    gymLabel: 'Bauchpresse · Matrix G7-S51',
    shortName: 'Ab Crunch',
    muscleTag: 'Upper & Mid Abs',
    tier: 't4_isolation',
    zone: 'core',
    sectionMapped: false,
    pos: { x: 25.4, y: 7.6 },
    widthM: 1.21,
    depthM: 1.39,
    facingDeg: 270,
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
    matrixCode: 'T-ONYX',
    name: 'Treadmill',
    gymLabel: 'Laufband · Matrix Onyx',
    shortName: 'Treadmill',
    muscleTag: 'Cardio · Running / Incline Walk',
    tier: 'cardio',
    zone: 'cardio',
    sectionMapped: false,
    pos: { x: 18.6, y: 3.4 },
    widthM: 0.91,
    depthM: 2.15,
    facingDeg: 0,
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
    matrixCode: 'C-ONYX',
    name: 'Stair Climber',
    gymLabel: 'Treppensteiger · Matrix ClimbMill',
    shortName: 'Stairs',
    muscleTag: 'Cardio · Glutes & Legs',
    tier: 'cardio',
    zone: 'cardio',
    sectionMapped: false,
    pos: { x: 21.0, y: 3.4 },
    widthM: 0.85,
    depthM: 1.65,
    facingDeg: 0,
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
    matrixCode: 'ROWER',
    name: 'Rowing Machine',
    gymLabel: 'Rudergerät · Ergometer',
    shortName: 'Rower',
    muscleTag: 'Full-Body Warm-up & Cardio',
    tier: 'cardio',
    zone: 'cardio',
    sectionMapped: false,
    pos: { x: 23.5, y: 3.4 },
    widthM: 0.61,
    depthM: 2.44,
    facingDeg: 0,
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
    matrixCode: 'U-ONYX',
    name: 'Stationary Bike',
    gymLabel: 'Fahrrad · Matrix Onyx Bike',
    shortName: 'Bike',
    muscleTag: 'Low-Impact Cardio',
    tier: 'cardio',
    zone: 'cardio',
    sectionMapped: false,
    pos: { x: 26.0, y: 3.4 },
    widthM: 0.65,
    depthM: 1.1,
    facingDeg: 0,
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

export function getEffectiveFloorDims(floorOverrides = {}) {
  const rm = floorOverrides?.__room || {};
  return {
    width: Math.max(16, Math.min(50, Number(rm.width) || FLOOR_DIMS.width)),
    height: Math.max(12, Math.min(36, Number(rm.height) || FLOOR_DIMS.height)),
    sec1Width: Math.max(7, Math.min(20, Number(rm.sec1Width) || FLOOR_DIMS.sec1Width)),
    sec1Depth: Math.max(10, Math.min(30, Number(rm.sec1Depth) || FLOOR_DIMS.sec1Depth)),
    westStepY: Number(rm.westStepY) || FLOOR_DIMS.westStepY,
    westStepIn: Number.isFinite(Number(rm.westStepIn)) ? Number(rm.westStepIn) : FLOOR_DIMS.westStepIn,
  };
}

export function getEffectivePos(machine, floorOverrides = {}) {
  if (!machine) return { x: 14, y: 9 };
  const ov = floorOverrides?.[machine.id];
  if (ov && Number.isFinite(ov.x) && Number.isFinite(ov.y)) {
    return { x: ov.x, y: ov.y };
  }
  return machine.pos;
}

export function getEffectiveMachineSpec(machine, floorOverrides = {}) {
  if (!machine) return null;
  const ov = floorOverrides?.[machine.id];
  if (!ov) return machine;
  const model = ov.matrixCode ? getMatrixModel(ov.matrixCode) : null;
  return {
    ...machine,
    matrixCode: model?.code || machine.matrixCode,
    gymLabel: model ? `${model.de} · Matrix ${model.code}` : machine.gymLabel,
    widthM: model?.widthM || machine.widthM,
    depthM: model?.depthM || machine.depthM,
    tareKg: Number.isFinite(model?.tareKg) ? model.tareKg : machine.tareKg,
    facingDeg: Number.isFinite(ov.rot) ? ov.rot : machine.facingDeg,
    note: ov.note || '',
  };
}

export function buildFloorDiffSummary(floorOverrides = {}) {
  const lines = [];
  const rm = floorOverrides?.__room;
  if (rm) {
    const dims = getEffectiveFloorDims(floorOverrides);
    const roomParts = [];
    if (dims.width !== FLOOR_DIMS.width || dims.height !== FLOOR_DIMS.height) {
      roomParts.push(`Total gym: ${FLOOR_DIMS.width}×${FLOOR_DIMS.height}m -> ${dims.width}×${dims.height}m`);
    }
    if (dims.sec1Width !== FLOOR_DIMS.sec1Width || dims.sec1Depth !== FLOOR_DIMS.sec1Depth) {
      roomParts.push(`Section 1: ${FLOOR_DIMS.sec1Width}×${FLOOR_DIMS.sec1Depth}m -> ${dims.sec1Width}×${dims.sec1Depth}m`);
    }
    if (roomParts.length) {
      lines.push(`- **Room Dimensions**: ${roomParts.join(' · ')}`);
    }
  }

  for (const [id, ov] of Object.entries(floorOverrides || {})) {
    if (id === '__room' || !ov) continue;
    const m = getMachineById(id);
    if (!m) continue;
    const parts = [];
    if (Number.isFinite(ov.x) && Number.isFinite(ov.y) && (ov.x !== m.pos.x || ov.y !== m.pos.y)) {
      parts.push(`pos (${m.pos.x}, ${m.pos.y})m -> (${ov.x}, ${ov.y})m`);
    }
    if (ov.matrixCode && ov.matrixCode !== m.matrixCode) {
      const mod = getMatrixModel(ov.matrixCode);
      parts.push(`model ${m.matrixCode} -> ${ov.matrixCode}${mod ? ` (${mod.name})` : ''}`);
    }
    if (Number.isFinite(ov.rot) && ov.rot !== m.facingDeg) {
      parts.push(`facing ${m.facingDeg ?? 0}° -> ${ov.rot}°`);
    }
    if (ov.note) {
      parts.push(`note: "${ov.note}"`);
    }
    if (parts.length) {
      lines.push(`- **${m.name}** (\`${m.id}\`): ${parts.join(' · ')}`);
    }
  }

  if (!lines.length) return '';
  return `### Proposed Manegg Motion Floor Plan Updates\n${lines.join('\n')}`;
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
  selectedEditId = null,
  compact = false,
  interactive = false,
} = {}) {
  const dims = getEffectiveFloorDims(floorOverrides);
  const W = 560;
  const H = 360;
  const sx = (x) => (x / dims.width) * W;
  const sy = (y) => (y / dims.height) * H;

  const completedSet = new Set(completedIds);
  const busySet = new Set(busyIds);
  const routeSet = new Set(routeIds);

  const s1W = dims.sec1Width;
  const s1D = dims.sec1Depth;
  const jogW = s1W + 0.6;
  const sec2Start = Math.min(dims.width - 4, s1W + 5.4);
  const westIn = 0.8 + dims.westStepIn;

  // Exact Section 1 mapped floor polygon (including NE hallway & SE wide opening around the central building core)
  const sec1Pts = [
    [0.8, 0.8],
    [sec2Start, 0.8],
    [sec2Start, 2.7],
    [s1W, 2.7],
    [s1W, 8.6],
    [jogW, 8.6],
    [jogW, 12.2],
    [sec2Start, 12.2],
    [sec2Start, s1D],
    [westIn, s1D],
    [westIn, dims.westStepY],
    [0.8, dims.westStepY],
  ]
    .map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`)
    .join(' ');

  // Central WC / Building Core polygon (behind the WC doors and East Mirror walls)
  const corePts = [
    [s1W, 2.7],
    [sec2Start, 2.7],
    [sec2Start, 12.2],
    [jogW, 12.2],
    [jogW, 8.6],
    [s1W, 8.6],
  ]
    .map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`)
    .join(' ');

  const sec2RectX = sec2Start + 0.4;
  const sec2RectW = Math.max(2, dims.width - sec2RectX - 0.8);

  const archSvg = `
    <!-- Section 1 Mapped Floor + Central Core + Section 2 Unmapped Wing -->
    <polygon points="${sec1Pts}" class="fp-sec1-bg" />
    <polygon points="${corePts}" class="fp-mirror-wall" opacity="0.45" />
    <rect x="${sx(sec2RectX).toFixed(1)}" y="${sy(0.8).toFixed(1)}" width="${sx(sec2RectW).toFixed(1)}" height="${sy(s1D - 0.8).toFixed(1)}" rx="8" class="fp-sec2-bg" />

    <!-- North Wall + Stepped West Window Wall + South Window Wall -->
    <polyline points="${sx(s1W)},${sy(0.8)} ${sx(0.8)},${sy(0.8)} ${sx(0.8)},${sy(dims.westStepY)} ${sx(westIn)},${sy(dims.westStepY)} ${sx(westIn)},${sy(s1D)} ${sx(sec2Start)},${sy(s1D)}" class="fp-wall" />

    <!-- East Core Wall (Dumbbell Mirror -> 0.6m Mustard Jog -> 2nd Mirror to Concrete Column) -->
    <polyline points="${sx(s1W)},${sy(2.7)} ${sx(s1W)},${sy(8.6)} ${sx(jogW)},${sy(8.6)} ${sx(jogW)},${sy(12.1)}" class="fp-wall" />
    <line x1="${sx(s1W - 0.18)}" y1="${sy(2.9)}" x2="${sx(s1W - 0.18)}" y2="${sy(8.45)}" class="fp-mirror-glass" />
    <line x1="${sx(jogW - 0.18)}" y1="${sy(8.8)}" x2="${sx(jogW - 0.18)}" y2="${sy(11.9)}" class="fp-mirror-glass" />

    <!-- Courtyard Window Bays (West Wall + South Wall) -->
    <line x1="${sx(0.8)}" y1="${sy(1.4)}" x2="${sx(0.8)}" y2="${sy(3.1)}" class="fp-window" />
    <line x1="${sx(0.8)}" y1="${sy(3.9)}" x2="${sx(0.8)}" y2="${sy(6.4)}" class="fp-window" />
    <line x1="${sx(0.8)}" y1="${sy(7.2)}" x2="${sx(0.8)}" y2="${sy(10.1)}" class="fp-window" />
    <line x1="${sx(westIn)}" y1="${sy(10.8)}" x2="${sx(westIn)}" y2="${sy(13.8)}" class="fp-window" />
    <line x1="${sx(2.4)}" y1="${sy(s1D)}" x2="${sx(4.7)}" y2="${sy(s1D)}" class="fp-window" />
    <line x1="${sx(5.1)}" y1="${sy(s1D)}" x2="${sx(7.0)}" y2="${sy(s1D)}" class="fp-window" />
    <line x1="${sx(7.8)}" y1="${sy(s1D)}" x2="${sx(10.6)}" y2="${sy(s1D)}" class="fp-window" />
    <line x1="${sx(11.1)}" y1="${sy(s1D)}" x2="${sx(sec2Start - 0.2)}" y2="${sy(s1D)}" class="fp-window" />

    <!-- Doors (NW Door, 2 WC Doors on North Wall, Double Glass Exit Doors at SW of West Wall) -->
    <line x1="${sx(1.5)}" y1="${sy(0.8)}" x2="${sx(2.4)}" y2="${sy(0.8)}" class="fp-door" />
    <line x1="${sx(6.3)}" y1="${sy(0.8)}" x2="${sx(7.2)}" y2="${sy(0.8)}" class="fp-door" />
    <line x1="${sx(7.8)}" y1="${sy(0.8)}" x2="${sx(8.7)}" y2="${sy(0.8)}" class="fp-door" />
    <line x1="${sx(westIn)}" y1="${sy(14.5)}" x2="${sx(westIn)}" y2="${sy(16.7)}" class="fp-door" />

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
      <text x="${sx((s1W + sec2Start) / 2)}" y="${sy(1.95)}" text-anchor="middle" class="fp-arch-label">Hallway →</text>
      <text x="${sx((s1W + sec2Start) / 2)}" y="${sy(7.6)}" text-anchor="middle" class="fp-arch-label">Core / Mirrors</text>
      <text x="${sx((jogW + sec2Start) / 2 + 0.5)}" y="${sy(13.4)}" text-anchor="middle" class="fp-arch-label">Sec 2 →</text>
      <text x="${sx(sec2RectX + sec2RectW / 2)}" y="${sy(1.85)}" text-anchor="middle" class="fp-zone-label">Sec 2 &amp; Cardio (Next Photos)</text>
      <line x1="${sx(sec2RectX + 0.4)}" y1="${sy(5.4)}" x2="${sx(dims.width - 1.2)}" y2="${sy(5.4)}" stroke="var(--border)" stroke-dasharray="4 4" />
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

  const pinsSvg = GYM_MACHINES.map((baseM) => {
    const m = getEffectiveMachineSpec(baseM, floorOverrides);
    const p = getEffectivePos(baseM, floorOverrides);
    const cx = sx(p.x).toFixed(1);
    const cy = sy(p.y).toFixed(1);
    const isEditSel = interactive && m.id === selectedEditId;
    const isActive = m.id === activeId || isEditSel;
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
