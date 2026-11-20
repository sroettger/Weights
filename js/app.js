/**
 * Weights — Full-Screen Coach Controller (Manegg Motion + Fitbit Air)
 */

import {
  BODY_GROUPS,
  loadState,
  saveState,
  createDefaultState,
  convertAllWeights,
  uid,
  formatRest,
  formatLoadDisplay,
} from './data.js';
import {
  ensureValidActiveMachine,
  getNextUnfinishedMachine,
  evaluateSetFeedback,
  applyAdaptiveProgression,
  deferBusyMachine,
  skipMachineToday,
  swapMachineForToday,
  processCoachCommand,
} from './coach.js';
import { feedback } from './audio.js';
import { RestTimer } from './timer.js';
import { WearableManager } from './wearable.js';
import {
  escapeHtml,
  countSessionSets,
  renderCoachView,
  renderPlanModalBody,
  renderMachinesView,
  renderHistoryView,
  renderTimerDock,
  renderTimerModalBody,
  renderLiveBiometrics,
  renderWearableModalBody,
} from './ui.js';

const state = loadState();
let currentTab = 'coach';
let searchQuery = '';
let activeModal = null; // 'plan' | 'machine' | 'swap' | 'timer' | 'wearable' | 'settings'
let editingMachineId = null;
let toastTimer = null;

// Focused rep check-in state (only opens when user taps "Done Set N")
let draftCheckin = { open: false, machineId: null, reps: 10 };

const mainEl = document.getElementById('app-main');
const timerDockEl = document.getElementById('timer-dock');
const modalBackdropEl = document.getElementById('modal-backdrop');
const modalTitleEl = document.getElementById('modal-title');
const modalBodyEl = document.getElementById('modal-body');
const wearableBtnEl = document.getElementById('wearable-btn');
const wearableBtnLabelEl = document.getElementById('wearable-btn-label');
const toastEl = document.getElementById('toast');

function showToast(message) {
  toastEl.textContent = message;
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
    metaTheme.setAttribute('content', state.settings.theme === 'light' ? '#f3efe9' : '#131519');
  }
}

function syncBottomNav() {
  document.querySelectorAll('.nav-item').forEach((btn) => {
    const active = btn.dataset.tab === currentTab;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-current', active ? 'page' : 'false');
  });
}

function renderMain() {
  const activeId = document.activeElement?.id;
  const selStart = activeId === 'machine-search' ? document.activeElement.selectionStart : null;

  mainEl.classList.toggle('is-coach-mode', currentTab === 'coach');
  mainEl.classList.toggle('has-timer', restTimer.getSnapshot().running);

  if (currentTab === 'coach') {
    mainEl.innerHTML = renderCoachView(state, draftCheckin);
    renderWearableUI(wearable.getSnapshot());
  } else if (currentTab === 'machines') {
    mainEl.innerHTML = renderMachinesView(state, searchQuery);
  } else if (currentTab === 'history') {
    mainEl.innerHTML = renderHistoryView(state);
  }

  if (activeModal === 'plan') {
    modalBodyEl.innerHTML = renderPlanModalBody(state);
  }

  if (activeId === 'machine-search') {
    const input = document.getElementById('machine-search');
    if (input) {
      input.focus();
      if (selStart !== null) input.setSelectionRange(selStart, selStart);
    }
  }
}

function renderWearableUI(snap) {
  const isLive = snap.status === 'connected' || snap.status === 'simulating';
  if (wearableBtnEl && wearableBtnLabelEl) {
    wearableBtnEl.classList.toggle('is-live', isLive);
    wearableBtnLabelEl.textContent = isLive ? `${snap.bpm ?? '--'} · Z${snap.zone.zone || 1}` : 'Air';
  }

  const mount = document.getElementById('live-hr-mount');
  if (mount && currentTab === 'coach') {
    mount.innerHTML = renderLiveBiometrics(snap, restTimer.getSnapshot(), ensureValidActiveMachine(state));
  }

  if (activeModal === 'wearable') {
    modalBodyEl.innerHTML = renderWearableModalBody(state, snap);
  }
}

