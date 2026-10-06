import { useState } from 'react';
import { getExercise, getRecommendation, milestones as allMilestones } from '../content';
import { formatDate } from '../logic/dates';
import { useStore } from '../store/userStore';
import { Card, Chip, ScreenTitle } from '../components/ui';

type Tab = 'lists' | 'journal' | 'letters' | 'rewards';
const TABS: { id: Tab; label: string }[] = [
  { id: 'lists', label: '💿 Listen' },
  { id: 'journal', label: '📓 Journal' },
  { id: 'letters', label: '✉️ Briefe' },
  { id: 'rewards', label: '🎁 Belohnungen' },
];

/** Alles, was die Person geschrieben und gesammelt hat. */
export default function Collection() {
  const s = useStore();
  const [tab, setTab] = useState<Tab>('lists');
  const entries = [...s.exerciseLog]
    .reverse()
    .map((e) => ({ ...e, ex: getExercise(e.exerciseId) }))
    .filter((e) => e.ex?.savesTo === tab);

  return (
    <div className="pt-4">
      <ScreenTitle kicker="Sammlung" title="Dein Archiv" sub="Alles, was du auf deinem Weg geschrieben und bekommen hast." />
      <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
        {TABS.map((t) => (
          <Chip key={t.id} selected={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </Chip>
        ))}
      </div>

      {tab !== 'rewards' && (
        <div className="space-y-3">
          {entries.length === 0 && <Empty tab={tab} />}
          {entries.map((e, i) => (
            <Card key={i} className={tab === 'lists' ? '!bg-ink text-white' : tab === 'letters' ? '!bg-[#fffaf0]' : ''}>
              <p className={`text-xs font-bold uppercase tracking-wider ${tab === 'lists' ? 'text-sun' : 'text-ink-soft'}`}>
                {formatDate(e.date)}
              </p>
              <p className="font-display mt-1 text-lg font-semibold">{e.ex?.title}</p>
              {e.output.kind === 'list' && (
                <ol className="mt-2 space-y-1">
                  {e.output.items.map((it, n) =>
                    it ? (
                      <li key={n} className="flex gap-2">
                        <span className="font-display w-5 text-sun">{5 - n}</span>
                        {it}
                      </li>
                    ) : null,
                  )}
                </ol>
              )}
              {e.output.kind === 'text' && (
                <p className={`mt-2 whitespace-pre-wrap ${tab === 'letters' ? 'font-display text-[17px] leading-relaxed' : ''}`}>
                  {e.ex?.type === 'letter' && 'salutation' in e.ex ? `${e.ex.salutation}\n` : ''}
                  {e.output.text}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === 'rewards' && (
        <div className="space-y-3">
          {s.milestones.length === 0 && <Empty tab={tab} />}
          {[...s.milestones].reverse().map((m) => {
            const ms = allMilestones.find((x) => x.id === m.id);
            const rec = m.rewardId ? getRecommendation(m.rewardId) : undefined;
            const didDate = rec?.kind === 'self_date' && s.selfDatesDone.some((d) => d.recId === rec.id);
            return (
              <Card key={m.id}>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                  {formatDate(m.date)} · {ms?.title}
                </p>
                {rec && (
                  <div className="mt-2 flex gap-3">
                    <span className="text-4xl">{rec.emoji}</span>
                    <div className="flex-1">
                      <p className="font-display font-semibold leading-tight">{rec.title}</p>
                      {rec.author && <p className="text-sm text-ink-soft">{rec.author}</p>}
                      <p className="mt-1 text-sm">{rec.text}</p>
                      {rec.kind === 'self_date' && (
                        <button
                          disabled={didDate}
                          onClick={() => s.markSelfDate(rec.id)}
                          className="mt-2 text-sm font-bold text-[var(--phase-accent)] disabled:text-ink-soft"
                        >
                          {didDate ? 'Date erledigt ✓' : 'Hab ich gemacht ✓'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Empty({ tab }: { tab: Tab }) {
  const text = {
    lists: 'Noch keine Top-5-Listen. Die kommen in der Gefühls-Phase – mit Ansage.',
    journal: 'Noch leer. Jeder Satz, den du in einer Übung schreibst, landet hier.',
    letters: 'Noch keine Briefe. Der wichtigste kommt am Ende des Weges.',
    rewards: 'Belohnungen gibt es für dranbleiben – nicht für gute Laune. Die erste kommt bald.',
  }[tab];
  return <p className="rounded-3xl bg-white/60 p-6 text-center text-ink-soft">{text}</p>;
}
