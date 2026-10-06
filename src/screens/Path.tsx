import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPhase, getRecommendation, getWorkshop, phaseRules, recommendations } from '../content';
import type { PhaseId } from '../content/types';
import { advanceProgress } from '../logic/phase';
import { nextWorkshopStep } from '../logic/daily';
import { useStore } from '../store/userStore';
import { Button, Card, ScreenTitle, Sheet } from '../components/ui';
import PhaseMap from '../components/PhaseMap';

/** „Mein Weg“: Landkarte, aktuelle Etappe, Fortschritt, Werkstätten und manueller Phasenwechsel. */
export default function Path() {
  const s = useStore();
  const navigate = useNavigate();
  const today = s.today();
  const [picked, setPicked] = useState<PhaseId | null>(null);
  const phase = getPhase(s.phase.current);
  const progress = advanceProgress(s, today, phaseRules);
  const loops = s.phase.history.filter((h) => h.reason === 'step_back').length;
  const selfDates = recommendations.filter(
    (r) => r.kind === 'self_date' && r.phases.includes(phase.id) && (!r.ageGroups || r.ageGroups.includes(s.profile.ageGroup)),
  );

  return (
    <div className="pt-4">
      <ScreenTitle kicker="Mein Weg" title={`${phase.emoji} ${phase.title}`} sub={phase.description} />

      <PhaseMap current={s.phase.current} loops={loops} onSelect={setPicked} />
      <p className="mt-2 text-center text-xs text-ink-soft">Tipp: Tippe auf eine Etappe, um dorthin zu wechseln.</p>

      <Card className="mt-5">
        <p className="text-sm font-bold uppercase tracking-wider text-ink-soft">Was jetzt hilft</p>
        <ul className="mt-2 space-y-1">
          {phase.helps.map((h) => (
            <li key={h} className="flex gap-2">
              <span>🌱</span>
              {h}
            </li>
          ))}
        </ul>
      </Card>

      {!s.phase.completedAt && (
        <Card className="mt-3">
          <p className="text-sm font-bold uppercase tracking-wider text-ink-soft">
            {phase.id < 4 ? `Auf dem Weg zu: ${getPhase((phase.id + 1) as PhaseId).landscape}` : 'Auf dem Weg zum Abschluss'}
          </p>
          <p className="mt-1 text-xs text-ink-soft">Kein Wettrennen. Wenn alles passt, fragen wir dich einfach.</p>
          <ul className="mt-3 space-y-2">
            {progress.map((p) => (
              <li key={p.label} className="flex items-center gap-2 text-[15px]">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${p.done ? 'bg-[var(--phase-accent)] text-white' : 'bg-[var(--phase-soft)]'}`}>
                  {p.done ? '✓' : ''}
                </span>
                <span className="flex-1">{p.label}</span>
                <span className="text-sm text-ink-soft">{p.detail}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {phase.workshops.map((wid) => {
        const w = getWorkshop(wid)!;
        const done = w.steps.filter((st) => s.exerciseLog.some((e) => e.exerciseId === st)).length;
        const finished = s.workshopsDone.includes(w.id);
        return (
          <Card key={wid} className="mt-3" onClick={() => navigate(`/werkstatt/${wid}`)}>
            <div className="flex items-center gap-3">
              <span className="blob flex h-14 w-14 items-center justify-center bg-[var(--phase-soft)] text-3xl">{w.emoji}</span>
              <div className="flex-1">
                <p className="font-display text-lg font-semibold">{w.title}</p>
                <p className="text-sm text-ink-soft">
                  {finished ? 'Fertig – schau dir deinen Kompass an' : nextWorkshopStep(s, w) ? `${done}/${w.steps.length} Schritte` : ''}
                </p>
              </div>
              <span className="text-xl">→</span>
            </div>
          </Card>
        );
      })}

      {phase.id >= 3 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-ink-soft">Ideen für Selbst-Dates</h2>
          <div className="flex snap-x gap-3 overflow-x-auto pb-2">
            {selfDates.map((r) => {
              const count = s.selfDatesDone.filter((d) => d.recId === r.id).length;
              return (
                <div key={r.id} className="w-56 shrink-0 snap-start rounded-3xl bg-white p-4">
                  <p className="text-3xl">{r.emoji}</p>
                  <p className="font-display mt-1 font-semibold">{r.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">{r.text}</p>
                  <button onClick={() => s.markSelfDate(r.id)} className="mt-3 text-sm font-bold text-[var(--phase-accent)]">
                    {count ? `Erledigt ✓ (${count}×) · nochmal` : 'Hab ich gemacht ✓'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-ink-soft">Lesetipp für diese Etappe</h2>
        {phase.recommendations.map((id) => {
          const r = getRecommendation(id)!;
          return (
            <Card key={id} className="mb-2 !p-4">
              <div className="flex gap-3">
                <span className="text-4xl">{r.emoji}</span>
                <div>
                  <p className="font-display font-semibold leading-tight">{r.title}</p>
                  <p className="text-sm text-ink-soft">{r.author}</p>
                  <p className="mt-1 text-sm">{r.text}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <Sheet open={picked !== null} onClose={() => setPicked(null)}>
        {picked !== null && (
          <>
            <p className="text-5xl">{getPhase(picked).emoji}</p>
            <h2 className="mt-2 text-2xl font-semibold">{getPhase(picked).title}</h2>
            <p className="text-sm font-bold text-[var(--phase-accent)]">{getPhase(picked).subtitle}</p>
            <p className="mt-2 text-ink-soft">{getPhase(picked).description}</p>
            {picked === s.phase.current ? (
              <p className="mt-5 rounded-2xl bg-white p-3 text-center font-semibold">Hier bist du gerade 📍</p>
            ) : (
              <>
                <p className="mt-4 rounded-2xl bg-white p-3 text-sm">
                  {picked < s.phase.current
                    ? 'Zurückgehen ist völlig okay. Dein Garten und alles Gesammelte bleiben.'
                    : 'Du fühlst dich schon weiter? Dann vertrau dir – du kannst jederzeit zurück.'}
                </p>
                <Button
                  className="mt-4 w-full"
                  onClick={() => {
                    s.setPhase(picked, 'manual');
                    setPicked(null);
                  }}
                >
                  Zu „{getPhase(picked).title}“ wechseln
                </Button>
              </>
            )}
          </>
        )}
      </Sheet>
    </div>
  );
}
