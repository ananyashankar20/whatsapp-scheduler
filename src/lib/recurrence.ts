export type Repeat = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export const REPEAT_LABELS: Record<Repeat, string> = {
  none: 'Once',
  daily: 'Every day',
  weekly: 'Every week',
  monthly: 'Every month',
  yearly: 'Every year',
};

/**
 * The k-th occurrence of a repeating schedule that starts at `anchor`
 * (k = 0 is the anchor itself), in local time. Returns null when that
 * occurrence doesn't exist: a monthly message on the 31st skips 30-day
 * months, and a yearly one on 29 Feb skips non-leap years.
 */
export function occurrenceAt(anchor: Date, repeat: Repeat, k: number): Date | null {
  if (repeat === 'none') return k === 0 ? new Date(anchor) : null;
  const y = anchor.getFullYear();
  const m = anchor.getMonth();
  const d = anchor.getDate();
  const h = anchor.getHours();
  const min = anchor.getMinutes();

  switch (repeat) {
    case 'daily':
      return new Date(y, m, d + k, h, min);
    case 'weekly':
      return new Date(y, m, d + 7 * k, h, min);
    case 'monthly': {
      const date = new Date(y, m + k, d, h, min);
      return date.getDate() === d ? date : null;
    }
    case 'yearly': {
      const date = new Date(y + k, m, d, h, min);
      return date.getMonth() === m ? date : null;
    }
  }
}

/** A cheap lower bound for how many steps fit between anchor and `t`. */
function stepsBefore(anchor: Date, repeat: Repeat, t: Date): number {
  const days = (t.getTime() - anchor.getTime()) / 86_400_000;
  if (days <= 0) return 0;
  switch (repeat) {
    case 'daily':
      return Math.max(0, Math.floor(days) - 1);
    case 'weekly':
      return Math.max(0, Math.floor(days / 7) - 1);
    case 'monthly':
      return Math.max(0, (t.getFullYear() - anchor.getFullYear()) * 12 + t.getMonth() - anchor.getMonth() - 1);
    case 'yearly':
      return Math.max(0, t.getFullYear() - anchor.getFullYear() - 1);
    default:
      return 0;
  }
}

/** Up to `count` occurrences strictly after `after`, soonest first. */
export function occurrencesAfter(anchor: Date, repeat: Repeat, after: Date, count: number): Date[] {
  if (repeat === 'none') return anchor > after ? [new Date(anchor)] : [];
  const out: Date[] = [];
  const start = stepsBefore(anchor, repeat, after);
  // Skipped months/years leave gaps of at most a few steps (29 Feb: 3 years),
  // so 4 tries per wanted occurrence plus slack is always enough.
  for (let k = start; out.length < count && k <= start + count * 4 + 8; k++) {
    const occ = occurrenceAt(anchor, repeat, k);
    if (occ && occ > after) out.push(occ);
  }
  return out;
}

export function nextOccurrence(anchor: Date, repeat: Repeat, after: Date): Date | null {
  return occurrencesAfter(anchor, repeat, after, 1)[0] ?? null;
}

/** The most recent occurrence at or before `t`, or null if none yet. */
export function latestOccurrence(anchor: Date, repeat: Repeat, t: Date): Date | null {
  if (anchor > t) return null;
  if (repeat === 'none') return new Date(anchor);
  let latest: Date | null = null;
  for (let k = stepsBefore(anchor, repeat, t); k < 10_000; k++) {
    const occ = occurrenceAt(anchor, repeat, k);
    if (!occ) continue;
    if (occ > t) break;
    latest = occ;
  }
  return latest;
}
