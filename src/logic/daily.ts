import type { Exercise, Phase, PhaseRules, Workshop } from '../content/types';
import type { UserState } from '../store/types';
import { isProtectMode } from './phase';

type Ctx = { rules: PhaseRules; exercises: Exercise[]; workshops: Workshop[] };

const PROTECT_POOLS = ['breath', 'grounding'];

/** Nächster offener Schritt einer Werkstatt (oder null, wenn fertig). */
export function nextWorkshopStep(state: UserState, w: Workshop): string | null {
  const done = new Set(state.exerciseLog.map((e) => e.exerciseId));
  const open = w.steps.find((s) => !done.has(s));
  if (open) return open;
  return state.workshopsDone.includes(w.id) ? null : w.finalStep;
}

/**
 * Wählt die Mini-Übung des Tages (Reihenfolge siehe docs/KONZEPT.md, Abschnitt 9):
 * Schutzmodus → nach Kontakt → offene Werkstatt (max. 1 Schritt/Tag) → am längsten nicht gemachte Übung.
 */
export function pickDailyExercise(state: UserState, today: string, exclude: string[], ctx: Ctx): Exercise {
  const phase = ctx.rules.phases.find((p) => p.id === state.phase.current)!;
  const todayCheckin = state.checkins.find((c) => c.date === today);
  const allowed = (e: Exercise) => !exclude.includes(e.id);

  if (isProtectMode(state, today, ctx.rules)) {
    const pool = ctx.exercises.filter((e) => PROTECT_POOLS.includes(e.pool) && e.phases.includes(1) && allowed(e));
    if (pool.length) return leastRecent(pool, state, today);
  }

  if (todayCheckin?.chips.includes('contact')) {
    const pool = ctx.exercises.filter((e) => e.pool === 'after_contact' && allowed(e));
    if (pool.length) return leastRecent(pool, state, today);
  }

  const stepDoneToday = state.exerciseLog.some(
    (e) => e.date === today && ctx.workshops.some((w) => w.steps.includes(e.exerciseId) || w.finalStep === e.exerciseId),
  );
  if (!stepDoneToday) {
    for (const wid of phase.workshops) {
      const w = ctx.workshops.find((x) => x.id === wid);
      const step = w && nextWorkshopStep(state, w);
      const ex = step && ctx.exercises.find((e) => e.id === step);
      if (ex && allowed(ex)) return ex;
    }
  }

  const pool = phaseExercises(phase, ctx.exercises).filter(allowed);
  if (pool.length) return leastRecent(pool, state, today);
  // Alles übersprungen? Dann wieder von vorn.
  return leastRecent(phaseExercises(phase, ctx.exercises), state, today);
}

export function phaseExercises(phase: Phase, all: Exercise[]): Exercise[] {
  return all.filter(
    (e) => e.phases.includes(phase.id) && phase.exercisePools.includes(e.pool) && e.humorLevel <= Math.max(phase.humorLevel, 1),
  );
}

function leastRecent(pool: Exercise[], state: UserState, seed: string): Exercise {
  const lastDone = (id: string) => {
    const entries = state.exerciseLog.filter((e) => e.exerciseId === id);
    return entries.length ? entries[entries.length - 1].date : '';
  };
  const sorted = [...pool].sort((a, b) => lastDone(a.id).localeCompare(lastDone(b.id)));
  const oldest = lastDone(sorted[0].id);
  const candidates = sorted.filter((e) => lastDone(e.id) === oldest);
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return candidates[Math.abs(h) % candidates.length];
}
