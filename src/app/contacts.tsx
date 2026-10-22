import { Contact, ContactField, requestPermissionsAsync } from 'expo-contacts';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, StyleSheet, View } from 'react-native';

import { AppText, Avatar, Button, Divider, EmptyState, Field, ListRow } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { countryByCode } from '@/lib/countries';
import { formatPhone, toInternational } from '@/lib/phone';
import { useAppStore } from '@/store/app-store';
import { useUiStore } from '@/store/ui-store';

type Person = { id: string; name: string; phones: { label: string; phone: string }[] };

type LoadState = 'loading' | 'denied' | 'ready';

export default function ContactsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const countryCode = useAppStore((s) => s.settings.countryCode);
  const dial = countryByCode(countryCode)?.dial ?? '91';
  const [state, setState] = useState<LoadState>('loading');
  const [people, setPeople] = useState<Person[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      const { granted } = await requestPermissionsAsync();
      if (!granted) {
        if (alive) setState('denied');
        return;
      }
      const all = await Contact.getAllDetails([ContactField.FULL_NAME, ContactField.PHONES] as const);
      const list: Person[] = [];
      for (const c of all) {
        const seen = new Set<string>();
        const phones: Person['phones'] = [];
        for (const p of c.phones ?? []) {
          const phone = p.number ? toInternational(p.number, dial) : null;
          if (!phone || seen.has(phone)) continue;
          seen.add(phone);
          phones.push({ label: p.label ?? 'phone', phone });
        }
        if (!phones.length) continue;
        list.push({ id: c.id, name: c.fullName?.trim() || formatPhone(phones[0].phone), phones });
      }
      list.sort((a, b) => a.name.localeCompare(b.name));
      if (alive) {
        setPeople(list);
        setState('ready');
      }
    })().catch(() => alive && setState('denied'));
    return () => {
      alive = false;
    };
  }, [dial]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = q.replace(/\D/g, '');
    if (!q) return people;
    return people.filter(
      (p) => p.name.toLowerCase().includes(q) || (digits.length >= 3 && p.phones.some((ph) => ph.phone.includes(digits))),
    );
  }, [people, query]);

  const choose = (person: Person, phone: string) => {
    useUiStore.getState().setPickedRecipient({ kind: 'phone', phone, name: person.name });
    router.back();
  };

  const onPress = (person: Person) => {
    if (person.phones.length === 1) return choose(person, person.phones[0].phone);
    Alert.alert(
      person.name,
      'Which number?',
      [
        ...person.phones.slice(0, 4).map((p) => ({
          text: `${p.label}: ${formatPhone(p.phone)}`,
          onPress: () => choose(person, p.phone),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
      { cancelable: true },
    );
  };

  if (state === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (state === 'denied') {
    return (
      <EmptyState
        icon="account-lock-outline"
        title="Contacts access is off"
        body="Allow access to pick people from your contacts. Your contacts never leave your phone. You can also type a number instead."
        action={<Button title="Open settings" kind="secondary" onPress={() => Linking.openSettings()} />}
      />
    );
  }

  return (
    <FlatList
      data={filtered}
      keyExtractor={(p) => p.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={styles.search}>
          <Field autoFocus placeholder="Search name or number" value={query} onChangeText={setQuery} />
          <AppText variant="caption" muted>
            {filtered.length} contact{filtered.length === 1 ? '' : 's'} with phone numbers
          </AppText>
        </View>
      }
      renderItem={({ item }) => (
        <ListRow
          title={item.name}
          subtitle={item.phones.length > 1 ? `${item.phones.length} numbers` : formatPhone(item.phones[0].phone)}
          onPress={() => onPress(item)}
          right={<Avatar name={item.name} size={36} />}
        />
      )}
      ItemSeparatorComponent={Divider}
      ListEmptyComponent={<EmptyState icon="account-question-outline" title="No contacts found" body="Try a different name, or go back and type the number." />}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  search: { padding: Spacing.lg, gap: Spacing.sm },
});
