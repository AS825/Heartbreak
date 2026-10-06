import { useEffect, useState } from 'react';
import { Button } from '../components/ui';
import type { RendererProps } from './ExerciseRenderer';

type Step = { label: string; seconds: number; scale: number };

export default function BreathPlayer({ exercise, onDone }: RendererProps<'breath'>) {
  const { inhale, hold, exhale } = exercise.pattern;
  const steps: Step[] = [
    { label: 'Einatmen', seconds: inhale, scale: 1 },
    ...(hold > 0 ? [{ label: 'Halten', seconds: hold, scale: 1 }] : []),
    { label: 'Ausatmen', seconds: exhale, scale: 0.55 },
  ];
  const [running, setRunning] = useState(false);
  const [i, setI] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [left, setLeft] = useState(steps[0].seconds);
  const finished = cycle >= exercise.cycles;

  useEffect(() => {
    if (!running || finished) return;
    const t = setTimeout(() => {
      if (left > 1) return setLeft(left - 1);
      const next = (i + 1) % steps.length;
      if (next === 0) setCycle((c) => c + 1);
      setI(next);
      setLeft(steps[next].seconds);
    }, 1000);
    return () => clearTimeout(t);
  });

  const step = steps[i];
  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="relative mt-6 flex h-72 w-72 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-white/50" />
        <div
          className="blob absolute inset-4 bg-[var(--phase-accent)]/60 ease-in-out"
          style={{
            transform: `scale(${running && !finished ? step.scale : 0.55})`,
            transitionProperty: 'transform',
            transitionDuration: `${running ? step.seconds : 0.5}s`,
          }}
        />
        <div className="relative text-center text-white drop-shadow">
          {finished ? (
            <p className="font-display text-3xl font-semibold">Geschafft</p>
          ) : running ? (
            <>
              <p className="font-display text-3xl font-semibold">{step.label}</p>
              <p className="font-display text-5xl font-semibold">{left}</p>
            </>
          ) : (
            <p className="font-display text-2xl font-semibold">Bereit?</p>
          )}
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-ink-soft">
        Runde {Math.min(cycle + 1, exercise.cycles)} von {exercise.cycles}
      </p>
      <div className="mt-auto flex w-full flex-col gap-2 pt-8">
        {!running && !finished && <Button onClick={() => setRunning(true)}>Atmen starten</Button>}
        {(running || finished) && (
          <Button variant={finished ? 'primary' : 'soft'} onClick={() => onDone({ kind: 'done' })}>
            {finished ? 'Fertig' : 'Reicht mir für heute'}
          </Button>
        )}
      </div>
    </div>
  );
}
