/**
 * Weights — Machine Form Guide & Biomechanical Troubleshooting Engine
 *
 * Provides:
 * 1) Pre-exercise Setup, Pivot Alignment & Execution Guide for all 19 Manegg Motion stations
 * 2) Schematic SVG posture / force-vector diagrams per movement pattern
 * 3) Interactive Form Diagnostic Engine (1-tap symptoms + natural-language difficulty analyzer)
 *    that explains WHY compensation happens and offers live session fixes (Pin Cue, Drop Load, Swap).
 */

export const MACHINE_GUIDES = {
  m_ab_crunch: {
    pivot: 'Align machine cam pivot with mid-ribcage (seat height)',
    steps: [
      'Seat height: red cam axis level with bottom of sternum',
      'Hands/elbows: rest open palms lightly — DO NOT grip or pull down',
      'Curl ribs toward pelvis while exhaling; stop before stack touches',
    ],
    feel: 'Upper & deep abs',
    avoid: 'Pulling with lats/arms or hinging from hip flexors',
    issues: [
      {
        id: 'lats_overtaking',
        chip: 'Feels heavy on lats / arms',
        keywords: ['lat', 'lats', 'arm', 'arms', 'back', 'pull', 'shoulder', 'shoulders'],
        cause: 'Pulling down on handles engages shoulder extension (lats) instead of spinal flexion — very common in climbers.',
        fixes: [
          'Open your hands (hook fingertips or press wrists/elbows only)',
          'Raise seat 1 notch so pivot aligns with lower ribs, not shoulders',
          'Initiate by exhaling & curling sternum down before moving handles',
        ],
        pinCue: 'Open palms · Zero arm pull · Curl sternum to pelvis',
        suggestDropLoad: true,
        swapId: 'm_abs_mat',
      },
      {
        id: 'hip_flexors',
        chip: 'Hip flexors / thighs taking over',
        keywords: ['hip', 'hips', 'thigh', 'quads', 'groin', 'flexor'],
        cause: 'Folding with a flat spine hinges the hips (iliopsoas) instead of rounding the trunk.',
        fixes: [
          'Tuck pelvis slightly (posterior tilt) before starting rep 1',
          'Unhook feet from rollers if present — plant heels flat on floor',
          'Think "shorten rib-to-belt distance", not "bow forward"',
        ],
        pinCue: 'Heels flat · Posterior pelvic tuck · Round upper trunk',
        suggestDropLoad: true,
        swapId: 'm_abs_mat',
      },
      {
        id: 'low_back_pinch',
        chip: 'Lower back discomfort',
        keywords: ['lower back', 'lumbar', 'spine', 'pinch', 'arch'],
        cause: 'Over-extending at the top of the rep under stack tension.',
        fixes: [
          'Stop eccentric at neutral upright posture — do not arch backward',
          'Keep ribs stacked over pelvis throughout',
        ],
        pinCue: 'Stop at neutral top · Keep ribs down',
        suggestDropLoad: true,
        swapId: 'm_abs_mat',
      },
    ],
  },

  m_abs_mat: {
    pivot: 'Lumbar spine pressed flat into yoga mat (zero gap)',
    steps: [
      'Press lower back firmly into mat; lift shoulder blades 2 cm',
      'Extend legs/arms only as low as your lower back stays glued down',
      'Exhale slowly for 3s on the reach; return under control',
    ],
    feel: 'Deep anterior core (transversus & rectus)',
    avoid: 'Lower back arching off mat or neck jutting forward',
    issues: [
      {
        id: 'back_arching',
        chip: 'Lower back lifts off mat',
        keywords: ['back', 'arch', 'lumbar', 'hip'],
        cause: 'Leg lever is longer than current anti-extension strength.',
        fixes: [
          'Bend knees 45° or lower legs to a higher angle (45° instead of floor)',
          'Exhale fully to lock ribs down before extending leg',
        ],
        pinCue: 'Bend knees slightly · Keep lumbar glued to mat',
        suggestDropLoad: false,
      },
      {
        id: 'neck_strain',
        chip: 'Neck getting tired',
        keywords: ['neck', 'head', 'throat', 'chin'],
        cause: 'Jutting chin forward instead of curling upper thoracic spine.',
        fixes: [
          'Rest head on mat (dead bug style) OR lightly cradle skull with 2 fingers',
          'Tuck chin slightly (hold an imaginary apple under chin)',
        ],
        pinCue: 'Head down on mat · Pure dead-bug reach',
        suggestDropLoad: false,
      },
    ],
  },

  m_lat_pull: {
    pivot: 'Thighs locked snug under pad · Chest tall (15° lean max)',
    steps: [
      'Grip 1.3× shoulder width (going too wide cuts lat leverage)',
      'Start rep by pulling shoulder blades DOWN away from ears',
      'Drive elbows toward hip pockets until bar nears collarbone',
    ],
    feel: 'Outer lats & mid-back',
    avoid: 'Biceps/forearms burning out first or swinging torso back',
    issues: [
      {
        id: 'all_biceps_forearms',
        chip: 'All biceps / forearms, no lats',
        keywords: ['bicep', 'biceps', 'forearm', 'forearms', 'grip', 'arms', 'pump'],
        cause: 'Over-gripping the bar and flexing elbows before depressing scapulae.',
        fixes: [
          'Use a thumbless "hook" grip — treat hands as passive hooks',
          'Lead every rep with 2 cm of scapular depression (shoulders down)',
          'Pull elbows down & slightly forward, don’t curl bar behind neck',
        ],
        pinCue: 'Thumbless hook · Shoulders down first · Drive elbows',
        suggestDropLoad: true,
        swapId: 'm_low_row',
      },
      {
        id: 'shoulder_pinch',
        chip: 'Shoulder pinch at top/bottom',
        keywords: ['shoulder', 'pinch', 'cuff', 'neck', 'trap', 'traps'],
        cause: 'Grip too wide or internally rotating shoulders at bottom.',
        fixes: [
          'Narrow grip to just outside shoulder width (or neutral MAG handle)',
          'Keep sternum lifted 15° toward ceiling; stop bar at upper chest',
        ],
        pinCue: 'Medium grip · Sternum lifted · Stop at collarbone',
        suggestDropLoad: true,
        swapId: 'm_low_row',
      },
    ],
  },

  m_pullup: {
    pivot: 'Thighs locked snug under pad · Narrow parallel (neutral) handle',
    steps: [
      'Pin weight stack (higher number = heavier pull); lock thighs tightly under pad',
      'Grip narrow parallel handle with palms facing each other; lean torso back ~10–15°',
      'Pull shoulder blades down first, then drive elbows tight past ribs to lower sternum',
    ],
    feel: 'Lower/mid lats, lock-off muscles & brachialis',
    avoid: 'Rocking torso 45° backward or curling wrists inward',
    issues: [
      {
        id: 'elbow_golfer',
        chip: 'Inner elbow / forearm ache',
        keywords: ['elbow', 'forearm', 'tendon', 'golfer', 'finger', 'grip'],
        cause: 'Death-gripping the handle and flexing wrists under load overloads the medial epicondyle.',
        fixes: [
          'Hook fingers loosely with straight neutral wrists (no wrist curl)',
          'Stop 2 cm shy of yanking into a violent dead-hang bounce at the top',
        ],
        pinCue: 'Loose hook grip · Straight wrists · Smooth top stretch',
        suggestDropLoad: true,
        swapId: 'm_low_row',
      },
      {
        id: 'leaning_row_pull',
        chip: 'Swinging back / turning into a row',
        keywords: ['swing', 'lean', 'back', 'heavy', 'momentum'],
        cause: 'Using hip momentum when the pin is 1–2 steps above strict lock-off strength.',
        fixes: [
          'Keep thighs wedged firmly under pad and cap torso lean at ~15°',
          'Pause 0.5s with handle at lower chest — drop 1 pin if it won’t touch chest cleanly',
        ],
        pinCue: '15° max lean · Touch lower sternum cleanly',
        suggestDropLoad: true,
        swapId: 'm_lat_pull',
      },
    ],
  },

  m_low_row: {
    pivot: 'Chest pad set so fingers just reach handles with protracted blades',
    steps: [
      'Seat height: chest pad supports mid-sternum (not throat or belly)',
      'Let shoulder blades stretch forward slightly, then retract & row',
      'Drive elbows past torso; hold 1s without leaning backward',
    ],
    feel: 'Mid-back (rhomboids, mid-traps) & lats',
    avoid: 'Shrugging upper traps or rocking chest off pad',
    issues: [
      {
        id: 'upper_traps',
        chip: 'Neck / upper traps taking over',
        keywords: ['trap', 'traps', 'neck', 'shrug', 'shoulder'],
        cause: 'Seat is too low, forcing elbows high and shrugging toward ears.',
        fixes: [
          'Raise seat 1–2 clicks so handles pull toward lower ribs / navel',
          'Keep long neck; pull elbows down and back',
        ],
        pinCue: 'Raise seat +1 · Pull low toward ribs, not chest',
        suggestDropLoad: true,
      },
      {
        id: 'biceps_row',
        chip: 'Mostly arms / forearms',
        keywords: ['arm', 'arms', 'bicep', 'forearm', 'grip'],
        cause: 'Bending wrists and pulling with hands instead of scapular retraction.',
        fixes: [
          'Keep wrists straight; initiate by pinching shoulder blades first',
          'Pause 1s at peak contraction — if you can’t pause, drop 2.5–5 kg',
        ],
        pinCue: 'Straight wrists · Blades first · 1s squeeze',
        suggestDropLoad: true,
      },
    ],
  },

  m_cable_pull: {
    pivot: 'Pulley set slightly above eye level · Rope attachment',
    steps: [
      'Hold rope with thumbs pointing backward (hammer grip)',
      'Step back into split stance for stability',
      'Pull center of rope to forehead while rotating thumbs behind ears',
    ],
    feel: 'Rear delts & external rotators',
    avoid: 'Leaning way back and turning it into a heavy lat row',
    issues: [
      {
        id: 'low_back_lean',
        chip: 'Pulling with back / leaning',
        keywords: ['lean', 'back', 'lat', 'heavy', 'trap'],
        cause: 'Stack is too heavy for small external rotators, recruiting lats.',
        fixes: [
          'Drop 1–2 pins; stand tall in staggered stance',
          'Finish in a "double biceps" pose so wrists beat elbows backward',
        ],
        pinCue: 'Lighter pin · Wrists finish behind elbows',
        suggestDropLoad: true,
      },
    ],
  },

  m_leg_press: {
    pivot: 'Hips & tailbone stay glued into seat pad at bottom of rep',
    steps: [
      'Feet shoulder-width, mid-sled; toes turned out 10–15°',
      'Unrack safety handles; lower sled 2s until ~90° knee bend (before pelvis tucks)',
      'Drive through whole foot; stop just shy of hard knee lockout',
    ],
    feel: 'Quads & glutes',
    avoid: 'Butt lifting off pad (lumbar rounding) or heels coming up',
    issues: [
      {
        id: 'knee_ache_lp',
        chip: 'Front knee pressure',
        keywords: ['knee', 'knees', 'patella', 'joint'],
        cause: 'Feet placed too low on platform, pushing knees far past toes with heel lift.',
        fixes: [
          'Move feet 5–8 cm HIGHER on the footplate (shifts torque to hips/glutes)',
          'Keep entire heel planted; track knees over 2nd/3rd toe',
        ],
        pinCue: 'Higher foot placement · Full heel pressure',
        suggestDropLoad: true,
        swapId: 'm_hip_thrust',
      },
      {
        id: 'back_rounding_lp',
        chip: 'Lower back / tailbone tucking',
        keywords: ['back', 'tailbone', 'butt', 'lumbar', 'hip'],
        cause: 'Lowering sled past hip flexion mobility ("butt wink" under load).',
        fixes: [
          'Move seat back 1 notch OR stop 5 cm higher before tailbone lifts',
          'Pull yourself DOWN into the seat using the side handles!',
        ],
        pinCue: 'Pull into side handles · Stop before pelvis tucks',
        suggestDropLoad: false,
      },
      {
        id: 'no_glutes_lp',
        chip: 'All quads, want more glutes',
        keywords: ['glute', 'glutes', 'butt', 'quad'],
        cause: 'Low/narrow foot stance maximizes knee flexion over hip flexion.',
        fixes: [
          'Place feet high & slightly wider on the sled',
          'Drive strictly through heels',
        ],
        pinCue: 'High & wide stance · Heel drive',
        suggestDropLoad: false,
      },
    ],
  },

  m_leg_ext: {
    pivot: 'Align red machine cam pivot directly with knee joint center',
    steps: [
      'Adjust backrest so back of knee sits flush against seat edge + cam pivot',
      'Set shin pad just above shoelaces (not high on shin, not on toes)',
      'Pull down on side handles; extend fully and hold 1s at top',
    ],
    feel: 'All 4 quadriceps heads',
    avoid: 'Swinging momentum or seat too far back',
    issues: [
      {
        id: 'knee_cap_ext',
        chip: 'Kneecap discomfort',
        keywords: ['knee', 'kneecap', 'patella', 'pain', 'pressure'],
        cause: 'Knee joint is forward/behind the machine cam axis, creating shear.',
        fixes: [
          'Re-align backrest so knee joint matches the red pivot dot exactly',
          'Shorten bottom ROM by 1 pin if deep flexion pinches',
        ],
        pinCue: 'Exact knee-to-pivot alignment · Smooth tempo',
        suggestDropLoad: true,
        swapId: 'm_leg_press',
      },
    ],
  },

  m_leg_curl: {
    pivot: 'Align machine pivot with knee joint · Lap pad locked tight',
    steps: [
      'Set backrest so knees clear edge by 2 cm & match cam pivot',
      'Place ankle pad just above heels (Achilles); lock thigh pad SNUG',
      'Flex ankles (toes up) and drive heels all the way under seat',
    ],
    feel: 'Hamstrings (mimics climbing heel-hook tension)',
    avoid: 'Calves cramping or hips lifting',
    issues: [
      {
        id: 'calf_cramp_curl',
        chip: 'Calves cramping / taking over',
        keywords: ['calf', 'calves', 'cramp', 'ankle', 'foot'],
        cause: 'Gastrocnemius crosses the knee; pointing toes over-shortens calves.',
        fixes: [
          'Relax ankles (point toes slightly down/neutral) after initiating the curl',
          'Move ankle roller 1 notch closer to heel',
        ],
        pinCue: 'Relax toes/ankles mid-rep to silence calves',
        suggestDropLoad: true,
      },
      {
        id: 'low_back_curl',
        chip: 'Lower back arching',
        keywords: ['back', 'arch', 'hip', 'seat'],
        cause: 'Thigh pad is too loose, letting pelvis tilt forward.',
        fixes: [
          'Click thigh pad 1 notch tighter across quads',
          'Lean torso slightly forward (brace abs) rather than arching into pad',
        ],
        pinCue: 'Tight thigh pad · Slight forward torso brace',
        suggestDropLoad: false,
      },
    ],
  },

  m_calf: {
    pivot: 'Balls of feet on step edge · Heels free for full range',
    steps: [
      'Place forefoot (base of big & little toe) squarely on platform edge',
      'Lower heels slowly for 2s to a deep pause (silences Achilles bounce)',
      'Press straight up through the big toe (don’t roll outward onto pinky)',
    ],
    feel: 'Calves (gastroc & soleus)',
    avoid: 'Bouncing out of bottom stretch',
    issues: [
      {
        id: 'achilles_bounce',
        chip: 'Achilles tightness / no calf burn',
        keywords: ['achilles', 'tendon', 'ankle', 'foot', 'arch', 'slip'],
        cause: 'Fast elastic rebound stores energy in Achilles tendon instead of muscle.',
        fixes: [
          'Hold a dead 2-second pause at the bottom of every rep',
          'Push deliberately over the big-toe joint at top',
        ],
        pinCue: '2s dead pause at bottom · Big-toe drive',
        suggestDropLoad: true,
      },
    ],
  },

  m_hip_thrust: {
    pivot: 'Shoulder blades on pad · Shins vertical (90°) at top lockout',
    steps: [
      'Buckle hip belt/pad across crease of hips (not stomach)',
      'Set feet hip-width so knees hit 90° at full hip extension',
      'Keep chin tucked & ribs down; lock hips horizontally and pause 1s',
    ],
    feel: 'Glutes (& hamstrings)',
    avoid: 'Feeling it in quads, hamstrings only, or lower back',
    issues: [
      {
        id: 'quads_or_hams_ht',
        chip: 'Feeling quads or hamstrings instead',
        keywords: ['quad', 'quads', 'thigh', 'hamstring', 'hamstrings'],
        cause: 'Foot distance shifts leverage: too close = quads; too far = hamstrings.',
        fixes: [
          'If quads burn: walk feet 5 cm FURTHER forward',
          'If hamstrings cramp: bring feet 5 cm CLOSER to hips',
        ],
        pinCue: 'Adjust foot distance until shins are vertical at top',
        suggestDropLoad: false,
      },
      {
        id: 'back_arch_ht',
        chip: 'Lower back taking over',
        keywords: ['back', 'lumbar', 'spine', 'arch'],
        cause: 'Hyperextending lumbar spine at top instead of posterior pelvic tilt.',
        fixes: [
          'Keep chin tucked & eyes forward (look at wall in front, not ceiling!)',
          'Squeeze glutes to tilt belt buckle toward chin at top',
        ],
        pinCue: 'Eyes forward · Chin tucked · Ribs down at lockout',
        suggestDropLoad: true,
      },
    ],
  },

  m_lower_back: {
    pivot: 'Align machine pivot with hip bone / pelvis · Lock thigh/foot restraint',
    steps: [
      'Upper roller rests across shoulder blades (below neck)',
      'Brace core 360°; hinge forward with a flat back',
      'Extend smoothly back to straight neutral posture — do not slam past vertical',
    ],
    feel: 'Spinal erectors & glutes',
    avoid: 'Snapping into lumbar hyperextension',
    issues: [
      {
        id: 'sharp_lumbar',
        chip: 'Pinching / too intense on spine',
        keywords: ['pinch', 'sharp', 'pain', 'cramp', 'too much'],
        cause: 'Extending too far backward or pivot aligned with lumbar instead of hips.',
        fixes: [
          'Stop 5° shy of leaning backward; keep abs braced',
          'Move seat so hip crease aligns with pivot',
        ],
        pinCue: 'Stop at neutral upright · Braced abs',
        suggestDropLoad: true,
        swapId: 'm_hip_thrust',
      },
    ],
  },

  m_smith_incline: {
    pivot: 'Bench at 30° · Bar path touches upper chest / collarbone line',
    steps: [
      'Slide bench forward/back so angled bar lowers to upper chest (not throat)',
      'Set safety catches 2 cm below chest touch point',
      'Tuck elbows ~45° from torso; wrists stacked straight over elbows',
    ],
    feel: 'Upper chest & front delts',
    avoid: 'Flared 90° elbows pinching front shoulder',
    issues: [
      {
        id: 'shoulder_smith',
        chip: 'Front shoulder pinching',
        keywords: ['shoulder', 'shoulders', 'pinch', 'collarbone', 'rotator', 'awkward'],
        cause: 'Fixed Smith rail forces internal rotation if bench is too far back or incline >45°.',
        fixes: [
          'Lower bench to 30° (1–2 clicks above flat) and slide bench 3 cm toward feet',
          'Tuck elbows to 45° and retract shoulder blades into bench',
        ],
        pinCue: '30° bench · Slide bench so bar hits below clavicle · 45° elbows',
        suggestDropLoad: true,
        swapId: 'm_chest_press',
      },
      {
        id: 'all_triceps_smith',
        chip: 'All triceps, no chest',
        keywords: ['tricep', 'triceps', 'arm', 'arms', 'wrist'],
        cause: 'Grip is too narrow, turning press into close-grip triceps extension.',
        fixes: [
          'Widen grip so forearms are vertical at the bottom of the rep',
          'Think "push biceps toward each other" as you press',
        ],
        pinCue: 'Forearms vertical at bottom · Drive chest up',
        suggestDropLoad: false,
      },
    ],
  },

  m_chest_press: {
    pivot: 'Seat height sets handles at mid-to-lower chest (nipple line)',
    steps: [
      'Pin shoulder blades together & down against back pad',
      'Use neutral (vertical) handles if shoulders feel tight',
      'Press smoothly without letting shoulders roll forward at lockout',
    ],
    feel: 'Mid chest & triceps',
    avoid: 'Handles at shoulder height (seat too low)',
    issues: [
      {
        id: 'shoulder_cp',
        chip: 'Shoulders rolling / aching',
        keywords: ['shoulder', 'neck', 'front delt', 'pinch'],
        cause: 'Seat is too low or protracting shoulders off pad at lockout.',
        fixes: [
          'Raise seat 1–2 notches so handles align with lower sternum',
          'Switch to vertical neutral handles',
        ],
        pinCue: 'Seat higher · Neutral handles · Blades pinned',
        suggestDropLoad: true,
      },
    ],
  },

  m_butterfly: {
    pivot: 'Seat height places handles just below shoulder level',
    steps: [
      'Set rear range-of-motion pin 1 notch IN so arms don’t yank behind torso',
      'Keep a soft 15° bend in elbows; chest proud against pad',
      'Sweep elbows/biceps together in a wide hug; pause 1s',
    ],
    feel: 'Chest fibers across full sweep',
    avoid: 'Over-stretching front shoulder capsule at back',
    issues: [
      {
        id: 'shoulder_fly',
        chip: 'Front shoulder / biceps tendon pull',
        keywords: ['shoulder', 'bicep', 'tendon', 'stretch', 'front'],
        cause: 'Arms traveling behind coronal plane of torso.',
        fixes: [
          'Move arm-cam adjustment 1 hole forward to limit back stretch',
          'Raise seat 1 click so hands are slightly below shoulders',
        ],
        pinCue: 'Cam 1 notch forward · Hands below shoulders',
        suggestDropLoad: true,
        swapId: 'm_chest_press',
      },
    ],
  },

  c_treadmill: {
    pivot: '2% incline mimics outdoor ground · Land under center of mass',
    steps: [
      'Set 1.5–2.0% incline to reduce braking impact on knees/shins',
      'Quick light steps (~165–175 spm) rather than long over-strides',
      'Swing arms relaxed at 90°, hands loose',
    ],
    feel: 'Steady rhythmic breathing',
    avoid: 'Holding front console or over-striding',
    issues: [
      {
        id: 'shin_knee_run',
        chip: 'Shins or knees pounding',
        keywords: ['shin', 'knee', 'impact', 'calf', 'joint'],
        cause: 'Heel-striking ahead of hips at 0% incline.',
        fixes: [
          'Switch to brisk uphill walk (8–10% incline @ 5.0 km/h) for same HR with zero impact',
          'Or swap to ClimbMill / Bike',
        ],
        pinCue: 'Incline walk (8% @ 5 km/h) · Zero impact',
        suggestDropLoad: false,
        swapId: 'c_climbmill',
      },
    ],
  },

  c_climbmill: {
    pivot: 'Tall torso · Fingertips for balance only (never lean weight on rails)',
    steps: [
      'Step entire foot onto each stair (don’t tiptoe on edges)',
      'Slight hip hinge (5–10°), drive through heel & glute',
      'Pick a level where hands stay completely light',
    ],
    feel: 'Cardio + glutes/legs',
    avoid: 'Draping forearms over console (cuts calorie/VO2 demand by ~30%)',
    issues: [
      {
        id: 'calves_stairs',
        chip: 'Calves burning out early',
        keywords: ['calf', 'calves', 'toe', 'achilles', 'foot'],
        cause: 'Stepping on forefoot/toes instead of planting whole heel.',
        fixes: [
          'Drop speed 1 level and plant your full heel on each step',
          'Push from hips/glutes',
        ],
        pinCue: 'Full heel on step · Tall posture',
        suggestDropLoad: false,
      },
    ],
  },

  c_rower: {
    pivot: 'Damper 4–5 (drag ~120) · Sequence: Legs → Hips → Arms',
    steps: [
      'Set side damper to 4–5 (10 is like rowing a heavy barge — taxes lower back)',
      'Catch: shins vertical, arms straight, torso tilted slightly forward (1 o’clock)',
      'Drive legs first, swing hips to 11 o’clock, finish handle to lower ribs; reverse on return',
    ],
    feel: '60% legs, 20% core/hips, 20% pull',
    avoid: 'Damper at 10, gripping handle tight, or bending elbows early',
    issues: [
      {
        id: 'rower_forearms_back',
        chip: 'Forearms / lower back tiring',
        keywords: ['forearm', 'grip', 'finger', 'back', 'lumbar', 'arms'],
        cause: 'Damper set too high or pulling with arms before legs finish.',
        fixes: [
          'Lower side damper to 3–4',
          'Hang loosely from fingertips; keep arms straight until knees are nearly flat',
        ],
        pinCue: 'Damper 4 · Loose fingertips · Legs drive first',
        suggestDropLoad: false,
        swapId: 'c_bike',
      },
    ],
  },

  c_bike: {
    pivot: 'Saddle height: slight 25° knee bend at bottom of pedal stroke',
    steps: [
      'Adjust seat so hips don’t rock side-to-side at bottom of stroke',
      'Keep cadence lively (80–90 rpm) rather than grinding slow heavy gears',
      'Relax shoulders and hands on handlebars',
    ],
    feel: 'Smooth aerobic leg spin',
    avoid: 'Seat too low (front knee strain)',
    issues: [
      {
        id: 'bike_knee',
        chip: 'Front of knee tight',
        keywords: ['knee', 'seat', 'quad'],
        cause: 'Saddle is too low.',
        fixes: ['Raise saddle 1–2 holes so leg nearly extends at 6 o’clock'],
        pinCue: 'Raise saddle +1 · 85 rpm spin',
        suggestDropLoad: false,
      },
    ],
  },
};

