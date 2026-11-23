/**
 * Weights — AI-First Strength & Cardio Coach Controller (Clean 1-Tap Rep Overhaul)
 */

import { loadState, saveState, createDefaultState } from './state.js';
import { FLOOR_DIMS, getMachineById } from './floor.js';
import { GOAL_PROFILES, getMesocyclePhase, evaluateHrRestBrake } from './science.js';
import {
  createDynamicSession,
  getActiveStep,
  getCurrentSetInfo,
  recordLiftSetAndAdapt,
  rerouteBusyStation,
  applyPainProtection,
  compressRemainingSession,
  applyFormAdjustment,
  swapBriefingStep,
  removeBriefingStep,
  applyPreWorkoutFeedback,
  completeCurrentStep,
  finalizeSessionToPlan,
} from './planner.js';
import { feedback } from './audio.js';
import { RestTimer } from './timer.js';
import { WearableManager } from './wearable.js';
import {
  renderCoachStage,
  renderLiveHrStrip,
  renderGoalModalBody,
  renderFloorModalBody,
  renderPainModalBody,
  renderPlanModalBody,
  renderWearableModalBody,
  renderFormModalBody,
} from './ui.js';

const state = loadState();

let activeModal = null; // 'goal' | 'floor' | 'pain' | 'plan' | 'wearable' | 'form'
let editFloorPins = false;
let draggingMachineId = null;
let briefingView = 'plan'; // 'plan' | 'map'
let formUi = { tab: 'guide', machineId: null, query: '', rawText: '' };
let toastTimer = null;

const mainEl = document.getElementById('app-main');
const headerMesoTagEl = document.getElementById('header-meso-tag');
const wearableBtnEl = document.getElementById('wearable-btn');
const wearableBtnLabelEl = document.getElementById('wearable-btn-label');
const modalBackdropEl = document.getElementById('modal-backdrop');
const modalTitleEl = document.getElementById('modal-title');
const modalBodyEl = document.getElementById('modal-body');
const toastEl = document.getElementById('toast');

function showToast(msg) {
  if (!msg) return;
  toastEl.textContent = msg;
  toastEl.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastEl.classList.remove('is-visible');
  }, 2400);
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.settings.theme);
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', state.settings.theme === 'light' ? '#f3f0ea' : '#111317');
  }
}

function ensureSession() {
  if (!state.activeSession || !Array.isArray(state.activeSession.steps) || !state.activeSession.steps.length) {
    state.activeSession = createDynamicSession(state, {
      liveWearable: wearable?.getSnapshot?.() || null,
    });
    saveState(state);
  }
  return state.activeSession;
}

function syncHeader() {
  const goal = GOAL_PROFILES[state.athlete.goal] || GOAL_PROFILES.max_strength;
  const meso = getMesocyclePhase(state.athlete.mesocycle?.week || 1);
  if (headerMesoTagEl) {
    headerMesoTagEl.textContent =
      state.athlete.goal === 'max_strength' ? meso.headerTag : goal.short;
  }
}

// ============================================================================
// Wearable + Drift-Free Timer
// ============================================================================

const wearable = new WearableManager(
  () => ({
    deviceType: state.wearable.deviceType,
    restingHr: state.athlete.todayRhr || state.athlete.baselineRhr || 58,
    maxHr: state.athlete.maxHr || 188,
  }),
  (snap) => {
    if (snap.hrvMs && !state.athlete.todayHrv) {
      state.athlete.todayHrv = snap.hrvMs;
    }
    syncWearableUI(snap);
  }
);

