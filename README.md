# Weights — Manegg Motion AI Training Coach

An interactive, offline-first gym coach web app tailored to your Manegg Motion training circuit, with live **Google Fitbit Air** heart-rate integration.

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

- **AI-Assisted Guided Coach View**: Shows one station at a time with exact weight / plate loading, seat & bench setup notes, target sets/reps, and rest duration.
- **Post-Set Rep Check-In & Adaptive Progression**: After each set, log whether you managed fewer, exact, or more reps (plus effort). Finishing an exercise automatically adjusts your next session's weight, reps, or rest duration.
- **Interactive Gym-Floor Flexibility**: Tap **Busy** to defer an occupied machine, **Swap** for an alternative, **Skip Today**, toggle body groups, or tell the coach directly (`"skip arms"`, `"lat pulldown busy"`, `"too heavy"`, `"switch to stairs"`, `"2 sets"`).
- **Google Fitbit Air Live Data (BLE `0x180D`) + Google Health API v4**:
  - Streams live 1-second BPM directly over **Web Bluetooth** (standard BLE Heart Rate Profile `0x180D` / `0x2A37`), displaying Karvonen HR zones, a live waveform, estimated kcal, HR-guided rest recovery alerts, and avg/peak BPM in workout history.
  - **One-time setup on your phone:** Open the **Google Health** app → **Connections / Devices** → **Google Fitbit Air** → **Share heart rate** → turn on **Always visible**. Then open Weights in **Chrome** (Android/Desktop) or **Bluefy** (iOS) and tap **Fitbit Air** in the top bar.
  - Optional **Google Health API v4** (`health.googleapis.com/v4`) sync for daily Resting HR, HRV, and steps using your own Google Cloud OAuth Client ID.
- **Drift-Free Rest Timer**: Wall-clock countdown with `-15s`/`+15s`, overtime indicator, Web Audio chimes, vibration, and Screen Wake Lock.

## Running Locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` or host directly on **GitHub Pages** (HTTPS is required by browsers for Web Bluetooth).
