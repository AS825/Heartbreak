import { useNavigate, useParams } from 'react-router-dom';
import { getExercise, getWorkshop } from '../content';
import type { IkigaiKey } from '../content/types';
import { nextWorkshopStep } from '../logic/daily';
import { useStore } from '../store/userStore';
import { Button, Card, ScreenTitle } from '../components/ui';
import { IKIGAI_COLORS } from '../exercises/IkigaiStep';

/** Werkstatt-Übersicht (Ikigai): Fortschritt, Kompass-Ansicht, nächster Schritt. */
export default function WorkshopScreen() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const s = useStore();
  const w = getWorkshop(id);
  if (!w) return null;

  const next = nextWorkshopStep(s, w);
  const today = s.today();
  const stepDoneToday = s.exerciseLog.some((e) => e.date === today && (w.steps.includes(e.exerciseId) || e.exerciseId === w.finalStep));
  const keys = Object.keys(w.resultLabels) as IkigaiKey[];
  const allFilled = keys.every((k) => (s.ikigai[k] ?? []).length > 0);

  return (
    <div className="pt-6">
      <button onClick={() => navigate(-1)} className="mb-4 text-2xl text-ink-soft" aria-label="Zurück">←</button>
      <ScreenTitle kicker="Werkstatt" title={`${w.emoji} ${w.title}`} sub={w.intro} />

      {/* Kompass: vier überlappende Kreise */}
      <div className="relative mx-auto h-64 w-64">
        {keys.map((k, i) => {
          const pos = [
            { left: '22%', top: '0%' },
            { left: '44%', top: '22%' },
            { left: '22%', top: '44%' },
            { left: '0%', top: '22%' },
          ][i];
          const filled = (s.ikigai[k] ?? []).length > 0;
          return (
            <div
              key={k}
              className="absolute flex h-[56%] w-[56%] items-center justify-center rounded-full p-2 text-center text-[11px] font-bold leading-tight text-ink mix-blend-multiply transition"
              style={{ ...pos, background: IKIGAI_COLORS[k], opacity: filled ? 0.75 : 0.18 }}
            >
              <span className={i === 1 ? 'pl-12' : i === 3 ? 'pr-12' : i === 0 ? 'pb-12' : 'pt-12'}>{w.resultLabels[k]}</span>
            </div>
          );
        })}
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl">{allFilled ? '💛' : '?'}</span>
      </div>

      <div className="mt-6 space-y-2">
        {w.steps.map((stepId, i) => {
          const ex = getExercise(stepId);
          const k = keys[i];
          const items = s.ikigai[k] ?? [];
          return (
            <Card key={stepId} className="!p-4" onClick={() => navigate(`/uebung/${stepId}`)}>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-4 w-4 shrink-0 rounded-full" style={{ background: IKIGAI_COLORS[k] }} />
                <div className="flex-1">
                  <p className="font-bold">{ex?.title}</p>
                  <p className="text-sm text-ink-soft">{items.length ? items.join(' · ') : 'noch offen'}</p>
                </div>
                <span>{items.length ? '✓' : '→'}</span>
              </div>
            </Card>
          );
        })}
        <Card className="!p-4" onClick={allFilled ? () => navigate(`/uebung/${w.finalStep}`) : undefined}>
          <div className="flex items-center gap-3">
            <span className="text-xl">🌱</span>
            <div className="flex-1">
              <p className="font-bold">Daraus: 1–{w.maxHabits} neue Gewohnheiten</p>
              <p className="text-sm text-ink-soft">
                {s.habits.filter((h) => h.design).map((h) => h.title).join(' · ') || (allFilled ? 'Jetzt entwerfen' : 'Erst den Kompass fertig bauen')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {next && (
        <>
          <Button className="mt-6 w-full" onClick={() => navigate(`/uebung/${next}`)}>
            Nächster Schritt
          </Button>
          {stepDoneToday && (
            <p className="mt-2 text-center text-sm text-ink-soft">
              Heute hast du schon einen Schritt gemacht. Gern weiter – oder morgen, ganz in Ruhe.
            </p>
          )}
        </>
      )}
    </div>
  );
}
