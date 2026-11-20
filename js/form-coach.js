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
    pivot: 'Active hang (ears clear of shoulders before pulling)',
    steps: [
      'Set knee/foot pad counterweight (or dip belt) cleanly',
      'Neutral handles reduce elbow/shoulder strain for climbers',
      'Pull chest to bar; 2s controlled descent to full hang',
    ],
    feel: 'Lats, upper back & core tension',
    avoid: 'Medial elbow ache or half-reps at bottom',
    issues: [
      {
        id: 'elbow_golfer',
        chip: 'Inner elbow / forearm ache',
        keywords: ['elbow', 'forearm', 'tendon', 'golfer', 'finger'],
        cause: 'Supinated/pronated bar torque overloading flexor-pronator origin.',
        fixes: [
          'Switch immediately to neutral (parallel) grip handles',
          'Stop 1–2 cm shy of violent dead-hang bounce at bottom',
        ],
        pinCue: 'Neutral parallel grip · Smooth bottom transition',
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
 * Schematic biomechanical SVG showing body posture, joint pivot dot (orange), and force arrow (green).
 */
export function renderFormDiagramSvg(machine) {
  const mov = machine.movement;

  // Compact 220x110 schematic vector diagrams grouped by biomechanics
  let art = '';
  if (mov === 'core') {
    if (machine.id === 'm_abs_mat') {
      art = `
        <line x1="20" y1="88" x2="200" y2="88" stroke="var(--border-strong)" stroke-width="3"/>
        <path d="M55 82 Q105 85 135 82 L178 52" fill="none" stroke="var(--text)" stroke-width="5" stroke-linecap="round"/>
        <circle cx="44" cy="76" r="8" fill="var(--text)"/>
        <circle cx="110" cy="83" r="5" fill="var(--accent)"/>
        <path d="M110 68 L110 80" stroke="var(--success)" stroke-width="2.5" marker-end="url(#arr)"/>
        <text x="112" y="62" class="fd-lbl">Glue lumbar</text>
      `;
    } else {
      art = `
        <path d="M75 95 L75 65 L105 65" fill="none" stroke="var(--border-strong)" stroke-width="4"/>
        <path d="M98 92 L98 66 Q98 44 114 38" fill="none" stroke="var(--text)" stroke-width="5" stroke-linecap="round"/>
        <circle cx="118" cy="26" r="8" fill="var(--text)"/>
        <circle cx="98" cy="52" r="5.5" fill="var(--accent)"/>
        <path d="M128 36 Q138 52 122 64" fill="none" stroke="var(--success)" stroke-width="2.5"/>
        <text x="136" y="52" class="fd-lbl">Curl ribs (no arm pull)</text>
      `;
    }
  } else if (mov === 'vert_pull') {
    art = `
      <line x1="110" y1="10" x2="110" y2="32" stroke="var(--border-strong)" stroke-width="3"/>
      <line x1="78" y1="30" x2="142" y2="30" stroke="var(--text-secondary)" stroke-width="4" stroke-linecap="round"/>
      <path d="M84 30 L96 52 L110 86 M136 30 L124 52 L110 86" fill="none" stroke="var(--text)" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="110" cy="44" r="7.5" fill="var(--text)"/>
      <circle cx="98" cy="52" r="5" fill="var(--accent)"/>
      <circle cx="122" cy="52" r="5" fill="var(--accent)"/>
      <path d="M72 44 L72 68" stroke="var(--success)" stroke-width="2.5"/>
      <text x="142" y="64" class="fd-lbl">Elbows down</text>
    `;
  } else if (mov === 'horiz_pull' || mov === 'scapular') {
    art = `
      <line x1="40" y1="54" x2="96" y2="54" stroke="var(--border-strong)" stroke-width="3" stroke-dasharray="4 3"/>
      <path d="M122 92 L122 46 M96 54 L132 58" fill="none" stroke="var(--text)" stroke-width="5" stroke-linecap="round"/>
      <circle cx="122" cy="33" r="8" fill="var(--text)"/>
      <circle cx="122" cy="52" r="5" fill="var(--accent)"/>
      <path d="M88 68 L134 68" stroke="var(--success)" stroke-width="2.5"/>
      <text x="138" y="56" class="fd-lbl">Squeeze blades</text>
    `;
  } else if (mov === 'squat') {
    art = `
      <line x1="48" y1="86" x2="92" y2="92" stroke="var(--border-strong)" stroke-width="5" stroke-linecap="round"/>
      <line x1="148" y1="30" x2="168" y2="74" stroke="var(--border-strong)" stroke-width="5" stroke-linecap="round"/>
      <path d="M62 82 L88 88 L116 54 L154 68" fill="none" stroke="var(--text)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="54" cy="70" r="7.5" fill="var(--text)"/>
      <circle cx="88" cy="88" r="5" fill="var(--accent)"/>
      <circle cx="116" cy="54" r="5" fill="var(--accent)"/>
      <path d="M124 44 L152 32" stroke="var(--success)" stroke-width="2.5"/>
      <text x="95" y="26" class="fd-lbl">Drive full foot</text>
    `;
  } else if (mov === 'knee_ext' || mov === 'knee_flex') {
    art = `
      <path d="M72 34 L72 68 L116 68" fill="none" stroke="var(--border-strong)" stroke-width="5" stroke-linecap="round"/>
      <path d="M78 40 L78 66 L118 66 L${mov === 'knee_ext' ? '156 54' : '112 94'}" fill="none" stroke="var(--text)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="78" cy="27" r="7.5" fill="var(--text)"/>
      <circle cx="118" cy="66" r="5.5" fill="var(--accent)"/>
      <text x="128" y="42" class="fd-lbl">Match knee to pivot</text>
    `;
  } else if (mov === 'horiz_push' || mov === 'pec_fly') {
    art = `
      <line x1="58" y1="86" x2="108" y2="48" stroke="var(--border-strong)" stroke-width="5" stroke-linecap="round"/>
      <path d="M72 76 L104 52 L142 32" fill="none" stroke="var(--text)" stroke-width="5" stroke-linecap="round"/>
      <circle cx="110" cy="40" r="7.5" fill="var(--text)"/>
      <circle cx="102" cy="53" r="5" fill="var(--accent)"/>
      <path d="M118 56 L148 38" stroke="var(--success)" stroke-width="2.5"/>
      <text x="126" y="76" class="fd-lbl">Blades pinned · 45° elbow</text>
    `;
  } else {
    art = `
      <path d="M90 90 L106 58 L112 34" fill="none" stroke="var(--text)" stroke-width="5" stroke-linecap="round"/>
      <circle cx="114" cy="22" r="7.5" fill="var(--text)"/>
      <circle cx="106" cy="58" r="5.5" fill="var(--accent)"/>
      <text x="126" y="58" class="fd-lbl">Tall neutral posture</text>
    `;
  }

  return `
    <svg viewBox="0 0 230 104" class="form-diagram-svg" aria-hidden="true">
      <style>
        .fd-lbl { fill: var(--text-secondary); font-size: 9.5px; font-weight: 700; }
      </style>
      ${art}
    </svg>
  `;
}
