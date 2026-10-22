import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateTimeField } from '@/components/date-time-field';
import { AppText, Avatar, Button, Card, Chip, Field, IconButton, SectionTitle } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { countryByCode, flagOf } from '@/lib/countries';
import { formatPhone, toInternational } from '@/lib/phone';
import { formatWhen } from '@/lib/format';
import { requestPermission } from '@/lib/notifications';
import { quickTimes } from '@/lib/quick-times';
import { REPEAT_LABELS, type Repeat } from '@/lib/recurrence';
import { nextOccurrence } from '@/lib/recurrence';
import { personalize, recipientName } from '@/lib/status';
import { useAppStore } from '@/store/app-store';
import type { Recipient } from '@/store/types';
import { showToast, useUiStore } from '@/store/ui-store';

type Params = {
  id?: string; // edit this message
  copyOf?: string; // start from this message (duplicate)
  historyId?: string; // start from a history entry ("send again")
  templateId?: string;
  text?: string;
};

type Mode = 'person' | 'chat';

const REPEATS: Repeat[] = ['none', 'daily', 'weekly', 'monthly', 'yearly'];

function defaultTime(now: Date): Date {
  const d = new Date(now.getTime() + 60 * 60_000);
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
  return d;
}

export default function ComposeScreen() {
  const params = useLocalSearchParams<Params>();
  const router = useRouter();
  const navigation = useNavigation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const now = useNow(15_000);
  const textRef = useRef<TextInput>(null);

  const store = useAppStore();
  const settings = store.settings;
  const editing = params.id ? store.messages.find((m) => m.id === params.id) : undefined;
  const source =
    editing ??
    (params.copyOf ? store.messages.find((m) => m.id === params.copyOf) : undefined) ??
    (params.historyId ? store.history.find((h) => h.id === params.historyId) : undefined);
  const template = params.templateId ? store.templates.find((t) => t.id === params.templateId) : undefined;

  const initialRecipient = source?.recipient;
  const [mode, setMode] = useState<Mode>(initialRecipient?.kind === 'picker' ? 'chat' : 'person');
  const [picked, setPicked] = useState<Recipient | null>(
    initialRecipient?.kind === 'phone' ? initialRecipient : null,
  );
  const [chatLabel, setChatLabel] = useState(initialRecipient?.kind === 'picker' ? (initialRecipient.label ?? '') : '');
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState(settings.countryCode);
  const [text, setText] = useState(source?.text ?? template?.text ?? params.text ?? '');
  const [when, setWhen] = useState<Date>(() => {
    if (editing) {
      const anchor = new Date(editing.anchor);
      if (anchor > new Date()) return anchor;
      return nextOccurrence(anchor, editing.repeat, new Date()) ?? defaultTime(new Date());
    }
    return defaultTime(new Date());
  });
  const [repeat, setRepeat] = useState<Repeat>(editing?.repeat ?? (source && 'repeat' in source ? source.repeat : 'none'));
  const [showErrors, setShowErrors] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: editing ? 'Edit message' : 'New message' });
  }, [navigation, editing]);

  // Pick up choices made on the contacts and country screens.
  useFocusEffect(
    useCallback(() => {
      const ui = useUiStore.getState();
      if (ui.pickedRecipient) {
        setPicked(ui.pickedRecipient);
        setMode('person');
        ui.setPickedRecipient(null);
      }
      if (ui.pickedCountry) {
        setCountry(ui.pickedCountry);
        ui.setPickedCountry(null);
      }
    }, []),
  );

  const dial = countryByCode(country)?.dial ?? '91';

  const recipient: Recipient | null = useMemo(() => {
    if (mode === 'chat') return { kind: 'picker', label: chatLabel.trim() || undefined };
    if (picked) return picked;
    const phone = toInternational(number, dial);
    if (!phone) return null;
    return { kind: 'phone', phone, name: name.trim() || undefined };
  }, [mode, chatLabel, picked, number, dial, name]);

  const errors = {
    recipient: mode === 'person' && !recipient ? (number ? 'That doesn’t look like a full phone number' : 'Choose a contact or type a number') : null,
    text: text.trim() ? null : 'Write a message',
    when: when <= now ? 'Pick a time in the future' : null,
  };
  const valid = !errors.recipient && !errors.text && !errors.when;

  const save = async () => {
    if (!valid || !recipient) {
      setShowErrors(true);
      return;
    }
    const input = { recipient, text: text.trim(), anchor: when.toISOString(), repeat };
    if (editing) store.updateMessage(editing.id, input);
    else store.addMessage(input);
    await requestPermission();
    showToast(`Scheduled for ${formatWhen(when, new Date())}`);
    router.back();
  };

  const insertName = () => {
    setText((t) => (t.endsWith(' ') || !t ? `${t}{name}` : `${t} {name}`));
    textRef.current?.focus();
  };

  const preview = recipient && /\{name\}/i.test(text) ? personalize(text, recipient) : null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        keyboardShouldPersistTaps="handled">
        {/* WHO */}
        <SectionTitle>To</SectionTitle>
        <View style={styles.segment}>
          <Chip icon="account" label="A person" selected={mode === 'person'} onPress={() => setMode('person')} />
          <Chip icon="account-group" label="Any chat or group" selected={mode === 'chat'} onPress={() => setMode('chat')} />
        </View>

        {mode === 'person' ? (
          picked ? (
            <Card style={styles.pickedCard}>
              <Avatar name={recipientName(picked)} />
              <View style={{ flex: 1 }}>
                <AppText variant="label">{recipientName(picked)}</AppText>
                {picked.kind === 'phone' && picked.name && (
                  <AppText variant="caption" muted>
                    {formatPhone(picked.phone)}
                  </AppText>
                )}
              </View>
              <IconButton name="close" label="Remove contact" onPress={() => setPicked(null)} />
            </Card>
          ) : (
            <View style={styles.gap}>
              {Platform.OS !== 'web' && (
                <Button title="Choose from contacts" icon="account-search" kind="secondary" onPress={() => router.push('/contacts')} />
              )}
              <View style={styles.numberRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Change country code"
                  onPress={() => router.push({ pathname: '/country', params: { target: 'compose' } })}
                  style={[styles.dial, { borderColor: theme.border, backgroundColor: theme.card }]}>
                  <AppText>
                    {flagOf(country)} +{dial}
                  </AppText>
                </Pressable>
                <Field
                  style={{ flex: 1 }}
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                  value={number}
                  onChangeText={setNumber}
                  error={showErrors ? errors.recipient : null}
                />
              </View>
              <Field placeholder="Name (optional, used for {name})" value={name} onChangeText={setName} />
            </View>
          )
        ) : (
          <View style={styles.gap}>
            <Field
              placeholder="Label, e.g. Family group (optional)"
              value={chatLabel}
              onChangeText={setChatLabel}
            />
            <AppText variant="caption" muted>
              When it&apos;s time, WhatsApp opens its chat list with your message ready, so you can pick any chat,
              including groups.
            </AppText>
          </View>
        )}

        {/* WHAT */}
        <SectionTitle right={<AppText variant="caption" muted>{text.length} characters</AppText>}>Message</SectionTitle>
        <Field
          ref={textRef}
          multiline
          placeholder="Type your message…"
          value={text}
          onChangeText={setText}
          inputStyle={styles.textArea}
          error={showErrors ? errors.text : null}
        />
        {preview && (
          <AppText variant="caption" muted>
            Preview: {preview}
          </AppText>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          <Chip icon="account-edit" label="Insert {name}" onPress={insertName} />
          {store.templates.map((t) => (
            <Chip key={t.id} icon="text-box-outline" label={t.title} onPress={() => setText(t.text)} />
          ))}
        </ScrollView>

        {/* WHEN */}
        <SectionTitle>When</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {quickTimes(now).map((q) => (
            <Chip
              key={q.label}
              label={q.label}
              selected={q.date.getTime() === when.getTime()}
              onPress={() => setWhen(q.date)}
            />
          ))}
        </ScrollView>
        <DateTimeField value={when} onChange={setWhen} now={now} />
        {showErrors && errors.when && (
          <AppText variant="caption" color={theme.danger}>
            {errors.when}
          </AppText>
        )}

        <SectionTitle>Repeat</SectionTitle>
        <View style={styles.wrap}>
          {REPEATS.map((r) => (
            <Chip key={r} label={REPEAT_LABELS[r]} selected={repeat === r} onPress={() => setRepeat(r)} />
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + Spacing.md, backgroundColor: theme.background, borderTopColor: theme.border },
        ]}>
        <Button
          title={editing ? 'Save changes' : `Schedule for ${formatWhen(when, now)}`}
          icon="send-clock"
          onPress={save}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, gap: Spacing.sm },
  segment: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', marginBottom: Spacing.xs },
  gap: { gap: Spacing.sm },
  pickedCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  numberRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  dial: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    justifyContent: 'center',
  },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  chipsRow: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
