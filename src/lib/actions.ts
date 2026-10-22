import * as Haptics from 'expo-haptics';
import { Alert, Platform } from 'react-native';

import { dismissShownReminders } from '@/lib/notifications';
import { formatTime } from '@/lib/format';
import { personalize } from '@/lib/status';
import { openWhatsApp } from '@/lib/whatsapp';
import { useAppStore } from '@/store/app-store';
import type { HistoryEntry, ScheduledMessage } from '@/store/types';
import { showToast } from '@/store/ui-store';

// The things you can do to a message from several screens, with the same
// feedback everywhere (vibration, toast, undo).

function tap() {
  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

function getMessage(id: string) {
  return useAppStore.getState().messages.find((m) => m.id === id);
}

/** Puts a message and history back to how they were before an action. */
function undoTo(previous: ScheduledMessage, addedHistoryId?: string) {
  useAppStore.setState((s) => ({
    messages: s.messages.map((m) => (m.id === previous.id ? previous : m)),
    history: addedHistoryId ? s.history.filter((h) => h.id !== addedHistoryId) : s.history,
  }));
}

function record(id: string, outcome: HistoryEntry['outcome'], occurrence?: Date) {
  const before = getMessage(id);
  if (!before) return;
  useAppStore.getState().handleMessage(id, outcome, occurrence);
  const added = useAppStore.getState().history[0];
  dismissShownReminders(id);
  return { before, addedId: added?.messageId === id ? added.id : undefined };
}

/** Opens WhatsApp with the message ready and marks it as sent. */
export async function sendMessage(id: string, occurrence?: Date): Promise<boolean> {
  const message = getMessage(id);
  if (!message) return false;
  tap();
  const ok = await openWhatsApp(message.recipient, personalize(message.text, message.recipient));
  if (!ok) {
    Alert.alert(
      'WhatsApp not found',
      'Install WhatsApp or WhatsApp Business to send messages. You can also copy the message from the message screen.',
    );
    return false;
  }
  const result = record(id, 'sent', occurrence);
  if (result) {
    showToast('Marked as sent', { label: 'Undo', onPress: () => undoTo(result.before, result.addedId) });
  }
  return true;
}

export function skipMessage(id: string, occurrence?: Date) {
  tap();
  const result = record(id, 'skipped', occurrence);
  if (result) showToast('Skipped this time', { label: 'Undo', onPress: () => undoTo(result.before, result.addedId) });
}

export function snoozeMessage(id: string, minutes: number) {
  tap();
  const until = useAppStore.getState().snoozeMessage(id, minutes);
  dismissShownReminders(id);
  if (until) showToast(`Snoozed until ${formatTime(until)}`);
}

export function deleteMessage(id: string) {
  const before = getMessage(id);
  if (!before) return;
  tap();
  useAppStore.getState().deleteMessage(id);
  dismissShownReminders(id);
  showToast('Message deleted', {
    label: 'Undo',
    onPress: () => useAppStore.setState((s) => ({ messages: [...s.messages, before] })),
  });
}

export function stopRepeating(id: string) {
  const before = getMessage(id);
  if (!before) return;
  tap();
  useAppStore.getState().stopRepeating(id);
  showToast('Repeating stopped', { label: 'Undo', onPress: () => undoTo(before) });
}