const wearable = new WearableManager(
  () => state.wearable,
  (snap) => renderWearableUI(snap)
);

function renderTimerUI(snap) {
  timerDockEl.classList.toggle('is-hidden', !snap.running);
  timerDockEl.classList.toggle('is-running', snap.running && !snap.overtime);
  timerDockEl.classList.toggle('is-overtime', snap.running && snap.overtime);
  timerDockEl.innerHTML = renderTimerDock(snap);
  mainEl.classList.toggle('has-timer', snap.running);

  if (activeModal === 'timer') {
    if (!snap.running) closeModal();
    else modalBodyEl.innerHTML = renderTimerModalBody(snap);
  }
}

const restTimer = new RestTimer(
  () => state.timer,
  (snap, shouldPersist) => {
    renderTimerUI(snap);
    if (shouldPersist) saveState(state);
  },
  () => feedback.playCountdownTick(state.settings.sound),
  (snap) => {
    feedback.playRestDone(state.settings.sound);
    showToast(`Rest done · ${snap.label || 'Go'}`);
  }
);

// ============================================================================
// Modals
// ============================================================================

function openModal(type, title, bodyHtml) {
  activeModal = type;
  modalTitleEl.textContent = title;
  modalBodyEl.innerHTML = bodyHtml;
  modalBackdropEl.classList.add('is-open');
  modalBackdropEl.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  activeModal = null;
  editingMachineId = null;
  modalBackdropEl.classList.remove('is-open');
  modalBackdropEl.setAttribute('aria-hidden', 'true');
}

function openSwapModal(machineId) {
  const m = state.machines.find((x) => x.id === machineId);
  if (!m) return;
  const swaps = Array.isArray(m.swaps) ? m.swaps : [];

  openModal(
    'swap',
    `Swap · ${m.name}`,
    `
      <div class="form-stack">
        ${
          swaps.length
            ? `<div class="swap-list">${swaps
                .map(
                  (s, idx) => `
                <button type="button" class="swap-choice" data-action="apply-swap" data-machine-id="${escapeHtml(m.id)}" data-swap-index="${idx}">
                  <strong>${escapeHtml(s.name)}</strong>
                  <span>${escapeHtml(s.setupNote)}</span>
                </button>`
                )
                .join('')}</div>`
            : `<p class="spec-sub">No preset swaps.</p>`
        }
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary btn-sm" data-action="machine-busy-close" data-machine-id="${escapeHtml(m.id)}">Do Later (Busy)</button>
          <button type="button" class="btn btn-ghost btn-sm" data-action="close-modal">Cancel</button>
        </div>
      </div>
    `
  );
}

