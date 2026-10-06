import type { HabitsContent } from '../content/types';
import type { Habit } from '../store/types';
import { daysBetween } from './dates';

/** Wachstum hängt nur an der Gesamtzahl der Abhakungen – nie an Serien. */
export function plantStage(completions: number, thresholds: number[]): number {
  let stage = 0;
  thresholds.forEach((t, i) => {
    if (completions >= t) stage = i;
  });
  return stage;
}

export function plantEmoji(habit: Habit, content: HabitsContent): string {
  const stage = plantStage(habit.completions.length, content.growth.thresholds);
  if (stage >= content.growth.thresholds.length - 1) return content.plants[habit.plant]?.bloom ?? '🌸';
  return content.growth.stageEmojis[stage];
}

/** Bis zur nächsten Stufe – für kleine Fortschrittsanzeige. */
export function nextStageIn(completions: number, thresholds: number[]): number | null {
  const next = thresholds.find((t) => t > completions);
  return next === undefined ? null : next - completions;
}

/** Eine Pflanze „ruht“, wenn sie ein paar Tage nicht gegossen wurde. Sie welkt nie. */
export function isResting(habit: Habit, today: string): boolean {
  const last = habit.completions[habit.completions.length - 1] ?? habit.createdAt;
  return daysBetween(last, today) >= 3;
}
