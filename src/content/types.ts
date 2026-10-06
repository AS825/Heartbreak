export type PhaseId = 1 | 2 | 3 | 4;

export type Option = { id: string; label: string; emoji?: string };

export type OnboardingQuestion = {
  id: string;
  kind: 'text' | 'single' | 'multi' | 'slider';
  title: string;
  hint?: string;
  placeholder?: string;
  options?: Option[];
  allowCustom?: boolean;
  customPlaceholder?: string;
  min?: number;
  max?: number;
  reactions?: Record<string, string>;
  sliderReactions?: { max: number; text: string }[];
};

export type Requirement = {
  checkins?: number;
  exercises?: number;
  pools?: Record<string, number>;
  workshops?: string[];
  habitCompletions?: number;
  selfDates?: number;
};

export type Phase = {
  id: PhaseId;
  key: string;
  title: string;
  subtitle: string;
  emoji: string;
  landscape: string;
  humorLevel: number;
  theme: { bg: string; accent: string; soft: string };
  description: string;
  helps: string[];
  exercisePools: string[];
  habitTemplates: string[];
  recommendations: string[];
  workshops: string[];
  advance: { minDays: number; minAvgMood: number; require: Requirement };
};

export type Scoring = {
  base: Record<string, number>;
  who: Record<string, number>;
  contact: Record<string, number>;
  mood: { min?: number; max?: number; add: number }[];
  phase4Requires: { since: string; minMood: number };
  forcePhase1AtOrBelowMood: number;
};

export type PhaseRules = {
  phases: Phase[];
  scoring: Scoring;
  protectMode: { moodAtOrBelow: number };
  stepBack: { window: number; hits: number; belowEntryBy: number; chip: string };
  snoozeDays: number;
};

type ExerciseBase = {
  id: string;
  phases: PhaseId[];
  pool: string;
  durationSec: number;
  humorLevel: number;
  title: string;
  intro: string[];
  outro: string[];
  savesTo?: 'journal' | 'lists' | 'letters';
};

export type Exercise =
  | (ExerciseBase & { type: 'breath'; pattern: { inhale: number; hold: number; exhale: number }; cycles: number })
  | (ExerciseBase & { type: 'grounding'; steps: string[] })
  | (ExerciseBase & { type: 'micro_action'; task: string; doneLabel: string })
  | (ExerciseBase & { type: 'list_top5'; placeholders: string[] })
  | (ExerciseBase & { type: 'vent'; prompt: string; placeholder: string; burnLabel: string })
  | (ExerciseBase & { type: 'inner_child'; prompt: string; placeholder: string; frame: string })
  | (ExerciseBase & { type: 'journal' | 'reflection'; prompt: string; placeholder: string })
  | (ExerciseBase & { type: 'letter'; prompt: string; placeholder: string; salutation: string })
  | (ExerciseBase & {
      type: 'ikigai_step';
      key: IkigaiKey;
      prompt: string;
      suggestions: string[];
      seedFromJoys?: boolean;
    })
  | (ExerciseBase & { type: 'habit_design' });

export type ExerciseType = Exercise['type'];
export type IkigaiKey = 'love' | 'good' | 'world' | 'paid';

export type Workshop = {
  id: string;
  phases: PhaseId[];
  title: string;
  emoji: string;
  intro: string;
  steps: string[];
  finalStep: string;
  maxHabits: number;
  resultLabels: Record<IkigaiKey, string>;
};

export type HabitTemplate = { id: string; title: string; emoji: string; plant: string; cue: string; joys: string[] };

export type HabitsContent = {
  growth: { thresholds: number[]; stageNames: string[]; stageEmojis: string[]; restingLabel: string };
  plants: Record<string, { name: string; bloom: string }>;
  templates: HabitTemplate[];
  designer: {
    intro: string;
    titleStep: { prompt: string; placeholder: string; fromIkigai: string };
    steps: { key: HabitDesignKey; label: string; emoji: string; prompt: string; example: string }[];
    plantPrompt: string;
  };
  decorations: string[];
};

export type HabitDesignKey = 'obvious' | 'attractive' | 'easy' | 'satisfying';

export type RewardKind = 'book' | 'treat' | 'self_date';

export type Recommendation = {
  id: string;
  kind: RewardKind;
  phases: PhaseId[];
  title: string;
  author?: string;
  emoji: string;
  text: string;
  affiliateUrl?: string;
  ageGroups?: string[];
};

export type MilestoneCondition = {
  checkinsTotal?: number;
  exercisesTotal?: number;
  habitStage?: number;
  selfDatesTotal?: number;
  event?: string;
};

export type Milestone = {
  id: string;
  when: MilestoneCondition;
  title: string;
  text: string;
  reward: RewardKind;
};

export type CheckinChip = Option & { effect?: 'after_contact' | 'step_back' };

export type HelpContact = {
  id: string;
  name: string;
  number: string;
  tel: string;
  info: string;
  primary?: boolean;
  ageGroups?: string[];
};
