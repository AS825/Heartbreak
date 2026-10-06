import { useState } from 'react';
import { fill, getPhase } from '../content';
import { daysBetween } from '../logic/dates';
import { useStore } from '../store/userStore';
import { Button, TextArea } from '../components/ui';
import type { RendererProps } from './ExerciseRenderer';

type Props = RendererProps<'journal' | 'reflection' | 'inner_child' | 'letter' | 'vent'>;

/** Ein Renderer für alle Schreib-Übungen – mit kleinen Extras je Typ. */
export default function TextPrompt({ exercise, onDone }: Props) {
  const [text, setText] = useState('');
  const [burning, setBurning] = useState(false);
  const nickname = useStore((s) => s.profile.nickname);

  if (exercise.type === 'vent') {
    return (
      <div className="flex flex-1 flex-col">
        <p className="font-display mb-3 text-xl">{exercise.prompt}</p>
        <div className={burning ? 'burn' : ''}>
          <TextArea rows={7} value={text} placeholder={exercise.placeholder} onChange={(e) => setText(e.target.value)} className="!bg-[#fff1ea]" />
        </div>
        {burning && <p className="mt-2 animate-pop text-center text-6xl">🔥</p>}
        <p className="mt-2 text-center text-xs text-ink-soft">Wird nicht gespeichert. Versprochen.</p>
        <Button
          className="mt-auto w-full"
          disabled={!text.trim() || burning}
          onClick={() => {
            setBurning(true);
            setTimeout(() => onDone({ kind: 'burned' }), 1300);
          }}
        >
          {exercise.burnLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {exercise.type === 'inner_child' && (
        <p className="mb-4 rounded-2xl bg-white/70 p-4 text-[15px] text-ink-soft">🧸 {exercise.frame}</p>
      )}
      {exercise.type === 'reflection' && <JourneyStats />}
      <p className="font-display mb-3 text-xl leading-snug">{fill(exercise.prompt, { nickname })}</p>

      {exercise.type === 'letter' ? (
        <div className="rounded-[28px] bg-[#fffaf0] p-5 shadow-inner ring-1 ring-line">
          <p className="font-display text-lg">{exercise.salutation}</p>
          <textarea
            rows={8}
            value={text}
            placeholder={exercise.placeholder}
            onChange={(e) => setText(e.target.value)}
            className="mt-2 w-full resize-none bg-[repeating-linear-gradient(transparent,transparent_31px,#f0e0d6_32px)] text-base leading-8 outline-none"
          />
          <p className="font-display text-right text-lg">– {nickname || 'ich'} von heute</p>
        </div>
      ) : (
        <TextArea rows={6} value={text} placeholder={exercise.placeholder} onChange={(e) => setText(e.target.value)} />
      )}

      <Button className="mt-auto w-full" disabled={!text.trim()} onClick={() => onDone({ kind: 'text', text: text.trim() })}>
        {exercise.type === 'letter' ? 'Brief versiegeln ✉️' : 'Speichern'}
      </Button>
    </div>
  );
}

function JourneyStats() {
  const s = useStore();
  const start = s.phase.history[0]?.date ?? s.today();
  const stats = [
    { n: daysBetween(start, s.today()) + 1, label: 'Tage unterwegs' },
    { n: s.checkins.length, label: 'Check-ins' },
    { n: s.exerciseLog.length, label: 'Übungen' },
    { n: s.habits.reduce((sum, h) => sum + h.completions.length, 0), label: 'Mal gegossen' },
  ];
  return (
    <div className="mb-5">
      <div className="grid grid-cols-2 gap-2">
        {stats.map((x) => (
          <div key={x.label} className="rounded-2xl bg-white p-3 text-center">
            <p className="font-display text-3xl font-semibold text-[var(--phase-accent)]">{x.n}</p>
            <p className="text-xs font-bold text-ink-soft">{x.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-sm text-ink-soft">
        Dein Weg: {s.phase.history.map((h) => getPhase(h.phase).emoji).join(' → ')}
      </p>
    </div>
  );
}
