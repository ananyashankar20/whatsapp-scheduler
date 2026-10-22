import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useMemo } from 'react';
import { Alert, SectionList, StyleSheet, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { AppText, Avatar, Badge, Card, EmptyState, IconButton, SectionTitle } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { formatDay, formatTime } from '@/lib/format';
import { personalize, recipientName } from '@/lib/status';
import { useAppStore } from '@/store/app-store';
import type { HistoryEntry } from '@/store/types';
import { showToast } from '@/store/ui-store';

export default function HistoryScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const now = useNow(60_000);
  const history = useAppStore((s) => s.history);
  const clearHistory = useAppStore((s) => s.clearHistory);
  const deleteEntry = useAppStore((s) => s.deleteHistoryEntry);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        history.length ? (
          <View style={styles.headerRight}>
            <IconButton
              name="delete-sweep-outline"
              label="Clear history"
              onPress={() =>
                Alert.alert('Clear history?', 'This only removes the record. Scheduled messages are not affected.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', style: 'destructive', onPress: clearHistory },
                ])
              }
            />
          </View>
        ) : null,
    });
  }, [navigation, history.length, clearHistory]);

  const sections = useMemo(() => {
    const groups = new Map<string, HistoryEntry[]>();
    for (const h of history) {
      const day = formatDay(new Date(h.handledAt), now);
      groups.set(day, [...(groups.get(day) ?? []), h]);
    }
    return [...groups.entries()].map(([title, data]) => ({ title, data }));
  }, [history, now]);

  const openActions = (entry: HistoryEntry) => {
    const text = personalize(entry.text, entry.recipient);
    Alert.alert(recipientName(entry.recipient), text, [
      {
        text: 'Schedule again',
        onPress: () => router.push({ pathname: '/compose', params: { historyId: entry.id } }),
      },
      {
        text: 'Copy text',
        onPress: async () => {
          await Clipboard.setStringAsync(text);
          showToast('Message copied');
        },
      },
      { text: 'Remove from history', style: 'destructive', onPress: () => deleteEntry(entry.id) },
    ], { cancelable: true });
  };

  return (
    <SectionList
      sections={sections}
      keyExtractor={(h) => h.id}
      contentContainerStyle={styles.list}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => <SectionTitle>{section.title}</SectionTitle>}
      ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      renderItem={({ item }) => {
        const name = recipientName(item.recipient);
        return (
          <Card onPress={() => openActions(item)} style={styles.card}>
            <Avatar name={name} size={40} group={item.recipient.kind === 'picker'} />
            <View style={styles.body}>
              <View style={styles.titleRow}>
                <AppText variant="label" numberOfLines={1} style={{ flex: 1 }}>
                  {name}
                </AppText>
                <AppText variant="caption" muted>
                  {formatTime(new Date(item.handledAt))}
                </AppText>
              </View>
              <AppText muted numberOfLines={2}>
                {personalize(item.text, item.recipient)}
              </AppText>
              <Badge
                icon={item.outcome === 'sent' ? 'check-all' : 'debug-step-over'}
                label={item.outcome === 'sent' ? 'Sent' : 'Skipped'}
                tone={item.outcome === 'sent' ? 'primary' : 'neutral'}
              />
            </View>
          </Card>
        );
      }}
      ListEmptyComponent={
        <EmptyState
          icon="history"
          title="No history yet"
          body="Messages you send or skip from ChatLater will show up here, so you can send them again later."
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.lg, paddingTop: 0, paddingBottom: Spacing.xxl },
  headerRight: { paddingRight: Spacing.md },
  card: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.md },
  body: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
