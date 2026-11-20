# Weights — AI-First Strength & Cardio Coach

A full-screen, science-backed AI gym coach designed for **Manegg Motion** with a schematic 2D floor plan, multi-week mesocycle periodization, live intra-session adaptation, **Garmin Venu 4s / Fitbit Air** BLE heart-rate autoregulation, and **Partner Co-Location Mode**.

## Core Capabilities

- **Goal-Driven Periodization**:
  - **Max Strength · Climber** (`82–90% 1RM`, `3–5` compound reps, `RIR 1–2` velocity cutoff for neural force without hypertrophy mass bloat, `150–180s` ATP-PCr rest floor, warm-up ramp sets).
  - **Target Body Parts** (`Glutes / Butt`, `Core`, `Back & Pull`, `Quads`, `Chest & Shoulders`), **Weight Loss & Conditioning**, and **Muscle Growth**.
  - **Polarized Cardiovascular Health**: Combines steady **Zone 2** (`60–70% HRR`) aerobic base blocks with weekly **VO₂max `4×3m`** (`Z4`) intervals.
- **Persistent 4-Week Mesocycle & Readiness**:
  - Cycles **Base → Build → Peak → Deload** across sessions instead of starting from scratch.
  - Factors in days since last session, previous working weights (`e1RM`), and morning/live **RHR & HRV (RMSSD)** to rotate splits (`Pull + Posterior`, `Legs + Push`, `Force + VO₂max`, `Cardio + Core`) and autoregulate load.
- **2D Floor Plan & Live Intra-Session Adaptation**:
  - Interactive **Manegg Motion** schematic floor plan (`Zones A–E`, 19 stations, draggable pin calibration).
  - Step-by-step directives: Warm-up → Walk distance & Zone → Machine setup → Load & Reps → 1-tap Effort check-in (`Easy` adds load on remaining sets *today*; `Hard` drops load and extends rest).
  - **Busy**: Routes to the nearest compatible open station on the floor plan and re-queues the occupied machine next.
  - **Pain**: 1-tap joint protection (`Fingers`, `Shoulder`, `Lower Back`, `Knee`) swaps high-stress stations for joint-safe alternatives across the rest of the workout.
- **Science-Backed HR Rest Brake (`Garmin Venu 4s` & `Fitbit Air`)**:
  - Enforces a local-muscle `ATP-PCr` minimum rest floor and uses live BLE heart rate (`0x180D`) as an asymmetric ceiling — ignoring the first `15s` of wrist optical lag and adding `+15s` blocks if HR remains above `60% HRR` at `0:00`.
- **Partner Co-Location Mode**:
  - Pairs two athletes with different goals onto nearby stations (`~3–7m` apart) with matched block durations so both finish together.

## Running Locally

```bash
python3 -m http.server 8080
```
