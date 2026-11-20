/**
 * Weights — Full-Screen Minimalist Coach UI Renderers
 */

import {
  BODY_GROUPS,
  formatWeight,
  formatLoadDisplay,
  formatRest,
  formatClock,
  getRelativeDate,
} from './data.js';
import { getActiveQueue, ensureValidActiveMachine } from './coach.js';
import { WEARABLE_PRESETS } from './wearable.js';

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const ICONS = {
  timer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 1.5"/><path d="M9 2h6"/><path d="M12 2v3"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m8 7 4-4 4 4"/><rect x="4" y="15" width="16" height="6" rx="2"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  swap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>`,
  skip: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>`,
};

export function countSessionSets(state) {
  let totalSets = 0;
  for (const arr of Object.values(state.todayPlan.completedSets)) {
    if (Array.isArray(arr)) totalSets += arr.filter(Boolean).length;
  }
  return totalSets;
}

export function renderCoachView(state, draftCheckin) {
  const tp = state.todayPlan;
  const unit = state.settings.unit;
  const queue = getActiveQueue(state);
  const active = ensureValidActiveMachine(state);
  const totalLoggedSets = countSessionSets(state);
  const doneCount = tp.finishedMachineIds.filter((id) => queue.some((m) => m.id === id)).length;

  if (!active) {
    return renderAllDoneStage(state, queue, totalLoggedSets);
  }

  const stationIdx = queue.findIndex((m) => m.id === active.id) + 1;
  const load = formatLoadDisplay(active, unit);
  const loggedSets = (tp.completedSets[active.id] || []).filter(Boolean);
  const totalSets = Math.max(1, Number(active.sets) || 3);
  const currentSetNum = Math.min(totalSets, loggedSets.length + 1);
  const isFinalSet = loggedSets.length + 1 >= totalSets;
  const targetReps = Number(active.reps) || 10;
  const step = Number(active.step) || 2.5;

  const repVal = draftCheckin.machineId === active.id ? draftCheckin.reps : targetReps;
  const checkingIn = Boolean(draftCheckin.open && draftCheckin.machineId === active.id);
  const lessVal = Math.max(1, targetReps - 2);
  const moreVal = targetReps + 2;

  const noteText = tp.coachMessage || active.coachNote || '';

  const dotsHtml = Array.from({ length: totalSets }, (_, idx) => {
    const isDone = Boolean(loggedSets[idx]);
    const isCurrent = idx === loggedSets.length;
    return `<span class="set-dot ${isDone ? 'is-done' : isCurrent ? 'is-current' : ''}"></span>`;
  }).join('');

  const cardioToggle =
    active.loadType === 'cardio'
      ? `
      <div class="cardio-toggle">
        <button type="button" class="cardio-opt ${active.cardioMode !== 'stairs' ? 'is-active' : ''}" data-action="set-cardio-mode" data-machine-id="${escapeHtml(active.id)}" data-mode="running">Run · Treadmill</button>
        <button type="button" class="cardio-opt ${active.cardioMode === 'stairs' ? 'is-active' : ''}" data-action="set-cardio-mode" data-machine-id="${escapeHtml(active.id)}" data-mode="stairs">Stairs · ClimbMill</button>
      </div>
    `
      : '';

  const bottomActionHtml = checkingIn
    ? `
      <div class="stage-rep-box">
        <div class="stage-rep-head">
          <span>${active.loadType === 'cardio' ? 'Minutes done' : `Set ${currentSetNum} reps`}</span>
          <button type="button" class="quiet-link-btn" style="min-height:24px;padding:0;" data-action="cancel-checkin">Cancel</button>
        </div>
        <div class="rep-stepper-row">
          <button type="button" class="stage-step-btn" data-action="checkin-rep-step" data-delta="-1" aria-label="Decrease reps">−</button>
          <div class="rep-big-val">
            ${repVal}
            <small>${
              active.loadType === 'cardio'
                ? 'min'
                : repVal === targetReps
                ? 'target'
                : repVal > targetReps
                ? `+${repVal - targetReps}`
                : `${repVal - targetReps}`
            }</small>
          </div>
          <button type="button" class="stage-step-btn" data-action="checkin-rep-step" data-delta="1" aria-label="Increase reps">+</button>
        </div>
        <div class="rep-quick-row">
          <button type="button" class="rep-quick-btn ${repVal === lessVal ? 'is-selected' : ''}" data-action="checkin-rep-set" data-reps="${lessVal}">${lessVal}</button>
          <button type="button" class="rep-quick-btn ${repVal === targetReps ? 'is-selected' : ''}" data-action="checkin-rep-set" data-reps="${targetReps}">${targetReps} · Goal</button>
          <button type="button" class="rep-quick-btn ${repVal === moreVal ? 'is-selected' : ''}" data-action="checkin-rep-set" data-reps="${moreVal}">${moreVal}</button>
        </div>
        <button
          type="button"
          id="log-set-btn"
          class="btn ${isFinalSet ? 'btn-success' : 'btn-primary'} stage-primary-btn"
          data-action="log-active-set"
          data-machine-id="${escapeHtml(active.id)}"
        >
          ${
            active.loadType === 'cardio'
              ? `Log ${repVal} min`
              : isFinalSet
              ? `Finish · Next Station`
              : `Log ${repVal} · Rest ${formatRest(active.restSec)}`
          }
        </button>
      </div>
    `
    : `
      <button
        type="button"
        id="done-set-btn"
        class="btn btn-primary stage-primary-btn"
        data-action="open-checkin"
        data-machine-id="${escapeHtml(active.id)}"
      >
        ${active.loadType === 'cardio' ? `Done ${targetReps} min` : `Done Set ${currentSetNum} of ${totalSets}`}
      </button>

      <div class="stage-quiet-links">
        <button type="button" class="quiet-link-btn" data-action="machine-busy" data-machine-id="${escapeHtml(active.id)}">
          ${ICONS.clock}<span>Busy</span>
        </button>
        <button type="button" class="quiet-link-btn" data-action="open-swap-modal" data-machine-id="${escapeHtml(active.id)}">
          ${ICONS.swap}<span>Swap</span>
        </button>
        <button type="button" class="quiet-link-btn" data-action="skip-machine" data-machine-id="${escapeHtml(active.id)}">
          ${ICONS.skip}<span>Skip</span>
        </button>
      </div>
    `;

  return `
    <section class="coach-stage" aria-label="Active station">
      <div class="stage-top">
        <span class="stage-counter">${stationIdx} / ${queue.length} · ${escapeHtml(active.muscle || active.group)}</span>
        <button type="button" class="stage-plan-btn" data-action="open-plan-modal">
          ${ICONS.list}
          <span>Plan${doneCount > 0 ? ` · ${doneCount}/${queue.length}` : ''}</span>
        </button>
      </div>

      <div class="stage-center">
        <div class="stage-title-row">
          <div>
            <h2 class="stage-machine-name">${escapeHtml(active.name)}</h2>
            ${active.subtitle ? `<p class="stage-machine-sub">${escapeHtml(active.subtitle)}</p>` : ''}
          </div>
          <button type="button" class="card-mini-btn" data-action="open-edit-machine" data-machine-id="${escapeHtml(active.id)}" aria-label="Edit machine">
            ${ICONS.edit}
          </button>
        </div>

        ${cardioToggle}

        <div class="stage-load-panel">
          ${
            active.loadType !== 'bodyweight'
              ? `<button type="button" class="stage-step-btn" data-action="step-weight" data-machine-id="${escapeHtml(active.id)}" data-delta="${-step}" aria-label="Decrease">−</button>`
              : '<span style="width:12px;"></span>'
          }
          <div class="stage-load-center">
            <div class="stage-load-value">${escapeHtml(load.primary)}</div>
            <div class="stage-load-sub">${escapeHtml(load.sub)}</div>
          </div>
          ${
            active.loadType !== 'bodyweight'
              ? `<button type="button" class="stage-step-btn" data-action="step-weight" data-machine-id="${escapeHtml(active.id)}" data-delta="${step}" aria-label="Increase">+</button>`
              : '<span style="width:12px;"></span>'
          }
        </div>

        <div class="stage-setup-line">
          ${ICONS.pin}
          <span>${escapeHtml(active.setupNote)}</span>
        </div>

        <div class="stage-specs-3">
          <div class="stage-spec-tile">
            <span class="stage-spec-tile-label">Set</span>
            <span class="stage-spec-tile-val">${currentSetNum}/${totalSets}</span>
          </div>
          <div class="stage-spec-tile">
            <span class="stage-spec-tile-label">${active.loadType === 'cardio' ? 'Goal' : 'Reps'}</span>
            <span class="stage-spec-tile-val">${active.loadType === 'cardio' ? `${targetReps}m` : targetReps}</span>
          </div>
          <button type="button" class="stage-spec-tile is-accent" data-action="start-machine-rest" data-machine-id="${escapeHtml(active.id)}" title="Start rest timer">
            <span class="stage-spec-tile-label">Rest</span>
            <span class="stage-spec-tile-val">${formatRest(active.restSec)}</span>
          </button>
        </div>

        <div class="stage-meta-row">
          <div class="set-dots" aria-label="Set progress">${dotsHtml}</div>
          <div class="stage-note-pill">${escapeHtml(noteText)}</div>
        </div>

        <div id="live-hr-mount"></div>
      </div>

      <div class="stage-bottom">
        ${bottomActionHtml}
      </div>
    </section>
  `;
}

