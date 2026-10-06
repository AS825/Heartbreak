import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  exercises,
  getHabitTemplate,
  getWorkshop,
  habits as habitsContent,
  milestones as allMilestones,
  phaseRules,
  recommendations,
  workshops,
} from '../content';
import type { Exercise, HabitDesignKey, PhaseId } from '../content/types';
import { addDays, daysBetween, todayISO } from '../logic/dates';
import { pickDailyExercise } from '../logic/daily';
import { newlyReached, pickReward } from '../logic/milestones';
import { evaluatePhase, snoozeUntil, type PhaseSuggestion } from '../logic/phase';
import { localStorageAdapter } from './storage';
import type { ExerciseOutput, Habit, PhaseChangeReason, UserState } from './types';

export const initialState = (): UserState => ({
  onboarded: false,
  profile: { nickname: '', ageGroup: '', joys: [] },
  onboardingAnswers: {},
  phase: { current: 1, enteredAt: todayISO(), history: [] },
  checkins: [],
  exerciseLog: [],
  habits: [],
  ikigai: {},
  workshopsDone: [],
  events: [],
  selfDatesDone: [],
  milestones: [],
  daily: {},
  helpHighlight: false,
  dev: { dayOffset: 0 },
});

type Store = UserState & {
  suggestion: PhaseSuggestion;
  today: () => string;
  completeOnboarding: (input: {
    nickname: string;
    ageGroup: string;
    joys: string[];
    answers: Record<string, unknown>;
    startPhase: PhaseId;
    habitTemplateIds: string[];
  }) => void;
  checkin: (mood: number, chips: string[]) => void;
  answerSuggestion: (accept: boolean) => void;
  setPhase: (phase: PhaseId, reason: PhaseChangeReason) => void;
  ensureDaily: () => void;
  skipDaily: () => void;
  logExercise: (exercise: Exercise, output: ExerciseOutput) => void;
  addHabit: (input: { templateId?: string; title?: string; emoji?: string; plant?: string; design?: Partial<Record<HabitDesignKey, string>> }) => void;
  toggleHabit: (id: string) => void;
  setHabitActive: (id: string, active: boolean) => void;
  markSelfDate: (recId: string) => void;
  markMilestoneSeen: (id: string) => void;
  registerVisit: () => boolean;
  dismissHelpHighlight: () => void;
  devShiftDays: (n: number) => void;
  devSimulateCheckins: (count: number, mood: number) => void;
  devReset: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

/** Nach jeder Änderung: neue Meilensteine eintragen und passende Belohnung auswählen. */
function withMilestones(s: UserState, today: string): Partial<UserState> {
  const fresh = newlyReached(s, allMilestones, habitsContent.growth.thresholds);
  if (!fresh.length) return {};
  const used = s.milestones.map((m) => m.rewardId).filter(Boolean) as string[];
  const added = fresh.map((m) => {
    const rec =
      pickReward(m.reward, s.phase.current, s.profile.ageGroup, used, recommendations) ??
      pickReward('treat', s.phase.current, s.profile.ageGroup, used, recommendations);
    if (rec) used.push(rec.id);
    return { id: m.id, date: today, rewardId: rec?.id, seen: false };
  });
  return { milestones: [...s.milestones, ...added] };
}

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      /** Zustand ändern und danach Meilensteine prüfen. */
      const update = (fn: (s: UserState) => Partial<UserState>) => {
        set((s) => {
          const patch = fn(s);
          return { ...patch, ...withMilestones({ ...s, ...patch }, s.today()) };
        });
      };

      const changePhase = (s: UserState, phase: PhaseId, reason: PhaseChangeReason, today: string): Partial<UserState> => ({
        phase: {
          current: phase,
          enteredAt: today,
          history: [...s.phase.history, { phase, date: today, reason }],
        },
        events: s.events.includes(`phase_enter:${phase}`) ? s.events : [...s.events, `phase_enter:${phase}`],
        // Neue Phase → neue Tagesübung
        daily: Object.fromEntries(Object.entries(s.daily).filter(([d]) => d !== today)),
      });

      return {
        ...initialState(),
        suggestion: null,
        today: () => todayISO(get().dev.dayOffset),

        completeOnboarding: ({ nickname, ageGroup, joys, answers, startPhase, habitTemplateIds }) => {
          const today = get().today();
          const mood = Number(answers.mood);
          update((s) => ({
            onboarded: true,
            profile: { nickname, ageGroup, joys },
            onboardingAnswers: answers,
            phase: { current: startPhase, enteredAt: today, history: [{ phase: startPhase, date: today, reason: 'start' }] },
            events: [...s.events, 'onboarded'],
            // Die Onboarding-Stimmung zählt als erster Check-in.
            checkins: [{ date: today, mood, chips: [] }],
            helpHighlight: mood <= phaseRules.scoring.forcePhase1AtOrBelowMood,
            lastVisit: today,
            habits: habitTemplateIds.map((id) => {
              const t = getHabitTemplate(id)!;
              return { id: uid(), templateId: id, title: t.title, emoji: t.emoji, plant: t.plant, completions: [], active: true, createdAt: today };
            }),
          }));
        },

        checkin: (mood, chips) => {
          const today = get().today();
          update((s) => ({
            checkins: [...s.checkins.filter((c) => c.date !== today), { date: today, mood, chips }],
            helpHighlight: s.helpHighlight || mood <= phaseRules.protectMode.moodAtOrBelow,
            // Check-in kann die Tagesübung beeinflussen (Schutzmodus, Kontakt) → neu wählen, falls noch nicht gemacht
            daily: s.exerciseLog.some((e) => e.date === today)
              ? s.daily
              : Object.fromEntries(Object.entries(s.daily).filter(([d]) => d !== today)),
          }));
          set({ suggestion: evaluatePhase(get(), today, phaseRules) });
        },

        answerSuggestion: (accept) => {
          const { suggestion } = get();
          const today = get().today();
          if (!suggestion) return;
          if (!accept) {
            update((s) => ({ phase: { ...s.phase, snoozedUntil: snoozeUntil(today, phaseRules) } }));
          } else if (suggestion.kind === 'complete') {
            update((s) => ({ phase: { ...s.phase, completedAt: today }, events: [...s.events, 'journey_complete'] }));
          } else {
            update((s) => changePhase(s, suggestion.to, suggestion.kind === 'advance' ? 'advance' : 'step_back', today));
          }
          set({ suggestion: null });
        },

        setPhase: (phase, reason) => {
          const today = get().today();
          update((s) => changePhase(s, phase, reason, today));
          set({ suggestion: null });
        },

        /** Legt die Tagesübung fest, damit sie sich nach dem Erledigen nicht verändert. */
        ensureDaily: () => {
          const s = get();
          const today = s.today();
          const plan = s.daily[today];
          if (plan && exercises.some((e) => e.id === plan.exerciseId)) return;
          const ex = pickDailyExercise(s, today, plan?.skipped ?? [], { rules: phaseRules, exercises, workshops });
          set({ daily: { ...s.daily, [today]: { exerciseId: ex.id, skipped: plan?.skipped ?? [] } } });
        },

        skipDaily: () => {
          const s = get();
          const today = s.today();
          const plan = s.daily[today];
          const skipped = plan ? [...plan.skipped, plan.exerciseId] : [];
          const ex = pickDailyExercise(s, today, skipped, { rules: phaseRules, exercises, workshops });
          set({ daily: { ...s.daily, [today]: { exerciseId: ex.id, skipped } } });
        },

        logExercise: (exercise, output) => {
          const today = get().today();
          update((s) => {
            const exerciseLog = [...s.exerciseLog, { exerciseId: exercise.id, pool: exercise.pool, date: today, output }];
            const patch: Partial<UserState> = { exerciseLog };
            if (exercise.type === 'ikigai_step' && output.kind === 'list') {
              patch.ikigai = { ...s.ikigai, [exercise.key]: output.items };
            }
            // Werkstatt abgeschlossen?
            for (const w of workshops) {
              const done = new Set(exerciseLog.map((e) => e.exerciseId));
              if (!s.workshopsDone.includes(w.id) && w.steps.every((st) => done.has(st)) && done.has(w.finalStep)) {
                patch.workshopsDone = [...s.workshopsDone, w.id];
                patch.events = [...s.events, `workshop_done:${w.id}`];
              }
            }
            return patch;
          });
        },

        addHabit: ({ templateId, title, emoji, plant, design }) => {
          const today = get().today();
          const t = templateId ? getHabitTemplate(templateId) : undefined;
          const habit: Habit = {
            id: uid(),
            templateId,
            title: title ?? t?.title ?? 'Neue Gewohnheit',
            emoji: emoji ?? t?.emoji ?? '🌱',
            plant: plant ?? t?.plant ?? 'daisy',
            design,
            completions: [],
            active: true,
            createdAt: today,
          };
          update((s) => ({ habits: [...s.habits, habit] }));
        },

        toggleHabit: (id) => {
          const today = get().today();
          update((s) => ({
            habits: s.habits.map((h) =>
              h.id !== id
                ? h
                : {
                    ...h,
                    completions: h.completions.includes(today)
                      ? h.completions.filter((d) => d !== today)
                      : [...h.completions, today].sort(),
                  },
            ),
          }));
        },

        setHabitActive: (id, active) => update((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...h, active } : h)) })),

        markSelfDate: (recId) => {
          const today = get().today();
          update((s) => ({ selfDatesDone: [...s.selfDatesDone, { recId, date: today }], events: [...s.events, 'self_date_done'] }));
        },

        markMilestoneSeen: (id) => set((s) => ({ milestones: s.milestones.map((m) => (m.id === id ? { ...m, seen: true } : m)) })),

        /** Gibt true zurück, wenn die Person ein paar Tage weg war (→ freundliche Begrüßung). */
        registerVisit: () => {
          const s = get();
          const today = s.today();
          const wasAway = !!s.lastVisit && daysBetween(s.lastVisit, today) >= 3;
          if (s.lastVisit !== today) set({ lastVisit: today });
          return wasAway;
        },

        dismissHelpHighlight: () => set({ helpHighlight: false }),

        devShiftDays: (n) => set((s) => ({ dev: { ...s.dev, dayOffset: s.dev.dayOffset + n }, suggestion: null })),

        /** Simuliert Check-ins an den vergangenen Tagen, damit Phasenwechsel vorführbar sind. */
        devSimulateCheckins: (count, mood) => {
          const today = get().today();
          update((s) => {
            const dates = Array.from({ length: count }, (_, i) => addDays(today, -(count - 1 - i)));
            const kept = s.checkins.filter((c) => !dates.includes(c.date));
            // Für die Demo: so tun, als wären diese Tage schon in der aktuellen Etappe gewesen.
            const enteredAt = dates[0] < s.phase.enteredAt ? dates[0] : s.phase.enteredAt;
            return {
              checkins: [...kept, ...dates.map((date) => ({ date, mood, chips: [] }))].sort((a, b) => a.date.localeCompare(b.date)),
              phase: { ...s.phase, enteredAt, snoozedUntil: undefined },
            };
          });
          set({ suggestion: evaluatePhase(get(), today, phaseRules) });
        },

        devReset: () => {
          localStorageAdapter.removeItem('heartbreak-state');
          set({ ...initialState(), suggestion: null });
        },
      };
    },
    {
      name: 'heartbreak-state',
      version: 1,
      storage: createJSONStorage(() => localStorageAdapter),
      partialize: ({ suggestion: _s, ...rest }) =>
        Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== 'function')) as UserState,
    },
  ),
);

export const getWorkshopOrThrow = (id: string) => getWorkshop(id)!;
