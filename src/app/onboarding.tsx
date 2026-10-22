import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Icon, type IconName } from '@/components/ui';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { requestPermission } from '@/lib/notifications';
import { useAppStore } from '@/store/app-store';

const PAGES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'message-text-clock-outline',
    title: 'Write it now, send it on time',
    body: 'Birthday wishes at midnight, reminders for clients, good-morning texts. Write them whenever it suits you.',
  },
  {
    icon: 'bell-ring-outline',
    title: 'A reminder at the right moment',
    body: 'When it’s time, you get a notification. Tap it and WhatsApp opens with the chat and your message ready. Just press send.',
  },
  {
    icon: 'shield-check-outline',
    title: 'Private by design',
    body: 'Your messages stay on your phone. No account, no servers, nothing sent anywhere until you press send in WhatsApp.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scroller = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const last = page === PAGES.length - 1;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));

  const next = async () => {
    if (!last) {
      scroller.current?.scrollTo({ x: width * (page + 1), animated: true });
      setPage(page + 1);
      return;
    }
    await requestPermission();
    updateSettings({ onboarded: true });
    router.replace('/');
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background, paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.lg }]}>
      <AppText variant="heading" color={theme.primary} style={styles.brand}>
        {Brand.name}
      </AppText>
      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={{ flex: 1 }}>
        {PAGES.map((p) => (
          <View key={p.title} style={[styles.page, { width }]}>
            <View style={[styles.illustration, { backgroundColor: theme.primarySoft }]}>
              <Icon name={p.icon} size={88} color={theme.primary} />
            </View>
            <AppText variant="title" style={styles.center}>
              {p.title}
            </AppText>
            <AppText muted style={[styles.center, styles.body]}>
              {p.body}
            </AppText>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {PAGES.map((p, i) => (
          <View
            key={p.title}
            style={[styles.dot, { backgroundColor: i === page ? theme.primary : theme.border, width: i === page ? 22 : 8 }]}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <Button title={last ? 'Allow reminders & start' : 'Next'} icon={last ? 'bell-check-outline' : undefined} onPress={next} />
        {last && (
          <AppText variant="caption" muted style={styles.center}>
            Reminders need notification permission. You can change this any time in Settings.
          </AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  brand: { textAlign: 'center', marginTop: Spacing.lg, letterSpacing: 0.5 },
  page: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl, gap: Spacing.lg },
  illustration: { width: 180, height: 180, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  center: { textAlign: 'center' },
  body: { fontSize: 17, lineHeight: 25 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: Spacing.lg },
  dot: { height: 8, borderRadius: 4 },
  actions: { paddingHorizontal: Spacing.xl, gap: Spacing.sm },
});