function renderAllDoneStage(state, queue, totalLoggedSets) {
  const adjustments = Object.entries(state.todayPlan.sessionAdjustments || {})
    .map(([id, adj]) => {
      const m = state.machines.find((x) => x.id === id);
      return m ? { machine: m, adj } : null;
    })
    .filter(Boolean);

  return `
    <section class="coach-stage">
      <div class="stage-top">
        <span class="stage-counter">Complete</span>
        <button type="button" class="stage-plan-btn" data-action="open-plan-modal">
          ${ICONS.list}<span>Plan</span>
        </button>
      </div>

      <div class="stage-center">
        <div>
          <h2 class="stage-machine-name">Session Done</h2>
          <p class="stage-machine-sub">${totalLoggedSets} sets logged · Next weights updated</p>
        </div>

        ${
          adjustments.length
            ? `
            <div class="adjust-list">
              ${adjustments
                .map(
                  ({ machine, adj }) => `
                <div class="adjust-item">
                  <div class="adjust-item-head">
                    <span>${escapeHtml(machine.name)}</span>
                    <span class="adjust-badge ${adj.direction === 'up' ? 'is-up' : ''}">${escapeHtml(adj.deltaText)}</span>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          `
            : ''
        }
      </div>

      <div class="stage-bottom">
        ${
          totalLoggedSets > 0
            ? `<button type="button" class="btn btn-success stage-primary-btn" data-action="finish-session">Save Workout</button>`
            : ''
        }
        <button type="button" class="btn btn-secondary" style="width:100%;" data-action="start-new-session">Start Fresh</button>
      </div>
    </section>
  `;
}

export function renderPlanModalBody(state) {
  const tp = state.todayPlan;
  const unit = state.settings.unit;
  const queue = getActiveQueue(state);
  const active = ensureValidActiveMachine(state);
  const doneSet = new Set(tp.finishedMachineIds);
  const totalLoggedSets = countSessionSets(state);
  const armsSkipped = tp.excludedTags.includes('arms');
  const hasExclusions =
    tp.skippedIds.length > 0 || tp.excludedGroups.length > 0 || tp.excludedTags.length > 0;

  return `
    <div class="form-stack">
      <form id="coach-cmd-form" class="coach-cmd-form">
        <input
          id="coach-cmd-input"
          class="coach-cmd-input"
          type="text"
          placeholder="Command: skip arms · busy · stairs · 2 sets"
          autocomplete="off"
        />
        <button type="submit" class="btn btn-primary btn-sm">Apply</button>
      </form>

      <div class="filter-strip">
        ${BODY_GROUPS.map((g) => {
          const ex = tp.excludedGroups.includes(g.id);
          return `
            <button type="button" class="filter-pill ${ex ? 'is-excluded' : ''}" data-action="toggle-group" data-group-id="${escapeHtml(g.id)}">
              <span class="filter-pill-dot"></span><span>${escapeHtml(g.label)}</span>
            </button>
          `;
        }).join('')}
        <button type="button" class="coach-chip ${armsSkipped ? 'is-off' : ''}" data-action="coach-quick" data-cmd="${armsSkipped ? 'restore plan' : 'skip arms'}">
          ${armsSkipped ? 'Arms Off' : 'Skip Arms'}
        </button>
        ${
          hasExclusions
            ? `<button type="button" class="coach-chip" data-action="coach-quick" data-cmd="restore plan">Restore All</button>`
            : ''
        }
      </div>

      <div class="queue-list">
        ${queue
          .map((m, idx) => {
            const isActive = active && active.id === m.id;
            const isDone = doneSet.has(m.id);
            const isBusy = tp.busyIds.includes(m.id) && !isDone;
            const adj = tp.sessionAdjustments[m.id];
            const load = formatLoadDisplay(m, unit);
            const setsDone = (tp.completedSets[m.id] || []).filter(Boolean).length;
            return `
              <button
                type="button"
                class="queue-item ${isActive ? 'is-active' : ''} ${isDone ? 'is-done' : ''}"
                data-action="focus-machine"
                data-machine-id="${escapeHtml(m.id)}"
              >
                <div class="queue-item-left">
                  <span class="queue-index">${isDone ? '✓' : idx + 1}</span>
                  <div class="queue-item-info">
                    <div class="queue-item-name">${escapeHtml(m.name)}</div>
                    <div class="queue-item-sub">${escapeHtml(load.badge)} · ${
              m.loadType === 'cardio' ? `${m.reps}m` : `${setsDone}/${m.sets}×${m.reps}`
            }${m.restSec ? ` · ${formatRest(m.restSec)}` : ''}</div>
                  </div>
                </div>
                ${
                  adj
                    ? `<span class="queue-tag is-adjusted">${escapeHtml(adj.deltaText)}</span>`
                    : isBusy
                    ? `<span class="queue-tag is-busy">Busy</span>`
                    : ''
                }
              </button>
            `;
          })
          .join('')}
      </div>

      ${
        totalLoggedSets > 0
          ? `<button type="button" class="btn btn-success" style="width:100%;" data-action="finish-session-close">Save Workout (${totalLoggedSets} sets)</button>`
          : ''
      }
    </div>
  `;
}

export function renderMachinesView(state, searchQuery) {
  const unit = state.settings.unit;
  const q = searchQuery.trim().toLowerCase();
  const filtered = state.machines.filter((m) => {
    if (!q) return true;
    return `${m.name} ${m.subtitle || ''} ${m.muscle} ${m.setupNote || ''} ${m.group}`.toLowerCase().includes(q);
  });

  return `
    <div class="section-head">
      <div>
        <h2 class="section-title">Machines</h2>
        <p class="section-sub">Manegg Motion · ${state.machines.length} stations</p>
      </div>
      <button type="button" class="btn btn-primary btn-sm" data-action="open-add-machine">
        ${ICONS.plus} Add
      </button>
    </div>

    <div class="search-row">
      <div class="search-box">
        ${ICONS.search}
        <input id="machine-search" class="search-input" type="search" placeholder="Search..." value="${escapeHtml(searchQuery)}" autocomplete="off" />
        ${searchQuery ? `<button type="button" class="search-clear" data-action="clear-search">${ICONS.close}</button>` : ''}
      </div>
    </div>

    <div class="machine-list">
      ${filtered
        .map((m) => {
          const load = formatLoadDisplay(m, unit);
          const step = Number(m.step) || 2.5;
          return `
            <article class="machine-card">
              <div class="machine-card-head">
                <div class="machine-meta">
                  <div class="machine-title-row">
                    <h3 class="machine-name">${escapeHtml(m.name)}</h3>
                    <span class="machine-muscle">${escapeHtml(m.muscle || m.group)}</span>
                  </div>
                  ${m.setupNote ? `<p class="machine-setup"><span class="machine-setup-icon">${ICONS.pin}</span><span>${escapeHtml(m.setupNote)}</span></p>` : ''}
                </div>
                <button type="button" class="card-mini-btn" data-action="open-edit-machine" data-machine-id="${escapeHtml(m.id)}">${ICONS.edit}</button>
              </div>
              <div class="machine-metrics">
                <div class="weight-control">
                  ${m.loadType !== 'bodyweight' ? `<button type="button" class="step-btn" data-action="step-weight" data-machine-id="${escapeHtml(m.id)}" data-delta="${-step}">−</button>` : '<span style="width:12px;"></span>'}
                  <button type="button" class="weight-display" data-action="open-edit-machine" data-machine-id="${escapeHtml(m.id)}">
                    <span class="weight-number" style="font-size:1.18rem;">${escapeHtml(load.primary)}</span>
                    <span class="weight-sub">${escapeHtml(load.sub)}</span>
                  </button>
                  ${m.loadType !== 'bodyweight' ? `<button type="button" class="step-btn" data-action="step-weight" data-machine-id="${escapeHtml(m.id)}" data-delta="${step}">+</button>` : '<span style="width:12px;"></span>'}
                </div>
                <button type="button" class="rest-chip-btn" data-action="start-machine-rest" data-machine-id="${escapeHtml(m.id)}">
                  <span class="rest-chip-label">Rest</span>
                  <span class="rest-chip-time">${ICONS.timer}${formatRest(m.restSec)}</span>
                </button>
              </div>
              <div class="machine-foot">
                <span>${m.sets}×${m.reps}${m.loadType === 'cardio' ? 'm' : ''} · ${escapeHtml(getRelativeDate(m.lastTrainedAt))}</span>
                <button type="button" class="btn btn-secondary btn-sm" data-action="jump-to-coach" data-machine-id="${escapeHtml(m.id)}">Train</button>
              </div>
            </article>
          `;
        })
        .join('')}
    </div>
  `;
}

export function renderHistoryView(state) {
  const unit = state.settings.unit;
  const totalWorkouts = state.history.length;
  const totalSets = state.history.reduce((sum, h) => sum + (h.totalSets || 0), 0);
  const machinesWithTrend = state.machines.filter((m) => Array.isArray(m.weightLog) && m.weightLog.length >= 2).slice(0, 6);

  const trendHtml =
    machinesWithTrend.length > 0
      ? `
      <div class="section-head"><h2 class="section-title">Progression</h2></div>
      <div class="progress-list">${machinesWithTrend.map((m) => renderProgressCard(m, unit)).join('')}</div>
    `
      : '';

  const sessionsHtml =
    state.history.length === 0
      ? `<div class="empty-state"><h3>No workouts yet</h3></div>`
      : state.history
          .map((session) => {
            const dateStr = new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            const durMin = Math.max(1, Math.round((session.durationSec || 0) / 60));
            return `
              <article class="history-card">
                <div class="history-card-top">
                  <div>
                    <div class="history-date">${escapeHtml(dateStr)}</div>
                    <h3 class="history-title">${escapeHtml(session.title || 'Manegg Motion')}</h3>
                  </div>
                  <button type="button" class="card-mini-btn" data-action="delete-history" data-history-id="${escapeHtml(session.id)}">${ICONS.trash}</button>
                </div>
                <div class="history-pills">
                  <span class="meta-pill">${session.totalSets} sets</span>
                  <span class="meta-pill">${durMin}m</span>
                  ${session.avgBpm ? `<span class="meta-pill">♥ ${session.avgBpm} · ${session.peakBpm || session.avgBpm} pk</span>` : ''}
                  ${session.estKcal ? `<span class="meta-pill">~${Math.round(session.estKcal)} kcal</span>` : ''}
                </div>
                <div class="history-items">
                  ${(session.entries || [])
                    .map(
                      (e) => `
                    <div class="history-item-row">
                      <span class="history-item-name">${escapeHtml(e.name)}</span>
                      <span class="history-item-val">${escapeHtml(e.loadText || '')} · ${Array.isArray(e.repsList) ? e.repsList.join('/') : `${e.sets}×${e.reps}`}</span>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </article>
            `;
          })
          .join('');

  return `
    <div class="history-summary-grid">
      <div class="stat-tile"><span class="stat-tile-label">Sessions</span><span class="stat-tile-val">${totalWorkouts}</span></div>
      <div class="stat-tile"><span class="stat-tile-label">Sets</span><span class="stat-tile-val">${totalSets}</span></div>
      <div class="stat-tile"><span class="stat-tile-label">Stations</span><span class="stat-tile-val">${state.machines.length}</span></div>
    </div>
    ${trendHtml}
    <div class="section-head"><h2 class="section-title">Log</h2></div>
    ${sessionsHtml}
  `;
}

function renderProgressCard(machine, unit) {
  const pts = machine.weightLog.slice(-8);
  const first = pts[0].weight;
  const last = pts[pts.length - 1].weight;
  const delta = last - first;
  const suffix = machine.loadType === 'plate_per_side' ? `${unit}/side` : unit;
  const deltaStr = delta === 0 ? 'Steady' : `${delta > 0 ? '+' : ''}${formatWeight(delta)}`;
  const min = Math.min(...pts.map((p) => p.weight));
  const max = Math.max(...pts.map((p) => p.weight));
  const span = max - min || 1;
  const coords = pts
    .map((p, i) => `${(4 + (i / Math.max(1, pts.length - 1)) * 88).toFixed(1)},${(28 - ((p.weight - min) / span) * 24).toFixed(1)}`)
    .join(' ');
  const [lx, ly] = coords.split(' ').pop().split(',');

  return `
    <div class="progress-card">
      <div class="progress-info">
        <div class="progress-name">${escapeHtml(machine.name)}</div>
        <div class="progress-meta">${formatWeight(first)} → ${formatWeight(last)} ${escapeHtml(suffix)} (${escapeHtml(deltaStr)})</div>
      </div>
      <svg class="sparkline" viewBox="0 0 96 32"><polyline fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" points="${coords}" /><circle cx="${lx}" cy="${ly}" r="3.2" fill="var(--accent)" /></svg>
    </div>
  `;
}

export function renderTimerDock(snap) {
  if (!snap.running) return '';

  const timeStr = snap.overtime ? `+${formatClock(snap.overtimeSec)}` : formatClock(snap.remainingSec);
  const statusText = snap.overtime ? 'Go!' : snap.paused ? 'Paused' : 'Rest';

  return `
    <div class="timer-progress-track">
      <div class="timer-progress-fill" style="width:${(snap.progress * 100).toFixed(1)}%"></div>
    </div>
    <div class="timer-dock-inner">
      <button type="button" class="timer-active-left" data-action="open-timer-modal">
        <span class="timer-readout">${timeStr}</span>
        <span class="timer-meta">
          <span class="timer-status">${statusText}</span>
          <span class="timer-context">${escapeHtml(snap.label || 'Rest')}</span>
        </span>
      </button>
      <div class="timer-active-controls">
        <button type="button" class="timer-nudge-btn" data-action="timer-adjust" data-delta="-15">-15</button>
        <button type="button" class="timer-nudge-btn" data-action="timer-adjust" data-delta="15">+15</button>
        <button type="button" class="timer-stop-btn" data-action="timer-stop">${snap.overtime ? 'Go' : 'Skip'}</button>
      </div>
    </div>
  `;
}

export function renderTimerModalBody(snap) {
  const radius = 94;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - snap.progress);
  const timeStr = snap.overtime ? `+${formatClock(snap.overtimeSec)}` : formatClock(snap.remainingSec);

  return `
    <div class="timer-ring-wrap ${snap.overtime ? 'is-overtime' : ''}">
      <svg class="timer-ring-svg" viewBox="0 0 220 220">
        <circle class="timer-ring-bg" cx="110" cy="110" r="${radius}"></circle>
        <circle class="timer-ring-fg" cx="110" cy="110" r="${radius}" stroke-dasharray="${circumference.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"></circle>
      </svg>
      <div class="timer-ring-center">
        <span class="timer-ring-time">${timeStr}</span>
        <span class="timer-ring-label">${snap.overtime ? 'Next set' : escapeHtml(snap.label || 'Rest')}</span>
      </div>
    </div>
    <div class="timer-modal-controls">
      <button type="button" class="btn btn-secondary" data-action="timer-adjust" data-delta="-15">-15s</button>
      <button type="button" class="btn btn-secondary" data-action="timer-toggle-pause">${snap.paused ? 'Resume' : 'Pause'}</button>
      <button type="button" class="btn btn-secondary" data-action="timer-adjust" data-delta="15">+15s</button>
    </div>
    <button type="button" class="btn ${snap.overtime ? 'btn-success' : 'btn-primary'}" style="width:100%;" data-action="timer-stop-and-close">
      ${snap.overtime ? 'Start Set' : 'Skip'}
    </button>
  `;
}

