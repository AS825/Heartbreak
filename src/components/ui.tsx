import type { ButtonHTMLAttributes, ReactNode } from 'react';

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'soft' | 'ghost' };

export function Button({ variant = 'primary', className = '', ...props }: BtnProps) {
  const styles = {
    primary: 'bg-[var(--phase-accent)] text-white shadow-[0_4px_0_rgb(0_0_0/0.15)] active:translate-y-0.5 active:shadow-none',
    soft: 'bg-white text-ink border-2 border-line active:bg-[var(--phase-soft)]',
    ghost: 'text-ink-soft underline-offset-4 hover:underline',
  }[variant];
  return (
    <button
      {...props}
      className={`font-display rounded-2xl px-5 py-3 text-lg font-medium transition disabled:opacity-40 disabled:pointer-events-none ${styles} ${className}`}
    />
  );
}

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`block w-full text-left rounded-3xl bg-white/90 p-5 shadow-[0_6px_20px_rgb(120_80_60/0.08)] ${onClick ? 'active:scale-[0.98] transition' : ''} ${className}`}
    >
      {children}
    </Tag>
  );
}

export function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border-2 px-4 py-2 text-[15px] font-semibold transition active:scale-95 ${
        selected ? 'border-[var(--phase-accent)] bg-[var(--phase-accent)] text-white' : 'border-line bg-white text-ink'
      }`}
    >
      {children}
    </button>
  );
}

export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Schließen" className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md animate-fade-up rounded-t-[32px] bg-cream px-6 pb-8 pt-3 shadow-2xl max-h-[90dvh] overflow-y-auto">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" />
        {children}
      </div>
    </div>
  );
}

export function Modal({ open, children }: { open: boolean; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6 backdrop-blur-[2px]">
      <div className="w-full max-w-sm animate-pop rounded-[32px] bg-cream p-6 shadow-2xl">{children}</div>
    </div>
  );
}

export function ScreenTitle({ kicker, title, sub }: { kicker?: string; title: string; sub?: string }) {
  return (
    <header className="mb-5 animate-fade-up">
      {kicker && <p className="text-sm font-bold uppercase tracking-wider text-[var(--phase-accent)]">{kicker}</p>}
      <h1 className="text-3xl font-semibold leading-tight">{title}</h1>
      {sub && <p className="mt-2 text-ink-soft">{sub}</p>}
    </header>
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={4}
      {...props}
      className={`w-full resize-none rounded-2xl border-2 border-line bg-white p-4 text-base outline-none focus:border-[var(--phase-accent)] ${props.className ?? ''}`}
    />
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-lg outline-none focus:border-[var(--phase-accent)] ${props.className ?? ''}`}
    />
  );
}
