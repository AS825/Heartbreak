import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { copy, fill, getExercise, pick } from '../content';
import { useStore } from '../store/userStore';
import type { ExerciseOutput } from '../store/types';
import { Button } from '../components/ui';
import ExerciseRenderer from '../exercises/ExerciseRenderer';
import { TYPE_ICON } from './Today';

type Stage = 'intro' | 'run' | 'outro';

/** Pro Übung neu mounten, damit beim direkten Wechsel kein alter Zustand hängen bleibt. */
export default function ExerciseRoute() {
  const { id = '' } = useParams();
  return <ExerciseScreen key={id} id={id} />;
}

/** Generischer Übungs-Player: Intro → Übung (nach Typ) → Outro. */
function ExerciseScreen({ id }: { id: string }) {
  const navigate = useNavigate();
  const exercise = getExercise(id);
  const s = useStore();
  const [stage, setStage] = useState<Stage>('intro');
  const today = s.today();

  if (!exercise) {
    return (
      <div className="pt-20 text-center">
        <p>Diese Übung gibt's (noch) nicht.</p>
        <Button className="mt-4" onClick={() => navigate('/')}>{copy.exercise.back}</Button>
      </div>
    );
  }

  const vars = { nickname: s.profile.nickname };
  const isDaily = s.daily[today]?.exerciseId === exercise.id;
  const finish = (output: ExerciseOutput) => {
    s.logExercise(exercise, output);
    setStage('outro');
  };

  return (
    <div className="flex min-h-[88dvh] flex-col pt-6">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-2xl text-ink-soft" aria-label="Zurück">←</button>
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-ink-soft">
          ⏱ ca. {Math.max(1, Math.round(exercise.durationSec / 60))} Min.
        </span>
      </div>

      {stage === 'intro' && (
        <div className="flex flex-1 flex-col animate-fade-up">
          <div className="blob mx-auto mt-6 flex h-32 w-32 animate-float items-center justify-center bg-white text-6xl shadow-sm">
            {TYPE_ICON[exercise.type]}
          </div>
          <h1 className="mt-8 text-center text-3xl font-semibold leading-tight">{exercise.title}</h1>
          <div className="mt-4 space-y-2 text-center text-lg text-ink-soft">
            {exercise.intro.map((t, i) => (
              <p key={i}>{fill(t, vars)}</p>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-2 pt-10">
            <Button onClick={() => setStage('run')}>{copy.exercise.start}</Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (isDaily) s.skipDaily();
                navigate('/');
              }}
            >
              {copy.exercise.skip}
            </Button>
          </div>
        </div>
      )}

      {stage === 'run' && (
        <div className="flex flex-1 flex-col animate-fade-up">
          <h1 className="mb-4 text-2xl font-semibold leading-tight">{exercise.title}</h1>
          <ExerciseRenderer exercise={exercise} onDone={finish} />
        </div>
      )}

      {stage === 'outro' && (
        <div className="flex flex-1 flex-col items-center justify-center text-center animate-fade-up">
          <div className="animate-pop text-8xl">🌟</div>
          <p className="font-display mt-6 text-2xl font-semibold leading-snug">{fill(pick(exercise.outro, today), vars)}</p>
          <Button className="mt-10 w-full" onClick={() => navigate('/')}>
            {copy.exercise.back}
          </Button>
        </div>
      )}
    </div>
  );
}