export function renderLiveBiometrics(snap, timerSnap, activeMachine) {
  const isLive = snap.status === 'connected' || snap.status === 'simulating';
  if (!isLive) return '';

  const samples = snap.samples || [];
  let waveSvg = '';
  if (samples.length >= 2) {
    const vals = samples.map((s) => s.bpm);
    const min = Math.min(...vals, 80);
    const max = Math.max(...vals, 150);
    const span = max - min || 1;
    const pts = vals
      .map((v, i) => `${(2 + (i / Math.max(1, vals.length - 1)) * 74).toFixed(1)},${(22 - ((v - min) / span) * 18).toFixed(1)}`)
      .join(' ');
    const [lx, ly] = pts.split(' ').pop().split(',');
    waveSvg = `<svg width="78" height="24" viewBox="0 0 78 24" aria-hidden="true"><polyline fill="none" stroke="${snap.zone.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${pts}" /><circle cx="${lx}" cy="${ly}" r="2.6" fill="${snap.zone.color}" /></svg>`;
  }

  let statusTag = `Z${snap.zone.decimal || 0} · ${snap.zone.label}`;
  if (snap.bpm && timerSnap?.running) {
    statusTag = snap.zone.zone >= 3 ? `Z${snap.zone.zone} · Keep resting` : `Z${snap.zone.zone} · Ready`;
  } else if (snap.bpm && activeMachine?.loadType === 'cardio') {
    statusTag = `Z${snap.zone.decimal} · ${snap.zone.label}`;
  }

  return `
    <button type="button" class="stage-hr-line" style="width:100%;text-align:left;" data-action="open-wearable-modal">
      <div class="stage-hr-left">
        <span class="stage-hr-bpm" style="color:${snap.zone.color};">${snap.bpm ?? '--'}</span>
        <span class="stage-hr-tag">bpm · ${escapeHtml(statusTag)}</span>
      </div>
      ${waveSvg}
    </button>
  `;
}

