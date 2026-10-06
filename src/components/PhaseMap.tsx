import { phaseRules } from '../content';
import type { PhaseId } from '../content/types';

const POS = [
  { x: 22, y: 84 },
  { x: 72, y: 62 },
  { x: 28, y: 38 },
  { x: 74, y: 14 },
];

/**
 * Die vier Etappen als verspielte Landkarte.
 * `loops` zeigt, wie oft jemand eine Etappe zurückgegangen ist – als Schleife, nicht als Absturz.
 */
export default function PhaseMap({
  current,
  onSelect,
  loops = 0,
}: {
  current: PhaseId;
  onSelect?: (p: PhaseId) => void;
  loops?: number;
}) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[32px] bg-gradient-to-b from-[#fff7da] via-[#e3f4e6] to-[#ece4f6]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path
          d="M22 88 C 40 90, 80 78, 72 64 S 18 52, 28 40 S 90 26, 74 14"
          fill="none"
          stroke="#fff"
          strokeWidth="5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ strokeWidth: 14 }}
        />
        <path
          d="M22 88 C 40 90, 80 78, 72 64 S 18 52, 28 40 S 90 26, 74 14"
          fill="none"
          stroke="#e8cdb8"
          strokeDasharray="2 6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ strokeWidth: 3 }}
        />
      </svg>

      {/* Deko */}
      <span className="absolute left-[6%] top-[8%] text-2xl opacity-80">☁️</span>
      <span className="absolute right-[8%] top-[34%] text-xl">🌳</span>
      <span className="absolute left-[50%] top-[46%] text-lg">🌼</span>
      <span className="absolute left-[8%] top-[58%] text-xl">🌲</span>
      <span className="absolute right-[12%] bottom-[8%] text-xl">🍄</span>

      {phaseRules.phases.map((p, i) => {
        const pos = POS[i];
        const isCurrent = p.id === current;
        const passed = p.id < current;
        return (
          <button
            key={p.id}
            type="button"
            disabled={!onSelect}
            onClick={() => onSelect?.(p.id)}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <span
              className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl shadow-md transition ${
                isCurrent ? 'scale-110 bg-white ring-4 ring-[var(--phase-accent)]' : passed ? 'bg-white/90' : 'bg-white/60 grayscale-[40%]'
              }`}
            >
              {p.emoji}
            </span>
            <span className="mt-1 rounded-full bg-white/85 px-2 py-0.5 text-xs font-bold">{p.landscape}</span>
            {isCurrent && <span className="absolute -top-7 animate-float text-2xl">📍</span>}
          </button>
        );
      })}

      {loops > 0 && (
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-ink-soft">
          ➰ {loops} {loops === 1 ? 'Schleife' : 'Schleifen'} – Wege sind selten gerade
        </p>
      )}
    </div>
  );
}
