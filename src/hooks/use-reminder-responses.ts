import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { sendMessage, snoozeMessage } from '@/lib/actions';
import { ACTION_SEND, ACTION_SNOOZE, SNOOZE_MINUTES, type ReminderData } from '@/lib/notifications';
import { useAppStore, whenHydrated } from '@/store/app-store';

/** Reacts to the user tapping a reminder or one of its buttons. */
export function useReminderResponses() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web') return;
    // On a cold start the same tap can arrive twice (last response + listener).
    const handled = new Set<string>();

    const handle = async (response: Notifications.NotificationResponse) => {
      const key = `${response.notification.request.identifier}:${response.actionIdentifier}:${response.notification.date}`;
      if (handled.has(key)) return;
      handled.add(key);

      await whenHydrated();
      Notifications.clearLastNotificationResponse();
      const data = response.notification.request.content.data as Partial<ReminderData> | undefined;
      const id = data?.messageId;
      if (!id || !useAppStore.getState().messages.some((m) => m.id === id)) return;
      const occurrence = data.occurrence ? new Date(data.occurrence) : undefined;

      if (response.actionIdentifier === ACTION_SEND) {
        await sendMessage(id, occurrence);
      } else if (response.actionIdentifier === ACTION_SNOOZE) {
        snoozeMessage(id, SNOOZE_MINUTES);
      } else {
        router.push({ pathname: '/send/[id]', params: { id, occurrence: data.occurrence ?? '' } });
      }
    };

    const last = Notifications.getLastNotificationResponse();
    if (last) handle(last);
    const sub = Notifications.addNotificationResponseReceivedListener(handle);
    return () => sub.remove();
  }, [router]);
}