export function renderWearableModalBody(state, snap) {
  const isLive = snap.status === 'connected' || snap.status === 'simulating';
  const deviceType = state.wearable?.deviceType || 'garmin_venu_4s';
  const preset = WEARABLE_PRESETS[deviceType] || WEARABLE_PRESETS.garmin_venu_4s;
  const gh = state.wearable?.googleHealthSummary;

  const liveStatsParts = [
    `${snap.bpm ?? '--'} bpm`,
    `Z${snap.zone.decimal || 0} (${snap.zone.label})`,
    `Avg ${snap.avgBpm ?? '--'}`,
    `Peak ${snap.peakBpm ?? '--'}`,
  ];
  if (snap.hrvMs) liveStatsParts.push(`HRV ${snap.hrvMs} ms`);
  if (snap.batteryPct !== null && snap.batteryPct !== undefined) liveStatsParts.push(`${snap.batteryPct}%`);

  return `
    <div class="form-stack">
      <div class="cardio-toggle">
        <button type="button" class="cardio-opt ${deviceType === 'garmin_venu_4s' ? 'is-active' : ''}" data-action="set-wearable-device" data-device="garmin_venu_4s">Garmin Venu 4s</button>
        <button type="button" class="cardio-opt ${deviceType === 'fitbit_air' ? 'is-active' : ''}" data-action="set-wearable-device" data-device="fitbit_air">Fitbit Air</button>
      </div>

      <div class="wearable-status-box">
        <div>
          <strong style="display:block;font-size:0.94rem;">
            ${
              snap.status === 'connected'
                ? escapeHtml(snap.deviceName)
                : snap.status === 'simulating'
                ? escapeHtml(snap.deviceName || `${preset.label} (Demo)`)
                : snap.status === 'connecting'
                ? 'Pairing...'
                : `${escapeHtml(preset.label)} · Off`
            }
          </strong>
          <span class="spec-sub">
            ${isLive ? escapeHtml(liveStatsParts.join(' · ')) : 'BLE Heart Rate (0x180D)'}
          </span>
        </div>
        ${isLive ? `<button type="button" class="btn btn-danger btn-sm" data-action="wearable-disconnect">Stop</button>` : ''}
      </div>

      ${snap.errorMessage ? `<div class="wearable-error">${escapeHtml(snap.errorMessage)}</div>` : ''}

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <button type="button" class="btn btn-primary" data-action="wearable-connect-ble" ${snap.status === 'connecting' ? 'disabled' : ''}>${escapeHtml(preset.connectLabel)}</button>
        <button type="button" class="btn btn-secondary" data-action="${snap.status === 'simulating' ? 'wearable-disconnect' : 'wearable-simulate'}">${snap.status === 'simulating' ? 'Stop Demo' : 'Simulate HR'}</button>
      </div>

      <div class="spec-box">
        <span class="spec-label">${escapeHtml(preset.stepsTitle)}</span>
        <ol class="setup-steps">
          ${preset.steps.map((s) => `<li>${s}</li>`).join('')}
        </ol>
      </div>

      <form id="wearable-profile-form" class="form-stack">
        <div class="form-grid-2">
          <div class="field">
            <label class="field-label" for="w-rhr">Resting HR</label>
            <input id="w-rhr" name="restingHr" class="field-input mono" type="number" min="35" max="110" value="${escapeHtml(state.wearable.restingHr || 58)}" />
          </div>
          <div class="field">
            <label class="field-label" for="w-mhr">Max HR</label>
            <input id="w-mhr" name="maxHr" class="field-input mono" type="number" min="120" max="220" value="${escapeHtml(state.wearable.maxHr || 188)}" />
          </div>
        </div>
        <div class="spec-sub">${escapeHtml(preset.zonesHint)}</div>
        <button type="submit" class="btn btn-secondary btn-sm">Save HR Zones</button>
      </form>

      ${
        deviceType === 'fitbit_air'
          ? `
        <div class="spec-box" style="gap:8px;">
          <span class="spec-label">Google Health API v4 (Optional)</span>
          <div class="spec-sub">${gh ? `RHR ${gh.restingHr ?? '--'} · HRV ${gh.hrvMs ?? '--'} ms` : 'Daily RHR & HRV via OAuth Client ID'}</div>
          <form id="google-health-form" class="coach-cmd-form">
            <input name="clientId" class="coach-cmd-input mono" type="text" placeholder="Google OAuth Client ID" value="${escapeHtml(state.wearable.googleHealthClientId || '')}" />
            <button type="submit" class="btn btn-secondary btn-sm">Sync</button>
          </form>
        </div>
      `
          : ''
      }
    </div>
  `;
}
