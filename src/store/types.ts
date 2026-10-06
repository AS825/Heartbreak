import type { HabitDesignKey, IkigaiKey, PhaseId } from '../content/types';

export type Checkin = { date: string; mood: number; chips: string[] };

export type ExerciseOutput =
  | { kind: 'done' }
  | { kind: 'burned' }
  | { kind: 'text'; text: string }
  | { kind: 'list'; items: string[] };

export type ExerciseLogEntry = {
  exerciseId: string;
  pool: string;
  date: string;
  output: ExerciseOutput;
};

export type Habit = {
  id: string;
  title: string;
  emoji: string;
  plant: string;
  templateId?: string;
  design?: Partial<Record<HabitDesignKey, string>>;
  completions: string[];
  active: boolean;
  createdAt: string;
};

export type PhaseChangeReason = 'start' | 'advance' | 'step_back' | 'manual';

export type ReachedMilestone = { id: string; date: string; rewardId?: string; seen: boolean };

export type UserState = {
  onboarded: boolean;
  profile: { nickname: string; ageGroup: string; joys: string[] };
  onboardingAnswers: Record<string, unknown>;
  phase: {
    current: PhaseId;
    enteredAt: string;
    history: { phase: PhaseId; date: string; reason: PhaseChangeReason }[];
    snoozedUntil?: string;
    completedAt?: string;
  };
  checkins: Checkin[];
  exerciseLog: ExerciseLogEntry[];
  habits: Habit[];
  ikigai: Partial<Record<IkigaiKey, string[]>>;
  workshopsDone: string[];
  events: string[];
  selfDatesDone: { recId: string; date: string }[];
  milestones: ReachedMilestone[];
  daily: Record<string, { exerciseId: string; skipped: string[] }>;
  lastVisit?: string;
  helpHighlight: boolean;
  dev: { dayOffset: number };
};
