import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fill, getHabitTemplate, getPhase, habits, onboarding, phaseRules } from '../content';
import type { OnboardingQuestion } from '../content/types';
import { computeStartPhase } from '../logic/phase';
import { useStore } from '../store/userStore';
import { Button, Chip, TextInput } from '../components/ui';
import PhaseMap from '../components/PhaseMap';

type Answers = Record<string, string | number | string[]>;

export default function Onboarding() {
  const navigate = useNavigate();
  const complete = useStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ mood: 5, joys: [] });
  const [custom, setCustom] = useState('');
  const questions = onboarding.questions;
  const isReveal = step === questions.length;

  if (isReveal) {
    return <Reveal answers={answers} onBack={() => setStep(step - 1)} onDone={(habitIds) => {
      const startPhase = computeStartPhase(
        { since: String(answers.since), who: String(answers.who), contact: String(answers.contact), mood: Number(answers.mood) },
        phaseRules.scoring,
      );
      complete({
        nickname: String(answers.nickname).trim(),
        ageGroup: String(answers.ageGroup),
        joys: answers.joys as string[],
        answers,
        startPhase,
        habitTemplateIds: habitIds,
      });
      navigate('/');
    }} />;
  }

  const q = questions[step];
  const value = answers[q.id];
  const answered = q.kind === 'multi' ? (value as string[]).length > 0 : q.kind === 'text' ? String(value ?? '').trim().length > 0 : value !== undefined;
  const reaction = answered ? reactionFor(q, value, answers) : null;
  const set = (v: string | number | string[]) => setAnswers({ ...answers, [q.id]: v });

  return (
    <div className="flex min-h-[85dvh] flex-col">
      <div className="mb-8 flex items-center gap-3 pt-6">
        <button onClick={() => (step === 0 ? navigate('/') : setStep(step - 1))} className="text-2xl text-ink-soft" aria-label="Zurück">
          ←
        </button>
        <div className="flex flex-1 gap-1.5">
          {questions.map((_, i) => (
            <span key={i} className={`h-2 flex-1 rounded-full transition ${i <= step ? 'bg-[var(--phase-accent)]' : 'bg-white'}`} />
          ))}
        </div>
      </div>

      <div key={q.id} className="animate-fade-up">
        <h1 className="text-3xl font-semibold leading-tight">{q.title}</h1>
        {q.hint && <p className="mt-2 text-ink-soft">{q.hint}</p>}

        <div className="mt-6">
          {q.kind === 'text' && (
            <TextInput
              autoFocus
              value={String(value ?? '')}
              placeholder={q.placeholder}
              maxLength={24}
              onChange={(e) => set(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && answered && setStep(step + 1)}
            />
          )}

          {q.kind === 'single' && (
            <div className="grid gap-2.5">
              {q.options!.map((o) => (
                <button
                  key={o.id}
                  onClick={() => set(o.id)}
                  className={`flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3.5 text-left text-lg font-semibold transition active:scale-[0.98] ${
                    value === o.id ? 'border-[var(--phase-accent)] bg-[var(--phase-soft)]' : 'border-transparent'
                  }`}
                >
                  <span className="text-2xl">{o.emoji}</span>
                  {o.label}
                </button>
              ))}
            </div>
          )}

          {q.kind === 'slider' && (
            <div className="rounded-3xl bg-white p-6 text-center">
              <div className="text-6xl">{['😭', '😢', '😞', '😕', '😐', '🙂', '😊', '😄', '🤩', '🥳'][Number(value) - 1]}</div>
              <div className="font-display mt-2 text-4xl font-semibold">{String(value)}</div>
              <input
                type="range"
                min={q.min}
                max={q.max}
                value={Number(value)}
                onChange={(e) => set(Number(e.target.value))}
                className="mt-4 w-full"
              />
              <div className="flex justify-between text-xs text-ink-soft">
                <span>gar nicht gut</span>
                <span>überraschend gut</span>
              </div>
            </div>
          )}

          {q.kind === 'multi' && (
            <>
              <div className="flex flex-wrap gap-2">
                {[...q.options!, ...(value as string[]).filter((v) => !q.options!.some((o) => o.id === v)).map((v) => ({ id: v, label: v, emoji: '✨' }))].map((o) => {
                  const list = value as string[];
                  const sel = list.includes(o.id);
                  return (
                    <Chip key={o.id} selected={sel} onClick={() => set(sel ? list.filter((x) => x !== o.id) : [...list, o.id])}>
                      {o.emoji} {o.label}
                    </Chip>
                  );
                })}
              </div>
              {q.allowCustom && (
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (custom.trim()) set([...(value as string[]), custom.trim()]);
                    setCustom('');
                  }}
                >
                  <TextInput value={custom} placeholder={q.customPlaceholder} onChange={(e) => setCustom(e.target.value)} />
                  <Button variant="soft" type="submit">+</Button>
                </form>
              )}
            </>
          )}
        </div>

        {reaction && (
          <div key={reaction} className="mt-6 flex animate-pop items-start gap-2">
            <span className="text-2xl">💬</span>
            <p className="rounded-2xl rounded-tl-sm bg-white/80 px-4 py-3 font-semibold">{reaction}</p>
          </div>
        )}
      </div>

      <Button className="mt-auto w-full" disabled={!answered} onClick={() => setStep(step + 1)}>
        Weiter
      </Button>
    </div>
  );
}

