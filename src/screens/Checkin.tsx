import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkinChips, copy, pick } from '../content';
import type { PhaseId } from '../content/types';
import { useStore } from '../store/userStore';
import { Button, Chip } from '../components/ui';

export type MoodBand = 'low' | 'mid' | 'high';
export const moodBand = (mood: number): MoodBand => (mood <= 3 ? 'low' : mood <= 6 ? 'mid' : 'high');
export const checkinResponse = (phase: PhaseId, band: MoodBand, seed: string) =>
  pick(copy.checkinResponses[String(phase) as '1'][band], seed);

export default function Checkin() {
  const navigate = useNavigate();
  const s = useStore();
  const today = s.today();
  const existing = s.checkins.find((c) => c.date === today);
  const [mood, setMood] = useState(existing?.mood ?? 5);
  const [chips, setChips] = useState<string[]>(existing?.chips ?? []);
  const [submitted, setSubmitted] = useState(false);
  const c = copy.checkin;

  if (submitted) {
    const protect = mood <= 2;
    return (
      <div className="flex min-h-[85dvh] flex-col justify-center text-center">
        <div className="animate-pop text-8xl">{c.moodEmojis[String(mood) as '1']}</div>
        <p className="font-display mt-6 animate-fade-up text-2xl font-semibold leading-snug">
          {checkinResponse(s.phase.current, moodBand(mood), today + mood)}
        </p>
        {protect && (
          <div className="mt-6 animate-fade-up rounded-3xl bg-white p-5 text-left">
            <p className="font-display text-lg font-semibold">🫂 {copy.protectMode.title}</p>
            <p className="mt-1 text-ink-soft">{copy.protectMode.text}</p>
            <a href="tel:142" className="mt-3 block rounded-2xl bg-coral py-3 text-center font-bold text-white">
              📞 {copy.protectMode.helpCta} · 142
            </a>
          </div>
        )}
        {chips.includes('contact') && (
          <p className="mt-4 rounded-2xl bg-white/70 p-3 text-ink-soft">📱 Wir haben dir eine Übung für nach dem Kontakt rausgesucht.</p>
        )}
        <Button className="mt-10 w-full" onClick={() => navigate('/')}>
          Weiter
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[85dvh] flex-col pt-6">
      <button onClick={() => navigate(-1)} className="mb-4 self-start text-2xl text-ink-soft" aria-label="Zurück">
        ←
      </button>
      <h1 className="text-3xl font-semibold">{c.title}</h1>
      {existing && <p className="mt-1 text-sm text-ink-soft">{c.alreadyDone}</p>}

      <div className="mt-6 rounded-3xl bg-white p-6 text-center">
        <div key={mood} className="animate-pop text-7xl">{c.moodEmojis[String(mood) as '1']}</div>
        <p className="font-display mt-2 text-xl font-semibold">
          {mood} · {c.moodLabels[String(mood) as '1']}
        </p>
        <div className="mt-5 grid grid-cols-10 gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setMood(n)}
              aria-label={`Stimmung ${n}`}
              className={`h-10 rounded-xl text-sm font-bold transition ${n === mood ? 'scale-110 bg-[var(--phase-accent)] text-white' : 'bg-[var(--phase-soft)] text-ink-soft'}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm font-bold text-ink-soft">{c.chipsTitle}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {checkinChips.map((chip) => {
          const sel = chips.includes(chip.id);
          return (
            <Chip key={chip.id} selected={sel} onClick={() => setChips(sel ? chips.filter((x) => x !== chip.id) : [...chips, chip.id])}>
              {chip.emoji} {chip.label}
            </Chip>
          );
        })}
      </div>

      <Button
        className="mt-auto w-full"
        onClick={() => {
          s.checkin(mood, chips);
          setSubmitted(true);
        }}
      >
        {c.cta}
      </Button>
    </div>
  );
}
