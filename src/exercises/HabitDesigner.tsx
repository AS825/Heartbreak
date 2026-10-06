import { useState } from 'react';
import { getWorkshop, habits } from '../content';
import type { HabitDesignKey } from '../content/types';
import { useStore } from '../store/userStore';
import type { ExerciseOutput } from '../store/types';
import { Button, Chip, TextArea, TextInput } from '../components/ui';

/** Atomic-Habits-Raster: offensichtlich, attraktiv, einfach, befriedigend – als Mini-Wizard. */
export default function HabitDesigner({ onDone }: { onDone: (o: ExerciseOutput) => void }) {
  const s = useStore();
  const d = habits.designer;
  const [step, setStep] = useState(0); // 0 = Titel, 1–4 = Raster, 5 = Pflanze
  const [title, setTitle] = useState('');
  const [design, setDesign] = useState<Partial<Record<HabitDesignKey, string>>>({});
  const [plant, setPlant] = useState('sunflower');
  const ideas = [...(s.ikigai.love ?? []), ...(s.ikigai.good ?? [])].slice(0, 6);
  const customCount = s.habits.filter((h) => h.design && h.active).length;
  const max = getWorkshop('p3_ikigai')?.maxHabits ?? 3;
  const total = d.steps.length + 2;

  if (customCount >= max) {
    return (
      <div className="flex flex-1 flex-col">
        <p className="rounded-2xl bg-white p-5">
          Du pflegst schon {customCount} eigene Gewohnheiten – mehr wären zu viel auf einmal. Lass die erst mal wachsen. 🌱
        </p>
        <Button className="mt-auto w-full" onClick={() => onDone({ kind: 'done' })}>Okay</Button>
      </div>
    );
  }

  const designStep = step >= 1 && step <= d.steps.length ? d.steps[step - 1] : null;
  const canNext = step === 0 ? !!title.trim() : designStep ? !!design[designStep.key]?.trim() : true;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex gap-1.5">
        {Array.from({ length: total }, (_, n) => (
          <span key={n} className={`h-2 flex-1 rounded-full ${n <= step ? 'bg-[var(--phase-accent)]' : 'bg-white'}`} />
        ))}
      </div>

      <div key={step} className="animate-fade-up">
        {step === 0 && (
          <>
            <p className="mb-3 text-[15px] text-ink-soft">{d.intro}</p>
            <p className="font-display mb-3 text-xl">{d.titleStep.prompt}</p>
            <TextInput value={title} placeholder={d.titleStep.placeholder} onChange={(e) => setTitle(e.target.value)} />
            {ideas.length > 0 && (
              <>
                <p className="mt-4 mb-2 text-sm font-bold text-ink-soft">{d.titleStep.fromIkigai}</p>
                <div className="flex flex-wrap gap-2">
                  {ideas.map((i) => (
                    <Chip key={i} selected={title === i} onClick={() => setTitle(i)}>{i}</Chip>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {designStep && (
          <>
            <p className="text-sm font-bold uppercase tracking-wider text-[var(--phase-accent)]">
              {designStep.emoji} {designStep.label}
            </p>
            <p className="font-display mt-1 mb-3 text-xl">{designStep.prompt}</p>
            <TextArea
              rows={3}
              value={design[designStep.key] ?? ''}
              placeholder={`z. B. ${designStep.example}`}
              onChange={(e) => setDesign({ ...design, [designStep.key]: e.target.value })}
            />
          </>
        )}

        {step === total - 1 && (
          <>
            <p className="font-display mb-3 text-xl">{d.plantPrompt}</p>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(habits.plants).map(([id, p]) => (
                <button
                  key={id}
                  onClick={() => setPlant(id)}
                  className={`rounded-2xl border-2 bg-white p-2 text-center ${plant === id ? 'border-[var(--phase-accent)]' : 'border-transparent'}`}
                >
                  <span className="block text-3xl">{p.bloom}</span>
                  <span className="text-[11px] font-bold">{p.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-white p-4 text-sm">
              <p className="font-bold">🌱 {title}</p>
              {d.steps.map((st) => (
                <p key={st.key} className="text-ink-soft">
                  {st.emoji} {design[st.key]}
                </p>
              ))}
            </div>
          </>
        )}
      </div>

      <Button
        className="mt-auto w-full"
        disabled={!canNext}
        onClick={() => {
          if (step < total - 1) return setStep(step + 1);
          s.addHabit({ title: title.trim(), emoji: '✨', plant, design });
          onDone({ kind: 'text', text: title.trim() });
        }}
      >
        {step < total - 1 ? 'Weiter' : 'Samen pflanzen 🌰'}
      </Button>
    </div>
  );
}
