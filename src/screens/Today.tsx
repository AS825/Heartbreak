import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { copy, fill, getExercise, getPhase, habits as habitsContent, phaseRules, pick } from '../content';
import { isProtectMode } from '../logic/phase';
import { plantEmoji } from '../logic/garden';
import { useStore } from '../store/userStore';
import { Card } from '../components/ui';
import HabitRow from '../components/HabitRow';
import { checkinResponse, moodBand } from './Checkin';

export const TYPE_ICON: Record<string, string> = {
  breath: '🫧', grounding: '🌿', micro_action: '⚡', list_top5: '💿', vent: '🔥', inner_child: '🧸',
  journal: '📓', reflection: '🔭', letter: '✉️', ikigai_step: '🧭', habit_design: '🌱',
};

export default function Today() {
  const s = useStore();
  const navigate = useNavigate();
  const today = s.today();
  const [wasAway, setWasAway] = useState(false);

  useEffect(() => {
    setWasAway(useStore.getState().registerVisit());
  }, [today]);
  useEffect(() => {
    useStore.getState().ensureDaily();
  }, [today, s.daily, s.phase.current]);

  const phase = getPhase(s.phase.current);
  const checkin = s.checkins.find((c) => c.date === today);
  const protect = isProtectMode(s, today, phaseRules);
  const plan = s.daily[today];
  const exercise = plan ? getExercise(plan.exerciseId) : undefined;
  const exerciseDone = !!exercise && s.exerciseLog.some((e) => e.date === today && e.exerciseId === exercise.id);
  const activeHabits = s.habits.filter((h) => h.active);
  const allHabitsDone = activeHabits.length > 0 && activeHabits.every((h) => h.completions.includes(today));
  const greeting = fill(pick(copy.greetings[String(phase.id) as '1'], today), { nickname: s.profile.nickname });

  return (
    <div className="space-y-4 pt-4">
      <header className="animate-fade-up">
        <Link to="/weg" className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-sm font-bold text-[var(--phase-accent)]">
          {phase.emoji} {phase.subtitle}
        </Link>
        <h1 className="mt-3 text-[28px] font-semibold leading-tight">{greeting}</h1>
        {wasAway && <p className="mt-2 animate-pop font-semibold text-ink-soft">{pick(copy.restDayWelcome, today)}</p>}
      </header>

      {s.phase.completedAt && (
        <Card className="bg-sun/30" onClick={() => navigate('/abschluss')}>
          <p className="font-display text-lg font-semibold">🎓 Weg abgeschlossen</p>
          <p className="text-sm text-ink-soft">Dein Garten bleibt – schau gern weiter vorbei.</p>
        </Card>
      )}

      {protect && (
        <Card className="border-2 border-lilac/60 !bg-[#f4effb]">
          <p className="font-display text-lg font-semibold">🫂 {copy.protectMode.title}</p>
          <p className="mt-1 text-[15px] text-ink-soft">{copy.protectMode.text}</p>
        </Card>
      )}

      {/* 1 · Check-in */}
      {!checkin ? (
        <Card onClick={() => navigate('/checkin')} className="animate-fade-up !bg-[var(--phase-accent)] text-white">
          <p className="text-sm font-bold uppercase tracking-wider opacity-80">Schritt 1</p>
          <p className="font-display mt-1 text-2xl font-semibold">{copy.today.checkinCard}</p>
          <p className="mt-3 text-4xl tracking-widest">😢 😐 🙂 😄</p>
        </Card>
      ) : (
        <Card onClick={() => navigate('/checkin')}>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{copy.checkin.moodEmojis[String(checkin.mood) as '1']}</span>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">{copy.today.checkinDone} ✓</p>
              <p className="text-[15px]">{checkinResponse(phase.id, moodBand(checkin.mood), today)}</p>
            </div>
          </div>
        </Card>
      )}

      {/* 2 · Übung */}
      {exercise && (
        <Card className="animate-fade-up [animation-delay:100ms]">
          <p className="text-sm font-bold uppercase tracking-wider text-ink-soft">Schritt 2 · {copy.today.exerciseTitle}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="blob flex h-14 w-14 shrink-0 items-center justify-center bg-[var(--phase-soft)] text-3xl">{TYPE_ICON[exercise.type]}</span>
            <div className="flex-1">
              <p className="font-display text-xl font-semibold leading-tight">{exercise.title}</p>
              <p className="text-sm text-ink-soft">ca. {Math.max(1, Math.round(exercise.durationSec / 60))} Min.</p>
            </div>
          </div>
          {exerciseDone ? (
            <p className="mt-3 font-bold text-[var(--phase-accent)]">{copy.today.exerciseDone}</p>
          ) : (
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => navigate(`/uebung/${exercise.id}`)}
                className="font-display flex-1 rounded-2xl bg-[var(--phase-accent)] py-3 text-lg font-medium text-white"
              >
                Starten
              </button>
              <button onClick={s.skipDaily} className="px-2 text-sm font-semibold text-ink-soft">
                {copy.today.otherExercise} ↻
              </button>
            </div>
          )}
        </Card>
      )}

      {/* 3 · Habits */}
      <section className="animate-fade-up [animation-delay:200ms]">
        <h2 className="mb-2 px-1 text-sm font-bold uppercase tracking-wider text-ink-soft">Schritt 3 · {copy.today.habitsTitle}</h2>
        <div className="space-y-2">
          {activeHabits.length === 0 && <Card onClick={() => navigate('/garten')}>{copy.today.noHabits}</Card>}
          {activeHabits.map((h) => (
            <HabitRow key={h.id} habit={h} today={today} onToggle={() => s.toggleHabit(h.id)} />
          ))}
        </div>
      </section>

      {/* 4 · Garten-Vorschau */}
      <Card onClick={() => navigate('/garten')} className="!bg-gradient-to-b !from-[#e9f7ee] !to-[#d5ecd9]">
        <p className="text-sm font-bold uppercase tracking-wider text-[#3e7b5a]">{copy.today.gardenTitle} →</p>
        <p className="mt-2 text-4xl tracking-[0.3em]">
          {s.habits.map((h) => plantEmoji(h, habitsContent)).join('') || '🌰'}
          {habitsContent.decorations.slice(0, s.selfDatesDone.length).join('')}
        </p>
      </Card>

      {checkin && exerciseDone && allHabitsDone && (
        <p className="animate-pop py-4 text-center font-display text-xl font-semibold">{pick(copy.today.doneForToday, today)}</p>
      )}
    </div>
  );
}
