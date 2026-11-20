/**
 * Weights — Crisp Adaptive Coach Engine
 */

import { formatWeight, formatRest, uid } from './data.js';

export function isMachineExcluded(state, machine) {
  const tp = state.todayPlan;
  if (tp.skippedIds.includes(machine.id)) return true;
  if (tp.excludedGroups.includes(machine.group)) return true;
  if (tp.excludedTags.some((tag) => (machine.tags || []).includes(tag))) return true;
  return false;
}

export function getActiveQueue(state) {
  const byId = new Map(state.machines.map((m) => [m.id, m]));
  return state.todayPlan.queue
    .map((id) => byId.get(id))
    .filter((m) => m && !isMachineExcluded(state, m));
}

export function getNextUnfinishedMachine(state, excludeId = null) {
  const queue = getActiveQueue(state);
  const done = new Set(state.todayPlan.finishedMachineIds);
  const candidate = queue.find((m) => !done.has(m.id) && m.id !== excludeId);
  return candidate || queue.find((m) => !done.has(m.id)) || null;
}

export function ensureValidActiveMachine(state) {
  const queue = getActiveQueue(state);
  const done = new Set(state.todayPlan.finishedMachineIds);
  const current = queue.find((m) => m.id === state.todayPlan.activeMachineId && !done.has(m.id));
  if (current) return current;
  const next = getNextUnfinishedMachine(state);
  state.todayPlan.activeMachineId = next ? next.id : null;
  return next;
}

export function evaluateSetFeedback(machine, repsDone, setNumber, totalSets) {
  const target = Number(machine.reps) || 10;
  const diff = repsDone - target;

  if (machine.loadType === 'cardio') {
    return { restSec: 0, message: `${repsDone} min logged` };
  }

  let restSec = Number(machine.restSec) || 60;
  let message = '';

  if (diff <= -3) {
    restSec = Math.min(180, restSec + 15);
    message = `Set ${setNumber}: ${repsDone}/${target} · +15s rest (${formatRest(restSec)})`;
  } else if (diff >= 2) {
    message = `Set ${setNumber}: ${repsDone}/${target} (+${diff}) · Strong`;
  } else {
    message = `Set ${setNumber}: ${repsDone}/${target} · Rest ${formatRest(restSec)}`;
  }

  return { restSec, message };
}

export function applyAdaptiveProgression(state, machine) {
  const unit = state.settings.unit;
  const logged = (state.todayPlan.completedSets[machine.id] || []).filter(Boolean);
  if (logged.length === 0) return null;

  const target = Number(machine.reps) || 10;
  const repsList = logged.map((s) => Number(s.reps) || target);
  const avgReps = repsList.reduce((a, b) => a + b, 0) / repsList.length;
  const minReps = Math.min(...repsList);
  const oldWeight = Number(machine.weight) || 0;
  const step = Number(machine.step) || 2.5;

  let direction = 'hold';
  let summary = '';
  let deltaText = '';

  if (machine.loadType === 'cardio') {
    const mins = repsList[repsList.length - 1];
    if (mins > target) {
      machine.weight = mins + 2;
      machine.reps = mins + 2;
      direction = 'up';
      deltaText = `Next: ${machine.reps} min`;
      summary = `Last: ${mins} min → Next: ${machine.reps} min`;
    } else {
      machine.weight = mins;
      machine.reps = mins;
      deltaText = `Next: ${mins} min`;
      summary = `Last: ${mins} min · Hold`;
    }
  } else if (machine.loadType === 'bodyweight') {
    if (avgReps >= target + 2) {
      machine.reps = target + 2;
      direction = 'up';
      deltaText = `Next: ${machine.reps} reps`;
      summary = `Last: ${repsList.join('/')} → +2 reps next`;
    } else if (avgReps <= target - 3) {
      machine.reps = Math.max(8, target - 2);
      direction = 'down';
      deltaText = `Next: ${machine.reps} reps`;
      summary = `Last: ${repsList.join('/')} → −2 reps next`;
    } else {
      deltaText = `Hold ${target} reps`;
      summary = `Last: ${repsList.join('/')} · Hold ${target}`;
    }
  } else {
    const loadLabel = (w) =>
      machine.loadType === 'plate_per_side' ? `${formatWeight(w)} ${unit}/side` : `${formatWeight(w)} ${unit}`;

    if (avgReps >= target + 2) {
      const nextWeight = Math.round((oldWeight + step) * 100) / 100;
      machine.weight = nextWeight;
      if (nextWeight > (machine.prWeight || 0)) machine.prWeight = nextWeight;
      direction = 'up';
      deltaText = `+${formatWeight(step)} → ${loadLabel(nextWeight)}`;
      summary = `Last: ${repsList.join('/')} → ${loadLabel(nextWeight)} next`;
    } else if (avgReps <= target - 3 || minReps <= target - 3) {
      const nextWeight = Math.max(0, Math.round((oldWeight - step) * 100) / 100);
      machine.weight = nextWeight;
      direction = 'down';
      deltaText = `−${formatWeight(step)} → ${loadLabel(nextWeight)}`;
      summary = `Last: ${repsList.join('/')} → ${loadLabel(nextWeight)} next`;
    } else if (avgReps <= target - 1.5) {
      const nextRest = Math.min(150, (Number(machine.restSec) || 60) + 15);
      machine.restSec = nextRest;
      direction = 'rest';
      deltaText = `Hold · ${formatRest(nextRest)} rest`;
      summary = `Last: ${repsList.join('/')} · +15s rest next`;
    } else {
      deltaText = `Hold ${loadLabel(oldWeight)}`;
      summary = `Last: ${repsList.join('/')} · Hold ${loadLabel(oldWeight)}`;
    }
  }

  machine.lastTrainedAt = Date.now();
  machine.lastReps = repsList;
  machine.coachNote = summary;
  if (machine.loadType !== 'bodyweight' && machine.loadType !== 'cardio') {
    if (!Array.isArray(machine.weightLog)) machine.weightLog = [];
    machine.weightLog.push({ date: Date.now(), weight: oldWeight });
    if (machine.weightLog.length > 30) machine.weightLog = machine.weightLog.slice(-30);
    if (oldWeight > (machine.prWeight || 0)) machine.prWeight = oldWeight;
  }

  const record = { direction, summary, deltaText, repsList };
  state.todayPlan.sessionAdjustments[machine.id] = record;
  return record;
}

