import { useState } from 'react';
import { habits as habitsContent } from '../content';
import { nextStageIn, plantEmoji } from '../logic/garden';
import type { Habit } from '../store/types';

export default function HabitRow({ habit, today, onToggle }: { habit: Habit; today: string; onToggle: () => void }) {
  const done = habit.completions.includes(today);
  const [bump, setBump] = useState(0);
  const toNext = nextStageIn(habit.completions.length, habitsContent.growth.thresholds);

  return (
    <button
      onClick={() => {
        onToggle();
        if (!done) setBump(bump + 1);
      }}
      className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition active:scale-[0.98] ${done ? 'bg-[var(--phase-soft)]' : 'bg-white'}`}
    >
      <span key={bump} className={`flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm ${bump ? 'animate-wiggle' : ''}`}>
        {plantEmoji(habit, habitsContent)}
      </span>
      <span className="flex-1">
        <span className={`block font-bold ${done ? 'text-ink-soft line-through decoration-2' : ''}`}>
          {habit.emoji} {habit.title}
        </span>
        <span className="text-xs text-ink-soft">
          {toNext === null ? 'In voller Blüte 🌟' : `Noch ${toNext}× bis zur nächsten Stufe`}
        </span>
      </span>
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-lg font-bold transition ${
          done ? 'border-[var(--phase-accent)] bg-[var(--phase-accent)] text-white' : 'border-line text-transparent'
        }`}
      >
        ✓
      </span>
    </button>
  );
}