function reactionFor(q: OnboardingQuestion, value: unknown, answers: Answers): string | null {
  if (q.sliderReactions) return q.sliderReactions.find((r) => Number(value) <= r.max)?.text ?? null;
  const text = q.reactions?.[String(value)] ?? q.reactions?.default;
  return text ? fill(text, { nickname: String(answers.nickname ?? '') }) : null;
}

function Reveal({ answers, onBack, onDone }: { answers: Answers; onBack: () => void; onDone: (habitIds: string[]) => void }) {
  const startPhase = computeStartPhase(
    { since: String(answers.since), who: String(answers.who), contact: String(answers.contact), mood: Number(answers.mood) },
    phaseRules.scoring,
  );
  const phase = getPhase(startPhase);
  const joys = answers.joys as string[];
  const templates = phase.habitTemplates.map((id) => getHabitTemplate(id)!);
  const preselected = useMemo(() => {
    const byJoy = templates.find((t) => t.joys.some((j) => joys.includes(j)));
    return [templates[0].id, ...(byJoy && byJoy.id !== templates[0].id ? [byJoy.id] : [])];
  }, [templates, joys]);
  const [selected, setSelected] = useState<string[]>(preselected);
  const { reveal } = onboarding;

  return (
    <div className="animate-fade-up pt-6">
      <button onClick={onBack} className="mb-4 text-2xl text-ink-soft" aria-label="Zurück">←</button>
      <p className="text-sm font-bold uppercase tracking-wider text-[var(--phase-accent)]">{phase.subtitle}</p>
      <h1 className="text-3xl font-semibold">{reveal.title}: {phase.title} {phase.emoji}</h1>
      <p className="mt-2 text-ink-soft">{phase.description}</p>

      <div className="mt-5">
        <PhaseMap current={startPhase} />
      </div>
      <p className="mt-3 rounded-2xl bg-white/70 p-3 text-sm text-ink-soft">{reveal.disclaimer}</p>

      <h2 className="mt-8 text-xl font-semibold">{reveal.habitsTitle}</h2>
      <p className="text-sm text-ink-soft">{reveal.habitsHint}</p>
      <div className="mt-3 grid gap-2">
        {templates.map((t) => {
          const sel = selected.includes(t.id);
          return (
            <button
              key={t.id}
              onClick={() => setSelected(sel ? selected.filter((x) => x !== t.id) : selected.length < 2 ? [...selected, t.id] : [selected[1], t.id])}
              className={`flex items-center gap-3 rounded-2xl border-2 bg-white p-3 text-left transition ${sel ? 'border-[var(--phase-accent)]' : 'border-transparent'}`}
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="flex-1">
                <span className="block font-bold">{t.title}</span>
                <span className="text-sm text-ink-soft">{t.cue}</span>
              </span>
              <span className="text-2xl">{sel ? habits.plants[t.plant].bloom : '○'}</span>
            </button>
          );
        })}
      </div>

      <Button className="mt-8 w-full" disabled={selected.length === 0} onClick={() => onDone(selected)}>
        {reveal.cta} 🌱
      </Button>
    </div>
  );
}
