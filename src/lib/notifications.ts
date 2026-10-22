import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { plannedReminders } from '@/lib/reminders';
import { useAppStore } from '@/store/app-store';

export const CHANNEL_ID = 'reminders';
export const CATEGORY_ID = 'due-message';
export const ACTION_SEND = 'send';
export const ACTION_SNOOZE = 'snooze';
export const SNOOZE_MINUTES = 15;

const supported = Platform.OS !== 'web';

export type ReminderData = { messageId: string; occurrence: string; kind: string };

/** Show reminders even when the app is open. */
export function configureNotificationHandler() {
  if (!supported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function setUpChannelsAndActions() {
  if (!supported) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Message reminders',
      description: 'Tells you when a scheduled message is ready to send',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 150, 250],
      lightColor: '#0E9F6E',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
    });
  }
  await Notifications.setNotificationCategoryAsync(CATEGORY_ID, [
    { identifier: ACTION_SEND, buttonTitle: 'Send now', options: { opensAppToForeground: true } },
    { identifier: ACTION_SNOOZE, buttonTitle: `Snooze ${SNOOZE_MINUTES} min`, options: { opensAppToForeground: true } },
  ]);
}

export async function getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  if (!supported) return 'granted';
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export async function requestPermission(): Promise<boolean> {
  if (!supported) return true;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

let syncing: Promise<void> | null = null;
let again = false;

/**
 * Makes the reminders queued on the phone match the saved messages: cancels
 * ones that are no longer needed and schedules missing ones. Safe to call as
 * often as you like; overlapping calls are merged.
 */
export function syncReminders(): Promise<void> {
  if (!supported) return Promise.resolve();
  if (syncing) {
    again = true;
    return syncing;
  }
  syncing = (async () => {
    try {
      do {
        again = false;
        await syncOnce();
      } while (again);
    } catch (e) {
      console.warn('Could not update reminders', e);
    } finally {
      syncing = null;
    }
  })();
  return syncing;
}

async function syncOnce() {
  const { messages, settings } = useAppStore.getState();
  const wanted = plannedReminders(messages, settings, new Date());
  const wantedIds = new Set(wanted.map((r) => r.identifier));

  const existing = await Notifications.getAllScheduledNotificationsAsync();
  const existingIds = new Set(existing.map((r) => r.identifier));

  for (const request of existing) {
    if (!wantedIds.has(request.identifier) && !request.identifier.startsWith(TEST_PREFIX)) {
      await Notifications.cancelScheduledNotificationAsync(request.identifier);
    }
  }
  for (const r of wanted) {
    if (existingIds.has(r.identifier)) continue;
    const data: ReminderData = { messageId: r.messageId, occurrence: r.occurrence.toISOString(), kind: r.kind };
    await Notifications.scheduleNotificationAsync({
      identifier: r.identifier,
      content: {
        title: r.title,
        body: r.body,
        data,
        categoryIdentifier: CATEGORY_ID,
        sound: 'default',
        color: '#0E9F6E',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.date, channelId: CHANNEL_ID },
    });
  }
}

/** Removes reminders for this message that are already showing in the tray. */
export async function dismissShownReminders(messageId: string) {
  if (!supported) return;
  try {
    const shown = await Notifications.getPresentedNotificationsAsync();
    for (const n of shown) {
      const data = n.request.content.data as Partial<ReminderData> | undefined;
      if (data?.messageId === messageId) await Notifications.dismissNotificationAsync(n.request.identifier);
    }
  } catch {
    // Not critical.
  }
}

const TEST_PREFIX = 'test.';

export async function sendTestReminder(seconds = 5) {
  if (!supported) return;
  await Notifications.scheduleNotificationAsync({
    identifier: `${TEST_PREFIX}${Date.now()}`,
    content: {
      title: 'Test reminder',
      body: 'Reminders are working. Your scheduled messages will look like this.',
      sound: 'default',
      color: '#0E9F6E',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, channelId: CHANNEL_ID },
  });
}
