import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { help } from '../content';
import { useStore } from '../store/userStore';
import { Button, Sheet } from './ui';

/** Immer sichtbar: kleiner Herz-Button mit Notfallnummern (Österreich). */
export default function HelpButton({ raised }: { raised: boolean }) {
  const [open, setOpen] = useState(false);
  const highlight = useStore((s) => s.helpHighlight);
  const dismiss = useStore((s) => s.dismissHelpHighlight);
  const ageGroup = useStore((s) => s.profile.ageGroup);
  const navigate = useNavigate();

  const contacts = help.contacts.filter((c) => !c.ageGroups || !ageGroup || c.ageGroups.includes(ageGroup));

  return (
    <>
      <button
        aria-label="Hilfe – mit jemandem reden"
        onClick={() => {
          setOpen(true);
          dismiss();
        }}
        className={`fixed right-4 z-40 flex h-12 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-bold text-coral-dark shadow-lg ring-2 ring-coral/30 transition active:scale-95 ${
          raised ? 'bottom-24' : 'bottom-5'
        } ${highlight ? 'pulse-ring' : ''}`}
        style={{ right: 'max(1rem, calc(50vw - 14rem + 1rem))' }}
      >
        <span className="text-lg">♡</span> Hilfe
      </button>

      <Sheet open={open} onClose={() => setOpen(false)}>
        <h2 className="text-2xl font-semibold">{help.title}</h2>
        <p className="mt-2 text-ink-soft">{help.text}</p>
        <div className="mt-5 space-y-3">
          {contacts.map((c) => (
            <a
              key={c.id}
              href={`tel:${c.tel}`}
              className={`flex items-center justify-between rounded-2xl p-4 ${c.primary ? 'bg-coral text-white' : 'bg-white'}`}
            >
              <div>
                <p className="font-display text-lg font-semibold">{c.name}</p>
                <p className={`text-sm ${c.primary ? 'text-white/85' : 'text-ink-soft'}`}>{c.info}</p>
              </div>
              <span className="font-display text-3xl font-semibold">{c.number}</span>
            </a>
          ))}
        </div>
        <p className="mt-6 text-sm font-bold text-ink-soft">{help.calmTitle}</p>
        <Button
          variant="soft"
          className="mt-2 w-full"
          onClick={() => {
            setOpen(false);
            navigate(`/uebung/${help.calmExercise}`);
          }}
        >
          🫧 60 Sekunden atmen
        </Button>
      </Sheet>
    </>
  );
}
