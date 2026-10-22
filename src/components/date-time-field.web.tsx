import { createElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Props = { value: Date; onChange: (date: Date) => void; now: Date };

const pad = (n: number) => String(n).padStart(2, '0');
const toLocalInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** The browser version: a plain date-time input. Only used for previews. */
export function DateTimeField({ value, onChange, now }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      {createElement('input', {
        type: 'datetime-local',
        value: toLocalInput(value),
        min: toLocalInput(now),
        onChange: (e: { target: { value: string } }) => {
          const next = new Date(e.target.value);
          if (!Number.isNaN(next.getTime())) onChange(next);
        },
        style: {
          fontSize: 16,
          padding: 10,
          borderRadius: 12,
          border: `1px solid ${theme.border}`,
          background: theme.card,
          color: theme.text,
        },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
});