export function deferBusyMachine(state, machineId) {
  const machine = state.machines.find((m) => m.id === machineId);
  if (!machine) return null;

  const q = state.todayPlan.queue;
  const idx = q.indexOf(machineId);
  if (idx !== -1) {
    q.splice(idx, 1);
    const cardioIdx = q.findIndex((id) => {
      const m = state.machines.find((x) => x.id === id);
      return m && m.group === 'cardio';
    });
    const insertAt = Math.min(idx + 2, cardioIdx !== -1 ? cardioIdx : q.length);
    q.splice(insertAt, 0, machineId);
  }

  if (!state.todayPlan.busyIds.includes(machineId)) {
    state.todayPlan.busyIds.push(machineId);
  }

  const next = getNextUnfinishedMachine(state, machineId);
  if (next) {
    state.todayPlan.activeMachineId = next.id;
    state.todayPlan.coachMessage = `${machine.name} busy → moved later`;
  } else {
    state.todayPlan.coachMessage = `${machine.name} busy · Last station left`;
  }
  return next;
}

export function skipMachineToday(state, machineId) {
  const machine = state.machines.find((m) => m.id === machineId);
  if (!machine) return;
  if (!state.todayPlan.skippedIds.includes(machineId)) {
    state.todayPlan.skippedIds.push(machineId);
  }
  const next = getNextUnfinishedMachine(state, machineId);
  state.todayPlan.activeMachineId = next ? next.id : null;
  state.todayPlan.coachMessage = `Skipped ${machine.name}`;
}

export function swapMachineForToday(state, machineId, swapIndex) {
  const machine = state.machines.find((m) => m.id === machineId);
  if (!machine || !Array.isArray(machine.swaps) || !machine.swaps[swapIndex]) return;
  const choice = machine.swaps[swapIndex];
  const oldName = machine.name;
  const oldSetup = machine.setupNote;

  machine.name = choice.name;
  machine.setupNote = choice.setupNote;
  machine.swaps[swapIndex] = { name: oldName, setupNote: oldSetup };
  state.todayPlan.busyIds = state.todayPlan.busyIds.filter((id) => id !== machineId);
  state.todayPlan.coachMessage = `Swapped → ${choice.name}`;
}

