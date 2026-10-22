import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MessageBubble } from '@/components/message-bubble';
import { AppText, Avatar, Badge, Button, Card, Chip, Divider, EmptyState, ListRow, SectionTitle } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { deleteMessage, sendMessage, skipMessage, snoozeMessage, stopRepeating } from '@/lib/actions';
import { formatWhen, relative } from '@/lib/format';
import { formatPhone } from '@/lib/phone';
import { REPEAT_LABELS } from '@/lib/recurrence';
import { pendingOccurrence, personalize, recipientName, upcomingOccurrence } from '@/lib/status';
import { useAppStore } from '@/store/app-store';

const SNOOZES = [
  { label: '15 min', minutes: 15 },
  { label: '1 hour', minutes: 60 },
  { label: '3 hours', minutes: 180 },
];

export default function MessageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const message = useAppStore((s) => s.messages.find((m) => m.id === id));
  const history = useAppStore((s) => s.history);

  if (!message) {
    return <EmptyState icon="message-off-outline" title="Message not found" body="It may have been deleted." />;
  }

  const name = recipientName(message.recipient);
  const due = pendingOccurrence(message, now);
  const next = upcomingOccurrence(message, now);
  const sends = history.filter((h) => h.messageId === message.id).slice(0, 5);
  const isRepeating = message.repeat !== 'none';

  const confirmDelete = () =>
    Alert.alert('Delete this message?', isRepeating ? 'All future repeats will be cancelled too.' : undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteMessage(message.id);
          router.back();
        },
      },
    ]);

  let status: { label: string; tone: 'warning' | 'primary' | 'neutral' };
  if (due) status = { label: 'Ready to send', tone: 'warning' };
  else if (message.active) status = { label: 'Scheduled', tone: 'primary' };
  else status = { label: isRepeating ? 'Stopped' : 'Sent', tone: 'neutral' };

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xxl }]}>
      <View style={styles.header}>
        <Avatar name={name} size={56} group={message.recipient.kind === 'picker'} />
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="heading">{name}</AppText>
          {message.recipient.kind === 'phone' && message.recipient.name && (
            <AppText muted>{formatPhone(message.recipient.phone)}</AppText>
          )}
          <Badge label={status.label} tone={status.tone} />
        </View>
      </View>

      <MessageBubble text={personalize(message.text, message.recipient)} />

      {due ? (
        <View style={styles.gap}>
          <Button title="Send on WhatsApp" icon="whatsapp" onPress={() => sendMessage(message.id, due)} />
          <View style={styles.row}>
            {SNOOZES.map((s) => (
              <Chip key={s.minutes} icon="alarm-snooze" label={s.label} onPress={() => snoozeMessage(message.id, s.minutes)} />
            ))}
          </View>
          <Button title="Skip this time" kind="secondary" icon="debug-step-over" onPress={() => skipMessage(message.id, due)} />
        </View>
      ) : message.active && next ? (
        <Button
          title="Send now instead"
          kind="secondary"
          icon="send"
          onPress={() => sendMessage(message.id, next)}
        />
      ) : null}

      <Card style={styles.info}>
        {due && <ListRow icon="clock-alert-outline" title="Was due" value={formatWhen(due, now)} />}
        {due && <Divider />}
        {next && (
          <ListRow icon="clock-outline" title={due ? 'Next time' : 'Scheduled for'} subtitle={relative(next, now)} value={formatWhen(next, now)} />
        )}
        {next && <Divider />}
        <ListRow icon="repeat" title="Repeat" value={REPEAT_LABELS[message.repeat]} />
      </Card>

      <View style={styles.gap}>
        <Button
          title={message.active ? 'Edit' : 'Schedule again'}
          kind="secondary"
          icon="pencil"
          onPress={() => router.push({ pathname: '/compose', params: { id: message.id } })}
        />
        <Button
          title="Duplicate"
          kind="secondary"
          icon="content-duplicate"
          onPress={() => router.push({ pathname: '/compose', params: { copyOf: message.id } })}
        />
        {isRepeating && message.active && (
          <Button title="Stop repeating" kind="secondary" icon="repeat-off" onPress={() => stopRepeating(message.id)} />
        )}
        <Button title="Delete" kind="danger" icon="trash-can-outline" onPress={confirmDelete} />
      </View>

      {sends.length > 0 && (
        <>
          <SectionTitle>Recent</SectionTitle>
          <Card style={styles.info}>
            {sends.map((h, i) => (
              <View key={h.id}>
                {i > 0 && <Divider />}
                <ListRow
                  icon={h.outcome === 'sent' ? 'check' : 'debug-step-over'}
                  title={h.outcome === 'sent' ? 'Sent' : 'Skipped'}
                  value={formatWhen(new Date(h.handledAt), now)}
                />
              </View>
            ))}
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, gap: Spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  gap: { gap: Spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  info: { padding: 0, overflow: 'hidden' },
});