function openMachineModal(machineId = null) {
  editingMachineId = machineId;
  const existing = machineId ? state.machines.find((m) => m.id === machineId) : null;
  const unit = state.settings.unit;
  const m = existing || {
    name: '',
    subtitle: '',
    muscle: '',
    group: 'push',
    loadType: 'stack',
    weight: 30,
    step: 2.5,
    sets: 3,
    reps: 10,
    restSec: 90,
    setupNote: '',
  };

  openModal(
    'machine',
    existing ? 'Edit Station' : 'Add Station',
    `
      <form id="machine-form" class="form-stack">
        <div class="field">
          <label class="field-label" for="m-name">Name</label>
          <input id="m-name" name="name" class="field-input" type="text" required value="${escapeHtml(m.name)}" />
        </div>
        <div class="form-grid-2">
          <div class="field">
            <label class="field-label" for="m-muscle">Muscle</label>
            <input id="m-muscle" name="muscle" class="field-input" type="text" value="${escapeHtml(m.muscle)}" />
          </div>
          <div class="field">
            <label class="field-label" for="m-group">Group</label>
            <select id="m-group" name="group" class="field-select">
              ${BODY_GROUPS.map((g) => `<option value="${g.id}" ${m.group === g.id ? 'selected' : ''}>${escapeHtml(g.label)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-grid-2">
          <div class="field">
            <label class="field-label" for="m-load-type">Load Type</label>
            <select id="m-load-type" name="loadType" class="field-select">
              <option value="stack" ${m.loadType === 'stack' ? 'selected' : ''}>Stack (${escapeHtml(unit)})</option>
              <option value="plate_per_side" ${m.loadType === 'plate_per_side' ? 'selected' : ''}>Plates/side (${escapeHtml(unit)})</option>
              <option value="bodyweight" ${m.loadType === 'bodyweight' ? 'selected' : ''}>Bodyweight</option>
              <option value="cardio" ${m.loadType === 'cardio' ? 'selected' : ''}>Cardio (min)</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label" for="m-weight">Weight / Min</label>
            <input id="m-weight" name="weight" class="field-input mono" type="number" step="any" min="0" required value="${escapeHtml(m.weight)}" />
          </div>
        </div>
        <div class="form-grid-3">
          <div class="field">
            <label class="field-label" for="m-step">Step</label>
            <select id="m-step" name="step" class="field-select mono">
              ${[1.25, 2.3, 2.5, 4.5, 5, 10].map((s) => `<option value="${s}" ${Number(m.step) === s ? 'selected' : ''}>±${s}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label class="field-label" for="m-sets">Sets</label>
            <input id="m-sets" name="sets" class="field-input mono" type="number" min="1" max="10" required value="${escapeHtml(m.sets)}" />
          </div>
          <div class="field">
            <label class="field-label" for="m-reps">Reps</label>
            <input id="m-reps" name="reps" class="field-input mono" type="number" min="1" max="100" required value="${escapeHtml(m.reps)}" />
          </div>
        </div>
        <div class="field">
          <label class="field-label" for="m-rest">Rest (sec)</label>
          <div class="rest-preset-row">
            ${[0, 45, 60, 75, 90, 120, 180].map((sec) => `<button type="button" class="rest-option-btn ${Number(m.restSec) === sec ? 'is-selected' : ''}" data-action="pick-rest-preset" data-sec="${sec}">${formatRest(sec)}</button>`).join('')}
          </div>
          <input id="m-rest" name="restSec" class="field-input mono" type="number" min="0" max="600" step="5" required value="${escapeHtml(m.restSec)}" />
        </div>
        <div class="field">
          <label class="field-label" for="m-setup">Setup (Seat / Pin / Bench)</label>
          <input id="m-setup" name="setupNote" class="field-input" type="text" value="${escapeHtml(m.setupNote || '')}" />
        </div>
        <div class="modal-footer">
          ${existing ? `<button type="button" class="btn btn-danger btn-sm" data-action="delete-machine" data-machine-id="${escapeHtml(existing.id)}">Delete</button>` : '<span></span>'}
          <div class="modal-footer-right">
            <button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </div>
      </form>
    `
  );
}

function openSettingsModal() {
  openModal(
    'settings',
    'Settings',
    `
      <div>
        <div class="setting-row">
          <div class="setting-info"><strong>Theme</strong></div>
          <div class="segmented">
            <button type="button" class="segmented-btn ${state.settings.theme === 'dark' ? 'is-active' : ''}" data-action="set-theme" data-val="dark">Dark</button>
            <button type="button" class="segmented-btn ${state.settings.theme === 'light' ? 'is-active' : ''}" data-action="set-theme" data-val="light">Light</button>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info"><strong>Unit</strong></div>
          <div class="segmented">
            <button type="button" class="segmented-btn ${state.settings.unit === 'kg' ? 'is-active' : ''}" data-action="set-unit" data-unit="kg">kg</button>
            <button type="button" class="segmented-btn ${state.settings.unit === 'lb' ? 'is-active' : ''}" data-action="set-unit" data-unit="lb">lb</button>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info"><strong>Auto-Rest</strong></div>
          <div class="segmented">
            <button type="button" class="segmented-btn ${state.settings.autoStartRest ? 'is-active' : ''}" data-action="set-autorest" data-val="true">On</button>
            <button type="button" class="segmented-btn ${!state.settings.autoStartRest ? 'is-active' : ''}" data-action="set-autorest" data-val="false">Off</button>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info"><strong>Chime</strong></div>
          <div style="display:flex;gap:6px;align-items:center;">
            <button type="button" class="btn btn-secondary btn-sm" data-action="test-chime">Test</button>
            <div class="segmented">
              <button type="button" class="segmented-btn ${state.settings.sound ? 'is-active' : ''}" data-action="set-sound" data-val="true">On</button>
              <button type="button" class="segmented-btn ${!state.settings.sound ? 'is-active' : ''}" data-action="set-sound" data-val="false">Off</button>
            </div>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info"><strong>Keep Screen Awake</strong></div>
          <div class="segmented">
            <button type="button" class="segmented-btn ${state.settings.wakeLock ? 'is-active' : ''}" data-action="set-wakelock" data-val="true">On</button>
            <button type="button" class="segmented-btn ${!state.settings.wakeLock ? 'is-active' : ''}" data-action="set-wakelock" data-val="false">Off</button>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info"><strong>Backup</strong></div>
          <div style="display:flex;gap:6px;">
            <button type="button" class="btn btn-secondary btn-sm" data-action="export-data">Export</button>
            <label class="btn btn-secondary btn-sm" style="cursor:pointer;">
              Import
              <input type="file" id="import-file-input" accept="application/json" class="sr-only" />
            </label>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info"><strong>Reset Defaults</strong></div>
          <button type="button" class="btn btn-danger btn-sm" data-action="reset-all-data">Reset</button>
        </div>
      </div>
    `
  );
}

// ============================================================================
// Core Actions
// ============================================================================

function handleLogActiveSet(machineId) {
  const m = state.machines.find((x) => x.id === machineId);
  if (!m) return;

  feedback.ensureAudio();
  const tp = state.todayPlan;
  if (!tp.startedAt) tp.startedAt = Date.now();
  if (!Array.isArray(tp.completedSets[m.id])) tp.completedSets[m.id] = [];

  const repsDone = Math.max(1, Number(draftCheckin.reps) || Number(m.reps) || 10);
  tp.completedSets[m.id].push({
    weight: m.weight,
    reps: repsDone,
    bpm: wearable.getSnapshot().bpm,
    at: Date.now(),
  });

  const setNum = tp.completedSets[m.id].length;
  const totalSets = Math.max(1, Number(m.sets) || 3);
  feedback.playSetComplete(state.settings.sound);

  draftCheckin = { open: false, machineId: null, reps: 10 };

  if (setNum >= totalSets) {
    if (!tp.finishedMachineIds.includes(m.id)) tp.finishedMachineIds.push(m.id);
    tp.busyIds = tp.busyIds.filter((id) => id !== m.id);
    const adj = applyAdaptiveProgression(state, m);
    const next = getNextUnfinishedMachine(state, m.id);
    tp.activeMachineId = next ? next.id : null;
    tp.coachMessage = '';

    if (next) {
      if (state.settings.autoStartRest && m.restSec > 0) {
        restTimer.start(m.restSec, `Next · ${next.name}`);
      }
      showToast(`${m.name} · ${adj ? adj.deltaText : 'Done'}`);
    } else {
      restTimer.stop();
      showToast('Session complete');
    }
  } else {
    const fb = evaluateSetFeedback(m, repsDone, setNum, totalSets);
    tp.coachMessage = fb.message;
    if (state.settings.autoStartRest && fb.restSec > 0) {
      restTimer.start(fb.restSec, `${m.name} · Set ${setNum + 1}`);
    }
  }

  saveState(state);
  renderMain();
}

function handleFinishSession() {
  const totalSets = countSessionSets(state);
  if (totalSets === 0) return;

  const tp = state.todayPlan;
  const now = Date.now();
  const unit = state.settings.unit;
  const durationSec = tp.startedAt ? Math.max(60, Math.floor((now - tp.startedAt) / 1000)) : 1800;

  const entries = [];
  for (const m of state.machines) {
    const logged = (tp.completedSets[m.id] || []).filter(Boolean);
    if (logged.length > 0) {
      if (!tp.finishedMachineIds.includes(m.id)) applyAdaptiveProgression(state, m);
      entries.push({
        machineId: m.id,
        name: m.name,
        loadText: formatLoadDisplay(m, unit).badge,
        sets: logged.length,
        repsList: logged.map((s) => s.reps),
      });
    }
  }

  const wSnap = wearable.getSnapshot();
  state.history.unshift({
    id: uid('hist'),
    date: now,
    title: `${state.gymName} · ${entries.length} Stations`,
    durationSec,
    totalSets,
    unit,
    avgBpm: wSnap.avgBpm,
    peakBpm: wSnap.peakBpm,
    estKcal: wSnap.estKcal > 1 ? Math.round(wSnap.estKcal) : null,
    entries,
  });

  wearable.resetSessionMetrics();
  startFreshSession(false);
  showToast(`Saved · ${totalSets} sets`);
}

function startFreshSession(notify = true) {
  state.todayPlan = {
    startedAt: null,
    queue: state.machines.map((m) => m.id),
    activeMachineId: state.machines[0]?.id || null,
    skippedIds: [],
    busyIds: [],
    excludedGroups: [],
    excludedTags: [],
    completedSets: {},
    finishedMachineIds: [],
    sessionAdjustments: {},
    coachMessage: '',
  };
  draftCheckin = { open: false, machineId: null, reps: 10 };
  restTimer.stop();
  saveState(state);
  renderMain();
  if (notify) showToast('New session ready');
}

function handleExportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `weights-manegg-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Exported');
}

function handleImportData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!Array.isArray(parsed.machines)) throw new Error('Invalid');
      Object.assign(state, createDefaultState(), parsed);
      saveState(state);
      applyTheme();
      renderMain();
      renderTimerUI(restTimer.getSnapshot());
      closeModal();
      showToast('Imported');
    } catch {
      showToast('Invalid JSON');
    }
  };
  reader.readAsText(file);
}

// ============================================================================
// Events
// ============================================================================

document.addEventListener('click', async (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;

  switch (action) {
    case 'open-plan-modal': {
      openModal('plan', "Today's Plan", renderPlanModalBody(state));
      break;
    }
    case 'open-checkin': {
      const m = state.machines.find((x) => x.id === target.dataset.machineId);
      if (m) {
        const prevLogged = (state.todayPlan.completedSets[m.id] || []).filter(Boolean);
        const defaultReps = prevLogged.length ? prevLogged[prevLogged.length - 1].reps : Number(m.reps) || 10;
        draftCheckin = { open: true, machineId: m.id, reps: defaultReps };
        renderMain();
      }
      break;
    }
    case 'cancel-checkin': {
      draftCheckin.open = false;
      renderMain();
      break;
    }
    case 'checkin-rep-step': {
      draftCheckin.reps = Math.max(1, (Number(draftCheckin.reps) || 10) + (Number(target.dataset.delta) || 0));
      renderMain();
      break;
    }
    case 'checkin-rep-set': {
      draftCheckin.reps = Math.max(1, Number(target.dataset.reps) || 10);
      renderMain();
      break;
    }
    case 'log-active-set': {
      handleLogActiveSet(target.dataset.machineId);
      break;
    }
    case 'coach-quick': {
      const msg = processCoachCommand(state, target.dataset.cmd);
      saveState(state);
      renderMain();
      if (msg) showToast(msg);
      break;
    }
    case 'toggle-group': {
      const g = target.dataset.groupId;
      const ex = state.todayPlan.excludedGroups;
      const idx = ex.indexOf(g);
      const label = BODY_GROUPS.find((x) => x.id === g)?.label || g;
      if (idx === -1) {
        ex.push(g);
        state.todayPlan.coachMessage = `Skipped ${label}`;
      } else {
        ex.splice(idx, 1);
        state.todayPlan.coachMessage = `Added ${label}`;
      }
      ensureValidActiveMachine(state);
      saveState(state);
      renderMain();
      break;
    }
    case 'machine-busy': {
      deferBusyMachine(state, target.dataset.machineId);
      draftCheckin.open = false;
      saveState(state);
      renderMain();
      showToast(state.todayPlan.coachMessage);
      break;
    }
    case 'machine-busy-close': {
      deferBusyMachine(state, target.dataset.machineId);
      draftCheckin.open = false;
      saveState(state);
      closeModal();
      renderMain();
      showToast(state.todayPlan.coachMessage);
      break;
    }
    case 'skip-machine': {
      skipMachineToday(state, target.dataset.machineId);
      draftCheckin.open = false;
      saveState(state);
      renderMain();
      showToast(state.todayPlan.coachMessage);
      break;
    }
    case 'open-swap-modal': {
      openSwapModal(target.dataset.machineId);
      break;
    }
    case 'apply-swap': {
      swapMachineForToday(state, target.dataset.machineId, Number(target.dataset.swapIndex));
      saveState(state);
      closeModal();
      renderMain();
      showToast(state.todayPlan.coachMessage);
      break;
    }
    case 'focus-machine': {
      const id = target.dataset.machineId;
      state.todayPlan.activeMachineId = id;
      state.todayPlan.finishedMachineIds = state.todayPlan.finishedMachineIds.filter((x) => x !== id);
      state.todayPlan.coachMessage = '';
      draftCheckin.open = false;
      saveState(state);
      closeModal();
      renderMain();
      break;
    }
    case 'jump-to-coach': {
      const id = target.dataset.machineId;
      state.todayPlan.skippedIds = state.todayPlan.skippedIds.filter((x) => x !== id);
      state.todayPlan.finishedMachineIds = state.todayPlan.finishedMachineIds.filter((x) => x !== id);
      state.todayPlan.activeMachineId = id;
      state.todayPlan.coachMessage = '';
      currentTab = 'coach';
      draftCheckin.open = false;
      saveState(state);
      syncBottomNav();
      renderMain();
      break;
    }
    case 'set-cardio-mode': {
      const m = state.machines.find((x) => x.id === target.dataset.machineId);
      if (m) {
        m.cardioMode = target.dataset.mode === 'stairs' ? 'stairs' : 'running';
        m.setupNote = m.cardioMode === 'stairs' ? 'Onyx ClimbMill · Level 5–7 · Upright' : 'Onyx Treadmill 2% incline · Steady pace';
        saveState(state);
        renderMain();
      }
      break;
    }
    case 'step-weight': {
      const m = state.machines.find((x) => x.id === target.dataset.machineId);
      if (m) {
        const next = Math.max(0, Math.round((Number(m.weight) + Number(target.dataset.delta)) * 100) / 100);
        m.weight = next;
        if (m.loadType === 'cardio') m.reps = Math.max(5, Math.round(next));
        saveState(state);
        renderMain();
      }
      break;
    }
    case 'start-machine-rest': {
      feedback.ensureAudio();
      const m = state.machines.find((x) => x.id === target.dataset.machineId);
      if (m && m.restSec > 0) restTimer.start(m.restSec, m.name);
      break;
    }
    case 'timer-adjust': {
      restTimer.adjust(Number(target.dataset.delta));
      break;
    }
    case 'timer-toggle-pause': {
      restTimer.togglePause();
      break;
    }
    case 'timer-stop': {
      restTimer.stop();
      break;
    }
    case 'timer-stop-and-close': {
      restTimer.stop();
      closeModal();
      break;
    }
    case 'open-timer-modal': {
      const snap = restTimer.getSnapshot();
      if (snap.running) openModal('timer', 'Rest', renderTimerModalBody(snap));
      break;
    }
    case 'open-add-machine': {
      openMachineModal(null);
      break;
    }
    case 'open-edit-machine': {
      openMachineModal(target.dataset.machineId);
      break;
    }
    case 'delete-machine': {
      const id = target.dataset.machineId;
      state.machines = state.machines.filter((m) => m.id !== id);
      state.todayPlan.queue = state.todayPlan.queue.filter((x) => x !== id);
      ensureValidActiveMachine(state);
      saveState(state);
      closeModal();
      renderMain();
      break;
    }
    case 'pick-rest-preset': {
      const sec = Number(target.dataset.sec);
      const inp = document.getElementById('m-rest');
      if (inp) inp.value = String(sec);
      document.querySelectorAll('.rest-option-btn').forEach((b) => {
        b.classList.toggle('is-selected', Number(b.dataset.sec) === sec);
      });
      break;
    }
    case 'clear-search': {
      searchQuery = '';
      renderMain();
      break;
    }
    case 'finish-session': {
      handleFinishSession();
      break;
    }
    case 'finish-session-close': {
      closeModal();
      handleFinishSession();
      break;
    }
    case 'start-new-session': {
      startFreshSession(true);
      break;
    }
    case 'delete-history': {
      state.history = state.history.filter((h) => h.id !== target.dataset.historyId);
      saveState(state);
      renderMain();
      break;
    }
    case 'set-theme': {
      state.settings.theme = target.dataset.val === 'light' ? 'light' : 'dark';
      saveState(state);
      applyTheme();
      openSettingsModal();
      break;
    }
    case 'set-unit': {
      convertAllWeights(state, target.dataset.unit);
      saveState(state);
      openSettingsModal();
      renderMain();
      break;
    }
    case 'set-autorest': {
      state.settings.autoStartRest = target.dataset.val === 'true';
      saveState(state);
      openSettingsModal();
      break;
    }
    case 'set-sound': {
      feedback.ensureAudio();
      state.settings.sound = target.dataset.val === 'true';
      saveState(state);
      openSettingsModal();
      break;
    }
    case 'set-wakelock': {
      const next = target.dataset.val === 'true';
      const ok = await feedback.setWakeLock(next);
      state.settings.wakeLock = next && ok;
      saveState(state);
      openSettingsModal();
      if (next && !ok) showToast('Wake lock unsupported here');
      break;
    }
    case 'test-chime': {
      feedback.ensureAudio();
      feedback.playRestDone(true);
      break;
    }
    case 'export-data': {
      handleExportData();
      break;
    }
    case 'reset-all-data': {
      if (window.confirm('Reset to Manegg Motion defaults?')) {
        Object.assign(state, createDefaultState());
        draftCheckin = { open: false, machineId: null, reps: 10 };
        restTimer.stop();
        saveState(state);
        applyTheme();
        closeModal();
        renderMain();
        showToast('Reset complete');
      }
      break;
    }
    case 'open-wearable-modal': {
      openModal('wearable', 'Google Fitbit Air', renderWearableModalBody(state, wearable.getSnapshot()));
      break;
    }
    case 'wearable-connect-ble': {
      wearable.connectBle().then((ok) => {
        if (ok) showToast('Fitbit Air connected');
      });
      break;
    }
    case 'wearable-simulate': {
      wearable.startSimulation(() => restTimer.getSnapshot().running);
      showToast('Demo HR active');
      break;
    }
    case 'wearable-disconnect': {
      wearable.disconnect();
      showToast('Disconnected');
      break;
    }
    case 'close-modal': {
      closeModal();
      break;
    }
    default:
      break;
  }
});

mainEl.addEventListener('input', (event) => {
  if (event.target.id === 'machine-search') {
    searchQuery = event.target.value;
    renderMain();
  }
});

modalBodyEl.addEventListener('submit', (event) => {
  event.preventDefault();

  if (event.target.id === 'coach-cmd-form') {
    const input = document.getElementById('coach-cmd-input');
    if (input?.value.trim()) {
      const msg = processCoachCommand(state, input.value);
      saveState(state);
      renderMain();
      if (msg) showToast(msg);
    }
    return;
  }

  if (event.target.id === 'wearable-profile-form') {
    const fd = new FormData(event.target);
    state.wearable.restingHr = Math.min(110, Math.max(35, parseInt(String(fd.get('restingHr')), 10) || 58));
    state.wearable.maxHr = Math.min(220, Math.max(120, parseInt(String(fd.get('maxHr')), 10) || 188));
    saveState(state);
    renderWearableUI(wearable.getSnapshot());
    showToast('HR Zones saved');
    return;
  }

  if (event.target.id === 'google-health-form') {
    const fd = new FormData(event.target);
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
    return;
  }

  if (event.target.id !== 'machine-form') return;
  const fd = new FormData(event.target);
  const name = String(fd.get('name') || '').trim();
  if (!name) return;

  const group = String(fd.get('group') || 'push');
  const tags = [group];
  if (group === 'pull' || group === 'push') tags.push('upper', 'arms');
  if (group === 'legs') tags.push('lower');

  const payload = {
    name,
    muscle: String(fd.get('muscle') || '').trim(),
    group,
    tags,
    loadType: String(fd.get('loadType') || 'stack'),
    weight: Math.max(0, Number(fd.get('weight')) || 0),
    step: Math.max(0.5, Number(fd.get('step')) || 2.5),
    sets: Math.min(10, Math.max(1, parseInt(String(fd.get('sets')), 10) || 3)),
    reps: Math.min(100, Math.max(1, parseInt(String(fd.get('reps')), 10) || 10)),
    restSec: Math.min(600, Math.max(0, parseInt(String(fd.get('restSec')), 10) || 0)),
    setupNote: String(fd.get('setupNote') || '').trim(),
  };

  if (editingMachineId) {
    const m = state.machines.find((x) => x.id === editingMachineId);
    if (m) Object.assign(m, payload);
    showToast(`Saved ${name}`);
  } else {
    const id = uid('m');
    state.machines.push({
      id,
      subtitle: '',
      ...payload,
      coachNote: 'New station',
      prWeight: payload.weight,
      lastTrainedAt: null,
      lastReps: null,
      weightLog: [],
      swaps: [],
    });
    state.todayPlan.queue.push(id);
    showToast(`Added ${name}`);
  }

  saveState(state);
  closeModal();
  renderMain();
});

modalBodyEl.addEventListener('change', (event) => {
  if (event.target.id === 'import-file-input' && event.target.files?.[0]) {
    handleImportData(event.target.files[0]);
  }
});

modalBackdropEl.addEventListener('click', (event) => {
  if (event.target === modalBackdropEl) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && activeModal) closeModal();
});

wearableBtnEl.addEventListener('click', () => {
  openModal('wearable', 'Google Fitbit Air', renderWearableModalBody(state, wearable.getSnapshot()));
});

document.getElementById('open-settings-btn').addEventListener('click', openSettingsModal);

document.querySelectorAll('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    currentTab = btn.dataset.tab;
    syncBottomNav();
    renderMain();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// OAuth callback pickup for Google Health API v4
const oauthRes = WearableManager.extractAccessTokenFromHash();
if (oauthRes?.accessToken) {
  WearableManager.fetchGoogleHealthSummary(oauthRes.accessToken)
    .then((summary) => {
      state.wearable.googleHealthSummary = summary;
      if (summary.restingHr) state.wearable.restingHr = summary.restingHr;
      saveState(state);
      renderWearableUI(wearable.getSnapshot());
      showToast(`Google Health synced`);
    })
    .catch(() => showToast('Google Health sync failed'));
}

// Boot
applyTheme();
syncBottomNav();
renderMain();
restTimer.init();
if (state.settings.wakeLock) feedback.setWakeLock(true);

if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
