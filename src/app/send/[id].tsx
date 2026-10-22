import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MessageBubble } from '@/components/message-bubble';
import { AppText, Avatar, Button, Chip, EmptyState } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { sendMessage, skipMessage, snoozeMessage } from '@/lib/actions';
import { formatWhen } from '@/lib/format';
import { pendingOccurrence, personalize, recipientName } from '@/lib/status';
import { useAppStore } from '@/store/app-store';

/** Opened from a reminder: everything needed to send in one tap. */
export default function SendScreen() {
  const { id, occurrence } = useLocalSearchParams<{ id: string; occurrence?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const message = useAppStore((s) => s.messages.find((m) => m.id === id));

  if (!message) {
    return <EmptyState icon="message-off-outline" title="Message not found" body="It may have been deleted." />;
  }

  const occ = (occurrence ? new Date(occurrence) : null) ?? pendingOccurrence(message, now) ?? now;
  const name = recipientName(message.recipient);
  const done = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xxl }]}>
      <View style={styles.header}>
        <Avatar name={name} size={72} group={message.recipient.kind === 'picker'} />
        <AppText variant="title" style={styles.center}>
          {name}
        </AppText>
        <AppText muted style={styles.center}>
          Scheduled for {formatWhen(occ, now)}
        </AppText>
      </View>

      <MessageBubble text={personalize(message.text, message.recipient)} />

      <Button
        title="Open WhatsApp and send"
        icon="whatsapp"
        onPress={async () => {
          if (await sendMessage(message.id, occ)) done();
        }}
      />
      <AppText variant="caption" muted style={styles.center}>
        {message.recipient.kind === 'picker'
          ? 'WhatsApp will open its chat list. Pick the chat, then tap send.'
          : 'WhatsApp opens with the message typed in. Just tap send.'}
      </AppText>

      <View style={styles.row}>
        <Chip icon="alarm-snooze" label="15 min" onPress={() => { snoozeMessage(message.id, 15); done(); }} />
        <Chip icon="alarm-snooze" label="1 hour" onPress={() => { snoozeMessage(message.id, 60); done(); }} />
        {now.getHours() < 19 && (
          <Chip icon="alarm-snooze" label="Tonight 8 PM" onPress={() => {
            const tonight = new Date();
            tonight.setHours(20, 0, 0, 0);
            snoozeMessage(message.id, Math.round((tonight.getTime() - Date.now()) / 60_000));
            done();
          }} />
        )}
      </View>

      <View style={styles.row}>
        <Button title="Skip" kind="ghost" compact onPress={() => { skipMessage(message.id, occ); done(); }} />
        <Button
          title="Edit"
          kind="ghost"
          compact
          onPress={() => router.replace({ pathname: '/compose', params: { id: message.id } })}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.xl, gap: Spacing.lg },
  header: { alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.lg },
  center: { textAlign: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
});
