import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { Divider, Field, Icon, ListRow } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { COUNTRIES, flagOf } from '@/lib/countries';
import { useAppStore } from '@/store/app-store';
import { useUiStore } from '@/store/ui-store';

/** Country code list. target=compose sends the choice back to the compose screen; otherwise it's the default. */
export default function CountryScreen() {
  const { target } = useLocalSearchParams<{ target?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const current = useAppStore((s) => s.settings.countryCode);
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, '');
    const sorted = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));
    return q ? sorted.filter((c) => c.name.toLowerCase().includes(q) || c.dial.startsWith(q)) : sorted;
  }, [query]);

  const choose = (code: string) => {
    if (target === 'compose') useUiStore.getState().setPickedCountry(code);
    else useAppStore.getState().updateSettings({ countryCode: code });
    router.back();
  };

  return (
    <FlatList
      data={list}
      keyExtractor={(c) => c.code}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={styles.search}>
          <Field placeholder="Search country or code" value={query} onChangeText={setQuery} />
        </View>
      }
      renderItem={({ item }) => (
        <ListRow
          title={`${flagOf(item.code)}  ${item.name}`}
          value={`+${item.dial}`}
          onPress={() => choose(item.code)}
          right={item.code === current && target !== 'compose' ? <Icon name="check" color={theme.primary} /> : <View />}
        />
      )}
      ItemSeparatorComponent={Divider}
    />
  );
}

const styles = StyleSheet.create({
  search: { padding: Spacing.lg },
});
