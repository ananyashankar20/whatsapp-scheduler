import * as Clipboard from 'expo-clipboard';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/store/ui-store';

/** The message shown like a chat bubble, with a copy button. */
export function MessageBubble({ text, time }: { text: string; time?: string }) {
  const theme = useTheme();
  const copy = async () => {
    await Clipboard.setStringAsync(text);
    showToast('Message copied');
  };
  return (
    <View style={[styles.bubble, { backgroundColor: theme.primarySoft }]}>
      <AppText selectable style={styles.text}>
        {text}
      </AppText>
      <View style={styles.footer}>
        {time ? (
          <AppText variant="caption" muted>
            {time}
          </AppText>
        ) : (
          <View />
        )}
        <Pressable accessibilityRole="button" accessibilityLabel="Copy message" hitSlop={10} onPress={copy} style={styles.copy}>
          <Icon name="content-copy" size={16} color={theme.primary} />
          <AppText variant="caption" color={theme.primary} style={styles.copyText}>
            Copy
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderRadius: Radius.lg,
    borderTopRightRadius: 4,
    padding: Spacing.lg,
    gap: Spacing.sm,
    alignSelf: 'stretch',
  },
  text: { fontSize: 17, lineHeight: 24 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  copy: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  copyText: { fontWeight: '700' },
});
