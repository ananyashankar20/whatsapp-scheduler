import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, Badge, Button, Card } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatWhen, relative } from '@/lib/format';
import { REPEAT_LABELS } from '@/lib/recurrence';
import { displayTime, pendingOccurrence, personalize, recipientName } from '@/lib/status';
import type { ScheduledMessage } from '@/store/types';

export function MessageCard({
  message,
  now,
  onPress,
  onSend,
}: {
  message: ScheduledMessage;
  now: Date;
  onPress: () => void;
  onSend?: () => void;
}) {
  const theme = useTheme();
  const due = pendingOccurrence(message, now);
  const when = displayTime(message, now);
  const name = recipientName(message.recipient);
  const snoozed = message.snoozedUntil && new Date(message.snoozedUntil) > now;

  return (
    <Card onPress={onPress} style={[styles.card, due && { borderColor: theme.warning, borderWidth: 1 }]}>
      <View style={styles.row}>
        <Avatar name={name} group={message.recipient.kind === 'picker'} />
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <AppText variant="label" numberOfLines={1} style={styles.name}>
              {name}
            </AppText>
            {when && (
              <AppText variant="caption" muted={!due} color={due ? theme.warning : undefined}>
                {relative(when, now)}
              </AppText>
            )}
          </View>
          <AppText numberOfLines={2} muted>
            {personalize(message.text, message.recipient)}
          </AppText>
          <View style={styles.meta}>
            {when && <Badge icon="clock-outline" label={formatWhen(when, now)} tone={due ? 'warning' : 'neutral'} />}
            {message.repeat !== 'none' && <Badge icon="repeat" label={REPEAT_LABELS[message.repeat]} tone="primary" />}
            {snoozed && <Badge icon="alarm-snooze" label="Snoozed" />}
          </View>
        </View>
      </View>
      {due && onSend && (
        <Button title="Send on WhatsApp" icon="whatsapp" onPress={onSend} compact style={styles.send} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.md },
  body: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  name: { flex: 1, fontSize: 16 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  send: { marginTop: Spacing.md },
});
