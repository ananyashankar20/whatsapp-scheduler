import type { Repeat } from '@/lib/recurrence';

export type Recipient =
  // A specific person: WhatsApp opens straight into their chat.
  | { kind: 'phone'; phone: string; name?: string }
  // No number: WhatsApp opens its chat list so you can pick any chat, including groups.
  | { kind: 'picker'; label?: string };

export type ScheduledMessage = {
  id: string;
  recipient: Recipient;
  text: string;
  /** First (or only) send time, ISO string. Repeats are counted from here. */
  anchor: string;
  repeat: Repeat;
  /** False once a one-time message is sent, or a repeating one is stopped. */
  active: boolean;
  /** For repeating messages: the latest occurrence that was sent or skipped. */
  lastHandled?: string;
  snoozedUntil?: string;
  createdAt: string;
  updatedAt: string;
};

export type HistoryEntry = {
  id: string;
  messageId: string;
  recipient: Recipient;
  text: string;
  /** The scheduled time this entry was for. */
  occurrence: string;
  /** When it was actually handled. */
  handledAt: string;
  outcome: 'sent' | 'skipped';
};

export type Template = {
  id: string;
  title: string;
  text: string;
};

export type ThemePreference = 'system' | 'light' | 'dark';

export type Settings = {
  countryCode: string; // region code, e.g. "IN"
  /** Remind again this many minutes later if a message wasn't sent. 0 = off. */
  followUpMinutes: number;
  theme: ThemePreference;
  onboarded: boolean;
};

export type MessageInput = Pick<ScheduledMessage, 'recipient' | 'text' | 'anchor' | 'repeat'>;
