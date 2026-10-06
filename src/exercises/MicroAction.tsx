import { Button } from '../components/ui';
import type { RendererProps } from './ExerciseRenderer';

export default function MicroAction({ exercise, onDone }: RendererProps<'micro_action'>) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="rounded-[32px] bg-white p-8 text-center">
        <p className="text-5xl">⚡</p>
        <p className="font-display mt-4 text-2xl font-medium leading-snug">{exercise.task}</p>
      </div>
      <p className="mt-3 text-center text-sm text-ink-soft">Wir warten hier. Kein Stress.</p>
      <Button className="mt-auto w-full" onClick={() => onDone({ kind: 'done' })}>
        {exercise.doneLabel} ✓
      </Button>
    </div>
  );
}
