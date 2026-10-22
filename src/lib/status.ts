import { latestOccurrence, nextOccurrence } from '@/lib/recurrence';
import type { Recipient, ScheduledMessage } from '@/store/types';

/**
 * The occurrence that's waiting to be sent right now, if any: its time has
 * passed and the user hasn't sent or skipped it yet.
 */
export function pendingOccurrence(message: ScheduledMessage, now: Date): Date | null {
  if (!message.active) return null;
  const latest = latestOccurrence(new Date(message.anchor), message.repeat, now);
  if (!latest) return null;
  if (message.lastHandled && latest <= new Date(message.lastHandled)) return null;
  return latest;
}

/** The next time this message is due, after now. */
export function upcomingOccurrence(message: ScheduledMessage, now: Date): Date | null {
  if (!message.active) return null;
  // Skip past occurrences already handled early with "Send now instead".
  const after = message.lastHandled && new Date(message.lastHandled) > now ? new Date(message.lastHandled) : now;
  return nextOccurrence(new Date(message.anchor), message.repeat, after);
}

/** The time to show for a message in lists: the pending one, else the next one. */
export function displayTime(message: ScheduledMessage, now: Date): Date | null {
  return pendingOccurrence(message, now) ?? upcomingOccurrence(message, now);
}

export function recipientName(recipient: Recipient): string {
  if (recipient.kind === 'picker') return recipient.label?.trim() || 'Choose chat in WhatsApp';
  return recipient.name?.trim() || `+${recipient.phone}`;
}

export function firstName(recipient: Recipient): string {
  if (recipient.kind !== 'phone' || !recipient.name) return '';
  return recipient.name.trim().split(/\s+/)[0] ?? '';
}

/**
 * Fills in {name} with the recipient's first name. If there's no name,
 * the placeholder is dropped and spacing tidied ("Hi {name}!" -> "Hi!").
 */
export function personalize(text: string, recipient: Recipient): string {
  const name = firstName(recipient);
  if (!/\{name\}/i.test(text)) return text;
  if (name) return text.replace(/\{name\}/gi, name);
  return text
    .replace(/\s*\{name\}/gi, '')
    .replace(/^\s+/, '')
    .replace(/ {2,}/g, ' ');
}
