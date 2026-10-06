import { useState } from 'react';
import { onboarding } from '../content';
import { useStore } from '../store/userStore';
import { Button, Chip, TextInput } from '../components/ui';
import type { RendererProps } from './ExerciseRenderer';

const IKIGAI_COLORS = { love: '#F27C6A', good: '#7CC6A0', world: '#7FA7E0', paid: '#FFC65C' };

export default function IkigaiStep({ exercise, onDone }: RendererProps<'ikigai_step'>) {
  const s = useStore();
  const joyOptions = onboarding.questions.find((q) => q.id === 'joys')?.options ?? [];
  const joyLabels = exercise.seedFromJoys
    ? s.profile.joys.map((j) => joyOptions.find((o) => o.id === j)?.label ?? j)
    : [];
  const [items, setItems] = useState<string[]>(s.ikigai[exercise.key] ?? joyLabels);
  const [custom, setCustom] = useState('');
  const options = Array.from(new Set([...joyLabels, ...exercise.suggestions, ...items]));
  const toggle = (x: string) => setItems(items.includes(x) ? items.filter((i) => i !== x) : [...items, x]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex justify-center gap-1">
        {(['love', 'good', 'world', 'paid'] as const).map((k) => (
          <span
            key={k}
            className="h-10 w-10 rounded-full opacity-70 mix-blend-multiply"
            style={{ background: IKIGAI_COLORS[k], opacity: k === exercise.key ? 1 : 0.25, transform: k === exercise.key ? 'scale(1.2)' : undefined }}
          />
        ))}
      </div>
      <p className="font-display mb-3 text-xl">{exercise.prompt}</p>
      {exercise.seedFromJoys && joyLabels.length > 0 && (
        <p className="mb-2 text-sm text-ink-soft">Aus deinem Onboarding vorausgewählt – ergänze oder streiche.</p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o} selected={items.includes(o)} onClick={() => toggle(o)}>
            {o}
          </Chip>
        ))}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (custom.trim() && !items.includes(custom.trim())) setItems([...items, custom.trim()]);
          setCustom('');
        }}
      >
        <TextInput value={custom} placeholder="Eigenes hinzufügen …" onChange={(e) => setCustom(e.target.value)} />
        <Button variant="soft" type="submit">+</Button>
      </form>
      <Button className="mt-auto w-full" disabled={items.length === 0} onClick={() => onDone({ kind: 'list', items })}>
        Speichern ({items.length})
      </Button>
    </div>
  );
}

export { IKIGAI_COLORS };
