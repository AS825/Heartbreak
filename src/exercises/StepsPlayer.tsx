import { useState } from 'react';
import { Button } from '../components/ui';
import type { RendererProps } from './ExerciseRenderer';

export default function StepsPlayer({ exercise, onDone }: RendererProps<'grounding'>) {
  const [i, setI] = useState(0);
  const last = i === exercise.steps.length - 1;
  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex gap-1.5">
        {exercise.steps.map((_, n) => (
          <span key={n} className={`h-2 flex-1 rounded-full ${n <= i ? 'bg-[var(--phase-accent)]' : 'bg-white'}`} />
        ))}
      </div>
      <div key={i} className="flex min-h-56 animate-pop items-center justify-center rounded-[32px] bg-white p-8 text-center">
        <p className="font-display text-2xl font-medium leading-snug">{exercise.steps[i]}</p>
      </div>
      <p className="mt-3 text-center text-sm text-ink-soft">Nimm dir Zeit. Weiter, wenn du so weit bist.</p>
      <Button className="mt-auto w-full" onClick={() => (last ? onDone({ kind: 'done' }) : setI(i + 1))}>
        {last ? 'Fertig' : 'Weiter'}
      </Button>
    </div>
  );
}
