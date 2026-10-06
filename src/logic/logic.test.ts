import { describe, expect, it } from 'vitest';
import { exercises, habits, milestones, phaseRules, recommendations, workshops } from '../content';
import { initialState } from '../store/userStore';
import type { UserState } from '../store/types';
import { addDays } from './dates';
import { pickDailyExercise } from './daily';
import { plantStage } from './garden';
import { newlyReached, pickReward } from './milestones';
import { computeStartPhase, evaluatePhase } from './phase';

const s = phaseRules.scoring;
const TODAY = '2026-10-06';
const ctx = { rules: phaseRules, exercises, workshops };

function state(patch: Partial<UserState> = {}): UserState {
  return { ...initialState(), onboarded: true, ...patch };
}
const checkins = (n: number, mood: number, end = TODAY) =>
  Array.from({ length: n }, (_, i) => ({ date: addDays(end, -(n - 1 - i)), mood, chips: [] as string[] }));

describe('computeStartPhase', () => {
  it('frisch verlassen, viel Kontakt, schlechte Stimmung → Phase 1', () => {
    expect(computeStartPhase({ since: '2w-2m', who: 'them', contact: 'daily', mood: 3 }, s)).toBe(1);
  });
  it('2–6 Monate, selbst getrennt, mittlere Stimmung → Phase 3', () => {
    expect(computeStartPhase({ since: '2m-6m', who: 'me', contact: 'none', mood: 5 }, s)).toBe(3);
  });
  it('Phase 4 nur bei > 6 Monaten und Stimmung ≥ 7', () => {
    expect(computeStartPhase({ since: 'gt6m', who: 'me', contact: 'none', mood: 8 }, s)).toBe(4);
    expect(computeStartPhase({ since: 'gt6m', who: 'me', contact: 'none', mood: 6 }, s)).toBe(3);
  });
  it('Stimmung ≤ 2 erzwingt Phase 1', () => {
    expect(computeStartPhase({ since: 'gt6m', who: 'me', contact: 'none', mood: 2 }, s)).toBe(1);
  });
});

describe('evaluatePhase', () => {
  const entered = addDays(TODAY, -10);
  it('schlägt Aufstieg vor, wenn alle Bedingungen erfüllt sind', () => {
    const st = state({
      phase: { current: 1, enteredAt: entered, history: [] },
      checkins: checkins(7, 5),
      exerciseLog: Array.from({ length: 3 }, () => ({ exerciseId: 'p1_micro_window', pool: 'self_care_micro', date: TODAY, output: { kind: 'done' as const } })),
    });
    expect(evaluatePhase(st, TODAY, phaseRules)).toEqual({ kind: 'advance', to: 2 });
  });
  it('kein Aufstieg ohne genug Tage', () => {
    const st = state({ phase: { current: 1, enteredAt: addDays(TODAY, -2), history: [] }, checkins: checkins(3, 8) });
    expect(evaluatePhase(st, TODAY, phaseRules)).toBeNull();
  });
  it('schlägt Rückschritt bei mehreren sehr schweren Tagen vor', () => {
    const st = state({ phase: { current: 3, enteredAt: entered, history: [] }, checkins: checkins(4, 2) });
    expect(evaluatePhase(st, TODAY, phaseRules)).toEqual({ kind: 'step_back', to: 2 });
  });
  it('Chip „wie am Anfang“ führt zum Rückschritt-Angebot', () => {
    const st = state({ phase: { current: 2, enteredAt: entered, history: [] }, checkins: [{ date: TODAY, mood: 6, chips: ['like_beginning'] }] });
    expect(evaluatePhase(st, TODAY, phaseRules)).toEqual({ kind: 'step_back', to: 1 });
  });
  it('nach „Lieber noch bleiben“ wird nicht erneut gefragt', () => {
    const st = state({ phase: { current: 3, enteredAt: entered, history: [], snoozedUntil: addDays(TODAY, 2) }, checkins: checkins(4, 2) });
    expect(evaluatePhase(st, TODAY, phaseRules)).toBeNull();
  });
});

describe('Belohnungen', () => {
  it('hängen nie an der Stimmung – nur an Aktivität', () => {
    for (const m of milestones) expect(Object.keys(m.when)).not.toContain('mood');
    const sad = newlyReached(state({ checkins: checkins(3, 1) }), milestones, habits.growth.thresholds).map((m) => m.id);
    const happy = newlyReached(state({ checkins: checkins(3, 10) }), milestones, habits.growth.thresholds).map((m) => m.id);
    expect(sad).toEqual(happy);
    expect(sad).toContain('checkins_3');
  });
  it('greift nicht in spätere Phasen vor', () => {
    const rec = pickReward('book', 1, '30-39', ['book_wolf_partner_geht'], recommendations);
    expect(rec?.id).toBe('book_wolf_partner_geht');
  });
});

describe('Garten & Tagesübung', () => {
  it('Wachstumsstufen nach Gesamtzahl', () => {
    expect([0, 2, 3, 8, 20].map((n) => plantStage(n, habits.growth.thresholds))).toEqual([0, 0, 1, 2, 3]);
  });
  it('Schutzmodus wählt sanfte Übungen', () => {
    const st = state({ phase: { current: 3, enteredAt: TODAY, history: [] }, checkins: [{ date: TODAY, mood: 1, chips: [] }] });
    expect(['breath', 'grounding']).toContain(pickDailyExercise(st, TODAY, [], ctx).pool);
  });
  it('nach Kontakt mit Ex kommt eine passende Übung', () => {
    const st = state({ phase: { current: 2, enteredAt: TODAY, history: [] }, checkins: [{ date: TODAY, mood: 5, chips: ['contact'] }] });
    expect(pickDailyExercise(st, TODAY, [], ctx).pool).toBe('after_contact');
  });
  it('Phase 3 startet mit der Ikigai-Werkstatt', () => {
    const st = state({ phase: { current: 3, enteredAt: TODAY, history: [] } });
    expect(pickDailyExercise(st, TODAY, [], ctx).id).toBe('p3_ikigai_love');
  });
});

describe('Content-Integrität', () => {
  it('alle Verweise in phases.json existieren', () => {
    const exIds = new Set(exercises.map((e) => e.id));
    for (const p of phaseRules.phases) {
      expect(p.exercisePools.every((pool) => exercises.some((e) => e.pool === pool && e.phases.includes(p.id)))).toBe(true);
      expect(p.habitTemplates.every((id) => habits.templates.some((t) => t.id === id))).toBe(true);
      expect(p.recommendations.every((id) => recommendations.some((r) => r.id === id))).toBe(true);
      expect(p.workshops.every((id) => workshops.some((w) => w.id === id))).toBe(true);
    }
    for (const w of workshops) expect([...w.steps, w.finalStep].every((id) => exIds.has(id))).toBe(true);
    for (const t of habits.templates) expect(habits.plants[t.plant]).toBeDefined();
  });
  it('Übungs-IDs sind eindeutig und dauern max. 2 Minuten', () => {
    expect(new Set(exercises.map((e) => e.id)).size).toBe(exercises.length);
    for (const e of exercises) expect(e.durationSec).toBeLessThanOrEqual(120);
  });
});
