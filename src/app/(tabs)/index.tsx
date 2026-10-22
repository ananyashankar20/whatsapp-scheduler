import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Linking, Pressable, SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MessageCard } from '@/components/message-card';
import { AppText, Button, Card, EmptyState, Field, Icon, IconButton, SectionTitle } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { sendMessage } from '@/lib/actions';
import { bucketOf } from '@/lib/format';
import { getPermissionStatus, requestPermission } from '@/lib/notifications';
import { displayTime, pendingOccurrence, recipientName } from '@/lib/status';
import { useAppStore } from '@/store/app-store';
import type { ScheduledMessage } from '@/store/types';

type Section = { title: string; data: ScheduledMessage[] };

export default function ScheduledScreen() {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const messages = useAppStore((s) => s.messages);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'undetermined'>('granted');

  useFocusEffect(
    useCallback(() => {
      getPermissionStatus().then(setPermission);
    }, []),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRight}>
          <IconButton
            name={searching ? 'close' : 'magnify'}
            label={searching ? 'Close search' : 'Search'}
            onPress={() => {
              setSearching((v) => !v);
              setQuery('');
            }}
          />
        </View>
      ),
    });
  }, [navigation, searching]);

  const sections = useMemo<Section[]>(() => {
    const q = query.trim().toLowerCase();
    const matches = (m: ScheduledMessage) =>
      !q || m.text.toLowerCase().includes(q) || recipientName(m.recipient).toLowerCase().includes(q);

    const visible = messages.filter(matches);
    const due: ScheduledMessage[] = [];
    const buckets = new Map<string, ScheduledMessage[]>();
    const stopped: ScheduledMessage[] = [];

    for (const m of visible) {
      if (!m.active) {
        if (m.repeat !== 'none') stopped.push(m);
        continue;
      }
      if (pendingOccurrence(m, now)) {
        due.push(m);
        continue;
      }
      const when = displayTime(m, now);
      if (!when) continue;
      const bucket = bucketOf(when, now);
      buckets.set(bucket, [...(buckets.get(bucket) ?? []), m]);
    }

    const byTime = (a: ScheduledMessage, b: ScheduledMessage) =>
      (displayTime(a, now)?.getTime() ?? 0) - (displayTime(b, now)?.getTime() ?? 0);

    const out: Section[] = [];
    if (due.length) out.push({ title: 'Ready to send', data: due.sort(byTime) });
    for (const title of ['Today', 'Tomorrow', 'This week', 'Later']) {
      const data = buckets.get(title);
      if (data?.length) out.push({ title, data: data.sort(byTime) });
    }
    if (stopped.length) out.push({ title: 'Stopped', data: stopped });
    return out;
  }, [messages, now, query]);

  const hasAnyMessages = messages.some((m) => m.active || m.repeat !== 'none');

  const fixPermission = async () => {
    const granted = await requestPermission();
    if (!granted) Linking.openSettings();
    setPermission(granted ? 'granted' : 'denied');
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(m) => m.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 120 }]}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            {searching && (
              <Field
                autoFocus
                placeholder="Search by name or message"
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
              />
            )}
            {permission !== 'granted' && (
              <Card style={[styles.banner, { backgroundColor: theme.warningSoft, borderColor: theme.warning }]}>
                <Icon name="bell-off-outline" color={theme.warning} />
                <View style={styles.bannerText}>
                  <AppText variant="label">Reminders are turned off</AppText>
                  <AppText variant="caption" muted>
                    Without notifications you won&apos;t be told when a message is ready to send.
                  </AppText>
                </View>
                <Button title="Turn on" compact onPress={fixPermission} />
              </Card>
            )}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <SectionTitle>
            {section.title} · {section.data.length}
          </SectionTitle>
        )}
        renderItem={({ item }) => (
          <MessageCard
            message={item}
            now={now}
            onPress={() => router.push({ pathname: '/message/[id]', params: { id: item.id } })}
            onSend={() => sendMessage(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListEmptyComponent={
          query ? (
            <EmptyState icon="magnify" title="No matches" body={`Nothing scheduled matches “${query}”.`} />
          ) : (
            <EmptyState
              icon="message-text-clock-outline"
              title={hasAnyMessages ? 'All caught up' : 'Nothing scheduled yet'}
              body="Write a message now and get a reminder with it ready in WhatsApp at the right time."
              action={
                <Button title="Schedule a message" icon="plus" onPress={() => router.push('/compose')} />
              }
            />
          )
        }
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Schedule a new message"
        onPress={() => router.push('/compose')}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: theme.primary, bottom: Spacing.xl, opacity: pressed ? 0.85 : 1 },
        ]}>
        <Icon name="plus" size={30} color={theme.primaryText} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { paddingHorizontal: Spacing.lg },
  header: { gap: Spacing.md, paddingTop: Spacing.sm },
  headerRight: { paddingRight: Spacing.md },
  banner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  bannerText: { flex: 1, gap: 2 },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    width: 60,
    height: 60,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
