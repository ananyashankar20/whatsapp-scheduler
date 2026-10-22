import { describe, expect, it } from '@jest/globals';

import { plannedReminders } from '@/lib/reminders';
import { pendingOccurrence, personalize } from '@/lib/status';
import type { ScheduledMessage, Settings } from '@/store/types';

const settings: Settings = { countryCode: 'IN', followUpMinutes: 15, theme: 'system', onboarded: true };
const now = new Date(2026, 9, 22, 12, 0);

function message(overrides: Partial<ScheduledMessage> = {}): ScheduledMessage {
  return {
    id: 'm1',
    recipient: { kind: 'phone', phone: '919876543210', name: 'Priya Sharma' },
    text: 'Happy birthday {name}!',
    anchor: new Date(2026, 9, 22, 18, 0).toISOString(),
    repeat: 'none',
    active: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    ...overrides,
  };
}

describe('personalize', () => {
  it('fills in the first name', () => {
    expect(personalize('Happy birthday {name}!', { kind: 'phone', phone: '1', name: 'Priya Sharma' })).toBe(
      'Happy birthday Priya!',
    );
  });
  it('drops the placeholder neatly when there is no name', () => {
    expect(personalize('Hi {name}, see you soon', { kind: 'phone', phone: '1' })).toBe('Hi, see you soon');
    expect(personalize('{name} good morning', { kind: 'picker' })).toBe('good morning');
  });
});

describe('plannedReminders', () => {
  it('plans the reminder and one follow-up for a one-time message', () => {
    const r = plannedReminders([message()], settings, now);
    expect(r.map((x) => x.kind)).toEqual(['main', 'followup']);
    expect(r[0].date).toEqual(new Date(2026, 9, 22, 18, 0));
    expect(r[1].date).toEqual(new Date(2026, 9, 22, 18, 15));
    expect(r[0].title).toBe('Time to message Priya Sharma');
    expect(r[0].body).toBe('Happy birthday Priya!');
  });

  it('plans nothing for sent or stopped messages', () => {
    expect(plannedReminders([message({ active: false })], settings, now)).toEqual([]);
  });

  it('queues several future repeats', () => {
    const r = plannedReminders([message({ repeat: 'daily' })], { ...settings, followUpMinutes: 0 }, now);
    expect(r).toHaveLength(14);
    expect(new Set(r.map((x) => x.identifier)).size).toBe(14);
  });

  it('changes identifiers when the text changes, so old reminders are replaced', () => {
    const a = plannedReminders([message()], settings, now)[0].identifier;
    const b = plannedReminders([message({ text: 'Different' })], settings, now)[0].identifier;
    expect(a).not.toBe(b);
  });

  it('keeps nudging about a missed message and includes snoozes', () => {
    const missed = message({
      anchor: new Date(2026, 9, 22, 11, 50).toISOString(),
      snoozedUntil: new Date(2026, 9, 22, 12, 30).toISOString(),
    });
    expect(pendingOccurrence(missed, now)).toEqual(new Date(2026, 9, 22, 11, 50));
    const r = plannedReminders([missed], settings, now);
    expect(r.map((x) => x.kind)).toEqual(['followup', 'snooze']);
  });

  it('does not remind about an occurrence that was sent early', () => {
    const m = message({ repeat: 'daily', lastHandled: new Date(2026, 9, 22, 18, 0).toISOString() });
    const r = plannedReminders([m], { ...settings, followUpMinutes: 0 }, now);
    expect(r[0].date).toEqual(new Date(2026, 9, 23, 18, 0));
  });

  it('stops treating a repeat as pending once it is handled', () => {
    const m = message({
      repeat: 'daily',
      anchor: new Date(2026, 9, 20, 9, 0).toISOString(),
      lastHandled: new Date(2026, 9, 22, 9, 0).toISOString(),
    });
    expect(pendingOccurrence(m, now)).toBeNull();
    expect(pendingOccurrence({ ...m, lastHandled: undefined }, now)).toEqual(new Date(2026, 9, 22, 9, 0));
  });
});
