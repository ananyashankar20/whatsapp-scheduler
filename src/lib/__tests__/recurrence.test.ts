import { describe, expect, it } from '@jest/globals';

import { latestOccurrence, nextOccurrence, occurrencesAfter } from '@/lib/recurrence';

const d = (y: number, m: number, day: number, h = 9, min = 0) => new Date(y, m - 1, day, h, min);

describe('occurrencesAfter', () => {
  it('returns a one-time message only while it is in the future', () => {
    expect(occurrencesAfter(d(2026, 5, 1), 'none', d(2026, 4, 1), 5)).toEqual([d(2026, 5, 1)]);
    expect(occurrencesAfter(d(2026, 5, 1), 'none', d(2026, 6, 1), 5)).toEqual([]);
  });

  it('counts daily repeats from the anchor, not from today', () => {
    const anchor = d(2026, 1, 10, 8, 30);
    expect(occurrencesAfter(anchor, 'daily', d(2026, 1, 1), 2)).toEqual([d(2026, 1, 10, 8, 30), d(2026, 1, 11, 8, 30)]);
    expect(occurrencesAfter(anchor, 'daily', d(2026, 3, 5, 12), 2)).toEqual([d(2026, 3, 6, 8, 30), d(2026, 3, 7, 8, 30)]);
  });

  it('keeps the same weekday for weekly repeats', () => {
    const anchor = d(2026, 1, 5); // a Monday
    const next = occurrencesAfter(anchor, 'weekly', d(2026, 2, 1), 3);
    expect(next.map((x) => x.getDay())).toEqual([1, 1, 1]);
    expect(next[0]).toEqual(d(2026, 2, 2));
  });

  it('skips months that do not have the day', () => {
    const anchor = d(2026, 1, 31);
    expect(occurrencesAfter(anchor, 'monthly', d(2026, 1, 31, 10), 3)).toEqual([
      d(2026, 3, 31),
      d(2026, 5, 31),
      d(2026, 7, 31),
    ]);
  });

  it('handles 29 February birthdays', () => {
    expect(nextOccurrence(d(2024, 2, 29), 'yearly', d(2024, 3, 1))).toEqual(d(2028, 2, 29));
  });

  it('is fast and correct far into the future', () => {
    const anchor = d(2020, 1, 1, 7);
    expect(nextOccurrence(anchor, 'daily', d(2030, 6, 15, 12))).toEqual(d(2030, 6, 16, 7));
    expect(nextOccurrence(anchor, 'monthly', d(2030, 6, 15))).toEqual(d(2030, 7, 1, 7));
    expect(nextOccurrence(anchor, 'yearly', d(2030, 6, 15))).toEqual(d(2031, 1, 1, 7));
  });
});

describe('latestOccurrence', () => {
  it('finds the most recent time at or before now', () => {
    const anchor = d(2026, 1, 1, 9);
    expect(latestOccurrence(anchor, 'daily', d(2026, 1, 3, 10))).toEqual(d(2026, 1, 3, 9));
    expect(latestOccurrence(anchor, 'daily', d(2026, 1, 3, 8))).toEqual(d(2026, 1, 2, 9));
    expect(latestOccurrence(anchor, 'none', d(2026, 1, 3))).toEqual(anchor);
    expect(latestOccurrence(anchor, 'weekly', d(2025, 12, 31))).toBeNull();
  });
});