export function getMachineGuide(machineId) {
  return (
    MACHINE_GUIDES[machineId] || {
      pivot: 'Align seat & pad with primary joint axis',
      steps: [
        'Adjust seat so joint aligns with machine pivot',
        'Control 2s eccentric; smooth concentric without momentum',
        'Breathe out on effort',
      ],
      feel: 'Target muscle belly',
      avoid: 'Joint pinching or body English',
      issues: [],
    }
  );
}

/**
 * Diagnose any free-text difficulty or symptom chip on a given machine.
 * Returns { title, cause, fixes[], pinCue, suggestDropLoad, swapId }.
 */
export function diagnoseMachineIssue(machine, input) {
  const guide = getMachineGuide(machine.id);
  const raw = String(input || '').trim();
  const q = raw.toLowerCase();

  // 1. Direct match by issue ID
  const exact = guide.issues.find((iss) => iss.id === raw);
  if (exact) return exact;

  // 2. Keyword match against station's curated biomechanical knowledge base
  let bestIssue = null;
  let bestHits = 0;
  for (const iss of guide.issues) {
    let hits = 0;
    for (const kw of iss.keywords) {
      if (q.includes(kw)) hits += kw.includes(' ') ? 3 : 2;
    }
    if (hits > bestHits) {
      bestHits = hits;
      bestIssue = iss;
    }
  }
  if (bestIssue && bestHits > 0) return bestIssue;

  // 3. General cross-machine biomechanical analyzer for arbitrary natural-language descriptions
  if (q.includes('lat') || (q.includes('arm') && machine.movement === 'core')) {
    return {
      id: 'gen_lats',
      chip: 'Lats / arms taking over',
      cause: 'Pulling down through shoulder extension recruits strong climber lats instead of the target trunk/prime mover.',
      fixes: [
        'Ungrip your hands (open palms / wrists only) so arms cannot pull',
        'Adjust seat 1 notch so machine pivot matches your joint center',
        'Drop load 1 step and initiate strictly from the target muscle',
      ],
      pinCue: 'Open hands · Zero arm pull · Align pivot',
      suggestDropLoad: true,
      swapId: machine.movement === 'core' ? 'm_abs_mat' : null,
    };
  }

  if (q.includes('forearm') || q.includes('grip') || q.includes('finger')) {
    return {
      id: 'gen_grip',
      chip: 'Grip / forearms limiting set',
      cause: 'Squeezing handles tightly fatigues finger flexors before larger prime movers — common after climbing.',
      fixes: [
        'Use a relaxed thumbless hook on pulling handles (or open palm on presses)',
        'Keep wrists neutral, not curled inward',
      ],
      pinCue: 'Relaxed hook grip · Neutral wrists',
      suggestDropLoad: false,
      swapId: null,
    };
  }

  if (q.includes('neck') || q.includes('trap')) {
    return {
      id: 'gen_neck_traps',
      chip: 'Neck / upper traps tensing',
      cause: 'Shrugging shoulders toward ears or craning head forward under load.',
      fixes: [
        'Raise seat 1 notch to lower the line of pull/push',
        'Pack shoulder blades down ("put shoulders in back pockets") & tuck chin',
      ],
      pinCue: 'Shoulders down · Chin tucked · Seat +1',
      suggestDropLoad: true,
      swapId: null,
    };
  }

  if (q.includes('back') || q.includes('lumbar') || q.includes('arch')) {
    return {
      id: 'gen_lumbar',
      chip: 'Lower back compensation',
      cause: 'Pelvis tilting / spine extending when load exceeds local stabilization.',
      fixes: [
        'Exhale to lock ribcage down over pelvis before rep 1',
        'Pull hips/chest firmly into machine pad using side handles',
      ],
      pinCue: 'Ribs down · Brace into pad',
      suggestDropLoad: true,
      swapId: null,
    };
  }

  if (q.includes('tall') || q.includes('short') || q.includes('seat') || q.includes('fit') || q.includes('lever')) {
    return {
      id: 'gen_fit',
      chip: 'Machine fit / leverage feels off',
      cause: 'Joint center is misaligned with the machine’s red cam axis.',
      fixes: [
        `Check pivot rule: ${guide.pivot}`,
        'Adjust roller/pad so force presses near wrist or ankle, not across a joint',
      ],
      pinCue: guide.pivot,
      suggestDropLoad: false,
      swapId: null,
    };
  }

  // Fallback smart response tailored to the machine
  return {
    id: 'gen_custom',
    chip: 'Form adjustment',
    cause: `Compensation usually means load or seat alignment is shifting torque away from ${guide.feel.toLowerCase()}.`,
    fixes: [
      guide.steps[0],
      `Focus on feeling ${guide.feel.toLowerCase()} with a 1s pause at peak contraction`,
      'Drop 1 plate/pin for 1 clean set to lock in the groove',
    ],
    pinCue: `${guide.steps[2] || 'Slow tempo · 1s peak pause'}`,
    suggestDropLoad: true,
    swapId: null,
  };
}

