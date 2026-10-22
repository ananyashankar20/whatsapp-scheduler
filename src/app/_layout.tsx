import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Toast } from '@/components/toast';
import { useIsDark, useTheme } from '@/hooks/use-theme';
import { useReminderResponses } from '@/hooks/use-reminder-responses';
import { configureNotificationHandler, setUpChannelsAndActions, syncReminders } from '@/lib/notifications';
import { useAppStore, whenHydrated } from '@/store/app-store';

SplashScreen.preventAutoHideAsync().catch(() => {});
configureNotificationHandler();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    whenHydrated().then(async () => {
      setReady(true);
      SplashScreen.hideAsync().catch(() => {});
      await setUpChannelsAndActions().catch(() => {});
      syncReminders();
    });

    // Keep the phone's reminders in step with any change to messages or settings.
    const unsubscribe = useAppStore.subscribe((state, prev) => {
      if (state.messages !== prev.messages || state.settings.followUpMinutes !== prev.settings.followUpMinutes) {
        syncReminders();
      }
    });
    // Queue the next batch of repeat reminders whenever the app is opened.
    const appState = AppState.addEventListener('change', (s) => {
      if (s === 'active') syncReminders();
    });
    return () => {
      unsubscribe();
      appState.remove();
    };
  }, []);

  if (!ready) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemedApp />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedApp() {
  const theme = useTheme();
  const dark = useIsDark();
  useReminderResponses();

  const base = dark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.border,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.card },
            headerTintColor: theme.text,
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: theme.background },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="compose" options={{ presentation: 'modal', title: 'New message' }} />
          <Stack.Screen name="contacts" options={{ presentation: 'modal', title: 'Choose contact' }} />
          <Stack.Screen name="country" options={{ presentation: 'modal', title: 'Country code' }} />
          <Stack.Screen name="template" options={{ presentation: 'modal', title: 'Template' }} />
          <Stack.Screen name="message/[id]" options={{ title: 'Message' }} />
          <Stack.Screen name="send/[id]" options={{ title: 'Ready to send' }} />
          <Stack.Screen name="privacy" options={{ title: 'Privacy policy' }} />
          <Stack.Screen name="help" options={{ title: 'How it works' }} />
        </Stack>
        <Toast />
        <StatusBar style={dark ? 'light' : 'dark'} />
      </View>
    </ThemeProvider>
  );
}
