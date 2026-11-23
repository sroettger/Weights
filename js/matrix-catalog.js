/**
 * Official Matrix Fitness Commercial Equipment Specifications
 * Sourced from Matrix Fitness technical guides (world.matrixfitness.com):
 * - Magnum Plate-Loaded (MG-PL series)
 * - Magnum Free Weights, Benches, Racks & 900-Series Modular Cable Jungle (MG-MR / MG-A / MG-9 series)
 * - Ultra Selectorized w/ Intelligent Training Console & Incremental Micro-Weights (G7-S series)
 * - Onyx / Performance Commercial Cardio
 *
 * Dimensions: `widthM` (side-to-side) × `depthM` (front-to-back) in meters at 0° (facing North/Up).
 */

export const MATRIX_CATALOG = [
  // === MAGNUM PLATE-LOADED (MG-PL) ===
  { code: 'MG-PL70', series: 'Magnum Plate-Loaded', name: '45° Leg Press', de: '45° Beinpresse', widthM: 1.71, depthM: 2.29, loadType: 'plate_per_side', tareKg: 75.7 },
  { code: 'MG-PL62', series: 'Magnum Plate-Loaded', name: 'Smith Machine (90°)', de: 'Multipresse', widthM: 2.31, depthM: 1.11, loadType: 'plate_per_side', tareKg: 11.3 },
  { code: 'MG-PL12', series: 'Magnum Plate-Loaded', name: 'Vertical Bench Press', de: 'Brustpresse (Plate-Loaded)', widthM: 1.69, depthM: 1.47, loadType: 'plate_per_side', tareKg: 6.8 },
  { code: 'MG-PL13', series: 'Magnum Plate-Loaded', name: 'Supine Bench Press', de: 'Flachbank-Brustpresse', widthM: 1.55, depthM: 1.37, loadType: 'plate_per_side', tareKg: 8.2 },
  { code: 'MG-PL14', series: 'Magnum Plate-Loaded', name: 'Incline Bench Press', de: 'Schrägbank-Presse', widthM: 1.68, depthM: 1.42, loadType: 'plate_per_side', tareKg: 8.2 },
  { code: 'MG-PL23', series: 'Magnum Plate-Loaded', name: 'Shoulder Press', de: 'Schulterpresse (Plate-Loaded)', widthM: 1.60, depthM: 1.61, loadType: 'plate_per_side', tareKg: 5.4 },
  { code: 'MG-PL33', series: 'Magnum Plate-Loaded', name: 'Plate-Loaded Lat Pulldown', de: 'Latzug (Plate-Loaded)', widthM: 1.38, depthM: 1.72, loadType: 'plate_per_side', tareKg: 6.8 },
  { code: 'MG-PL34', series: 'Magnum Plate-Loaded', name: 'Plate-Loaded Seated Row', de: 'Rudermaschine (Plate-Loaded)', widthM: 1.39, depthM: 1.52, loadType: 'plate_per_side', tareKg: 9.0 },
  { code: 'MG-PL38', series: 'Magnum Plate-Loaded', name: 'Low Row', de: 'Tiefes Rudern', widthM: 1.42, depthM: 1.62, loadType: 'plate_per_side', tareKg: 9.0 },
  { code: 'MG-PL71', series: 'Magnum Plate-Loaded', name: 'Hack Squat', de: 'Hackenschmidt', widthM: 1.65, depthM: 2.24, loadType: 'plate_per_side', tareKg: 63.5 },
  { code: 'MG-PL76', series: 'Magnum Plate-Loaded', name: 'Standing Calf', de: 'Wadenheben stehend', widthM: 0.89, depthM: 1.38, loadType: 'plate_per_side', tareKg: 30.4 },
  { code: 'MG-PL77', series: 'Magnum Plate-Loaded', name: 'Seated Calf', de: 'Wadenheben sitzend', widthM: 0.76, depthM: 1.45, loadType: 'plate_per_side', tareKg: 11.3 },
  { code: 'MG-PL78', series: 'Magnum Plate-Loaded', name: 'Glute Trainer (Hip Thrust)', de: 'Glute Drive / Hip Thrust', widthM: 1.33, depthM: 1.68, loadType: 'plate_per_side', tareKg: 22.7 },
  { code: 'MG-PL79', series: 'Magnum Plate-Loaded', name: 'Squat / Lunge', de: 'Kniebeuge / Ausfallschritt', widthM: 1.70, depthM: 1.49, loadType: 'plate_per_side', tareKg: 16.3 },
  { code: 'MG-PL81', series: 'Magnum Plate-Loaded', name: 'Belt Squat', de: 'Gürtel-Kniebeuge', widthM: 1.53, depthM: 1.98, loadType: 'plate_per_side', tareKg: 20.4 },

  // === MAGNUM RACKS, BENCHES & MULTI-STATION (MG-MR / MG-A / MG-9) ===
  { code: 'MG-MR47', series: 'Magnum Racks & Benches', name: 'MEGA Power Rack', de: 'Power Rack / Squat Cage', widthM: 2.07, depthM: 2.06, loadType: 'barbell', tareKg: 20 },
  { code: 'MG-MR690', series: 'Magnum Racks & Benches', name: 'MEGA Half Rack', de: 'Half Rack', widthM: 2.07, depthM: 1.75, loadType: 'barbell', tareKg: 20 },
  { code: 'MG-A98', series: 'Magnum Racks & Benches', name: '10-Bar Fixed Barbell Rack', de: 'Langhantelständer (5 Ebenen)', widthM: 1.52, depthM: 0.85, loadType: 'fixture', tareKg: 0 },
  { code: 'MG-A78', series: 'Magnum Racks & Benches', name: 'Olympic Flat Bench', de: 'Olympia-Flachbank', widthM: 1.28, depthM: 1.73, loadType: 'barbell', tareKg: 20 },
  { code: 'MG-A79', series: 'Magnum Racks & Benches', name: 'Olympic Incline Bench', de: 'Olympia-Schrägbank', widthM: 1.28, depthM: 1.75, loadType: 'barbell', tareKg: 20 },
  { code: 'MG-A62', series: 'Magnum Racks & Benches', name: 'Seated Preacher Curl', de: 'Scottbank / Bizepsbank', widthM: 0.94, depthM: 1.22, loadType: 'barbell', tareKg: 10 },
  { code: 'MG-A85', series: 'Magnum Racks & Benches', name: 'Multi-Adjustable Bench', de: 'Verstellbare Hantelbank', widthM: 0.75, depthM: 1.35, loadType: 'dumbbell', tareKg: 0 },
  { code: 'MG-A538', series: 'Magnum Racks & Benches', name: '3-Tier Dumbbell Rack', de: 'Kurzhantelablage (3 Ebenen)', widthM: 4.80, depthM: 0.85, loadType: 'dumbbell', tareKg: 0 },
  { code: 'MG-A52', series: 'Magnum Racks & Benches', name: '45° Back Extension Bench', de: '45° Rückenstrecker / Hyperextension', widthM: 0.76, depthM: 1.34, loadType: 'bodyweight', tareKg: 0 },
  { code: 'MG-A96', series: 'Magnum Racks & Benches', name: 'Glute Ham Bench (GHD)', de: 'Glute-Ham-Bank (GHD)', widthM: 0.85, depthM: 1.73, loadType: 'bodyweight', tareKg: 0 },
  { code: 'MG-A94', series: 'Magnum Racks & Benches', name: 'Olympic Weight Tree', de: 'Hantelscheibenständer', widthM: 0.68, depthM: 0.68, loadType: 'fixture', tareKg: 0 },
  { code: 'MG-5STACK', series: 'Magnum Multi-Jungle', name: '4-Stack Jungle Core (Lat / Row / Pushdown / Hi-Lo)', de: '4-Stationen Kabelturm', widthM: 3.40, depthM: 2.10, loadType: 'stack', stackKg: 105 },
  { code: 'MG-924', series: 'Magnum Multi-Jungle', name: 'Adjustable Crossover Pulley Column (#1–18)', de: 'Kabelzug-Säule (#1–18)', widthM: 1.10, depthM: 0.95, loadType: 'stack', stackKg: 90 },

  // === ULTRA SELECTORIZED W/ INTELLIGENT TRAINING CONSOLE (G7-S) ===
  { code: 'G7-S13', series: 'Ultra Selectorized (Console)', name: 'Converging Chest Press', de: 'Brustpresse (Konsole)', widthM: 1.41, depthM: 1.40, loadType: 'stack', stackKg: 108 },
  { code: 'G7-S21', series: 'Ultra Selectorized (Console)', name: 'Lateral Raise', de: 'Seitheben (Konsole)', widthM: 1.06, depthM: 1.35, loadType: 'stack', stackKg: 90 },
  { code: 'G7-S22', series: 'Ultra Selectorized (Console)', name: 'Pec Fly / Rear Delt', de: 'Butterfly / Reverse (Konsole)', widthM: 1.74, depthM: 1.44, loadType: 'stack', stackKg: 135 },
  { code: 'G7-S23', series: 'Ultra Selectorized (Console)', name: 'Converging Shoulder Press', de: 'Schulterpresse (Konsole)', widthM: 1.50, depthM: 1.55, loadType: 'stack', stackKg: 108 },
  { code: 'G7-S33', series: 'Ultra Selectorized (Console)', name: 'Diverging Lat Pulldown', de: 'Latzug Maschine (Konsole)', widthM: 1.52, depthM: 1.60, loadType: 'stack', stackKg: 108 },
  { code: 'G7-S34', series: 'Ultra Selectorized (Console)', name: 'Diverging Seated Row', de: 'Rudermaschine (Konsole)', widthM: 1.22, depthM: 1.55, loadType: 'stack', stackKg: 108 },
  { code: 'G7-S40', series: 'Ultra Selectorized (Console)', name: 'Independent Biceps Curl', de: 'Bizepsmaschine (Konsole)', widthM: 1.22, depthM: 1.35, loadType: 'stack', stackKg: 90 },
  { code: 'G7-S42', series: 'Ultra Selectorized (Console)', name: 'Triceps Press', de: 'Trizepsmaschine (Konsole)', widthM: 1.24, depthM: 1.40, loadType: 'stack', stackKg: 108 },
  { code: 'G7-S51', series: 'Ultra Selectorized (Console)', name: 'Abdominal Crunch', de: 'Bauchpresse (Konsole)', widthM: 1.21, depthM: 1.39, loadType: 'stack', stackKg: 108 },
  { code: 'G7-S52', series: 'Ultra Selectorized (Console)', name: 'Back Extension', de: 'Rückenstrecker (Konsole)', widthM: 1.20, depthM: 1.28, loadType: 'stack', stackKg: 108 },
  { code: 'G7-S55', series: 'Ultra Selectorized (Console)', name: 'Rotary Torso', de: 'Rumpfrotation (Konsole)', widthM: 1.18, depthM: 1.25, loadType: 'stack', stackKg: 90 },
  { code: 'G7-S70', series: 'Ultra Selectorized (Console)', name: 'Horizontal Leg Press', de: 'Sitzende Beinpresse (Konsole)', widthM: 1.14, depthM: 2.06, loadType: 'stack', stackKg: 180 },
  { code: 'G7-S71', series: 'Ultra Selectorized (Console)', name: 'Leg Extension', de: 'Beinstrecker (Konsole)', widthM: 1.26, depthM: 1.22, loadType: 'stack', stackKg: 108 },
  { code: 'G7-S72', series: 'Ultra Selectorized (Console)', name: 'Seated Leg Curl', de: 'Beinbeuger sitzend (Konsole)', widthM: 1.17, depthM: 1.49, loadType: 'stack', stackKg: 90 },
  { code: 'G7-S73', series: 'Ultra Selectorized (Console)', name: 'Prone Leg Curl', de: 'Beinbeuger liegend (Konsole)', widthM: 1.15, depthM: 1.72, loadType: 'stack', stackKg: 90 },
  { code: 'G7-S74', series: 'Ultra Selectorized (Console)', name: 'Hip Adductor', de: 'Adduktoren (Konsole)', widthM: 1.73, depthM: 1.82, loadType: 'stack', stackKg: 90 },
  { code: 'G7-S75', series: 'Ultra Selectorized (Console)', name: 'Hip Abductor', de: 'Abduktoren (Konsole)', widthM: 1.73, depthM: 1.82, loadType: 'stack', stackKg: 90 },
  { code: 'G7-S77', series: 'Ultra Selectorized (Console)', name: 'Seated Calf Extension', de: 'Wadenpresse (Konsole)', widthM: 1.07, depthM: 1.56, loadType: 'stack', stackKg: 135 },
  { code: 'G7-S78', series: 'Ultra Selectorized (Console)', name: 'Standing Glute Kickback', de: 'Gesässmaschine / Glute (Konsole)', widthM: 0.90, depthM: 1.32, loadType: 'stack', stackKg: 63 },

  // === CARDIO & TURF ===
  { code: 'T-ONYX', series: 'Cardio & Turf', name: 'Treadmill', de: 'Laufband · Matrix', widthM: 0.91, depthM: 2.15, loadType: 'cardio' },
  { code: 'C-ONYX', series: 'Cardio & Turf', name: 'ClimbMill (Stair Climber)', de: 'Treppensteiger · ClimbMill', widthM: 0.85, depthM: 1.65, loadType: 'cardio' },
  { code: 'ROWER', series: 'Cardio & Turf', name: 'Rowing Ergometer', de: 'Rudergerät', widthM: 0.61, depthM: 2.44, loadType: 'cardio' },
  { code: 'U-ONYX', series: 'Cardio & Turf', name: 'Stationary Bike', de: 'Fahrrad-Ergometer', widthM: 0.65, depthM: 1.10, loadType: 'cardio' },
  { code: 'E-ONYX', series: 'Cardio & Turf', name: 'Elliptical / Ascent Trainer', de: 'Crosstrainer', widthM: 0.88, depthM: 1.95, loadType: 'cardio' },
  { code: 'TURF-MAT', series: 'Cardio & Turf', name: 'Stretching / Core Mat', de: 'Mattenbereich', widthM: 1.00, depthM: 1.80, loadType: 'bodyweight' },
];

export function getMatrixModel(code) {
  return MATRIX_CATALOG.find((m) => m.code === code) || null;
}
