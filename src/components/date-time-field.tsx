import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/ui';
import { formatDay, formatTime } from '@/lib/format';

type Props = { value: Date; onChange: (date: Date) => void; now: Date };

/** Date and time chips that open the phone's own pickers. */
export function DateTimeField({ value, onChange, now }: Props) {
  if (Platform.OS === 'ios') {
    return (
      <View style={styles.row}>
        <DateTimePicker
          value={value}
          mode="datetime"
          minimumDate={now}
          onValueChange={(_e, date) => onChange(date)}
        />
      </View>
    );
  }

  const pickDate = () =>
    DateTimePickerAndroid.open({
      value,
      mode: 'date',
      minimumDate: now,
      onValueChange: (_e, date) => {
        const next = new Date(value);
        next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        onChange(next);
      },
    });

  const pickTime = () =>
    DateTimePickerAndroid.open({
      value,
      mode: 'time',
      onValueChange: (_e, date) => {
        const next = new Date(value);
        next.setHours(date.getHours(), date.getMinutes(), 0, 0);
        onChange(next);
      },
    });

  return (
    <View style={styles.row}>
      <Chip icon="calendar" label={formatDay(value, now)} onPress={pickDate} selected />
      <Chip icon="clock-outline" label={formatTime(value)} onPress={pickTime} selected />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
});
