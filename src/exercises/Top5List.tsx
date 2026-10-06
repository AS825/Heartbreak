import { useState } from 'react';
import { Button } from '../components/ui';
import type { RendererProps } from './ExerciseRenderer';

/** Top-5-Liste im Plattenladen-Stil: von Platz 5 runter auf Platz 1. */
export default function Top5List({ exercise, onDone }: RendererProps<'list_top5'>) {
  const [items, setItems] = useState<string[]>(['', '', '', '', '']);
  const filled = items.filter((x) => x.trim()).length;

  return (
    <div className="flex flex-1 flex-col">
      <div className="rounded-[28px] bg-ink p-4 text-white shadow-lg">
        <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-sun">
          <span className="animate-[spin_4s_linear_infinite] text-lg">💿</span> Charts der Woche
        </p>
        <div className="space-y-2">
          {exercise.placeholders.map((ph, i) => (
            <label key={i} className="flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2">
              <span className="font-display w-7 text-center text-2xl font-semibold text-sun">{5 - i}</span>
              <input
                value={items[i]}
                placeholder={ph}
                onChange={(e) => setItems(items.map((x, n) => (n === i ? e.target.value : x)))}
                className="w-full bg-transparent py-1 text-base text-white outline-none placeholder:text-white/45"
              />
            </label>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-ink-soft">
        {filled < 5 ? 'Nicht alle Plätze nötig – aber Platz 1 lohnt sich.' : 'Volle Charts! 🎉'}
      </p>
      <Button className="mt-auto w-full" disabled={filled === 0} onClick={() => onDone({ kind: 'list', items: items.map((x) => x.trim()) })}>
        Liste speichern
      </Button>
    </div>
  );
}