/**
 * Distinct schematic machine + posture + motion-arrow SVG for every station,
 * designed to make each physical machine immediately recognizable on the gym floor.
 */
export function renderFormDiagramSvg(machine) {
  const id = machine?.id || '';
  let art = '';

  switch (id) {
    case 'm_leg_press':
      art = `
        <path d="M24 84 L62 90 M62 90 L46 52" stroke="var(--border-strong)" stroke-width="5" stroke-linecap="round"/>
        <line x1="126" y1="26" x2="148" y2="76" stroke="var(--text-muted)" stroke-width="6" stroke-linecap="round"/>
        <line x1="138" y1="52" x2="168" y2="40" stroke="var(--border-strong)" stroke-width="4"/>
        <path d="M54 58 L64 84 L96 58 L134 54" fill="none" stroke="var(--text)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="49" cy="44" r="7.5" fill="var(--text)"/>
        <circle cx="96" cy="58" r="5" fill="var(--accent)"/>
        <path d="M104 38 L128 28 M122 25 L129 28 L125 35" fill="none" stroke="var(--success)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      break;

    case 'm_leg_ext':
      art = `
        <path d="M52 28 L52 68 L96 68 L96 94 M62 68 L62 94" fill="none" stroke="var(--border-strong)" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M62 34 L62 64 L100 64 L138 46" fill="none" stroke="var(--text)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="62" cy="21" r="7.5" fill="var(--text)"/>
        <circle cx="100" cy="64" r="5" fill="var(--accent)"/>
        <circle cx="136" cy="43" r="4.5" fill="var(--warning)"/>
        <path d="M126 74 Q144 62 144 42 M139 46 L144 40 L149 46" fill="none" stroke="var(--success)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      break;

    case 'm_leg_curl':
      art = `
        <path d="M52 28 L52 66 L96 66 L96 94 M62 66 L62 94" fill="none" stroke="var(--border-strong)" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="78" y1="56" x2="98" y2="56" stroke="var(--warning)" stroke-width="5" stroke-linecap="round"/>
        <path d="M62 34 L62 63 L102 63 L92 92" fill="none" stroke="var(--text)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="62" cy="21" r="7.5" fill="var(--text)"/>
        <circle cx="102" cy="63" r="5" fill="var(--accent)"/>
        <circle cx="96" cy="89" r="4.5" fill="var(--warning)"/>
        <path d="M128 68 Q122 88 102 92 M107 87 L100 92 L107 96" fill="none" stroke="var(--success)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      break;

    case 'm_hip_thrust':
      art = `
        <rect x="28" y="56" width="28" height="32" rx="5" fill="none" stroke="var(--border-strong)" stroke-width="4"/>
        <line x1="20" y1="88" x2="156" y2="88" stroke="var(--border-strong)" stroke-width="3"/>
        <path d="M48 56 L92 56 L124 56 L124 88" fill="none" stroke="var(--text)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="38" cy="48" r="7.5" fill="var(--text)"/>
        <rect x="85" y="48" width="14" height="10" rx="3" fill="var(--accent)"/>
        <path d="M92 42 L92 22 M86 28 L92 21 L98 28" fill="none" stroke="var(--success)" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      break;

    case 'm_calf':
      art = `
        <path d="M44 66 L86 66 L86 92 M116 88 L144 88" fill="none" stroke="var(--border-strong)" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="88" y1="54" x2="108" y2="54" stroke="var(--warning)" stroke-width="5" stroke-linecap="round"/>
        <path d="M56 32 L56 62 L102 62 L122 86" fill="none" stroke="var(--text)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="56" cy="20" r="7.5" fill="var(--text)"/>
        <circle cx="118" cy="82" r="4.5" fill="var(--accent)"/>
        <path d="M138 80 L138 56 M133 62 L138 55 L143 62" fill="none" stroke="var(--success)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      break;

    case 'm_lat_pull':
      art = `
        <path d="M88 8 L88 26 M58 26 L118 26" fill="none" stroke="var(--text-muted)" stroke-width="4" stroke-linecap="round"/>
        <line x1="72" y1="68" x2="104" y2="68" stroke="var(--warning)" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M64 26 L76 48 L88 86 M112 26 L100 48 L88 86" fill="none" stroke="var(--text)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="88" cy="40" r="7.5" fill="var(--text)"/>
        <circle cx="76" cy="48" r="4.5" fill="var(--accent)"/>
        <circle cx="100" cy="48" r="4.5" fill="var(--accent)"/>
        <path d="M134 30 L134 58 M129 52 L134 59 L139 52" fill="none" stroke="var(--success)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      break;

    case 'm_pullup':
      art = `
        <rect x="28" y="18" width="16" height="72" rx="3" fill="none" stroke="var(--border-strong)" stroke-width="3.5"/>
        <path d="M36 18 L84 12 L84 30" fill="none" stroke="var(--text-muted)" stroke-width="2.5" stroke-dasharray="4 3"/>
        <path d="M78 28 L84 34 L90 28" fill="none" stroke="var(--warning)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="80" cy="64" r="5" fill="var(--warning)"/>
        <path d="M72 72 L104 72 L104 92" fill="none" stroke="var(--border-strong)" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M84 34 L94 48 L96 70 L72 70 L68 90" fill="none" stroke="var(--text)" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="102" cy="36" r="7.5" fill="var(--text)"/>
        <circle cx="94" cy="48" r="4.5" fill="var(--accent)"/>
        <path d="M132 28 L132 58 M127 52 L132 59 L137 52" fill="none" stroke="var(--success)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      break;

    case 'm_low_row':
      art = `
        <rect x="30" y="24" width="16" height="66" rx="3" fill="none" stroke="var(--border-strong)" stroke-width="3.5"/>
        <line x1="46" y1="50" x2="94" y2="50" stroke="var(--text-muted)" stroke-width="2.5" stroke-dasharray="4 3"/>
        <line x1="94" y1="42" x2="94" y2="62" stroke="var(--warning)" stroke-width="5" stroke-linecap="round"/>
        <path d="M106 36 L106 70 L78 88 M94 50 L118 54" fill="none" stroke="var(--text)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="106" cy="22" r="7.5" fill="var(--text)"/>
        <circle cx="116" cy="54" r="4.5" fill="var(--accent)"/>
        <path d="M122 38 L144 38 M138 33 L145 38 L138 43" fill="none" stroke="var(--success)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      break;

    case 'm_cable_pull':
      art = `
        <line x1="34" y1="14" x2="34" y2="92" stroke="var(--border-strong)" stroke-width="5" stroke-linecap="round"/>
        <circle cx="38" cy="26" r="4.5" fill="var(--warning)"/>
        <line x1="42" y1="26" x2="96" y2="30" stroke="var(--text-muted)" stroke-width="2.5" stroke-dasharray="4 3"/>
        <path d="M114 34 L114 66 L100 90 M114 66 L128 90 M96 30 L122 36" fill="none" stroke="var(--text)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="114" cy="22" r="7.5" fill="var(--text)"/>
        <circle cx="122" cy="36" r="4.5" fill="var(--accent)"/>
        <path d="M90 44 L112 44 M106 39 L113 44 L106 49" fill="none" stroke="var(--success)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      break;

    case 'm_smith_incline':
      art = `
        <line x1="92" y1="12" x2="108" y2="92" stroke="var(--border-strong)" stroke-width="4" stroke-dasharray="5 3"/>
        <line x1="52" y1="84" x2="104" y2="50" stroke="var(--border-strong)" stroke-width="5" stroke-linecap="round"/>
        <path d="M64 76 L96 54 L126 78 M92 56 L98 32" fill="none" stroke="var(--text)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="104" cy="42" r="7.5" fill="var(--text)"/>
        <circle cx="98" cy="30" r="5" fill="var(--accent)"/>
        <path d="M114 40 L126 18 M120 21 L126 17 L129 24" fill="none" stroke="var(--success)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      break;

    case 'm_chest_press':
      art = `
        <path d="M52 24 L52 70 L88 70 L88 92" fill="none" stroke="var(--border-strong)" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M64 34 L64 66 L96 66 L108 90 M64 44 L108 44" fill="none" stroke="var(--text)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="64" cy="21" r="7.5" fill="var(--text)"/>
        <circle cx="64" cy="44" r="4.5" fill="var(--accent)"/>
        <path d="M114 44 L142 44 M136 39 L143 44 L136 49" fill="none" stroke="var(--success)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      break;

    case 'm_butterfly':
      art = `
        <circle cx="88" cy="26" r="7.5" fill="var(--text)"/>
        <line x1="88" y1="36" x2="88" y2="82" stroke="var(--text)" stroke-width="5.5" stroke-linecap="round"/>
        <path d="M44 46 Q56 62 88 50 Q120 62 132 46" fill="none" stroke="var(--text)" stroke-width="5" stroke-linecap="round"/>
        <circle cx="68" cy="48" r="4.5" fill="var(--accent)"/>
        <circle cx="108" cy="48" r="4.5" fill="var(--accent)"/>
        <path d="M46 70 Q66 78 80 72 M75 68 L81 72 L76 77" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M130 70 Q110 78 96 72 M101 68 L95 72 L100 77" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round"/>
      `;
      break;

    case 'm_ab_crunch':
      art = `
        <path d="M56 30 L56 70 L94 70 L94 92" fill="none" stroke="var(--border-strong)" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M68 68 Q68 42 88 34 M68 68 L100 68 L108 90" fill="none" stroke="var(--text)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="94" cy="24" r="7.5" fill="var(--text)"/>
        <circle cx="72" cy="52" r="5" fill="var(--accent)"/>
        <path d="M114 32 Q126 48 112 62 M112 55 L111 63 L119 61" fill="none" stroke="var(--success)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      break;

    case 'm_abs_mat':
      art = `
        <line x1="20" y1="86" x2="156" y2="86" stroke="var(--border-strong)" stroke-width="4" stroke-linecap="round"/>
        <path d="M46 78 L94 80 L138 48" fill="none" stroke="var(--text)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="34" cy="72" r="7.5" fill="var(--text)"/>
        <circle cx="88" cy="80" r="5" fill="var(--accent)"/>
        <path d="M136 38 Q148 54 146 72 M141 67 L146 73 L151 67" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      break;

    case 'm_lower_back':
      art = `
        <path d="M58 68 L98 68 L98 92 M122 86 L142 86" fill="none" stroke="var(--border-strong)" stroke-width="4.5" stroke-linecap="round"/>
        <circle cx="62" cy="38" r="5" fill="var(--warning)"/>
        <path d="M68 34 L82 66 L116 66 L128 86" fill="none" stroke="var(--text)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="64" cy="21" r="7.5" fill="var(--text)"/>
        <circle cx="82" cy="66" r="5" fill="var(--accent)"/>
        <path d="M92 26 Q74 22 60 28 M65 23 L59 29 L67 31" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      break;

    case 'c_climbmill':
      art = `
        <path d="M36 90 L64 90 L64 72 L92 72 L92 54 L120 54 L120 36 L144 36" fill="none" stroke="var(--border-strong)" stroke-width="4" stroke-linejoin="round"/>
        <path d="M88 26 L86 48 L74 70 M86 48 L102 54" fill="none" stroke="var(--text)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="90" cy="15" r="7" fill="var(--text)"/>
      `;
      break;

    case 'c_rower':
      art = `
        <line x1="28" y1="78" x2="144" y2="78" stroke="var(--border-strong)" stroke-width="4" stroke-linecap="round"/>
        <circle cx="40" cy="64" r="12" fill="none" stroke="var(--border-strong)" stroke-width="4"/>
        <line x1="52" y1="58" x2="96" y2="56" stroke="var(--text-muted)" stroke-width="2.5"/>
        <path d="M110 40 L102 68 L68 74 M96 56 L108 54" fill="none" stroke="var(--text)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="112" cy="28" r="7" fill="var(--text)"/>
      `;
      break;

    case 'c_bike':
      art = `
        <circle cx="54" cy="74" r="15" fill="none" stroke="var(--border-strong)" stroke-width="4"/>
        <circle cx="122" cy="74" r="15" fill="none" stroke="var(--border-strong)" stroke-width="4"/>
        <path d="M76 34 L68 58 L88 74 M76 34 L106 46" fill="none" stroke="var(--text)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="80" cy="22" r="7" fill="var(--text)"/>
      `;
      break;

    default:
      art = `
        <line x1="32" y1="86" x2="144" y2="82" stroke="var(--border-strong)" stroke-width="5" stroke-linecap="round"/>
        <path d="M88 28 L84 54 L68 80 M84 54 L104 76 M72 44 L102 40" fill="none" stroke="var(--text)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="90" cy="17" r="7" fill="var(--text)"/>
      `;
      break;
  }

  return `
    <svg viewBox="0 0 172 100" class="form-diagram-svg" aria-hidden="true">
      ${art}
    </svg>
  `;
}
