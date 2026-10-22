const DAY = 86_400_000;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Whole calendar days from `now` to `d` (0 = today, 1 = tomorrow, -1 = yesterday). */
export function dayDiff(d: Date, now: Date): number {
  return Math.round((startOfDay(d).getTime() - startOfDay(now).getTime()) / DAY);
}

export function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatDay(d: Date, now: Date): string {
  const diff = dayDiff(d, now);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString([], {
    weekday: Math.abs(diff) < 7 ? 'long' : 'short',
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

export function formatWhen(d: Date, now: Date): string {
  return `${formatDay(d, now)}, ${formatTime(d)}`;
}

/** "in 5 min", "in 3 h", "2 days ago"… */
export function relative(d: Date, now: Date): string {
  const ms = d.getTime() - now.getTime();
  const future = ms >= 0;
  const mins = Math.round(Math.abs(ms) / 60_000);
  let text: string;
  if (mins < 1) return future ? 'now' : 'just now';
  if (mins < 60) text = `${mins} min`;
  else if (mins < 60 * 24) text = `${Math.round(mins / 60)} h`;
  else {
    const days = Math.round(mins / (60 * 24));
    text = `${days} day${days === 1 ? '' : 's'}`;
  }
  return future ? `in ${text}` : `${text} ago`;
}

export type Bucket = 'Today' | 'Tomorrow' | 'This week' | 'Later';

export function bucketOf(d: Date, now: Date): Bucket {
  const diff = dayDiff(d, now);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff < 7) return 'This week';
  return 'Later';
}