export function processCoachCommand(state, rawInput) {
  const text = String(rawInput || '').trim();
  if (!text) return null;
  const lower = text.toLowerCase();
  const active = ensureValidActiveMachine(state);

  if (/\b(busy|taken|occupied|belegt|besetzt)\b/.test(lower)) {
    const mentioned = state.machines.find((m) =>
      lower.includes(m.name.toLowerCase().split(' ')[0]) && m.name.length > 3
    );
    const target = mentioned || active;
    if (target) {
      deferBusyMachine(state, target.id);
      return state.todayPlan.coachMessage;
    }
  }

  if (/\b(stair|stairs|climbmill|treppe|treppen)\b/.test(lower)) {
    const cardio = state.machines.find((m) => m.loadType === 'cardio');
    if (cardio) {
      cardio.cardioMode = 'stairs';
      cardio.setupNote = 'Onyx ClimbMill · Level 5–7 · Upright';
      state.todayPlan.coachMessage = 'Cardio → Stairs';
      return state.todayPlan.coachMessage;
    }
  }
  if (/\b(run|running|treadmill|laufband|jog)\b/.test(lower)) {
    const cardio = state.machines.find((m) => m.loadType === 'cardio');
    if (cardio) {
      cardio.cardioMode = 'running';
      cardio.setupNote = 'Onyx Treadmill 2% incline · Steady pace';
      state.todayPlan.coachMessage = 'Cardio → Run';
      return state.todayPlan.coachMessage;
    }
  }

  if (/\b(restore|unskip|include all|full circuit|reset plan|everything|all)\b/.test(lower)) {
    state.todayPlan.skippedIds = [];
    state.todayPlan.excludedGroups = [];
    state.todayPlan.excludedTags = [];
    ensureValidActiveMachine(state);
    state.todayPlan.coachMessage = 'Full circuit restored';
    return state.todayPlan.coachMessage;
  }

  if (/\b(skip|no|without|drop|ohne)\b/.test(lower)) {
    if (/\b(arm|arms|arme|upper|oberkörper)\b/.test(lower)) {
      if (!state.todayPlan.excludedTags.includes('arms')) state.todayPlan.excludedTags.push('arms');
      ensureValidActiveMachine(state);
      state.todayPlan.coachMessage = 'Skipped Arms / Upper';
      return state.todayPlan.coachMessage;
    }
    if (/\b(leg|legs|beine|bein)\b/.test(lower)) {
      if (!state.todayPlan.excludedGroups.includes('legs')) state.todayPlan.excludedGroups.push('legs');
      ensureValidActiveMachine(state);
      state.todayPlan.coachMessage = 'Skipped Legs';
      return state.todayPlan.coachMessage;
    }
    if (/\b(core|abs|bauch|rücken)\b/.test(lower)) {
      if (!state.todayPlan.excludedGroups.includes('core')) state.todayPlan.excludedGroups.push('core');
      ensureValidActiveMachine(state);
      state.todayPlan.coachMessage = 'Skipped Core';
      return state.todayPlan.coachMessage;
    }
    if (/\b(cardio|run|stairs)\b/.test(lower)) {
      if (!state.todayPlan.excludedGroups.includes('cardio')) state.todayPlan.excludedGroups.push('cardio');
      ensureValidActiveMachine(state);
      state.todayPlan.coachMessage = 'Skipped Cardio';
      return state.todayPlan.coachMessage;
    }
    if (active) {
      skipMachineToday(state, active.id);
      return state.todayPlan.coachMessage;
    }
  }

  if (/\b(short|quick|2 sets|express|kurz)\b/.test(lower)) {
    state.machines.forEach((m) => {
      if (m.loadType !== 'cardio' && m.sets > 2) m.sets = 2;
    });
    state.todayPlan.coachMessage = 'Express · 2 sets each';
    return state.todayPlan.coachMessage;
  }

  if (active && /\b(heavy|hard|schwer|lighter|drop)\b/.test(lower)) {
    if (active.loadType !== 'bodyweight' && active.loadType !== 'cardio') {
      const step = Number(active.step) || 2.5;
      active.weight = Math.max(0, Math.round((active.weight - step) * 100) / 100);
      state.todayPlan.coachMessage = `${active.name} −${formatWeight(step)} ${state.settings.unit}`;
      return state.todayPlan.coachMessage;
    }
  }
  if (active && /\b(light|easy|leicht|heavier|bump)\b/.test(lower)) {
    if (active.loadType !== 'bodyweight' && active.loadType !== 'cardio') {
      const step = Number(active.step) || 2.5;
      active.weight = Math.round((active.weight + step) * 100) / 100;
      state.todayPlan.coachMessage = `${active.name} +${formatWeight(step)} ${state.settings.unit}`;
      return state.todayPlan.coachMessage;
    }
  }

  const addMatch = text.match(/^(?:add|hinzufügen)\s+(.+)$/i);
  if (addMatch) {
    const newName = addMatch[1].trim();
    const id = uid('m');
    state.machines.push({
      id,
      name: newName,
      subtitle: 'Custom',
      muscle: 'Custom',
      group: 'push',
      tags: ['upper', 'arms'],
      loadType: 'stack',
      weight: 20,
      step: 2.5,
      sets: 3,
      reps: 12,
      restSec: 60,
      setupNote: 'Tap edit to set seat & pin',
      coachNote: 'New station',
      prWeight: 20,
      lastTrainedAt: null,
      lastReps: null,
      weightLog: [],
      swaps: [],
    });
    state.todayPlan.queue.push(id);
    state.todayPlan.coachMessage = `Added ${newName}`;
    return state.todayPlan.coachMessage;
  }

  state.todayPlan.coachMessage = 'Try: busy · skip arms · stairs · 2 sets';
  return state.todayPlan.coachMessage;
}
