import { hash } from '@/lib/id';
import type { Repeat } from '@/lib/recurrence';
import { occurrencesAfter } from '@/lib/recurrence';
import { pendingOccurrence, personalize, recipientName } from '@/lib/status';
import type { ScheduledMessage, Settings } from '@/store/types';

// Works out which reminders should exist on the phone right now. Kept free of
// any Expo imports so it can be unit tested.

export type ReminderKind = 'main' | 'followup' | 'snooze';

export type Reminder = {
  identifier: string;
  date: Date;
  messageId: string;
  kind: ReminderKind;
  /** The scheduled send time this reminder is about. */
  occurrence: Date;
  title: string;
  body: string;
};

/** How many future reminders to keep queued per repeating message. */
const AHEAD: Record<Repeat, number> = { none: 1, daily: 14, weekly: 8, monthly: 6, yearly: 3 };

/** Android allows 500 alarms per app; stay well under it. */
export const MAX_REMINDERS = 400;

function reminder(message: ScheduledMessage, kind: ReminderKind, date: Date, occurrence: Date): Reminder {
  const name = recipientName(message.recipient);
  const text = personalize(message.text, message.recipient);
  const title =
    kind === 'main' ? `Time to message ${name}` : kind === 'followup' ? `Not sent yet: ${name}` : `Reminder: message ${name}`;
  // The hash changes when the text or recipient is edited, so stale reminders get replaced.
  const version = hash(`${title}|${text}`);
  return {
    identifier: `${message.id}.${kind}.${date.getTime()}.${version}`,
    date,
    messageId: message.id,
    kind,
    occurrence,
    title,
    body: text.length > 180 ? `${text.slice(0, 177)}…` : text,
  };
}

export function plannedReminders(messages: ScheduledMessage[], settings: Settings, now: Date): Reminder[] {
  const out: Reminder[] = [];
  for (const message of messages) {
    if (!message.active) continue;
    const anchor = new Date(message.anchor);
    // "Send now instead" can handle an occurrence early; don't remind about it again.
    const handledUntil = message.lastHandled ? new Date(message.lastHandled) : null;
    const upcoming = occurrencesAfter(anchor, message.repeat, now, AHEAD[message.repeat]).filter(
      (occ) => !handledUntil || occ > handledUntil,
    );
    for (const occ of upcoming) out.push(reminder(message, 'main', occ, occ));

    // One nudge if the user ignores the reminder for the current/next occurrence.
    const target = pendingOccurrence(message, now) ?? upcoming[0];
    if (settings.followUpMinutes > 0 && target) {
      const at = new Date(target.getTime() + settings.followUpMinutes * 60_000);
      if (at > now) out.push(reminder(message, 'followup', at, target));
    }

    if (message.snoozedUntil) {
      const at = new Date(message.snoozedUntil);
      const occ = pendingOccurrence(message, now) ?? at;
      if (at > now) out.push(reminder(message, 'snooze', at, occ));
    }
  }
  out.sort((a, b) => a.date.getTime() - b.date.getTime());
  return out.slice(0, MAX_REMINDERS);
}
