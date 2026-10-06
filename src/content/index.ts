import onboardingJson from '../../content/onboarding.json';
import phasesJson from '../../content/phases.json';
import exercisesJson from '../../content/exercises.json';
import habitsJson from '../../content/habits.json';
import recommendationsJson from '../../content/recommendations.json';
import rewardsJson from '../../content/rewards.json';
import copyJson from '../../content/copy.json';
import helpJson from '../../content/help.json';
import type {
  CheckinChip,
  Exercise,
  HabitsContent,
  HelpContact,
  Milestone,
  OnboardingQuestion,
  Phase,
  PhaseId,
  PhaseRules,
  Recommendation,
  RewardKind,
  Workshop,
} from './types';

/**
 * Alle Inhalte kommen aus /content/*.json. Hier werden sie nur typisiert
 * und mit kleinen Lookup-Helfern versehen – kein Text ist im Code hart codiert.
 */

export const onboarding = onboardingJson as unknown as {
  intro: { title: string; lines: string[]; cta: string };
  questions: OnboardingQuestion[];
  reveal: { title: string; disclaimer: string; habitsTitle: string; habitsHint: string; cta: string };
};

export const phaseRules = phasesJson as unknown as PhaseRules;
export const exercises = exercisesJson.exercises as unknown as Exercise[];
export const workshops = exercisesJson.workshops as unknown as Workshop[];
export const habits = habitsJson as unknown as HabitsContent;
export const recommendations = recommendationsJson.items as unknown as Recommendation[];
export const milestones = rewardsJson.milestones as unknown as Milestone[];
export const rewardIntro = rewardsJson.rewardIntro as Record<RewardKind, string>;
export const copy = copyJson;
export const checkinChips = copyJson.checkin.chips as CheckinChip[];
export const help = helpJson as unknown as {
  region: string;
  title: string;
  text: string;
  contacts: HelpContact[];
  calmTitle: string;
  calmExercise: string;
};

export const getPhase = (id: PhaseId): Phase => phaseRules.phases.find((p) => p.id === id)!;
export const getExercise = (id: string) => exercises.find((e) => e.id === id);
export const getWorkshop = (id: string) => workshops.find((w) => w.id === id);
export const getRecommendation = (id: string) => recommendations.find((r) => r.id === id);
export const getHabitTemplate = (id: string) => habits.templates.find((t) => t.id === id);

/** Ersetzt {{platzhalter}} in Texten. */
export function fill(text: string, vars: Record<string, string | number | undefined>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(vars[key] ?? ''));
}

/** Wählt eine Textvariante – stabil pro Tag, damit sich nichts bei jedem Render ändert. */
export function pick<T>(items: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return items[Math.abs(h) % items.length];
}
