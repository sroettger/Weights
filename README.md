# Weights — Manegg Motion AI Training Coach

An interactive, offline-first gym coach web app tailored to your Manegg Motion training circuit, with live **Garmin Venu 4s** and **Google Fitbit Air** heart-rate integration.

## Pre-Loaded Manegg Motion Circuit

1. **Calf Raise (Wadenheben)** — 5 kg plates per side
2. **Beinstrecker (Leg Extension)** — Matrix pin stack
3. **Beinpresse (Leg Press)** — 10 kg plates per side
4. **Lower Back (Rückenstrecker)** — Matrix pin stack
5. **Abs on Yoga Mat** — Bodyweight core
6. **Low Row (Seated Row)** — Matrix pin stack
7. **Lat Pulldown (Latzug)** — Matrix pin stack
8. **Smith Machine Incline Press** — Angled bench, plates per side
9. **Butterfly (Pec Deck)** — Matrix pin stack
10. **Cardio Finisher** — Toggle between Matrix Onyx Treadmill (Running) and Onyx ClimbMill (Stairs)

## Features

- **Full-Screen Coach View**: One active station at a time with exact weight / plate loading, seat & bench setup specs, target sets/reps, and rest duration.
- **Post-Set Rep Check-In & Adaptive Progression**: After each set, log actual reps. Finishing an exercise automatically adjusts next session's weight, reps, or rest duration.
- **Interactive Gym-Floor Flexibility**: Tap **Busy** to defer an occupied machine, **Swap** for an alternative, **Skip**, or open **Plan** for **Skip Arms**, group filters, and quick commands (`"skip arms"`, `"lat pulldown busy"`, `"too heavy"`, `"switch to stairs"`, `"2 sets"`).
- **Garmin Venu 4s & Google Fitbit Air Live Data (BLE `0x180D`)**:
  - Streams live 1-second BPM (plus battery % and RR-interval HRV when broadcast) directly over **Web Bluetooth** (standard BLE Heart Rate Profile `0x180D` / `0x2A37`), displaying Karvonen HR zones, a live waveform, estimated kcal, HR-guided rest recovery, and avg/peak BPM in workout history.
  - **Garmin Venu 4s setup**: On watch, open **Settings → Health & Wellness → Wrist Heart Rate → Broadcast Heart Rate** (or **Controls** menu; or auto-enable under **Strength Settings → Broadcast Heart Rate → On**).
  - **Google Fitbit Air setup**: In **Google Health** app → **Devices** → **Fitbit Air** → **Share heart rate** → **Always visible**. Optional **Google Health API v4** sync for daily RHR & HRV.
  - Open in **Chrome** (Android/Desktop) or **Bluefy** (iOS) and tap the watch pill in the top bar.
- **Drift-Free Rest Timer**: Wall-clock countdown with `-15s`/`+15s`, overtime indicator, Web Audio chimes, vibration, and Screen Wake Lock.

## Running Locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` or host directly on **GitHub Pages** (HTTPS is required by browsers for Web Bluetooth).
