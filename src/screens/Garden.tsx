import { useState } from 'react';
import { getPhase, habits as habitsContent } from '../content';
import { isResting, plantEmoji, plantStage } from '../logic/garden';
import { useStore } from '../store/userStore';
import { Button, Card, ScreenTitle, Sheet } from '../components/ui';

/** Habit-Garten: wächst mit jeder Abhakung, welkt nie. */
export default function Garden() {
  const s = useStore();
  const today = s.today();
  const [adding, setAdding] = useState(false);
  const phase = getPhase(s.phase.current);
  const g = habitsContent.growth;
  const decorations = habitsContent.decorations.slice(0, s.selfDatesDone.length);
  const available = phase.habitTemplates.filter((id) => !s.habits.some((h) => h.templateId === id && h.active));

  return (
    <div className="pt-4">
      <ScreenTitle kicker="Dein Garten" title="Alles wächst. Langsam." sub="Jede Gewohnheit ist eine Pflanze. Wenn du sie mal nicht gießt, ruht sie nur." />

      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-b from-[#cfeefa] via-[#e9f7ee] to-[#bfe3c5] px-4 pb-6 pt-10">
        <span className="absolute right-5 top-3 animate-float text-4xl">☀️</span>
        <span className="absolute left-6 top-4 text-2xl opacity-80">☁️</span>
        <div className="relative grid grid-cols-3 gap-y-6">
          {s.habits.map((h) => {
            const stage = plantStage(h.completions.length, g.thresholds);
            const resting = isResting(h, today) && h.active;
            return (
              <div key={h.id} className={`flex flex-col items-center ${h.active ? '' : 'opacity-50'}`}>
                <span className={`text-5xl transition ${resting ? 'opacity-60 saturate-50' : 'animate-float'}`} style={{ fontSize: `${2.2 + stage * 0.45}rem` }}>
                  {plantEmoji(h, habitsContent)}
                </span>
                <span className="mt-1 h-2 w-12 rounded-full bg-[#9c7a5b]/40" />
                <span className="mt-1 max-w-24 truncate text-center text-xs font-bold">{h.title}</span>
              </div>
            );
          })}
          {s.habits.length === 0 && <p className="col-span-3 text-center text-ink-soft">Noch leer hier. Pflanz deinen ersten Samen!</p>}
        </div>
        {decorations.length > 0 && <p className="mt-6 text-center text-3xl tracking-[0.4em]">{decorations.join('')}</p>}
      </div>
      {decorations.length > 0 && <p className="mt-2 text-center text-xs text-ink-soft">Jedes Selbst-Date bringt etwas Neues in deinen Garten.</p>}

      <h2 className="mt-8 mb-2 text-sm font-bold uppercase tracking-wider text-ink-soft">Deine Pflanzen</h2>
      <div className="space-y-2">
        {s.habits.map((h) => {
          const stage = plantStage(h.completions.length, g.thresholds);
          return (
            <Card key={h.id} className="!p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{plantEmoji(h, habitsContent)}</span>
                <div className="flex-1">
                  <p className="font-bold">{h.emoji} {h.title}</p>
                  <p className="text-xs text-ink-soft">
                    {g.stageNames[stage]} · {h.completions.length}× gegossen
                    {h.active && isResting(h, today) ? ` · ${g.restingLabel}` : ''}
                  </p>
                  {h.design?.easy && <p className="mt-1 text-xs text-ink-soft">🪶 {h.design.easy}</p>}
                </div>
                <button onClick={() => s.setHabitActive(h.id, !h.active)} className="text-xs font-bold text-ink-soft">
                  {h.active ? 'Pausieren' : 'Aufwecken'}
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <Button variant="soft" className="mt-4 w-full" onClick={() => setAdding(true)}>
        + Neue Pflanze
      </Button>

      <Sheet open={adding} onClose={() => setAdding(false)}>
        <h2 className="text-2xl font-semibold">Was soll wachsen?</h2>
        <p className="text-sm text-ink-soft">Vorschläge passend zu {phase.subtitle}</p>
        <div className="mt-4 space-y-2">
          {available.map((id) => {
            const t = habitsContent.templates.find((x) => x.id === id)!;
            return (
              <button
                key={id}
                onClick={() => {
                  s.addHabit({ templateId: id });
                  setAdding(false);
                }}
                className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left"
              >
                <span className="text-2xl">{t.emoji}</span>
                <span className="flex-1">
                  <span className="block font-bold">{t.title}</span>
                  <span className="text-sm text-ink-soft">{t.cue}</span>
                </span>
                <span className="text-2xl">{habitsContent.plants[t.plant].bloom}</span>
              </button>
            );
          })}
          {available.length === 0 && <p className="text-ink-soft">Alle Vorschläge dieser Phase wachsen schon. 🌿</p>}
        </div>
        {s.phase.current >= 3 && (
          <p className="mt-4 text-sm text-ink-soft">Tipp: In der Ikigai-Werkstatt („Mein Weg“) entwirfst du eigene Gewohnheiten.</p>
        )}
      </Sheet>
    </div>
  );
}