const restTimer = new RestTimer(
  () => state.timer,
  (tSnap, shouldPersist) => {
    if (shouldPersist) saveState(state);
    renderStageOnly();
  },
  () => feedback.playCountdownTick(state.settings.sound),
  (tSnap) => {
    feedback.playRestDone(state.settings.sound);
    const sess = state.activeSession;
    if (sess && tSnap.mode === 'rest' && sess.phase === 'resting') {
      sess.phase = 'active';
      restTimer.stop();
      saveState(state);
      renderAll();
      showToast('Rest done · Ready for next set');
    } else if (sess && (tSnap.mode === 'warmup' || tSnap.mode === 'cardio')) {
      restTimer.stop();
      completeCurrentStep(sess, state.athlete);
      saveState(state);
      renderAll();
      showToast('Step complete');
    }
  },
  (tSnap) => {
    if (!state.settings.hrAutoExtendRest) return null;
    const wSnap = wearable.getSnapshot();
    const isLive = wSnap.status === 'connected' || wSnap.status === 'simulating';
    if (!isLive || !wSnap.bpm) return null;
    const brake = evaluateHrRestBrake({
      liveBpm: wSnap.bpm,
      athlete: state.athlete,
      elapsedSec: tSnap.elapsedSec,
      extensionsSoFar: tSnap.hrExtensions,
    });
    if (brake) showToast(brake.reason);
    return brake;
  }
);

function syncWearableUI(snap) {
  const isLive = snap.status === 'connected' || snap.status === 'simulating';
  if (wearableBtnEl && wearableBtnLabelEl) {
    wearableBtnEl.classList.toggle('is-live', isLive);
    wearableBtnLabelEl.textContent = isLive
      ? `${snap.bpm ?? '--'} bpm`
      : snap.preset?.shortLabel || 'Air';
  }

  const mount = document.getElementById('live-hr-mount');
  if (mount) {
    const sess = state.activeSession;
    const step = getActiveStep(sess);
    mount.innerHTML = renderLiveHrStrip(snap, step?.hrBand || null);
  }

  if (activeModal === 'wearable') {
    modalBodyEl.innerHTML = renderWearableModalBody(state, snap);
  }
}

function renderStageOnly() {
  const sess = ensureSession();
  mainEl.innerHTML = renderCoachStage(
    state,
    sess,
    restTimer.getSnapshot(),
    wearable.getSnapshot(),
    briefingView
  );
}

function renderAll() {
  syncHeader();
  renderStageOnly();
  syncWearableUI(wearable.getSnapshot());
  if (activeModal) refreshOpenModal();
}

// ============================================================================
// Modals
// ============================================================================

function openModal(type, title) {
  activeModal = type;
  modalTitleEl.textContent = title;
  refreshOpenModal();
  modalBackdropEl.classList.add('is-open');
  modalBackdropEl.setAttribute('aria-hidden', 'false');
}

function refreshOpenModal() {
  const sess = ensureSession();
  if (activeModal === 'goal') {
    modalBodyEl.innerHTML = renderGoalModalBody(state);
  } else if (activeModal === 'floor') {
    modalBodyEl.innerHTML = renderFloorModalBody(state, sess, editFloorPins);
  } else if (activeModal === 'pain') {
    modalBodyEl.innerHTML = renderPainModalBody(state);
  } else if (activeModal === 'plan') {
    modalBodyEl.innerHTML = renderPlanModalBody(state, sess);
  } else if (activeModal === 'wearable') {
    modalBodyEl.innerHTML = renderWearableModalBody(state, wearable.getSnapshot());
  } else if (activeModal === 'form') {
    modalBodyEl.innerHTML = renderFormModalBody(state, sess, formUi);
  }
}

function closeModal() {
  activeModal = null;
  editFloorPins = false;
  draggingMachineId = null;
  modalBackdropEl.classList.remove('is-open');
  modalBackdropEl.setAttribute('aria-hidden', 'true');
}

function rebuildBriefingSession(overrides = {}) {
  const prevSplit = overrides.splitOverride || state.activeSession?.splitId;
  const prevDur = overrides.durationMin || state.activeSession?.durationTargetMin || state.athlete.targetMinutes;
  restTimer.stop();
  state.activeSession = createDynamicSession(state, {
    splitOverride: overrides.useRecommended ? null : prevSplit,
    durationMin: prevDur,
    liveWearable: wearable.getSnapshot(),
  });
  saveState(state);
  renderAll();
}

