import type { PhaseId, PhaseRules, Requirement, Scoring } from '../content/types';
import type { UserState } from '../store/types';
import { addDays, daysBetween } from './dates';

export type OnboardingAnswers = { since: string; who: string; contact: string; mood: number };

/** Startphase aus den Onboarding-Antworten (siehe docs/KONZEPT.md, Abschnitt 3). */
export function computeStartPhase(a: OnboardingAnswers, s: Scoring): PhaseId {
  if (a.mood <= s.forcePhase1AtOrBelowMood) return 1;
  let score = (s.base[a.since] ?? 1) + (s.who[a.who] ?? 0) + (s.contact[a.contact] ?? 0);
  for (const rule of s.mood) {
    if ((rule.min === undefined || a.mood >= rule.min) && (rule.max === undefined || a.mood <= rule.max)) {
      score += rule.add;
    }
  }
  let phase = Math.min(4, Math.max(1, Math.floor(score)));
  if (phase === 4 && !(a.since === s.phase4Requires.since && a.mood >= s.phase4Requires.minMood)) phase = 3;
  return phase as PhaseId;
}

export function averageMood(state: UserState, lastN: number): number | null {
  const recent = state.checkins.slice(-lastN);
  if (recent.length === 0) return null;
  return recent.reduce((sum, c) => sum + c.mood, 0) / recent.length;
}

export function isProtectMode(state: UserState, today: string, rules: PhaseRules): boolean {
  const c = state.checkins.find((x) => x.date === today);
  return !!c && c.mood <= rules.protectMode.moodAtOrBelow;
}

export type RequirementProgress = { label: string; done: boolean; detail: string }[];

/** Fortschritt in Richtung nächster Etappe – wird auch in „Mein Weg“ angezeigt. */
export function advanceProgress(state: UserState, today: string, rules: PhaseRules): RequirementProgress {
  const phase = rules.phases.find((p) => p.id === state.phase.current)!;
  const { minDays, minAvgMood, require } = phase.advance;
  const since = state.phase.enteredAt;
  const days = daysBetween(since, today);
  const avg = averageMood(state, 7);
  const items: RequirementProgress = [
    { label: 'Zeit in dieser Etappe', done: days >= minDays, detail: `${Math.min(days, minDays)}/${minDays} Tage` },
    {
      label: 'Stimmung im Schnitt (letzte 7 Check-ins)',
      done: avg !== null && avg >= minAvgMood,
      detail: avg === null ? 'noch keine Check-ins' : `${avg.toFixed(1)} / ${minAvgMood}`,
    },
  ];
  items.push(...requirementItems(require, state, since));
  return items;
}

function requirementItems(req: Requirement, state: UserState, since: string): RequirementProgress {
  const items: RequirementProgress = [];
  if (req.checkins) {
    const n = state.checkins.filter((c) => c.date >= since).length;
    items.push({ label: 'Check-ins', done: n >= req.checkins, detail: `${Math.min(n, req.checkins)}/${req.checkins}` });
  }
  if (req.exercises) {
    const n = state.exerciseLog.filter((e) => e.date >= since).length;
    items.push({ label: 'Übungen', done: n >= req.exercises, detail: `${Math.min(n, req.exercises)}/${req.exercises}` });
  }
  for (const [pool, count] of Object.entries(req.pools ?? {})) {
    const n = state.exerciseLog.filter((e) => e.pool === pool).length;
    items.push({ label: POOL_LABELS[pool] ?? pool, done: n >= count, detail: `${Math.min(n, count)}/${count}` });
  }
  for (const w of req.workshops ?? []) {
    const done = state.workshopsDone.includes(w);
    items.push({ label: 'Ikigai-Werkstatt', done, detail: done ? 'fertig' : 'offen' });
  }
  if (req.habitCompletions) {
    const best = Math.max(0, ...state.habits.map((h) => h.completions.length));
    items.push({
      label: 'Eine Gewohnheit gepflegt',
      done: best >= req.habitCompletions,
      detail: `${Math.min(best, req.habitCompletions)}/${req.habitCompletions}×`,
    });
  }
  if (req.selfDates) {
    const n = state.selfDatesDone.length;
    items.push({ label: 'Selbst-Dates', done: n >= req.selfDates, detail: `${Math.min(n, req.selfDates)}/${req.selfDates}` });
  }
  return items;
}

const POOL_LABELS: Record<string, string> = {
  top5: 'Top-5-Listen',
  inner_child: 'Inneres-Kind-Übungen',
  reflection: 'Rückblick',
  letter: 'Brief ans frühere Ich',
};

export type PhaseSuggestion =
  | { kind: 'advance'; to: PhaseId }
  | { kind: 'step_back'; to: PhaseId }
  | { kind: 'complete' }
  | null;

/**
 * Prüft nach jedem Check-in, ob ein Phasenwechsel angeboten wird.
 * Es wird nie automatisch gewechselt – das Ergebnis ist immer nur ein Vorschlag.
 */
export function evaluatePhase(state: UserState, today: string, rules: PhaseRules): PhaseSuggestion {
  if (state.phase.completedAt) return null;
  if (state.phase.snoozedUntil && today < state.phase.snoozedUntil) return null;
  const current = state.phase.current;

  // Rückschritt zuerst prüfen: Halt geht vor Fortschritt.
  if (current > 1) {
    const prev = rules.phases.find((p) => p.id === current - 1)!;
    const entryThreshold = prev.advance.minAvgMood;
    const todayCheckin = state.checkins.find((c) => c.date === today);
    const chipHit = !!todayCheckin?.chips.includes(rules.stepBack.chip);
    const recent = state.checkins.filter((c) => c.date >= state.phase.enteredAt).slice(-rules.stepBack.window);
    const lowHits = recent.filter((c) => c.mood <= entryThreshold - rules.stepBack.belowEntryBy).length;
    if (chipHit || lowHits >= rules.stepBack.hits) return { kind: 'step_back', to: (current - 1) as PhaseId };
  }

  const ready = advanceProgress(state, today, rules).every((i) => i.done);
  if (!ready) return null;
  return current === 4 ? { kind: 'complete' } : { kind: 'advance', to: (current + 1) as PhaseId };
}

export function snoozeUntil(today: string, rules: PhaseRules): string {
  return addDays(today, rules.snoozeDays);
}
