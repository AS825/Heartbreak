import type { Milestone, MilestoneCondition, PhaseId, Recommendation, RewardKind } from '../content/types';
import type { UserState } from '../store/types';
import { plantStage } from './garden';

export function activityStats(state: UserState, thresholds: number[]) {
  return {
    checkinsTotal: state.checkins.length,
    exercisesTotal: state.exerciseLog.length,
    maxHabitStage: Math.max(0, ...state.habits.map((h) => plantStage(h.completions.length, thresholds))),
    selfDatesTotal: state.selfDatesDone.length,
  };
}

/** Bedingungen kennen nur Aktivität. Stimmung ist absichtlich kein Feld. */
function met(when: MilestoneCondition, state: UserState, thresholds: number[]): boolean {
  const s = activityStats(state, thresholds);
  if (when.checkinsTotal !== undefined && s.checkinsTotal < when.checkinsTotal) return false;
  if (when.exercisesTotal !== undefined && s.exercisesTotal < when.exercisesTotal) return false;
  if (when.habitStage !== undefined && s.maxHabitStage < when.habitStage) return false;
  if (when.selfDatesTotal !== undefined && s.selfDatesTotal < when.selfDatesTotal) return false;
  if (when.event !== undefined && !state.events.includes(when.event)) return false;
  return true;
}

export function newlyReached(state: UserState, all: Milestone[], thresholds: number[]): Milestone[] {
  const reached = new Set(state.milestones.map((m) => m.id));
  return all.filter((m) => !reached.has(m.id) && met(m.when, state, thresholds));
}

/** Passende Belohnung: aktuelle Phase, Altersgruppe, möglichst noch nicht vergeben. */
export function pickReward(
  kind: RewardKind,
  phase: PhaseId,
  ageGroup: string,
  usedIds: string[],
  recs: Recommendation[],
): Recommendation | undefined {
  const fits = recs.filter(
    (r) => r.kind === kind && (!r.ageGroups || r.ageGroups.includes(ageGroup)),
  );
  // Nie etwas aus einer späteren Phase vorgreifen (kein bell hooks in der Schockphase).
  const unused = fits.filter((r) => !usedIds.includes(r.id));
  const ranked = [
    ...unused.filter((r) => r.phases.includes(phase)),
    ...unused.filter((r) => Math.min(...r.phases) < phase),
    ...fits.filter((r) => r.phases.includes(phase)),
  ];
  return ranked[0];
}
