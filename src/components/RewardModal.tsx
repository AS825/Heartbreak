import { useLocation } from 'react-router-dom';
import { getRecommendation, milestones, rewardIntro } from '../content';
import { useStore } from '../store/userStore';
import { Button, Modal } from './ui';

/** Zeigt erreichte Meilensteine. Erscheint nie mitten in einer Übung oder einem Check-in. */
export default function RewardModal() {
  const reached = useStore((s) => s.milestones.find((m) => !m.seen));
  const suggestion = useStore((s) => s.suggestion);
  const markSeen = useStore((s) => s.markMilestoneSeen);
  const { pathname } = useLocation();

  const busy = pathname.startsWith('/uebung') || pathname.startsWith('/checkin') || pathname.startsWith('/abschluss');
  if (!reached || suggestion || busy) return null;

  const milestone = milestones.find((m) => m.id === reached.id);
  const rec = reached.rewardId ? getRecommendation(reached.rewardId) : undefined;
  if (!milestone) return null;

  return (
    <Modal open>
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-wider text-[var(--phase-accent)]">Meilenstein ✨</p>
        <h2 className="mt-1 text-2xl font-semibold">{milestone.title}</h2>
        <p className="mt-2 text-ink-soft">{milestone.text}</p>

        {rec && (
          <div className="mt-5 rounded-3xl bg-white p-5 text-left shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">{rewardIntro[rec.kind]}</p>
            <div className="mt-2 flex items-start gap-3">
              <span className="animate-wiggle text-5xl">{rec.emoji}</span>
              <div>
                <p className="font-display text-lg font-semibold leading-tight">{rec.title}</p>
                {rec.author && <p className="text-sm text-ink-soft">{rec.author}</p>}
              </div>
            </div>
            <p className="mt-3 text-[15px]">{rec.text}</p>
            {rec.affiliateUrl && (
              <a href={rec.affiliateUrl} onClick={(e) => e.preventDefault()} className="mt-3 inline-block text-sm font-bold text-[var(--phase-accent)]">
                Ansehen → <span className="font-normal text-ink-soft">(Link folgt)</span>
              </a>
            )}
          </div>
        )}

        <Button className="mt-6 w-full" onClick={() => markSeen(reached.id)}>
          {rec?.kind === 'self_date' ? 'Merk ich mir 📅' : 'Danke 💛'}
        </Button>
        <p className="mt-2 text-xs text-ink-soft">Findest du später in deiner Sammlung.</p>
      </div>
    </Modal>
  );
}
