/**
 * Weights — Crisp Zero-Prose AI Coach Renderers
 */

import {
  GYM_MACHINES,
  getMachineById,
  renderFloorPlanSvg,
} from './floor.js';
import {
  GOAL_PROFILES,
  CARDIO_PROFILES,
  FOCUS_AREAS,
  PAIN_LOCATIONS,
  MESOCYCLE_WEEKS,
  formatLoad,
  formatDurationShort,
  formatRelativeDays,
} from './science.js';
import {
  SPLIT_TEMPLATES,
  getActiveStep,
  getCurrentSetInfo,
} from './planner.js';
import {
  getMachineGuide,
  diagnoseMachineIssue,
  renderFormDiagramSvg,
} from './form-coach.js';
import { WEARABLE_PRESETS } from './wearable.js';

export function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatClock(sec) {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export function renderLiveHrStrip(wearableSnap, hrBand = null) {
  const isLive = wearableSnap.status === 'connected' || wearableSnap.status === 'simulating';
  if (!isLive) return '';

  const bpm = wearableSnap.bpm;
  let cue = `Z${wearableSnap.zone.decimal || 0} · ${wearableSnap.zone.label}`;
  if (bpm && hrBand) {
    if (bpm < hrBand.min) cue = `Target ${hrBand.min}–${hrBand.max} · +Pace`;
    else if (bpm > hrBand.max) cue = `Target ${hrBand.min}–${hrBand.max} · Ease pace`;
    else cue = `In zone (${hrBand.min}–${hrBand.max})`;
  }

  let waveSvg = '';
  const samples = wearableSnap.samples || [];
  if (samples.length >= 2) {
    const vals = samples.map((x) => x.bpm);
    const min = Math.min(...vals, 80);
    const max = Math.max(...vals, 155);
    const span = max - min || 1;
    const pts = vals
      .map(
        (v, i) =>
          `${(2 + (i / Math.max(1, vals.length - 1)) * 74).toFixed(1)},${(
            20 -
            ((v - min) / span) * 16
          ).toFixed(1)}`
      )
      .join(' ');
    const [lx, ly] = pts.split(' ').pop().split(',');
    waveSvg = `<svg width="78" height="22" viewBox="0 0 78 22" aria-hidden="true"><polyline fill="none" stroke="${wearableSnap.zone.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${pts}" /><circle cx="${lx}" cy="${ly}" r="2.5" fill="${wearableSnap.zone.color}" /></svg>`;
  }

  return `
    <button type="button" class="live-hr-strip" data-action="open-wearable-modal">
      <span class="live-hr-left">
        <span class="live-hr-bpm" style="color:${wearableSnap.zone.color};">${bpm ?? '--'}</span>
        <span class="live-hr-zone">bpm · ${esc(cue)}</span>
      </span>
      ${waveSvg}
    </button>
  `;
}

export function renderCoachStage(state, session, timerSnap, wearableSnap, checkinDraft) {
  if (!session) return '';

  if (session.phase === 'briefing') {
    return renderBriefingStage(state, session, wearableSnap);
  }
  if (session.phase === 'summary') {
    return renderSummaryStage(state, session, wearableSnap);
  }
  if (session.phase === 'resting' && timerSnap.running) {
    return renderRestStage(state, session, timerSnap, wearableSnap);
  }
  return renderActiveStepStage(state, session, timerSnap, wearableSnap, checkinDraft);
}

function renderBriefingStage(state, session, wearableSnap) {
  const athlete = state.athlete;
  const goal = GOAL_PROFILES[athlete.goal] || GOAL_PROFILES.max_strength;
  const routeIds = session.steps.map((s) => s.stationId);
  const rd = session.readiness;
  const rdClass = rd.tier === 'prime' || rd.tier === 'ready' ? 'is-prime' : 'is-warn';

  const splitBtns = Object.values(SPLIT_TEMPLATES)
    .map(
      (sp) => `
      <button type="button" class="seg-btn ${session.splitId === sp.id ? 'is-active' : ''}" data-action="select-split" data-split="${sp.id}">
        ${esc(sp.short)}
      </button>`
    )
    .join('');

  const durBtns = [30, 45, 60]
    .map(
      (m) => `
      <button type="button" class="seg-btn ${session.durationTargetMin === m ? 'is-active' : ''}" data-action="select-duration" data-min="${m}">
        ${m}m
      </button>`
    )
    .join('');

  const mapSvg = renderFloorPlanSvg({
    activeId: routeIds[0],
    routeIds,
    floorOverrides: state.floorOverrides,
  });

  return `
    <section class="stage">
      <div class="stage-top">
        <span class="step-crumb">Week ${session.mesoWeek} · ${esc(session.mesoName)} · Day ${athlete.mesocycle.sessionInWeek}/${athlete.daysPerWeek}</span>
        <button type="button" class="chip ${rdClass}" data-action="open-goal-modal">${esc(rd.label)} · ${esc(rd.summary)}</button>
      </div>

      <div class="stage-body">
        <div>
          <h2 class="station-title">${esc(session.splitName)}</h2>
          <p class="station-setup">${esc(session.splitReason)} · ${esc(goal.short)}</p>
        </div>

        <div class="seg-row" aria-label="Session focus">${splitBtns}</div>

        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div class="seg-row">${durBtns}</div>
          <button type="button" class="seg-btn ${state.partner.enabled ? 'is-active' : ''}" data-action="toggle-partner-quick">
            ${state.partner.enabled ? `👥 + ${esc(state.partner.name)}` : '+ Partner'}
          </button>
        </div>

        <div class="floor-card" data-action="open-floor-modal" style="cursor:pointer;">
          ${mapSvg}
        </div>

        <div id="live-hr-mount">${renderLiveHrStrip(wearableSnap)}</div>
      </div>

      <div class="stage-bottom">
        <button type="button" id="start-session-btn" class="btn btn-primary cta-giant" data-action="start-session">
          Start Session · ${session.estimatedMin} min (${session.steps.length} blocks)
        </button>
      </div>
    </section>
  `;
}

function renderActiveStepStage(state, session, timerSnap, wearableSnap, checkinDraft) {
  const step = getActiveStep(session);
  if (!step) return '';
  const machine = getMachineById(step.stationId);
  const unit = state.settings.unit;
  const stepNum = session.currentStepIndex + 1;
  const totalSteps = session.steps.length;

  const partnerHtml = step.partner
    ? `
      <div class="partner-strip">
        <span>👥 ${esc(step.partner.name)}: <strong>${esc(step.partner.stationName)}</strong> · ${esc(step.partner.prescription)}</span>
        <span class="partner-strip-meta">${step.partner.distanceM}m</span>
      </div>
    `
    : '';

  const guide = getMachineGuide(machine.id);
  const isNewStation =
    !state.athlete.lifts?.[machine.id] &&
    !state.athlete.formNotes?.[machine.id]?.seenGuide;

  // Timed Guided Block (Warm-up or Cardio)
  if (step.type === 'warmup' || step.type === 'cardio') {
    const isRunningThis = timerSnap.running && timerSnap.mode === step.type;
    const displaySec = isRunningThis ? timerSnap.remainingSec : step.durationSec;
    const band = step.hrBand;

    return `
      <section class="stage">
        <div class="stage-top">
          <span class="step-crumb">Block ${stepNum}/${totalSteps} · Zone ${esc(step.zoneCode)}</span>
          ${
            step.walkMeters > 0
              ? `<button type="button" class="walk-pill is-accent" data-action="open-floor-modal">Walk ${step.walkMeters}m · Map</button>`
              : `<button type="button" class="walk-pill" data-action="open-floor-modal">Zone ${esc(step.zoneCode)} · Map</button>`
          }
        </div>

        <div class="stage-body">
          <div class="station-head-row">
            <div>
              <h2 class="station-title">${esc(machine.name)}</h2>
              <p class="station-setup">${esc(step.setup)}</p>
            </div>
            <button type="button" class="howto-pill" data-action="open-form-modal" data-tab="guide">How to Use</button>
          </div>

          <div class="hero-panel is-rest">
            <span class="hero-value">${formatClock(displaySec)}</span>
            <span class="hero-sub">${
              step.type === 'warmup'
                ? `Warm-up · ${band.min}–${band.max} bpm`
                : step.protocol === 'vo2_4x3'
                ? `VO₂max 4×3m · ${band.min}–${band.max} bpm`
                : `Zone 2 · ${band.min}–${band.max} bpm`
            }</span>
            ${
              isRunningThis
                ? `<div class="rest-progress-track"><div class="rest-progress-fill" style="width:${Math.round(timerSnap.progress * 100)}%;"></div></div>`
                : ''
            }
          </div>

          <div class="cue-line">
            <span>${esc(step.cue)}</span>
          </div>

          ${partnerHtml}
          <div id="live-hr-mount">${renderLiveHrStrip(wearableSnap, band)}</div>
        </div>

        <div class="stage-bottom">
          ${
            isRunningThis
              ? `
              <div class="rest-controls-row">
                <button type="button" class="btn btn-secondary" data-action="timer-adjust" data-delta="-60">-1m</button>
                <button type="button" class="btn btn-success cta-giant" data-action="complete-timed-step">Done · Next</button>
                <button type="button" class="btn btn-secondary" data-action="timer-adjust" data-delta="60">+1m</button>
              </div>
            `
              : `
              <button type="button" class="btn btn-primary cta-giant" data-action="start-timed-step">
                Start ${formatClock(step.durationSec)}
              </button>
            `
          }
          <div class="quiet-actions">
            <button type="button" class="quiet-btn" data-action="machine-busy">Busy</button>
            <button type="button" class="quiet-btn" data-action="open-form-modal" data-tab="fix">Form / Issue</button>
            <button type="button" class="quiet-btn" data-action="open-pain-modal">Pain</button>
            <button type="button" class="quiet-btn" data-action="complete-timed-step">Skip</button>
          </div>
        </div>
      </section>
    `;
  }

  // Strength Lift Station
  const info = getCurrentSetInfo(step);
  if (!info) return '';
  const curSet = info.set;
  const load = formatLoad(machine, curSet.weightKg, unit);
  const stepInc = machine.stepKg || 2.5;
  const workSets = step.sets.filter((s) => s.kind === 'work');

  const dotsHtml = workSets
    .map((ws, i) => {
      const cls = ws.done ? 'is-done' : !info.isWarmup && i + 1 === info.workNumber ? 'is-current' : '';
      return `<span class="set-dot ${cls}"></span>`;
    })
    .join('');

  const isCheckingIn = Boolean(checkinDraft.open && checkinDraft.stepId === step.id);
  const draftReps = isCheckingIn ? checkinDraft.reps : curSet.targetReps;
  const cueText = step.liveNote || step.cue;

  const firstTimeHtml =
    isNewStation && info.arrayIndex === 0 && !isCheckingIn
      ? `
      <div class="first-time-banner">
        <div>
          <strong>Before Set 1 · Machine Setup</strong>
          <span>${esc(guide.pivot)}</span>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" data-action="open-form-modal" data-tab="guide">Guide</button>
      </div>
    `
      : '';

  return `
    <section class="stage">
      <div class="stage-top">
        <span class="step-crumb">Block ${stepNum}/${totalSteps} · Zone ${esc(step.zoneCode)}</span>
        <button type="button" class="walk-pill ${step.walkMeters >= 5 ? 'is-accent' : ''}" data-action="open-floor-modal">
          ${step.walkMeters > 0 ? `Walk ${step.walkMeters}m · Map` : `Zone ${esc(step.zoneCode)} · Map`}
        </button>
      </div>

      <div class="stage-body">
        <div class="station-head-row">
          <div>
            <h2 class="station-title">${esc(machine.name)}</h2>
            <p class="station-setup">${esc(step.setup)}</p>
          </div>
          <button type="button" class="howto-pill ${isNewStation ? 'is-new' : ''}" data-action="open-form-modal" data-tab="guide">
            How to Use
          </button>
        </div>

        ${firstTimeHtml}

        <div class="hero-panel">
          ${
            machine.loadType !== 'bodyweight'
              ? `<button type="button" class="load-step-btn" data-action="nudge-load" data-delta="${-stepInc}" aria-label="Decrease weight">−</button>`
              : `<span style="width:48px;"></span>`
          }
          <div class="hero-center">
            <span class="hero-value">${esc(load.primary)}</span>
            <span class="hero-sub">${
              info.isWarmup
                ? `${esc(load.sub)} · 55% Warm-up Ramp`
                : step.pct1RM > 0
                ? `${esc(load.sub)} · ${Math.round(step.pct1RM * 100)}% 1RM`
                : esc(load.sub)
            }</span>
          </div>
          ${
            machine.loadType !== 'bodyweight'
              ? `<button type="button" class="load-step-btn" data-action="nudge-load" data-delta="${stepInc}" aria-label="Increase weight">+</button>`
              : `<span style="width:48px;"></span>`
          }
        </div>

        <div class="specs-grid-3">
          <div class="spec-tile">
            <span class="spec-tile-label">Set</span>
            <span class="spec-tile-val">${info.isWarmup ? 'Warmup' : `${info.workNumber} / ${info.totalWorkSets}`}</span>
            <div class="set-dots">${dotsHtml}</div>
          </div>
          <div class="spec-tile">
            <span class="spec-tile-label">Reps</span>
            <span class="spec-tile-val">${curSet.targetReps}</span>
            <span class="spec-tile-sub">${info.isWarmup ? 'Crisp speed' : `Stop @ RIR ${curSet.rir}`}</span>
          </div>
          <div class="spec-tile">
            <span class="spec-tile-label">Rest</span>
            <span class="spec-tile-val">${formatDurationShort(curSet.restSec)}</span>
            <span class="spec-tile-sub">${state.settings.hrAutoExtendRest ? 'PCr + HR' : 'Fixed'}</span>
          </div>
        </div>

        <div class="cue-line ${step.liveNote ? 'is-adapted' : ''}">
          <span>${esc(cueText)}</span>
        </div>

        ${partnerHtml}
        <div id="live-hr-mount">${renderLiveHrStrip(wearableSnap)}</div>
      </div>

      <div class="stage-bottom">
        ${
          isCheckingIn
            ? `
            <div class="checkin-card">
              <div class="checkin-head">
                <span>${info.isWarmup ? 'Warm-up reps' : `Set ${info.workNumber} · How did it feel?`}</span>
                <button type="button" class="quiet-btn" style="padding:2px 6px;" data-action="cancel-checkin">Cancel</button>
              </div>
              <div class="checkin-rep-row">
                <button type="button" class="load-step-btn" data-action="step-checkin-reps" data-delta="-1">−</button>
                <div class="checkin-rep-val">
                  ${draftReps}
                  <small>reps done</small>
                </div>
                <button type="button" class="load-step-btn" data-action="step-checkin-reps" data-delta="1">+</button>
              </div>
              <div class="effort-grid">
                <button type="button" class="effort-btn is-easy" data-action="submit-set" data-effort="easy">
                  <span>Easy</span>
                  <small>${info.isWarmup || info.isLastSetOfStep || machine.loadType === 'bodyweight' ? 'Fast' : `+${stepInc} ${unit} next`}</small>
                </button>
                <button type="button" class="effort-btn is-solid" data-action="submit-set" data-effort="solid">
                  <span>Solid</span>
                  <small>On target</small>
                </button>
                <button type="button" class="effort-btn is-hard" data-action="submit-set" data-effort="hard">
                  <span>Hard</span>
                  <small>${info.isWarmup || info.isLastSetOfStep || machine.loadType === 'bodyweight' ? '+Rest' : `−${stepInc} ${unit} next`}</small>
                </button>
              </div>
              <button type="button" class="quiet-btn" style="align-self:center;" data-action="open-form-modal" data-tab="fix">
                Wrong muscle / Form felt awkward?
              </button>
            </div>
          `
            : `
            <button type="button" id="done-set-btn" class="btn btn-primary cta-giant" data-action="open-checkin">
              Done ${info.isWarmup ? 'Warm-up' : `Set ${info.workNumber}`} · ${curSet.targetReps} reps
            </button>
            <div class="quiet-actions">
              <button type="button" class="quiet-btn" data-action="machine-busy">Busy</button>
              <button type="button" class="quiet-btn" data-action="open-form-modal" data-tab="fix">Form / Issue</button>
              <button type="button" class="quiet-btn" data-action="open-pain-modal">Pain</button>
              <button type="button" class="quiet-btn" data-action="compress-time">−Time</button>
              <button type="button" class="quiet-btn" data-action="skip-step">Skip</button>
            </div>
          `
        }
      </div>
    </section>
  `;
}

function renderRestStage(state, session, timerSnap, wearableSnap) {
  const step = getActiveStep(session);
  const machine = getMachineById(step?.stationId);
  const unit = state.settings.unit;
  const info = step?.type === 'lift' ? getCurrentSetInfo(step) : null;

  // Check if we just transitioned to a brand-new station (0 sets done on current step)
  const isTransitionToNewStation =
    step &&
    ((step.type === 'lift' && step.sets.every((s) => !s.done)) || step.type === 'cardio');

  const timeStr = timerSnap.overtime
    ? `+${formatClock(timerSnap.overtimeSec)}`
    : formatClock(timerSnap.remainingSec);

  const ceilingBpm = Math.round(
    (state.athlete.todayRhr || 58) + 0.6 * ((state.athlete.maxHr || 188) - (state.athlete.todayRhr || 58))
  );

  const subStatus = timerSnap.hrReason
    ? timerSnap.hrReason
    : wearableSnap.bpm
    ? `PCr floor + HR recovery (<${ceilingBpm} bpm)`
    : 'ATP-PCr + CNS neural recovery';

  const nextLine =
    step?.type === 'lift' && info
      ? `${machine.name} · ${info.isWarmup ? 'Warm-up' : `Set ${info.workNumber}/${info.totalWorkSets}`} · ${
          formatLoad(machine, info.set.weightKg, unit).primary
        } × ${info.set.targetReps}`
      : `${machine?.name || 'Next Block'}`;

  const transitMap =
    isTransitionToNewStation && step?.prevStationId
      ? `
      <div class="floor-card" data-action="open-floor-modal" style="cursor:pointer;">
        ${renderFloorPlanSvg({
          activeId: step.stationId,
          prevId: step.prevStationId,
          partnerId: step.partner?.stationId || null,
          floorOverrides: state.floorOverrides,
          compact: true,
        })}
      </div>
    `
      : '';

  return `
    <section class="stage">
      <div class="stage-top">
        <span class="step-crumb">Rest &amp; Recover</span>
        ${
          isTransitionToNewStation && step.walkMeters > 0
            ? `<span class="walk-pill is-accent">Walk ${step.walkMeters}m → Zone ${esc(step.zoneCode)}</span>`
            : `<span class="walk-pill">Zone ${esc(step?.zoneCode || 'A')}</span>`
        }
      </div>

      <div class="stage-body">
        <div class="hero-panel is-rest">
          <span class="hero-value">${timeStr}</span>
          <span class="hero-sub">${esc(subStatus)}</span>
          <div class="rest-progress-track">
            <div class="rest-progress-fill" style="width:${Math.round(timerSnap.progress * 100)}%;"></div>
          </div>
        </div>

        <div class="cue-line ${step?.liveNote ? 'is-adapted' : ''}">
          <span><strong>Next:</strong> ${esc(nextLine)}</span>
        </div>

        ${transitMap}
        <div id="live-hr-mount">${renderLiveHrStrip(wearableSnap, { min: 70, max: ceilingBpm })}</div>
      </div>

      <div class="stage-bottom">
        <div class="rest-controls-row">
          <button type="button" class="btn btn-secondary" data-action="timer-adjust" data-delta="-15">-15s</button>
          <button type="button" class="btn btn-primary cta-giant" data-action="end-rest-now">
            Ready · Start Set
          </button>
          <button type="button" class="btn btn-secondary" data-action="timer-adjust" data-delta="30">+30s</button>
        </div>
        <div class="quiet-actions">
          <button type="button" class="quiet-btn" data-action="open-form-modal" data-tab="guide">How to Use</button>
          <button type="button" class="quiet-btn" data-action="open-form-modal" data-tab="fix">Form Check</button>
          <button type="button" class="quiet-btn" data-action="machine-busy">Busy</button>
          <button type="button" class="quiet-btn" data-action="open-pain-modal">Pain</button>
        </div>
      </div>
    </section>
  `;
}

function renderSummaryStage(state, session, wearableSnap) {
  const unit = state.settings.unit;
  const liftSteps = session.steps.filter(
    (st) => st.type === 'lift' && st.sets.some((s) => s.kind === 'work' && s.done)
  );
  const totalSets = liftSteps.reduce(
    (sum, st) => sum + st.sets.filter((s) => s.kind === 'work' && s.done).length,
    0
  );

  return `
    <section class="stage">
      <div class="stage-top">
        <span class="step-crumb">Session Complete</span>
        <span class="chip is-prime">Week ${session.mesoWeek} · ${esc(session.mesoName)}</span>
      </div>

      <div class="stage-body">
        <div>
          <h2 class="station-title">${esc(session.splitName)}</h2>
          <p class="station-setup">${totalSets} working sets${
            wearableSnap.avgBpm ? ` · Avg ${wearableSnap.avgBpm} bpm · Peak ${wearableSnap.peakBpm} bpm` : ''
          }</p>
        </div>

        <div class="sheet-section">
          ${liftSteps
            .map((st) => {
              const m = getMachineById(st.stationId);
              const done = st.sets.filter((s) => s.kind === 'work' && s.done);
              const topW = Math.max(...done.map((s) => s.weightKg || 0));
              return `
                <div class="list-card">
                  <div>
                    <strong style="font-size:0.88rem;">${esc(m.name)}</strong>
                    <div class="spec-tile-sub">${done.length} sets · Top ${esc(formatLoad(m, topW, unit).primary)}</div>
                  </div>
                  ${
                    st.e1rmGain > 0
                      ? `<span class="chip is-prime">+${st.e1rmGain} e1RM</span>`
                      : `<span class="chip">Logged</span>`
                  }
                </div>
              `;
            })
            .join('')}
        </div>

        ${
          session.adaptations.length
            ? `
            <div class="cue-line is-adapted">
              <span>Coach adapted: ${esc(session.adaptations.slice(-2).join(' · '))}</span>
            </div>`
            : ''
        }
      </div>

      <div class="stage-bottom">
        <button type="button" class="btn btn-success cta-giant" data-action="finish-and-save-session">
          Save &amp; Advance Mesocycle
        </button>
      </div>
    </section>
  `;
}

// ============================================================================
// Modal Renderers
// ============================================================================

export function renderGoalModalBody(state) {
  const a = state.athlete;
  const p = state.partner;

  return `
    <form id="goal-form" class="sheet-section" style="gap:14px;">
      <div class="sheet-section">
        <span class="sheet-label">Primary Training Goal</span>
        <div class="option-grid-2">
          ${Object.values(GOAL_PROFILES)
            .map(
              (g) => `
              <button type="button" class="option-card ${a.goal === g.id ? 'is-selected' : ''}" data-action="set-athlete-goal" data-goal="${g.id}">
                <strong>${esc(g.short)}</strong>
                <span>${esc(g.tagline)}</span>
              </button>`
            )
            .join('')}
        </div>
      </div>

      <div class="sheet-section">
        <span class="sheet-label">Priority Body Areas</span>
        <div class="pill-row">
          ${FOCUS_AREAS.map((f) => {
            const on = (a.focusAreas || []).includes(f.id);
            return `<button type="button" class="seg-btn ${on ? 'is-active' : ''}" data-action="toggle-focus-area" data-area="${f.id}">${esc(f.label)}</button>`;
          }).join('')}
        </div>
      </div>

      <div class="sheet-section">
        <span class="sheet-label">Cardiovascular Goal</span>
        <div class="seg-row">
          ${Object.values(CARDIO_PROFILES)
            .map(
              (c) => `
              <button type="button" class="seg-btn ${a.cardioGoal === c.id ? 'is-active' : ''}" data-action="set-cardio-goal" data-cardio="${c.id}">
                ${esc(c.name)}
              </button>`
            )
            .join('')}
        </div>
      </div>

      <div class="sheet-section">
        <span class="sheet-label">4-Week Mesocycle &amp; Today's Readiness</span>
        <div class="seg-row">
          ${Object.values(MESOCYCLE_WEEKS)
            .map(
              (w) => `
              <button type="button" class="seg-btn ${(a.mesocycle?.week || 1) === w.week ? 'is-active' : ''}" data-action="set-meso-week" data-week="${w.week}">
                W${w.week} · ${esc(w.name)}
              </button>`
            )
            .join('')}
        </div>
        <div class="field-grid-3" style="margin-top:4px;">
          <div class="field">
            <label for="in-days">Days / wk</label>
            <input id="in-days" name="daysPerWeek" class="field-input mono" type="number" min="2" max="6" value="${a.daysPerWeek || 3}" />
          </div>
          <div class="field">
            <label for="in-rhr">Today RHR</label>
            <input id="in-rhr" name="todayRhr" class="field-input mono" type="number" min="35" max="110" value="${a.todayRhr || 58}" />
          </div>
          <div class="field">
            <label for="in-hrv">HRV (ms)</label>
            <input id="in-hrv" name="todayHrv" class="field-input mono" type="number" min="15" max="180" placeholder="${a.baselineHrv || 58}" value="${a.todayHrv || ''}" />
          </div>
        </div>
      </div>

      <div class="sheet-section">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span class="sheet-label">Partner Co-Location Mode</span>
          <button type="button" class="seg-btn ${p.enabled ? 'is-active' : ''}" data-action="toggle-partner-mode">
            ${p.enabled ? 'Enabled' : 'Off'}
          </button>
        </div>
        ${
          p.enabled
            ? `
            <div class="field-grid-2">
              <div class="field">
                <label for="in-partner-name">Partner Name</label>
                <input id="in-partner-name" name="partnerName" class="field-input" type="text" value="${esc(p.name || 'Partner')}" />
              </div>
              <div class="field">
                <label for="in-partner-goal">Partner Goal</label>
                <select id="in-partner-goal" name="partnerGoal" class="field-input">
                  ${Object.values(GOAL_PROFILES)
                    .map(
                      (g) => `<option value="${g.id}" ${p.goal === g.id ? 'selected' : ''}>${esc(g.short)}</option>`
                    )
                    .join('')}
                </select>
              </div>
            </div>
            <div class="pill-row">
              ${FOCUS_AREAS.map((f) => {
                const on = (p.focusAreas || []).includes(f.id);
                return `<button type="button" class="seg-btn ${on ? 'is-active' : ''}" data-action="toggle-partner-area" data-area="${f.id}">Partner: ${esc(f.label)}</button>`;
              }).join('')}
            </div>
          `
            : `<span class="spec-tile-sub">Pairs two athletes onto nearby machines with matched block time.</span>`
        }
      </div>

      <button type="submit" class="btn btn-primary" style="width:100%;">Update Plan &amp; Rebuild Session</button>
    </form>
  `;
}

export function renderFloorModalBody(state, session, editPins = false) {
  const step = getActiveStep(session);
  const routeIds = session ? session.steps.map((s) => s.stationId) : [];
  const completedIds = session ? session.steps.filter((s) => s.done).map((s) => s.stationId) : [];

  return `
    <div class="sheet-section">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <span class="spec-tile-sub">${
          editPins ? 'Drag any pin to match the exact gym floor.' : 'Zones A–E · Active route highlighted'
        }</span>
        <div style="display:flex;gap:6px;">
          <button type="button" class="btn btn-secondary btn-sm" data-action="toggle-floor-edit">
            ${editPins ? 'Done Editing' : 'Calibrate Pins'}
          </button>
          ${
            Object.keys(state.floorOverrides || {}).length
              ? `<button type="button" class="btn btn-secondary btn-sm" data-action="reset-floor-pins">Reset</button>`
              : ''
          }
        </div>
      </div>

      <div id="floor-modal-svg-wrap" class="floor-card">
        ${renderFloorPlanSvg({
          activeId: step?.stationId || null,
          partnerId: step?.partner?.stationId || null,
          routeIds,
          completedIds,
          busyIds: session?.busyIds || [],
          floorOverrides: state.floorOverrides,
          interactive: editPins,
        })}
      </div>

      <div class="pill-row">
        <span class="chip">🟠 Active</span>
        ${state.partner?.enabled ? `<span class="chip">🔵 Partner</span>` : ''}
        <span class="chip">🟢 Done</span>
        <span class="chip">${GYM_MACHINES.length} Stations Mapped</span>
      </div>
    </div>
  `;
}

export function renderPainModalBody(state) {
  const activeFlags = Object.keys(state.athlete.jointFlags || {}).filter(
    (k) => state.athlete.jointFlags[k] && Date.now() - state.athlete.jointFlags[k] < 7 * 86400000
  );

  return `
    <div class="sheet-section">
      <span class="spec-tile-sub">Tap any area with discomfort — Coach immediately swaps high-stress lifts for joint-safe alternatives.</span>
      <div class="option-grid-2">
        ${PAIN_LOCATIONS.map(
          (loc) => `
          <button type="button" class="option-card ${activeFlags.includes(loc.id) ? 'is-selected' : ''}" data-action="report-pain" data-joint="${loc.id}">
            <strong>${esc(loc.label)}</strong>
            <span>${activeFlags.includes(loc.id) ? 'Protected (7d)' : 'Swap high-stress stations'}</span>
          </button>`
        ).join('')}
      </div>
      ${
        activeFlags.length
          ? `<button type="button" class="btn btn-secondary btn-sm" data-action="clear-pain-flags">Clear Protected Joints</button>`
          : ''
      }
    </div>
  `;
}

export function renderPlanModalBody(state, session) {
  const unit = state.settings.unit;

  return `
    <div class="sheet-section">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span class="sheet-label">Today's Coach Queue</span>
        <button type="button" class="btn btn-secondary btn-sm" data-action="regenerate-session">Rebuild Today</button>
      </div>

      ${(session?.steps || [])
        .map((st, idx) => {
          const m = getMachineById(st.stationId);
          const isCur = idx === session.currentStepIndex && session.phase !== 'summary';
          let spec = '';
          if (st.type === 'warmup' || st.type === 'cardio') {
            spec = `${Math.round(st.durationSec / 60)} min`;
          } else {
            const work = st.sets.filter((s) => s.kind === 'work');
            spec = `${work.length}×${work[0]?.targetReps} @ ${formatLoad(m, work[0]?.weightKg || 0, unit).primary}`;
          }
          return `
            <button type="button" class="list-card ${isCur ? 'is-current' : ''}" style="width:100%;text-align:left;" data-action="jump-step" data-index="${idx}">
              <div>
                <strong style="font-size:0.86rem;">${idx + 1}. ${esc(m?.name || '')}</strong>
                <div class="spec-tile-sub">Zone ${esc(st.zoneCode)} · ${esc(spec)}</div>
              </div>
              <span class="chip ${st.done ? 'is-prime' : ''}">${st.done ? 'Done' : isCur ? 'Now' : 'Jump'}</span>
            </button>
          `;
        })
        .join('')}
    </div>

    ${
      state.history.length
        ? `
      <div class="sheet-section">
        <span class="sheet-label">Recent Sessions (Feeds Next Weights)</span>
        ${state.history
          .slice(0, 4)
          .map(
            (h) => `
            <div class="list-card">
              <div>
                <strong style="font-size:0.84rem;">${esc(h.splitName)}</strong>
                <div class="spec-tile-sub">${formatRelativeDays(h.date)} · W${h.mesoWeek} ${esc(h.mesoName)} · ${h.totalSets} sets · ${h.durationMin}m${
              h.avgBpm ? ` · ♥ ${h.avgBpm}` : ''
            }</div>
              </div>
            </div>`
          )
          .join('')}
      </div>
    `
        : ''
    }

    <div class="sheet-section">
      <span class="sheet-label">Preferences</span>
      <div class="pill-row">
        <button type="button" class="seg-btn ${state.settings.hrAutoExtendRest ? 'is-active' : ''}" data-action="toggle-setting" data-key="hrAutoExtendRest">
          HR Rest Brake: ${state.settings.hrAutoExtendRest ? 'On' : 'Off'}
        </button>
        <button type="button" class="seg-btn ${state.settings.sound ? 'is-active' : ''}" data-action="toggle-setting" data-key="sound">
          Sound: ${state.settings.sound ? 'On' : 'Off'}
        </button>
        <button type="button" class="seg-btn" data-action="toggle-theme">
          Theme: ${state.settings.theme === 'light' ? 'Light' : 'Dark'}
        </button>
        <button type="button" class="seg-btn" data-action="toggle-unit">
          Unit: ${esc(state.settings.unit.toUpperCase())}
        </button>
      </div>
      <button type="button" class="btn btn-danger btn-sm" style="margin-top:4px;" data-action="reset-all">Reset All Data</button>
    </div>
  `;
}

export function renderWearableModalBody(state, snap) {
  const isLive = snap.status === 'connected' || snap.status === 'simulating';
  const deviceType = state.wearable?.deviceType || 'garmin_venu_4s';
  const preset = WEARABLE_PRESETS[deviceType] || WEARABLE_PRESETS.garmin_venu_4s;
  const gh = state.wearable?.googleHealthSummary;

  const stats = [
    `${snap.bpm ?? '--'} bpm`,
    `Z${snap.zone.decimal || 0} (${snap.zone.label})`,
    `Avg ${snap.avgBpm ?? '--'}`,
    `Peak ${snap.peakBpm ?? '--'}`,
  ];
  if (snap.hrvMs) stats.push(`HRV ${snap.hrvMs} ms`);
  if (snap.batteryPct !== null && snap.batteryPct !== undefined) stats.push(`${snap.batteryPct}%`);

  return `
    <div class="sheet-section" style="gap:12px;">
      <div class="option-grid-2">
        <button type="button" class="seg-btn ${deviceType === 'garmin_venu_4s' ? 'is-active' : ''}" data-action="set-wearable-device" data-device="garmin_venu_4s">Garmin Venu 4s</button>
        <button type="button" class="seg-btn ${deviceType === 'fitbit_air' ? 'is-active' : ''}" data-action="set-wearable-device" data-device="fitbit_air">Fitbit Air</button>
      </div>

      <div class="list-card">
        <div>
          <strong style="font-size:0.9rem;">
            ${
              snap.status === 'connected'
                ? esc(snap.deviceName)
                : snap.status === 'simulating'
                ? esc(snap.deviceName || `${preset.label} (Demo)`)
                : snap.status === 'connecting'
                ? 'Pairing...'
                : `${esc(preset.label)} · Off`
            }
          </strong>
          <div class="spec-tile-sub">${isLive ? esc(stats.join(' · ')) : 'BLE Heart Rate (0x180D)'}</div>
        </div>
        ${isLive ? `<button type="button" class="btn btn-danger btn-sm" data-action="wearable-disconnect">Stop</button>` : ''}
      </div>

      ${snap.errorMessage ? `<div class="cue-line is-adapted">${esc(snap.errorMessage)}</div>` : ''}

      <div class="option-grid-2">
        <button type="button" class="btn btn-primary" data-action="wearable-connect-ble" ${snap.status === 'connecting' ? 'disabled' : ''}>${esc(preset.connectLabel)}</button>
        <button type="button" class="btn btn-secondary" data-action="${snap.status === 'simulating' ? 'wearable-disconnect' : 'wearable-simulate'}">${snap.status === 'simulating' ? 'Stop Demo' : 'Simulate HR'}</button>
      </div>

      <div class="list-card" style="flex-direction:column;align-items:flex-start;">
        <span class="sheet-label">${esc(preset.stepsTitle)}</span>
        <ol class="setup-steps">
          ${preset.steps.map((s) => `<li>${s}</li>`).join('')}
        </ol>
      </div>

      <form id="wearable-hr-form" class="sheet-section">
        <div class="field-grid-2">
          <div class="field">
            <label for="w-rhr">Baseline Resting HR</label>
            <input id="w-rhr" name="restingHr" class="field-input mono" type="number" min="35" max="110" value="${state.athlete.baselineRhr || 58}" />
          </div>
          <div class="field">
            <label for="w-mhr">Max HR</label>
            <input id="w-mhr" name="maxHr" class="field-input mono" type="number" min="120" max="220" value="${state.athlete.maxHr || 188}" />
          </div>
        </div>
        <button type="submit" class="btn btn-secondary btn-sm">Save HR Profile</button>
      </form>

      ${
        deviceType === 'fitbit_air'
          ? `
        <form id="google-health-form" class="sheet-section">
          <span class="sheet-label">Google Health API v4 (Optional)</span>
          <span class="spec-tile-sub">${gh ? `Synced RHR ${gh.restingHr ?? '--'} · HRV ${gh.hrvMs ?? '--'} ms` : 'Pull daily RHR & HRV via OAuth Client ID'}</span>
          <div style="display:flex;gap:8px;">
            <input name="clientId" class="field-input mono" type="text" placeholder="Google OAuth Client ID" value="${esc(state.wearable.googleHealthClientId || '')}" />
            <button type="submit" class="btn btn-secondary btn-sm">Sync</button>
          </div>
        </form>`
          : ''
      }
    </div>
  `;
}

export function renderFormModalBody(state, session, formUi = {}) {
  const step = getActiveStep(session);
  const machineId = formUi.machineId || step?.stationId || 'm_ab_crunch';
  const machine = getMachineById(machineId) || GYM_MACHINES[0];
  const guide = getMachineGuide(machine.id);
  const tab = formUi.tab || 'guide'; // 'guide' | 'fix'
  const unit = state.settings.unit;
  const inc = machine.stepKg || 2.5;
  const pinnedCue = state.athlete.formNotes?.[machine.id]?.pinnedCue || '';

  const diagnosis = formUi.query ? diagnoseMachineIssue(machine, formUi.query) : null;
  const swapMachine = diagnosis?.swapId ? getMachineById(diagnosis.swapId) : null;

  const stationPickerHtml = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
      <select id="form-station-select" class="field-input" style="height:36px;font-size:0.82rem;">
        ${GYM_MACHINES.map(
          (m) => `<option value="${m.id}" ${m.id === machine.id ? 'selected' : ''}>${esc(m.name)}</option>`
        ).join('')}
      </select>
      <div class="seg-row" style="flex-shrink:0;">
        <button type="button" class="seg-btn ${tab === 'guide' ? 'is-active' : ''}" data-action="set-form-tab" data-tab="guide">How to Use</button>
        <button type="button" class="seg-btn ${tab === 'fix' ? 'is-active' : ''}" data-action="set-form-tab" data-tab="fix">Form Check</button>
      </div>
    </div>
  `;

  if (tab === 'guide') {
    return `
      <div class="sheet-section" style="gap:12px;">
        ${stationPickerHtml}

        <div class="form-diagram-box">
          ${renderFormDiagramSvg(machine)}
        </div>

        <div class="cue-line is-adapted">
          <span><strong>Pivot:</strong> ${esc(guide.pivot)}</span>
        </div>

        <div class="list-card" style="flex-direction:column;align-items:flex-start;gap:6px;">
          <span class="sheet-label">Execution Checklist</span>
          <ol class="setup-steps">
            ${guide.steps.map((s) => `<li>${esc(s)}</li>`).join('')}
          </ol>
        </div>

        <div class="feel-avoid-grid">
          <div class="feel-box">Feel: ${esc(guide.feel)}</div>
          <div class="avoid-box">Avoid: ${esc(guide.avoid)}</div>
        </div>

        ${
          pinnedCue
            ? `
            <div class="list-card">
              <div>
                <span class="sheet-label">Your Pinned Cue</span>
                <div style="font-size:0.81rem;font-weight:700;">${esc(pinnedCue)}</div>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" data-action="clear-pinned-cue" data-machine-id="${machine.id}">Clear</button>
            </div>`
            : ''
        }

        <div class="option-grid-2">
          <button type="button" class="btn btn-secondary" data-action="set-form-tab" data-tab="fix">Feels Off? Troubleshoot</button>
          <button type="button" class="btn btn-primary" data-action="confirm-guide-seen" data-machine-id="${machine.id}">Got It · Ready</button>
        </div>
      </div>
    `;
  }

  // Troubleshoot / Form Check Tab
  return `
    <div class="sheet-section" style="gap:12px;">
      ${stationPickerHtml}

      <div class="sheet-section">
        <span class="sheet-label">Common Issues on ${esc(machine.shortName)}</span>
        <div class="pill-row">
          ${guide.issues
            .map(
              (iss) => `
              <button type="button" class="seg-btn ${diagnosis?.id === iss.id ? 'is-active' : ''}" data-action="select-form-issue" data-issue="${iss.id}">
                ${esc(iss.chip)}
              </button>`
            )
            .join('')}
        </div>
      </div>

      <form id="form-issue-form" class="sheet-section">
        <span class="sheet-label">Or Describe What Feels Off</span>
        <div style="display:flex;gap:8px;">
          <input id="form-issue-input" name="issueText" class="field-input" type="text" placeholder="e.g. puts too much weight on lats instead..." value="${esc(formUi.rawText || '')}" />
          <button type="submit" class="btn btn-primary btn-sm">Analyze</button>
        </div>
      </form>

      ${
        diagnosis
          ? `
          <div class="diagnosis-card">
            <div>
              <span class="sheet-label" style="color:var(--accent);">Why It Happens</span>
              <p class="diagnosis-cause" style="margin:4px 0 0;">${esc(diagnosis.cause)}</p>
            </div>

            <div>
              <span class="sheet-label">Fix Right Now</span>
              <ol class="setup-steps" style="margin-top:4px;">
                ${diagnosis.fixes.map((f) => `<li>${esc(f)}</li>`).join('')}
              </ol>
            </div>

            <div class="sheet-section" style="gap:7px;margin-top:2px;">
              ${
                machine.loadType !== 'bodyweight' && machine.loadType !== 'cardio' && diagnosis.suggestDropLoad
                  ? `
                  <button type="button" class="btn btn-primary" data-action="apply-form-fix" data-cue="${esc(diagnosis.pinCue)}" data-drop="true">
                    Pin Cue &amp; −${inc} ${unit} Today
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" data-action="apply-form-fix" data-cue="${esc(diagnosis.pinCue)}" data-drop="false">
                    Pin Cue Only (Keep Weight)
                  </button>
                `
                  : `
                  <button type="button" class="btn btn-primary" data-action="apply-form-fix" data-cue="${esc(diagnosis.pinCue)}" data-drop="false">
                    Pin Cue to ${esc(machine.shortName)}
                  </button>
                `
              }
              ${
                swapMachine
                  ? `
                  <button type="button" class="btn btn-secondary btn-sm" data-action="apply-form-swap" data-swap-id="${swapMachine.id}">
                    Swap to ${esc(swapMachine.name)} &amp; Prefer Next Time
                  </button>
                `
                  : ''
              }
            </div>
          </div>
        `
          : `<div class="cue-line"><span>Tap a symptom above or type what feels wrong — Coach will adjust setup, load, or swap the machine.</span></div>`
      }
    </div>
  `;
}
