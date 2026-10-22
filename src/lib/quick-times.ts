export type QuickTime = { label: string; date: Date };

function at(base: Date, dayOffset: number, hour: number, minute = 0): Date {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + dayOffset, hour, minute);
}

/** Handy one-tap times for the compose screen, all in the future. */
export function quickTimes(now: Date): QuickTime[] {
  const inOneHour = new Date(now.getTime() + 60 * 60_000);
  inOneHour.setSeconds(0, 0);

  const options: QuickTime[] = [{ label: 'In 1 hour', date: inOneHour }];

  const evening = at(now, 0, 20);
  if (evening.getTime() - now.getTime() > 60 * 60_000) options.push({ label: 'Tonight 8 PM', date: evening });

  options.push({ label: 'Tomorrow 9 AM', date: at(now, 1, 9) });

  // Midnight tonight, for birthday wishes right as the day starts.
  options.push({ label: 'Midnight', date: at(now, 1, 0) });

  const daysToMonday = ((8 - now.getDay()) % 7) || 7;
  options.push({ label: 'Monday 9 AM', date: at(now, daysToMonday, 9) });

  return options;
}
