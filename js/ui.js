/**
 * Weights — Overhauled Clean UI Renderers
 * Plain-English + German gym stickers + Inline Machine Diagrams + 1-Tap Rep Logging
 */

import {
  GYM_MACHINES,
  getMachineById,
  getZoneInfo,
  renderFloorPlanSvg,
} from './floor.js';
import {
  GOAL_PROFILES,
  CARDIO_PROFILES,
  FOCUS_AREAS,
  PAIN_LOCATIONS,
  MESOCYCLE_WEEKS,
  getMesocyclePhase,
  buildRepChoices,
  formatLoad,
  formatRepRange,
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
  let cue = bpm ? `${wearableSnap.zone.label}` : 'Acquiring pulse…';
  if (bpm && hrBand) {
    if (bpm < hrBand.min) cue = `Target ${hrBand.min}–${hrBand.max} · Speed up slightly`;
    else if (bpm > hrBand.max) cue = `Target ${hrBand.min}–${hrBand.max} · Ease pace`;
    else cue = `In target zone (${hrBand.min}–${hrBand.max})`;
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

export function renderCoachStage(state, session, timerSnap, wearableSnap, briefingView = 'plan') {
  if (!session) return '';

  if (session.phase === 'briefing') {
    return renderBriefingStage(state, session, wearableSnap, briefingView);
  }
  if (session.phase === 'summary') {
    return renderSummaryStage(state, session, wearableSnap);
  }
  if (session.phase === 'resting' && timerSnap.running) {
    return renderRestStage(state, session, timerSnap, wearableSnap);
  }
  return renderActiveStepStage(state, session, timerSnap, wearableSnap);
}

const PREWORKOUT_FEEDBACK_CHIPS = [
  { label: 'Climbed yesterday', text: 'climbed yesterday fingers tired' },
  { label: 'Tired today', text: 'low energy today' },
  { label: 'Feel strong', text: 'feeling strong push hard' },
  { label: '+ Core', text: 'more core' },
  { label: 'Skip cardio', text: 'skip cardio' },
  { label: 'No legs', text: 'no legs today' },
];

function renderBriefingStage(state, session, wearableSnap, briefingView = 'plan') {
  const athlete = state.athlete;
  const unit = state.settings.unit;
  const meso = getMesocyclePhase(session.mesoWeek || athlete.mesocycle?.week || 1);
  const routeIds = session.steps.map((s) => s.stationId);
  const rd = session.readiness;
  const rdClass = rd.tier === 'prime' || rd.tier === 'ready' ? 'is-prime' : 'is-warn';

  const phaseLine =
    athlete.goal === 'max_strength'
      ? `Block ${meso.block} · ${meso.blockName} (Week ${meso.week} of 8)`
      : `${GOAL_PROFILES[athlete.goal]?.name || 'Custom Plan'}`;

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

  const summaryContentHtml =
    briefingView === 'map'
      ? `
      <div data-action="open-floor-modal" style="cursor:pointer;">
        ${renderFloorPlanSvg({
          activeId: routeIds[0],
          routeIds,
          floorOverrides: state.floorOverrides,
          compact: false,
        })}
      </div>
    `
      : `
      <div class="briefing-step-list">
        ${session.steps
          .map((st, idx) => {
            const m = getMachineById(st.stationId);
            let rxLine = '';
            if (st.type === 'warmup') {
              rxLine = `${Math.round(st.durationSec / 60)} min warm-up · ${st.hrBand.min}–${st.hrBand.max} bpm`;
            } else if (st.type === 'cardio') {
              rxLine = `${Math.round(st.durationSec / 60)} min ${st.protocol === 'vo2_4x3' ? 'VO₂ intervals' : 'steady cardio'} · ${st.hrBand.min}–${st.hrBand.max} bpm`;
            } else {
              const work = st.sets.filter((s) => s.kind === 'work');
              const firstW = work[0] || {};
              const repStr = formatRepRange(firstW.repMin, firstW.repMax, firstW.targetReps);
              const loadTxt = formatLoad(m, firstW.weightKg || 0, unit).primary;
              rxLine = `${work.length} sets × ${repStr} reps @ ${loadTxt}`;
            }
            if (st.partner) {
              rxLine += ` · 👥 ${st.partner.stationName}`;
            }

            return `
              <div class="briefing-step-row">
                <button type="button" class="briefing-step-main" data-action="open-form-modal-for" data-machine-id="${esc(st.stationId)}" title="Preview ${esc(m?.name)}">
                  <span class="briefing-num">${idx + 1}</span>
                  <span style="min-width:0;">
                    <span class="briefing-step-title">${esc(m?.name || '')}</span>
                    <span class="briefing-step-sub">${esc(m?.gymLabel || '')} · ${esc(m?.muscleTag || '')}</span>
                    <span class="briefing-step-rx">${esc(rxLine)}</span>
                  </span>
                </button>
                <div class="briefing-step-actions">
                  <button type="button" class="mini-act-btn" data-action="briefing-swap-step" data-index="${idx}" aria-label="Swap exercise" title="Swap exercise">↻</button>
                  ${
                    session.steps.length > 2
                      ? `<button type="button" class="mini-act-btn" data-action="briefing-remove-step" data-index="${idx}" aria-label="Remove exercise" title="Remove">×</button>`
                      : ''
                  }
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    `;

  const quickFeedbackHtml = PREWORKOUT_FEEDBACK_CHIPS.map(
    (c) => `<button type="button" class="seg-btn" data-action="apply-briefing-chip" data-feedback="${esc(c.text)}">${esc(c.label)}</button>`
  ).join('');

  return `
    <section class="stage">
      <div class="stage-top">
        <span class="step-crumb">${esc(phaseLine)}</span>
        <button type="button" class="chip ${rdClass}" data-action="open-goal-modal">${esc(rd.label)} · ${esc(rd.summary)}</button>
      </div>

      <div class="stage-body" style="gap:10px;">
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <h2 class="station-title" style="font-size:clamp(1.32rem,5.2vw,1.75rem);">${esc(session.splitName)}</h2>
            <button type="button" class="seg-btn ${state.partner.enabled ? 'is-active' : ''}" data-action="toggle-partner-quick">
              ${state.partner.enabled ? `👥 + ${esc(state.partner.name)}` : '+ Partner'}
            </button>
          </div>
          <p class="station-setup">${esc(
            session.feedbackNote
              ? `Adjusted: ${session.feedbackNote}`
              : `${session.splitReason} · Push ~1–2 reps shy of failure`
          )}</p>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div class="seg-row" aria-label="Session focus">${splitBtns}</div>
          <div class="seg-row" style="flex-shrink:0;">${durBtns}</div>
        </div>

        <div class="briefing-plan-card">
          <div class="briefing-card-head">
            <span class="sheet-label">Today's Plan · ~${session.estimatedMin} min</span>
            <div class="seg-row">
              <button type="button" class="seg-btn ${briefingView === 'plan' ? 'is-active' : ''}" style="padding:4px 9px;font-size:0.71rem;" data-action="set-briefing-view" data-view="plan">Exercises (${session.steps.length})</button>
              <button type="button" class="seg-btn ${briefingView === 'map' ? 'is-active' : ''}" style="padding:4px 9px;font-size:0.71rem;" data-action="set-briefing-view" data-view="map">Gym Map</button>
            </div>
          </div>
          ${summaryContentHtml}
        </div>

        <div class="sheet-section" style="gap:6px;">
          <div class="seg-row" aria-label="Quick pre-workout feedback">${quickFeedbackHtml}</div>
          <form id="briefing-feedback-form" class="feedback-bar">
            <input id="briefing-feedback-input" name="feedback" class="field-input" style="height:38px;font-size:0.81rem;" type="text" placeholder="Want to change anything? (e.g. climbed yesterday, swap row, 30m)..." />
            <button type="submit" class="btn btn-secondary btn-sm" style="height:38px;">Adjust</button>
          </form>
        </div>

        <div id="live-hr-mount">${renderLiveHrStrip(wearableSnap)}</div>
      </div>

      <div class="stage-bottom">
        <button type="button" id="start-session-btn" class="btn btn-primary cta-giant" data-action="start-session">
          Start Workout · ${session.estimatedMin} min
        </button>
      </div>
    </section>
  `;
}

function renderActiveStepStage(state, session, timerSnap, wearableSnap) {
  const step = getActiveStep(session);
  if (!step) return '';
  const machine = getMachineById(step.stationId);
  const zoneInfo = getZoneInfo(machine.zone);
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

  const locationBtnHtml = `
    <button type="button" class="walk-pill ${step.walkMeters >= 5 ? 'is-accent' : ''}" data-action="open-floor-modal">
      ${step.walkMeters > 0 ? `Walk ${step.walkMeters}m · Map` : `${esc(zoneInfo.name)} · Map`}
    </button>
  `;

  const machineHeaderHtml = `
    <div>
      <h2 class="station-title">${esc(machine.name)}</h2>
      <div class="machine-meta-row">
        <span class="gym-sticker-tag">${esc(machine.gymLabel || machine.name)}</span>
        <span class="muscle-tag-text">${esc(machine.muscleTag || '')}</span>
      </div>
    </div>
  `;

  const visualCardHtml = `
    <button type="button" class="machine-visual-card" data-action="open-form-modal" data-tab="guide">
      <span class="machine-visual-thumb">${renderFormDiagramSvg(machine)}</span>
      <span class="machine-visual-copy">
        <span class="machine-setup-text">${esc(step.setup)}</span>
        <span class="machine-cue-text">${esc(step.cue)}</span>
        <span class="machine-guide-hint">Tap for full setup &amp; form guide ›</span>
      </span>
    </button>
  `;

  // Timed Guided Block (Warm-up or Cardio)
  if (step.type === 'warmup' || step.type === 'cardio') {
    const isRunningThis = timerSnap.running && timerSnap.mode === step.type;
    const displaySec = isRunningThis ? timerSnap.remainingSec : step.durationSec;
    const band = step.hrBand;

    return `
      <section class="stage">
        <div class="stage-top">
          <span class="step-crumb">Step ${stepNum} of ${totalSteps}</span>
          ${locationBtnHtml}
        </div>

        <div class="stage-body">
          ${machineHeaderHtml}
          ${visualCardHtml}

          <div class="hero-panel is-rest">
            <span class="hero-value">${formatClock(displaySec)}</span>
            <span class="hero-sub">${
              step.type === 'warmup'
                ? `Easy warm-up · ${band.min}–${band.max} bpm`
                : step.protocol === 'vo2_4x3'
                ? `4 × 3 min hard · ${band.min}–${band.max} bpm`
                : `Steady cardio · ${band.min}–${band.max} bpm`
            }</span>
            ${
              isRunningThis
                ? `<div class="rest-progress-track"><div class="rest-progress-fill" style="width:${Math.round(timerSnap.progress * 100)}%;"></div></div>`
                : ''
            }
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
                Start ${formatClock(step.durationSec)} Timer
              </button>
            `
          }
          <div class="quiet-actions">
            <button type="button" class="quiet-btn" data-action="machine-busy">Machine Busy</button>
            <button type="button" class="quiet-btn" data-action="open-form-modal" data-tab="fix">Feels Wrong / Pain</button>
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
      return `<span class="inline-dot ${cls}"></span>`;
    })
    .join('');

  const setBadgeHtml = info.isWarmup
    ? `<span class="set-badge is-warmup">Warm-up${curSet.warmupTotal > 1 ? ` ${curSet.warmupIndex}/${curSet.warmupTotal}` : ''}</span>`
    : `<span class="set-badge">Set ${info.workNumber} of ${info.totalWorkSets} <span class="inline-dots">${dotsHtml}</span></span>`;

  const repRangeStr = formatRepRange(curSet.repMin, curSet.repMax, curSet.targetReps);
  const repChoices = buildRepChoices(curSet.repMin, curSet.repMax);

  const nextSetAfterWarmup = info.isWarmup ? step.sets[info.arrayIndex + 1] : null;
  const nextLoadAfterWarmup = nextSetAfterWarmup
    ? formatLoad(machine, nextSetAfterWarmup.weightKg, unit).primary
    : '';

  return `
    <section class="stage">
      <div class="stage-top">
        <div class="top-progress-left">
          <span class="step-crumb">${stepNum}/${totalSteps}</span>
          ${setBadgeHtml}
        </div>
        ${locationBtnHtml}
      </div>

      <div class="stage-body" style="gap:10px;">
        ${machineHeaderHtml}
        ${visualCardHtml}

        ${
          step.liveNote
            ? `<div class="cue-line is-adapted"><span>${esc(step.liveNote)}</span></div>`
            : ''
        }

        <div class="rx-panel">
          <div class="rx-load-row">
            ${
              machine.loadType !== 'bodyweight'
                ? `<button type="button" class="load-step-btn" data-action="nudge-load" data-delta="${-stepInc}" aria-label="Decrease weight">−</button>`
                : `<span style="width:48px;"></span>`
            }
            <div class="hero-center">
              <span class="hero-value">${esc(load.primary)}</span>
              <span class="hero-sub">${esc(load.sub)}</span>
            </div>
            ${
              machine.loadType !== 'bodyweight'
                ? `<button type="button" class="load-step-btn" data-action="nudge-load" data-delta="${stepInc}" aria-label="Increase weight">+</button>`
                : `<span style="width:48px;"></span>`
            }
          </div>

          <div class="rx-divider"></div>

          <div class="rx-rep-row">
            ${
              info.isWarmup
                ? `
                <span class="rx-rep-goal">Do ${curSet.targetReps} easy warm-up reps</span>
                <span class="rx-rep-rule">Light speed — don't push hard</span>
              `
                : `
                <span class="rx-rep-goal">Aim for ${esc(repRangeStr)} reps</span>
                <span class="rx-rep-rule">Stop ~1–2 shy of failure (when speed slows)</span>
              `
            }
          </div>
        </div>

        ${partnerHtml}
        <div id="live-hr-mount">${renderLiveHrStrip(wearableSnap)}</div>
      </div>

      <div class="stage-bottom">
        ${
          info.isWarmup
            ? `
            <button type="button" class="btn btn-primary cta-giant" data-action="log-reps" data-reps="${curSet.targetReps}">
              Warm-up Done${nextLoadAfterWarmup ? ` · Next ${esc(nextLoadAfterWarmup)}` : ''}
            </button>
          `
            : `
            <div class="rep-tap-block">
              <span class="rep-tap-label">Tap reps completed</span>
              <div class="rep-tap-grid">
                ${repChoices
                  .map(
                    (c) => `
                  <button type="button" class="rep-tap-btn ${c.zone === 'target' ? 'is-target' : ''}" data-action="log-reps" data-reps="${c.reps}">
                    ${esc(c.label)}
                  </button>`
                  )
                  .join('')}
              </div>
            </div>
          `
        }
        <div class="quiet-actions">
          <button type="button" class="quiet-btn" data-action="machine-busy">Machine Busy</button>
          <button type="button" class="quiet-btn" data-action="open-form-modal" data-tab="fix">Feels Wrong / Pain</button>
          <button type="button" class="quiet-btn" data-action="skip-step">Skip</button>
        </div>
      </div>
    </section>
  `;
}

function renderRestStage(state, session, timerSnap, wearableSnap) {
  const step = getActiveStep(session);
  const machine = getMachineById(step?.stationId);
  const unit = state.settings.unit;
  const info = step?.type === 'lift' ? getCurrentSetInfo(step) : null;

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
    ? `Recovering · Waiting for HR below ${ceilingBpm} bpm`
    : 'Catch your breath before next set';

  const nextRepRange = info
    ? formatRepRange(info.set.repMin, info.set.repMax, info.set.targetReps)
    : '';

  const nextLine =
    step?.type === 'lift' && info
      ? `${machine.name} (${machine.gymLabel || ''}) · ${
          info.isWarmup ? 'Warm-up' : `Set ${info.workNumber} of ${info.totalWorkSets}`
        } · ${formatLoad(machine, info.set.weightKg, unit).primary} × ${nextRepRange}`
      : `${machine?.name || 'Next Step'}`;

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
        <span class="step-crumb">Rest</span>
        ${
          isTransitionToNewStation && step.walkMeters > 0
            ? `<button type="button" class="walk-pill is-accent" data-action="open-floor-modal">Walk ${step.walkMeters}m · Map</button>`
            : `<button type="button" class="walk-pill" data-action="open-floor-modal">${esc(getZoneInfo(machine?.zone).name)} · Map</button>`
        }
      </div>

      <div class="stage-body">
        <div class="hero-panel is-rest">
          <span class="hero-value">${timeStr}</span>
          <span class="hero-sub" style="text-transform:none;letter-spacing:0;">${esc(subStatus)}</span>
          <div class="rest-progress-track">
            <div class="rest-progress-fill" style="width:${Math.round(timerSnap.progress * 100)}%;"></div>
          </div>
        </div>

        ${
          step?.liveNote && !isTransitionToNewStation
            ? `<div class="cue-line is-adapted"><span>${esc(step.liveNote)}</span></div>`
            : ''
        }

        <div class="cue-line">
          <span><strong>Up next:</strong> ${esc(nextLine)}</span>
        </div>

        ${transitMap}
        <div id="live-hr-mount">${renderLiveHrStrip(wearableSnap, { min: 70, max: ceilingBpm })}</div>
      </div>

      <div class="stage-bottom">
        <div class="rest-controls-row">
          <button type="button" class="btn btn-secondary" data-action="timer-adjust" data-delta="-15">-15s</button>
          <button type="button" class="btn btn-primary cta-giant" data-action="end-rest-now">
            Ready · Next Set
          </button>
          <button type="button" class="btn btn-secondary" data-action="timer-adjust" data-delta="30">+30s</button>
        </div>
        <div class="quiet-actions">
          <button type="button" class="quiet-btn" data-action="open-form-modal" data-tab="guide">Machine Guide</button>
          <button type="button" class="quiet-btn" data-action="machine-busy">Machine Busy</button>
          <button type="button" class="quiet-btn" data-action="open-form-modal" data-tab="pain">Pain / Issue</button>
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
        <span class="step-crumb">Workout Complete</span>
        <span class="chip is-prime">${esc(session.mesoName || `Week ${session.mesoWeek}`)}</span>
      </div>

      <div class="stage-body">
        <div>
          <h2 class="station-title">${esc(session.splitName)}</h2>
          <p class="station-setup">${totalSets} working sets completed${
            wearableSnap.avgBpm ? ` · Avg ${wearableSnap.avgBpm} bpm · Peak ${wearableSnap.peakBpm} bpm` : ''
          }</p>
        </div>

        <div class="sheet-section">
          ${liftSteps
            .map((st) => {
              const m = getMachineById(st.stationId);
              const done = st.sets.filter((s) => s.kind === 'work' && s.done);
              const topW = Math.max(...done.map((s) => s.weightKg || 0));
              const repsList = done.map((s) => s.actualReps || s.targetReps).join(', ');
              return `
                <div class="list-card">
                  <div>
                    <strong style="font-size:0.88rem;">${esc(m.name)}</strong>
                    <div class="spec-tile-sub">${esc(formatLoad(m, topW, unit).primary)} · Reps: ${esc(repsList)}</div>
                  </div>
                  ${
                    st.e1rmGain > 0
                      ? `<span class="chip is-prime">+Strength</span>`
                      : `<span class="chip">Saved</span>`
                  }
                </div>
              `;
            })
            .join('')}
        </div>
      </div>

      <div class="stage-bottom">
        <button type="button" class="btn btn-success cta-giant" data-action="finish-and-save-session">
          Save Workout &amp; Advance Plan
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
  const curWeek = a.mesocycle?.week || 1;
  const curMeso = getMesocyclePhase(curWeek);

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

      ${
        a.goal === 'max_strength'
          ? `
        <div class="sheet-section">
          <span class="sheet-label">8-Week Climber Block Phase</span>
          <div class="option-grid-2">
            <button type="button" class="option-card ${curMeso.block === 1 ? 'is-selected' : ''}" data-action="set-meso-block" data-block="1">
              <strong>Block 1 · Base (W1–W4)</strong>
              <span>8–10 reps · Build tendons &amp; upper pull</span>
            </button>
            <button type="button" class="option-card ${curMeso.block === 2 ? 'is-selected' : ''}" data-action="set-meso-block" data-block="2">
              <strong>Block 2 · Max Neural (W5–W8)</strong>
              <span>3–6 reps · Peak force, zero bulk</span>
            </button>
          </div>
          <div class="seg-row" style="margin-top:4px;">
            ${Object.values(MESOCYCLE_WEEKS)
              .map(
                (w) => `
                <button type="button" class="seg-btn ${curWeek === w.week ? 'is-active' : ''}" data-action="set-meso-week" data-week="${w.week}">
                  ${esc(w.name)}
                </button>`
              )
              .join('')}
          </div>
        </div>
      `
          : `
        <div class="sheet-section">
          <span class="sheet-label">Priority Body Areas</span>
          <div class="pill-row">
            ${FOCUS_AREAS.map((f) => {
              const on = (a.focusAreas || []).includes(f.id);
              return `<button type="button" class="seg-btn ${on ? 'is-active' : ''}" data-action="toggle-focus-area" data-area="${f.id}">${esc(f.label)}</button>`;
            }).join('')}
          </div>
        </div>
      `
      }

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
        <span class="sheet-label">Weekly Cadence &amp; Recovery</span>
        <div class="field-grid-3">
          <div class="field">
            <label for="in-days">Gym days/wk</label>
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
          <span class="sheet-label">Partner Workout Mode</span>
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
            : `<span class="spec-tile-sub">Pairs two athletes onto nearby machines with matched block duration.</span>`
        }
      </div>

      <button type="submit" class="btn btn-primary" style="width:100%;">Save &amp; Update Workout</button>
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
          editPins ? 'Drag any pin to match the exact gym layout.' : 'Manegg Motion · Highlighted workout route'
        }</span>
        <div style="display:flex;gap:6px;">
          <button type="button" class="btn btn-secondary btn-sm" data-action="toggle-floor-edit">
            ${editPins ? 'Done' : 'Move Pins'}
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
        <span class="chip">🟠 Current</span>
        ${state.partner?.enabled ? `<span class="chip">🔵 Partner</span>` : ''}
        <span class="chip">🟢 Done</span>
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
      <span class="spec-tile-sub">Tap any area that hurts or feels strained — the Coach swaps out high-stress exercises for 7 days.</span>
      <div class="option-grid-2">
        ${PAIN_LOCATIONS.map(
          (loc) => `
          <button type="button" class="option-card ${activeFlags.includes(loc.id) ? 'is-selected' : ''}" data-action="report-pain" data-joint="${loc.id}">
            <strong>${esc(loc.label)}</strong>
            <span>${activeFlags.includes(loc.id) ? 'Protected (7 days)' : 'Swap stressful exercises'}</span>
          </button>`
        ).join('')}
      </div>
      ${
        activeFlags.length
          ? `<button type="button" class="btn btn-secondary btn-sm" data-action="clear-pain-flags">Clear Protected Areas</button>`
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
        <span class="sheet-label">Today's Exercises</span>
        <div style="display:flex;gap:6px;">
          <button type="button" class="btn btn-secondary btn-sm" data-action="compress-time">Short on Time</button>
          <button type="button" class="btn btn-secondary btn-sm" data-action="regenerate-session">Reset Today</button>
        </div>
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
            const fw = work[0] || {};
            spec = `${work.length} × ${formatRepRange(fw.repMin, fw.repMax, fw.targetReps)} @ ${formatLoad(m, fw.weightKg || 0, unit).primary}`;
          }
          return `
            <button type="button" class="list-card ${isCur ? 'is-current' : ''}" style="width:100%;text-align:left;" data-action="jump-step" data-index="${idx}">
              <div>
                <strong style="font-size:0.86rem;">${idx + 1}. ${esc(m?.name || '')}</strong>
                <div class="spec-tile-sub">${esc(m?.gymLabel || '')} · ${esc(spec)}</div>
              </div>
              <span class="chip ${st.done ? 'is-prime' : ''}">${st.done ? 'Done' : isCur ? 'Now' : 'Go'}</span>
            </button>
          `;
        })
        .join('')}
    </div>

    ${
      state.history.length
        ? `
      <div class="sheet-section">
        <span class="sheet-label">Recent Workouts</span>
        ${state.history
          .slice(0, 4)
          .map(
            (h) => `
            <div class="list-card">
              <div>
                <strong style="font-size:0.84rem;">${esc(h.splitName)}</strong>
                <div class="spec-tile-sub">${formatRelativeDays(h.date)} · ${esc(h.mesoName || `W${h.mesoWeek}`)} · ${h.totalSets} sets · ${h.durationMin}m${
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
          Smart HR Rest: ${state.settings.hrAutoExtendRest ? 'On' : 'Off'}
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
  const isConnecting = snap.status === 'connecting';
  const deviceType = state.wearable?.deviceType || 'fitbit_air';
  const preset = WEARABLE_PRESETS[deviceType] || WEARABLE_PRESETS.fitbit_air;
  const gh = state.wearable?.googleHealthSummary;

  const stats = [
    `${snap.bpm ?? '--'} bpm`,
    `${snap.zone.label}`,
    `Avg ${snap.avgBpm ?? '--'}`,
    `Peak ${snap.peakBpm ?? '--'}`,
  ];
  if (snap.hrvMs) stats.push(`HRV ${snap.hrvMs} ms`);
  if (snap.batteryPct !== null && snap.batteryPct !== undefined) stats.push(`${snap.batteryPct}%`);

  const statusSub = isConnecting
    ? snap.connectingStage || 'Connecting Bluetooth Heart Rate…'
    : isLive
    ? snap.bpm
      ? stats.join(' · ')
      : 'Connected · Acquiring wrist pulse…'
    : 'Live Bluetooth Heart Rate';

  return `
    <div class="sheet-section" style="gap:12px;">
      <div class="option-grid-2">
        <button type="button" class="seg-btn ${deviceType === 'fitbit_air' ? 'is-active' : ''}" data-action="set-wearable-device" data-device="fitbit_air">Fitbit Air</button>
        <button type="button" class="seg-btn ${deviceType === 'garmin_venu_4s' ? 'is-active' : ''}" data-action="set-wearable-device" data-device="garmin_venu_4s">Garmin Venu 4s</button>
      </div>

      <div class="list-card">
        <div>
          <strong style="font-size:0.9rem;">
            ${
              snap.status === 'connected'
                ? esc(snap.deviceName)
                : snap.status === 'simulating'
                ? esc(snap.deviceName || `${preset.label} (Demo)`)
                : isConnecting
                ? `Pairing ${esc(snap.deviceName || preset.shortLabel)}…`
                : `${esc(preset.label)} · Not Connected`
            }
          </strong>
          <div class="spec-tile-sub">${esc(statusSub)}</div>
        </div>
        ${
          isLive
            ? `<button type="button" class="btn btn-danger btn-sm" data-action="wearable-disconnect">Stop</button>`
            : isConnecting
            ? `<button type="button" class="btn btn-secondary btn-sm" data-action="wearable-disconnect">Cancel</button>`
            : ''
        }
      </div>

      ${snap.errorMessage ? `<div class="cue-line is-adapted">${esc(snap.errorMessage)}</div>` : ''}

      ${
        snap.canReconnect
          ? `
        <div class="option-grid-2">
          <button type="button" class="btn btn-primary" data-action="wearable-reconnect-ble">Retry ${esc(snap.deviceName || preset.shortLabel)}</button>
          <button type="button" class="btn btn-secondary" data-action="wearable-connect-ble">Scan Again</button>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" data-action="wearable-simulate">Simulate HR (Demo)</button>
      `
          : `
        <div class="option-grid-2">
          <button type="button" class="btn btn-primary" data-action="wearable-connect-ble" ${isConnecting ? 'disabled' : ''}>${esc(preset.connectLabel)}</button>
          <button type="button" class="btn btn-secondary" data-action="${snap.status === 'simulating' ? 'wearable-disconnect' : 'wearable-simulate'}">${snap.status === 'simulating' ? 'Stop Demo' : 'Simulate HR'}</button>
        </div>
      `
      }

      <div class="list-card" style="flex-direction:column;align-items:flex-start;">
        <span class="sheet-label">${esc(preset.stepsTitle)}</span>
        <ol class="setup-steps">
          ${preset.steps.map((s) => `<li>${s}</li>`).join('')}
        </ol>
      </div>

      <form id="wearable-hr-form" class="sheet-section">
        <div class="field-grid-2">
          <div class="field">
            <label for="w-rhr">Resting HR</label>
            <input id="w-rhr" name="restingHr" class="field-input mono" type="number" min="35" max="110" value="${state.athlete.baselineRhr || 58}" />
          </div>
          <div class="field">
            <label for="w-mhr">Max HR</label>
            <input id="w-mhr" name="maxHr" class="field-input mono" type="number" min="120" max="220" value="${state.athlete.maxHr || 188}" />
          </div>
        </div>
        <button type="submit" class="btn btn-secondary btn-sm">Save HR Settings</button>
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

/**
 * Unified Machine Guide + Form Issue + Joint Pain Modal
 * Eliminates competing "How to Use", "Form / Issue", and "Pain" buttons!
 */
export function renderFormModalBody(state, session, formUi = {}) {
  const step = getActiveStep(session);
  const machineId = formUi.machineId || step?.stationId || 'm_ab_crunch';
  const machine = getMachineById(machineId) || GYM_MACHINES[0];
  const guide = getMachineGuide(machine.id);
  const tab = formUi.tab || 'guide'; // 'guide' | 'fix' | 'pain'
  const unit = state.settings.unit;
  const inc = machine.stepKg || 2.5;
  const pinnedCue = state.athlete.formNotes?.[machine.id]?.pinnedCue || '';

  const diagnosis = formUi.query ? diagnoseMachineIssue(machine, formUi.query) : null;
  const swapMachine = diagnosis?.swapId ? getMachineById(diagnosis.swapId) : null;

  const tabsHtml = `
    <div class="seg-row">
      <button type="button" class="seg-btn ${tab === 'guide' ? 'is-active' : ''}" data-action="set-form-tab" data-tab="guide">How to Use</button>
      <button type="button" class="seg-btn ${tab === 'fix' ? 'is-active' : ''}" data-action="set-form-tab" data-tab="fix">Wrong Muscle / Form</button>
      <button type="button" class="seg-btn ${tab === 'pain' ? 'is-active' : ''}" data-action="set-form-tab" data-tab="pain">Joint Pain</button>
    </div>
  `;

  if (tab === 'pain') {
    return `
      <div class="sheet-section" style="gap:12px;">
        ${tabsHtml}
        ${renderPainModalBody(state)}
      </div>
    `;
  }

  const stationSelectHtml = `
    <select id="form-station-select" class="field-input" style="height:38px;font-size:0.83rem;">
      ${GYM_MACHINES.map(
        (m) =>
          `<option value="${m.id}" ${m.id === machine.id ? 'selected' : ''}>${esc(m.name)} (${esc(m.gymLabel || '')})</option>`
      ).join('')}
    </select>
  `;

  if (tab === 'guide') {
    return `
      <div class="sheet-section" style="gap:12px;">
        ${tabsHtml}
        ${stationSelectHtml}

        <div class="form-diagram-box">
          ${renderFormDiagramSvg(machine)}
        </div>

        <div class="cue-line is-adapted">
          <span><strong>Seat &amp; Pivot:</strong> ${esc(guide.pivot)}</span>
        </div>

        <div class="list-card" style="flex-direction:column;align-items:flex-start;gap:6px;">
          <span class="sheet-label">Step-by-Step Setup</span>
          <ol class="setup-steps">
            ${guide.steps.map((s) => `<li>${esc(s)}</li>`).join('')}
          </ol>
        </div>

        <div class="feel-avoid-grid">
          <div class="feel-box">Should feel: ${esc(guide.feel)}</div>
          <div class="avoid-box">Avoid: ${esc(guide.avoid)}</div>
        </div>

        ${
          pinnedCue
            ? `
            <div class="list-card">
              <div>
                <span class="sheet-label">Your Saved Reminder</span>
                <div style="font-size:0.81rem;font-weight:700;">${esc(pinnedCue)}</div>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" data-action="clear-pinned-cue" data-machine-id="${machine.id}">Clear</button>
            </div>`
            : ''
        }

        <div class="option-grid-2">
          <button type="button" class="btn btn-secondary" data-action="set-form-tab" data-tab="fix">Feels Awkward?</button>
          <button type="button" class="btn btn-primary" data-action="confirm-guide-seen" data-machine-id="${machine.id}">Got It</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="sheet-section" style="gap:12px;">
      ${tabsHtml}
      ${stationSelectHtml}

      <div class="sheet-section">
        <span class="sheet-label">What feels off on ${esc(machine.name)}?</span>
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
        <span class="sheet-label">Or describe it in your own words</span>
        <div style="display:flex;gap:8px;">
          <input id="form-issue-input" name="issueText" class="field-input" type="text" placeholder="e.g. puts too much weight on lats instead..." value="${esc(formUi.rawText || '')}" />
          <button type="submit" class="btn btn-primary btn-sm">Fix</button>
        </div>
      </form>

      ${
        diagnosis
          ? `
          <div class="diagnosis-card">
            <div>
              <span class="sheet-label" style="color:var(--accent);">Why That Happens</span>
              <p class="diagnosis-cause" style="margin:4px 0 0;">${esc(diagnosis.cause)}</p>
            </div>

            <div>
              <span class="sheet-label">How to Fix It Now</span>
              <ol class="setup-steps" style="margin-top:4px;">
                ${diagnosis.fixes.map((f) => `<li>${esc(f)}</li>`).join('')}
              </ol>
            </div>

            <div class="sheet-section" style="gap:7px;margin-top:2px;">
              ${
                machine.loadType !== 'bodyweight' && machine.loadType !== 'cardio' && diagnosis.suggestDropLoad
                  ? `
                  <button type="button" class="btn btn-primary" data-action="apply-form-fix" data-cue="${esc(diagnosis.pinCue)}" data-drop="true">
                    Save Reminder &amp; Lower −${inc} ${unit}
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" data-action="apply-form-fix" data-cue="${esc(diagnosis.pinCue)}" data-drop="false">
                    Save Reminder Only
                  </button>
                `
                  : `
                  <button type="button" class="btn btn-primary" data-action="apply-form-fix" data-cue="${esc(diagnosis.pinCue)}" data-drop="false">
                    Save Reminder to ${esc(machine.shortName)}
                  </button>
                `
              }
              ${
                swapMachine
                  ? `
                  <button type="button" class="btn btn-secondary btn-sm" data-action="apply-form-swap" data-swap-id="${swapMachine.id}">
                    Swap to ${esc(swapMachine.name)} Instead
                  </button>
                `
                  : ''
              }
            </div>
          </div>
        `
          : `<div class="cue-line"><span>Tap an issue above or type what feels wrong — Coach will adjust setup, lower the pin, or swap the exercise.</span></div>`
      }
    </div>
  `;
}