// ============================================================================
// Event Delegation
// ============================================================================

document.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const sess = ensureSession();

  switch (action) {
    case 'open-goal-modal':
      openModal('goal', 'Training Plan & Goals');
      break;
    case 'open-floor-modal':
      openModal('floor', 'Manegg Motion Floor Map');
      break;
    case 'open-pain-modal':
      openModal('pain', 'Joint Pain Protection');
      break;
    case 'open-plan-modal':
      openModal('plan', 'Workout Queue & Settings');
      break;
    case 'open-wearable-modal':
      openModal('wearable', 'Heart Rate Sensor');
      break;
    case 'open-form-modal': {
      const curSt = getActiveStep(sess);
      formUi = {
        tab: btn.dataset.tab || 'guide',
        machineId: curSt?.stationId || 'm_ab_crunch',
        query: '',
        rawText: '',
      };
      openModal('form', 'Machine Guide & Troubleshooting');
      break;
    }
    case 'open-form-modal-for': {
      formUi = {
        tab: 'guide',
        machineId: btn.dataset.machineId || 'm_ab_crunch',
        query: '',
        rawText: '',
      };
      openModal('form', 'Machine Guide & Troubleshooting');
      break;
    }
    case 'set-form-tab': {
      formUi.tab = btn.dataset.tab || 'guide';
      refreshOpenModal();
      break;
    }
    case 'select-form-issue': {
      formUi.query = btn.dataset.issue || '';
      formUi.rawText = '';
      refreshOpenModal();
      break;
    }
    case 'confirm-guide-seen': {
      const mId = btn.dataset.machineId || formUi.machineId;
      if (mId) {
        if (!state.athlete.formNotes) state.athlete.formNotes = {};
        state.athlete.formNotes[mId] = {
          ...(state.athlete.formNotes[mId] || {}),
          seenGuide: true,
        };
        saveState(state);
      }
      closeModal();
      renderStageOnly();
      break;
    }
    case 'clear-pinned-cue': {
      const mId = btn.dataset.machineId || formUi.machineId;
      if (mId && state.athlete.formNotes?.[mId]) {
        delete state.athlete.formNotes[mId].pinnedCue;
        const curSt = getActiveStep(sess);
        if (curSt && curSt.stationId === mId) {
          const m = getMachineById(mId);
          curSt.cue = m?.cue || '';
          curSt.liveNote = '';
        }
        saveState(state);
        refreshOpenModal();
        renderStageOnly();
      }
      break;
    }
    case 'apply-form-fix': {
      const cue = btn.dataset.cue || '';
      const dropLoad = btn.dataset.drop === 'true';
      const curSt = getActiveStep(sess);
      if (curSt && (!formUi.machineId || formUi.machineId === curSt.stationId)) {
        const msg = applyFormAdjustment(sess, state.athlete, { pinCue: cue, dropLoad }, state.floorOverrides);
        saveState(state);
        closeModal();
        renderAll();
        showToast(msg);
      } else if (formUi.machineId) {
        if (!state.athlete.formNotes) state.athlete.formNotes = {};
        state.athlete.formNotes[formUi.machineId] = {
          ...(state.athlete.formNotes[formUi.machineId] || {}),
          seenGuide: true,
          pinnedCue: cue,
        };
        saveState(state);
        closeModal();
        showToast('Reminder saved for machine');
      }
      break;
    }
    case 'apply-form-swap': {
      const swapToId = btn.dataset.swapId;
      const msg = applyFormAdjustment(
        sess,
        state.athlete,
        { swapToId, rememberSwap: true },
        state.floorOverrides
      );
      saveState(state);
      closeModal();
      renderAll();
      showToast(msg);
      break;
    }
    case 'close-modal':
      closeModal();
      break;

    // Briefing controls
    case 'set-briefing-view': {
      briefingView = btn.dataset.view === 'map' ? 'map' : 'plan';
      renderStageOnly();
      break;
    }
    case 'briefing-swap-step': {
      const idx = parseInt(btn.dataset.index, 10);
      const msg = swapBriefingStep(state, sess, idx);
      saveState(state);
      renderAll();
      if (msg) showToast(msg);
      break;
    }
    case 'briefing-remove-step': {
      const idx = parseInt(btn.dataset.index, 10);
      const msg = removeBriefingStep(state, sess, idx);
      saveState(state);
      renderAll();
      if (msg) showToast(msg);
      break;
    }
    case 'apply-briefing-chip': {
      const fb = btn.dataset.feedback || '';
      const msg = applyPreWorkoutFeedback(state, sess, fb, wearable.getSnapshot());
      saveState(state);
      renderAll();
      if (msg) showToast(msg);
      break;
    }
    case 'select-split': {
      const splitId = btn.dataset.split;
      state.activeSession = createDynamicSession(state, {
        splitOverride: splitId,
        durationMin: sess.durationTargetMin,
        liveWearable: wearable.getSnapshot(),
      });
      saveState(state);
      renderAll();
      break;
    }
    case 'select-duration': {
      const mins = parseInt(btn.dataset.min, 10) || 45;
      state.athlete.targetMinutes = mins;
      state.activeSession = createDynamicSession(state, {
        splitOverride: sess.splitId,
        durationMin: mins,
        liveWearable: wearable.getSnapshot(),
      });
      saveState(state);
      renderAll();
      break;
    }
    case 'toggle-partner-quick': {
      state.partner.enabled = !state.partner.enabled;
      rebuildBriefingSession();
      showToast(state.partner.enabled ? 'Partner mode on' : 'Solo mode');
      break;
    }
    case 'start-session': {
      feedback.ensureAudio();
      if (state.settings.wakeLock) feedback.setWakeLock(true);
      wearable.resetSessionMetrics();
      sess.startedAt = Date.now();
      sess.phase = 'active';
      sess.currentStepIndex = 0;
      saveState(state);
      renderAll();
      break;
    }

    // Timed Warm-up / Cardio controls
    case 'start-timed-step': {
      feedback.ensureAudio();
      const step = getActiveStep(sess);
      if (step && (step.type === 'warmup' || step.type === 'cardio')) {
        restTimer.start(step.durationSec, { mode: step.type, label: step.type });
        saveState(state);
        renderStageOnly();
      }
      break;
    }
    case 'complete-timed-step': {
      restTimer.stop();
      completeCurrentStep(sess, state.athlete);
      saveState(state);
      renderAll();
      break;
    }

    // Strength station controls (1-tap rep logging!)
    case 'nudge-load': {
      const delta = Number(btn.dataset.delta) || 0;
      const step = getActiveStep(sess);
      const info = getCurrentSetInfo(step);
      if (step && info) {
        for (let i = info.arrayIndex; i < step.sets.length; i += 1) {
          const s = step.sets[i];
          if (!s.done && s.kind === info.set.kind) {
            s.weightKg = Math.max(0, Math.round((s.weightKg + delta) * 10) / 10);
          }
        }
        saveState(state);
        renderStageOnly();
      }
      break;
    }
    case 'log-reps': {
      feedback.ensureAudio();
      feedback.playLogConfirm(state.settings.sound);
      const actualReps = parseInt(btn.dataset.reps, 10) || 8;
      const outcome = recordLiftSetAndAdapt(
        sess,
        state.athlete,
        { actualReps },
        state.settings.unit
      );
      if (outcome) {
        if (outcome.coachBanner) showToast(outcome.coachBanner);
        if (!outcome.finishedSession && outcome.restSec > 0) {
          restTimer.start(outcome.restSec, { mode: 'rest', label: 'Rest' });
        } else {
          restTimer.stop();
        }
      }
      saveState(state);
      renderAll();
      break;
    }

    // Rest timer controls
    case 'timer-adjust': {
      const delta = parseInt(btn.dataset.delta, 10) || 0;
      restTimer.adjust(delta);
      break;
    }
    case 'end-rest-now': {
      restTimer.stop();
      sess.phase = 'active';
      saveState(state);
      renderAll();
      break;
    }

    // Live Coach Adaptation Triggers
    case 'machine-busy': {
      restTimer.stop();
      const msg = rerouteBusyStation(sess, state.athlete, state.floorOverrides);
      saveState(state);
      renderAll();
      showToast(msg);
      break;
    }
    case 'report-pain': {
      const joint = btn.dataset.joint;
      restTimer.stop();
      const msg = applyPainProtection(sess, state.athlete, joint, state.floorOverrides);
      saveState(state);
      closeModal();
      renderAll();
      showToast(msg);
      break;
    }
    case 'clear-pain-flags': {
      state.athlete.jointFlags = {};
      saveState(state);
      refreshOpenModal();
      showToast('Protected areas cleared');
      break;
    }
    case 'compress-time': {
      const msg = compressRemainingSession(sess);
      saveState(state);
      closeModal();
      renderAll();
      showToast(msg);
      break;
    }
    case 'skip-step': {
      restTimer.stop();
      completeCurrentStep(sess, state.athlete);
      saveState(state);
      renderAll();
      showToast('Skipped exercise');
      break;
    }
    case 'finish-and-save-session': {
      restTimer.stop();
      feedback.setWakeLock(false);
      finalizeSessionToPlan(state, sess, wearable.getSnapshot());
      state.activeSession = createDynamicSession(state, { liveWearable: wearable.getSnapshot() });
      saveState(state);
      renderAll();
      showToast('Workout saved · Next session ready');
      break;
    }

    // Goal & 8-Week Block modal controls
    case 'set-athlete-goal': {
      state.athlete.goal = btn.dataset.goal;
      saveState(state);
      refreshOpenModal();
      break;
    }
    case 'set-meso-block': {
      const blk = parseInt(btn.dataset.block, 10) || 1;
      state.athlete.mesocycle.week = blk === 2 ? 5 : 1;
      saveState(state);
      refreshOpenModal();
      break;
    }
    case 'set-meso-week': {
      const w = parseInt(btn.dataset.week, 10) || 1;
      state.athlete.mesocycle.week = w;
      saveState(state);
      refreshOpenModal();
      break;
    }
    case 'toggle-focus-area': {
      const area = btn.dataset.area;
      const cur = new Set(state.athlete.focusAreas || []);
      if (cur.has(area)) {
        if (cur.size > 1) cur.delete(area);
      } else {
        cur.add(area);
      }
      state.athlete.focusAreas = [...cur];
      saveState(state);
      refreshOpenModal();
      break;
    }
    case 'set-cardio-goal': {
      state.athlete.cardioGoal = btn.dataset.cardio;
      saveState(state);
      refreshOpenModal();
      break;
    }
    case 'toggle-partner-mode': {
      state.partner.enabled = !state.partner.enabled;
      saveState(state);
      refreshOpenModal();
      break;
    }
    case 'toggle-partner-area': {
      const area = btn.dataset.area;
      const cur = new Set(state.partner.focusAreas || []);
      if (cur.has(area)) {
        if (cur.size > 1) cur.delete(area);
      } else {
        cur.add(area);
      }
      state.partner.focusAreas = [...cur];
      saveState(state);
      refreshOpenModal();
      break;
    }

    // Floor calibration controls
    case 'toggle-floor-edit': {
      editFloorPins = !editFloorPins;
      refreshOpenModal();
      break;
    }
    case 'reset-floor-pins': {
      state.floorOverrides = {};
      saveState(state);
      refreshOpenModal();
      renderStageOnly();
      showToast('Floor map reset');
      break;
    }

    // Plan queue & settings modal controls
    case 'jump-step': {
      const idx = parseInt(btn.dataset.index, 10);
      if (Number.isFinite(idx) && sess.steps[idx]) {
        restTimer.stop();
        sess.currentStepIndex = idx;
        if (sess.phase === 'briefing') sess.startedAt = Date.now();
        sess.phase = 'active';
        saveState(state);
        closeModal();
        renderAll();
      }
      break;
    }
    case 'regenerate-session': {
      rebuildBriefingSession({ useRecommended: true });
      closeModal();
      showToast('Fresh workout generated');
      break;
    }
    case 'toggle-setting': {
      const key = btn.dataset.key;
      if (key in state.settings) {
        state.settings[key] = !state.settings[key];
        saveState(state);
        refreshOpenModal();
      }
      break;
    }
    case 'toggle-theme': {
      state.settings.theme = state.settings.theme === 'light' ? 'dark' : 'light';
      applyTheme();
      saveState(state);
      refreshOpenModal();
      break;
    }
    case 'toggle-unit': {
      state.settings.unit = state.settings.unit === 'lb' ? 'kg' : 'lb';
      saveState(state);
      refreshOpenModal();
      renderStageOnly();
      break;
    }
    case 'reset-all': {
      if (window.confirm('Reset profile & workout history to defaults?')) {
        restTimer.stop();
        Object.assign(state, createDefaultState());
        state.activeSession = createDynamicSession(state);
        saveState(state);
        applyTheme();
        closeModal();
        renderAll();
        showToast('Reset complete');
      }
      break;
    }

    // Wearable actions
    case 'set-wearable-device': {
      const dev = btn.dataset.device;
      if (dev === 'garmin_venu_4s' || dev === 'fitbit_air') {
        state.wearable.deviceType = dev;
        saveState(state);
        syncWearableUI(wearable.getSnapshot());
      }
      break;
    }
    case 'wearable-connect-ble':
    case 'wearable-reconnect-ble': {
      const reuseDevice = action === 'wearable-reconnect-ble';
      wearable.connectBle({ reuseDevice }).then((ok) => {
        if (ok) {
          const snap = wearable.getSnapshot();
          if (snap.detectedType && snap.detectedType !== state.wearable.deviceType) {
            state.wearable.deviceType = snap.detectedType;
            saveState(state);
            syncWearableUI(wearable.getSnapshot());
          }
          showToast(`${snap.deviceName || 'Watch'} connected`);
        }
      });
      break;
    }
    case 'wearable-simulate': {
      wearable.startSimulation(() => restTimer.getSnapshot().running && restTimer.getSnapshot().mode === 'rest');
      showToast('Demo HR active');
      break;
    }
    case 'wearable-disconnect': {
      const wasConnecting = wearable.getSnapshot().status === 'connecting';
      wearable.disconnect();
      showToast(wasConnecting ? 'Pairing cancelled' : 'Watch disconnected');
      break;
    }

    default:
      break;
  }
});

