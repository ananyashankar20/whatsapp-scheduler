import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { PRIVACY_SECTIONS, PRIVACY_UPDATED } from '@/constants/legal';

export default function PrivacyScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <AppText variant="caption" muted>
        Last updated {PRIVACY_UPDATED}
      </AppText>
      {PRIVACY_SECTIONS.map((s) => (
        <View key={s.title} style={styles.section}>
          <AppText variant="heading">{s.title}</AppText>
          <AppText>{s.body}</AppText>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  section: { gap: Spacing.sm },
});
