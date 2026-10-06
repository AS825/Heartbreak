import type { CSSProperties, ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { getPhase } from '../content';
import { useStore } from '../store/userStore';
import HelpButton from '../components/HelpButton';
import DevPanel from '../components/DevPanel';
import RewardModal from '../components/RewardModal';
import SuggestionModal from '../components/SuggestionModal';

const TABS = [
  { to: '/', label: 'Heute', icon: '☀️' },
  { to: '/garten', label: 'Garten', icon: '🌱' },
  { to: '/weg', label: 'Mein Weg', icon: '🗺️' },
  { to: '/sammlung', label: 'Sammlung', icon: '📚' },
];

/** Rahmen für alle Screens: Phasen-Farben, Tab-Bar, Hilfe-Button, Overlays. */
export default function Layout({ bare = false, children }: { bare?: boolean; children?: ReactNode }) {
  const onboarded = useStore((s) => s.onboarded);
  const phaseId = useStore((s) => s.phase.current);
  const theme = onboarded ? getPhase(phaseId).theme : { bg: '#FDE4DC', accent: '#F27C6A', soft: '#FFF3EE' };

  const style = {
    '--phase-accent': theme.accent,
    '--phase-soft': theme.soft,
    background: `radial-gradient(circle at 20% 0%, ${theme.soft} 0%, ${theme.bg} 55%)`,
  } as CSSProperties;

  return (
    <div style={style} className="min-h-dvh transition-[background] duration-700">
      <div className={`relative mx-auto min-h-dvh max-w-md px-5 pt-8 ${bare ? 'pb-10' : 'pb-28'}`}>
        {children ?? <Outlet />}
      </div>

      {!bare && (
        <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-4 pb-[max(env(safe-area-inset-bottom),12px)]">
          <div className="flex justify-around rounded-3xl bg-white/95 px-2 py-2 shadow-[0_-4px_24px_rgb(120_80_60/0.12)]">
            {TABS.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end
                className={({ isActive }) =>
                  `flex flex-1 flex-col items-center rounded-2xl py-1.5 text-xs font-bold transition ${
                    isActive ? 'bg-[var(--phase-soft)] text-[var(--phase-accent)]' : 'text-ink-soft'
                  }`
                }
              >
                <span className="text-xl leading-none">{t.icon}</span>
                {t.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}

      <HelpButton raised={!bare} />
      <DevPanel />
      {onboarded && <SuggestionModal />}
      {onboarded && <RewardModal />}
    </div>
  );
}
