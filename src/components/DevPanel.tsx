import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { phaseRules } from '../content';
import type { PhaseId } from '../content/types';
import { addDays } from '../logic/dates';
import { evaluatePhase } from '../logic/phase';
import { useStore } from '../store/userStore';
import { Button, Sheet } from './ui';

/** Nur für den Draft: Zeit vorspulen und Zustände simulieren, um alle Phasen vorzuführen. */
export default function DevPanel() {
  const [open, setOpen] = useState(false);
  const s = useStore();
  const navigate = useNavigate();
  const today = s.today();

  const waterAll = (n: number) =>
    useStore.setState((st) => ({
      habits: st.habits.map((h) => ({
        ...h,
        completions: Array.from(new Set([...h.completions, ...Array.from({ length: n }, (_, i) => addDays(today, -i - 1))])).sort(),
      })),
    }));

  return (
    <>
      <button
        aria-label="Dev-Panel"
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-40 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-bold text-white opacity-60 hover:opacity-100"
      >
        ⚙ Demo
      </button>
      <Sheet open={open} onClose={() => setOpen(false)}>
        <h2 className="text-xl font-semibold">Demo-Steuerung</h2>
        <p className="text-sm text-ink-soft">
          Simulierter Tag: <b>{today}</b> ({s.dev.dayOffset >= 0 ? '+' : ''}
          {s.dev.dayOffset} Tage) · Phase {s.phase.current} seit {s.phase.enteredAt}
        </p>

        <Section title="Zeit">
          <Button variant="soft" onClick={() => s.devShiftDays(1)}>+1 Tag</Button>
          <Button variant="soft" onClick={() => s.devShiftDays(7)}>+7 Tage</Button>
          <Button variant="soft" onClick={() => s.devShiftDays(-s.dev.dayOffset)}>Heute</Button>
        </Section>

        {s.onboarded && (
          <>
            <Section title="Phase direkt setzen">
              {([1, 2, 3, 4] as PhaseId[]).map((p) => (
                <Button key={p} variant={p === s.phase.current ? 'primary' : 'soft'} onClick={() => { s.setPhase(p, 'manual'); setOpen(false); }}>
                  {p}
                </Button>
              ))}
            </Section>

            <Section title="14 Check-ins simulieren (Stimmung)">
              {[2, 4, 6, 8].map((m) => (
                <Button key={m} variant="soft" onClick={() => { s.devSimulateCheckins(14, m); setOpen(false); }}>
                  {m}
                </Button>
              ))}
            </Section>

            <Section title="Sonstiges">
              <Button variant="soft" onClick={() => { waterAll(5); setOpen(false); }}>Alle Pflanzen +5× 💧</Button>
              <Button
                variant="soft"
                onClick={() => {
                  useStore.setState({ suggestion: evaluatePhase(useStore.getState(), today, phaseRules), phase: { ...s.phase, snoozedUntil: undefined } });
                  setOpen(false);
                }}
              >
                Phase jetzt prüfen
              </Button>
            </Section>
          </>
        )}

        <Button
          variant="ghost"
          className="mt-6 w-full !text-coral-dark"
          onClick={() => {
            s.devReset();
            setOpen(false);
            navigate('/');
          }}
        >
          Alles zurücksetzen
        </Button>
      </Sheet>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-sm font-bold text-ink-soft">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
