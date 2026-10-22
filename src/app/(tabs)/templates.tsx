import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, EmptyState, IconButton } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';

export default function TemplatesScreen() {
  const router = useRouter();
  const templates = useAppStore((s) => s.templates);

  return (
    <FlatList
      data={templates}
      keyExtractor={(t) => t.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.header}>
          <AppText muted>
            Tap a template to schedule it. Use {'{name}'} and it&apos;s replaced with the person&apos;s first name.
          </AppText>
          <Button title="New template" icon="plus" kind="secondary" onPress={() => router.push('/template')} />
        </View>
      }
      ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      renderItem={({ item }) => (
        <Card
          style={styles.card}
          onPress={() => router.push({ pathname: '/compose', params: { templateId: item.id } })}>
          <View style={styles.body}>
            <AppText variant="label">{item.title}</AppText>
            <AppText muted numberOfLines={3}>
              {item.text}
            </AppText>
          </View>
          <IconButton
            name="pencil-outline"
            label={`Edit ${item.title}`}
            onPress={() => router.push({ pathname: '/template', params: { id: item.id } })}
          />
        </Card>
      )}
      ListEmptyComponent={
        <EmptyState icon="text-box-plus-outline" title="No templates" body="Save messages you send often, like birthday wishes." />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.lg, paddingTop: 0, paddingBottom: Spacing.xxl },
  header: { gap: Spacing.md, marginBottom: Spacing.lg },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  body: { flex: 1, gap: 4 },
});