mainEl.addEventListener('submit', (event) => {
  if (event.target.id === 'briefing-feedback-form') {
    event.preventDefault();
    const fd = new FormData(event.target);
    const raw = String(fd.get('feedback') || '').trim();
    if (raw) {
      const sess = ensureSession();
      const msg = applyPreWorkoutFeedback(state, sess, raw, wearable.getSnapshot());
      saveState(state);
      renderAll();
      if (msg) showToast(msg);
    }
  }
});

modalBodyEl.addEventListener('submit', (event) => {
  event.preventDefault();
  const fd = new FormData(event.target);

  if (event.target.id === 'goal-form') {
    state.athlete.daysPerWeek = Math.min(6, Math.max(2, parseInt(String(fd.get('daysPerWeek')), 10) || 3));
    state.athlete.todayRhr = Math.min(110, Math.max(35, parseInt(String(fd.get('todayRhr')), 10) || 58));
    const hrvRaw = String(fd.get('todayHrv') || '').trim();
    state.athlete.todayHrv = hrvRaw ? Math.min(180, Math.max(15, parseInt(hrvRaw, 10))) : null;

    if (state.partner.enabled) {
      state.partner.name = String(fd.get('partnerName') || 'Partner').trim() || 'Partner';
      state.partner.goal = String(fd.get('partnerGoal') || 'body_focus');
    }

    rebuildBriefingSession({ useRecommended: true });
    closeModal();
    showToast('Plan & workout updated');
    return;
  }

  if (event.target.id === 'wearable-hr-form') {
    const rhr = Math.min(110, Math.max(35, parseInt(String(fd.get('restingHr')), 10) || 58));
    const mhr = Math.min(220, Math.max(120, parseInt(String(fd.get('maxHr')), 10) || 188));
    state.athlete.baselineRhr = rhr;
    state.athlete.todayRhr = rhr;
    state.athlete.maxHr = mhr;
    state.wearable.restingHr = rhr;
    state.wearable.maxHr = mhr;
    saveState(state);
    syncWearableUI(wearable.getSnapshot());
    showToast('HR settings saved');
    return;
  }

  if (event.target.id === 'form-issue-form') {
    const raw = String(fd.get('issueText') || '').trim();
    if (raw) {
      formUi.rawText = raw;
      formUi.query = raw;
      refreshOpenModal();
    }
    return;
  }

  if (event.target.id === 'google-health-form') {
    const clientId = String(fd.get('clientId') || '').trim();
    state.wearable.googleHealthClientId = clientId;
    saveState(state);
    if (!clientId) {
      showToast('Enter OAuth Client ID');
      return;
    }
    window.location.href = WearableManager.buildGoogleHealthAuthUrl(
      clientId,
      window.location.origin + window.location.pathname
    );
  }
});

