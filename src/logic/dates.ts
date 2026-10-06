const DAY = 24 * 60 * 60 * 1000;

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parse(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export function addDays(iso: string, n: number): string {
  return toISO(new Date(parse(iso).getTime() + n * DAY));
}

/** Ganze Tage von a bis b (b später → positiv). */
export function daysBetween(a: string, b: string): number {
  return Math.round((parse(b).getTime() - parse(a).getTime()) / DAY);
}

/** „Heute“ inkl. Zeitreise aus dem Dev-Panel. */
export function todayISO(dayOffset = 0): string {
  return addDays(toISO(new Date()), dayOffset);
}

export function formatDate(iso: string): string {
  return parse(iso).toLocaleDateString('de-AT', { day: 'numeric', month: 'long' });
}
