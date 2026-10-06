import { useNavigate } from 'react-router-dom';
import { copy, getExercise, getPhase, habits as habitsContent } from '../content';
import { plantEmoji } from '../logic/garden';
import { useStore } from '../store/userStore';
import { Button } from '../components/ui';

/** Bewusster Abschluss nach Phase 4: Garten-Foto, versiegelter Brief, Weg. */
export default function Abschluss() {
  const s = useStore();
  const navigate = useNavigate();
  const letter = [...s.exerciseLog].reverse().find((e) => getExercise(e.exerciseId)?.type === 'letter');

  return (
    <div className="flex min-h-[88dvh] flex-col justify-center pt-6 text-center">
      <div className="animate-pop text-7xl">🎓</div>
      <h1 className="mt-4 text-4xl font-semibold">{copy.abschluss.title}</h1>
      {copy.abschluss.lines.map((l) => (
        <p key={l} className="mt-3 text-lg text-ink-soft">{l}</p>
      ))}

      <div className="mt-8 rounded-[32px] bg-white p-5 shadow-lg [transform:rotate(-2deg)]">
        <div className="rounded-2xl bg-gradient-to-b from-[#cfeefa] to-[#bfe3c5] py-8 text-5xl tracking-[0.2em]">
          {s.habits.map((h) => plantEmoji(h, habitsContent)).join('') || '🌱'}
          {habitsContent.decorations.slice(0, s.selfDatesDone.length).join('')}
        </div>
        <p className="font-display mt-3 text-lg">
          Dein Weg: {s.phase.history.map((h) => getPhase(h.phase).emoji).join(' → ')} → 🎓
        </p>
      </div>

      {letter && letter.output.kind === 'text' && (
        <div className="mt-6 rounded-3xl bg-[#fffaf0] p-4 text-left ring-1 ring-line">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">✉️ Versiegelt</p>
          <p className="font-display mt-1 line-clamp-3">{letter.output.text}</p>
        </div>
      )}

      <Button className="mt-10 w-full" onClick={() => navigate('/garten')}>
        {copy.abschluss.cta}
      </Button>
    </div>
  );
}