modalBodyEl.addEventListener('change', (event) => {
  if (event.target.id === 'form-station-select') {
    formUi.machineId = event.target.value;
    formUi.query = '';
    formUi.rawText = '';
    refreshOpenModal();
  }
});

modalBodyEl.addEventListener('pointerdown', (e) => {
  if (!editFloorPins) return;
  const pin = e.target.closest('[data-fp-machine]');
  if (!pin) return;
  draggingMachineId = pin.dataset.fpMachine;
  pin.setPointerCapture?.(e.pointerId);
});

modalBodyEl.addEventListener('pointermove', (e) => {
  if (!editFloorPins || !draggingMachineId) return;
  const svg = modalBodyEl.querySelector('.floor-svg');
  if (!svg) return;
  const rect = svg.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const normX = Math.max(0.04, Math.min(0.96, (e.clientX - rect.left) / rect.width));
  const normY = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / rect.height));
  state.floorOverrides[draggingMachineId] = {
    x: Math.round(normX * FLOOR_DIMS.width * 10) / 10,
    y: Math.round(normY * FLOOR_DIMS.height * 10) / 10,
  };
  refreshOpenModal();
});

window.addEventListener('pointerup', () => {
  if (draggingMachineId) {
    const m = getMachineById(draggingMachineId);
    draggingMachineId = null;
    saveState(state);
    renderStageOnly();
    if (m) showToast(`Moved ${m.shortName}`);
  }
});

modalBackdropEl.addEventListener('click', (e) => {
  if (e.target === modalBackdropEl) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && activeModal) closeModal();
});

const oauthRes = WearableManager.extractAccessTokenFromHash();
if (oauthRes?.accessToken) {
  WearableManager.fetchGoogleHealthSummary(oauthRes.accessToken)
    .then((summary) => {
      state.wearable.googleHealthSummary = summary;
      if (summary.restingHr) state.athlete.todayRhr = summary.restingHr;
      if (summary.hrvMs) state.athlete.todayHrv = summary.hrvMs;
      rebuildBriefingSession({ useRecommended: true });
      showToast('Google Health synced');
    })
    .catch(() => showToast('Google Health sync failed'));
}

// Boot
applyTheme();
ensureSession();
renderAll();
restTimer.init();

if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  let reloadingSw = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloadingSw && state.activeSession?.phase === 'briefing' && !restTimer.getSnapshot().running) {
      reloadingSw = true;
      window.location.reload();
    }
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => reg.update().catch(() => {}))
      .catch(() => {});
  });
}
