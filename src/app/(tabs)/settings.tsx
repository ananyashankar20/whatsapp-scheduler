import * as Application from 'expo-application';
import * as IntentLauncher from 'expo-intent-launcher';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, Share, StyleSheet, View } from 'react-native';

import { AppText, Card, Chip, Divider, ListRow, SectionTitle } from '@/components/ui';
import { Brand, Spacing } from '@/constants/theme';
import { countryByCode, flagOf } from '@/lib/countries';
import { getPermissionStatus, requestPermission, sendTestReminder } from '@/lib/notifications';
import { useAppStore } from '@/store/app-store';
import type { ThemePreference } from '@/store/types';
import { showToast } from '@/store/ui-store';

const FOLLOW_UPS = [
  { label: 'Off', minutes: 0 },
  { label: '10 min', minutes: 10 },
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '1 hour', minutes: 60 },
];

const THEMES: { label: string; value: ThemePreference }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useAppStore((s) => s.settings);
  const update = useAppStore((s) => s.updateSettings);
  const resetEverything = useAppStore((s) => s.resetEverything);
  const [permission, setPermission] = useState<string>('granted');

  useFocusEffect(
    useCallback(() => {
      getPermissionStatus().then(setPermission);
    }, []),
  );

  const country = countryByCode(settings.countryCode);
  const appId = Application.applicationId ?? 'com.devsatish.chatlater';
  const version = `${Application.nativeApplicationVersion ?? '1.0.0'} (${Application.nativeBuildVersion ?? '1'})`;

  const fixNotifications = async () => {
    if (permission === 'granted') return Linking.openSettings();
    const granted = await requestPermission();
    if (!granted) Linking.openSettings();
    setPermission(granted ? 'granted' : 'denied');
  };

  const openExactAlarmSettings = () =>
    IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.REQUEST_SCHEDULE_EXACT_ALARM, {
      data: `package:${appId}`,
    }).catch(() => Linking.openSettings());

  const test = async () => {
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert('Notifications are off', 'Turn on notifications for ChatLater to get reminders.');
      return;
    }
    await sendTestReminder(5);
    showToast('Test reminder in 5 seconds');
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SectionTitle>Sending</SectionTitle>
      <Card style={styles.card}>
        <ListRow
          icon="earth"
          title="Default country code"
          subtitle="For numbers typed without +"
          value={country ? `${flagOf(country.code)} +${country.dial}` : settings.countryCode}
          onPress={() => router.push('/country')}
        />
      </Card>

      <SectionTitle>Reminders</SectionTitle>
      <Card style={styles.card}>
        <ListRow
          icon={permission === 'granted' ? 'bell-ring-outline' : 'bell-off-outline'}
          title="Notifications"
          value={permission === 'granted' ? 'On' : 'Off'}
          onPress={fixNotifications}
        />
        <Divider />
        <View style={styles.block}>
          <AppText variant="label">Remind again if not sent</AppText>
          <AppText variant="caption" muted>
            One extra nudge after the scheduled time if you haven&apos;t sent the message yet.
          </AppText>
          <View style={styles.chips}>
            {FOLLOW_UPS.map((f) => (
              <Chip
                key={f.minutes}
                label={f.label}
                selected={settings.followUpMinutes === f.minutes}
                onPress={() => update({ followUpMinutes: f.minutes })}
              />
            ))}
          </View>
        </View>
        {Platform.OS === 'android' && Number(Platform.Version) >= 31 && (
          <>
            <Divider />
            <ListRow
              icon="timer-check-outline"
              title="On-time reminders"
              subtitle="Allow “Alarms & reminders” so Android doesn’t delay them"
              onPress={openExactAlarmSettings}
            />
          </>
        )}
        <Divider />
        <ListRow icon="bell-badge-outline" title="Send a test reminder" onPress={test} />
      </Card>

      <SectionTitle>Appearance</SectionTitle>
      <Card style={styles.card}>
        <View style={styles.block}>
          <AppText variant="label">Theme</AppText>
          <View style={styles.chips}>
            {THEMES.map((t) => (
              <Chip key={t.value} label={t.label} selected={settings.theme === t.value} onPress={() => update({ theme: t.value })} />
            ))}
          </View>
        </View>
      </Card>

      <SectionTitle>About</SectionTitle>
      <Card style={styles.card}>
        <ListRow icon="help-circle-outline" title="How it works" onPress={() => router.push('/help')} />
        <Divider />
        <ListRow icon="shield-lock-outline" title="Privacy policy" onPress={() => router.push('/privacy')} />
        <Divider />
        <ListRow
          icon="star-outline"
          title="Rate ChatLater"
          onPress={() =>
            Linking.openURL(`market://details?id=${appId}`).catch(() =>
              Linking.openURL(`https://play.google.com/store/apps/details?id=${appId}`),
            )
          }
        />
        <Divider />
        <ListRow
          icon="share-variant-outline"
          title="Share with a friend"
          onPress={() =>
            Share.share({
              message: `I use ${Brand.name} to schedule WhatsApp messages: https://play.google.com/store/apps/details?id=${appId}`,
            })
          }
        />
        <Divider />
        <ListRow icon="information-outline" title="Version" value={version} />
      </Card>

      <SectionTitle>Data</SectionTitle>
      <Card style={styles.card}>
        <ListRow
          icon="delete-forever-outline"
          title="Erase all data"
          subtitle="Deletes every scheduled message, your history and templates"
          danger
          onPress={() =>
            Alert.alert('Erase everything?', 'This can’t be undone.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Erase', style: 'destructive', onPress: resetEverything },
            ])
          }
        />
      </Card>

      <AppText variant="caption" muted style={styles.footer}>
        {Brand.name} isn&apos;t affiliated with WhatsApp or Meta. Your messages stay on this phone.
      </AppText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, paddingTop: 0, paddingBottom: Spacing.xxl },
  card: { padding: 0, overflow: 'hidden' },
  block: { padding: Spacing.lg, gap: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  footer: { textAlign: 'center', marginTop: Spacing.xl },
});
