import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScheduledMessage } from '../types';

// "Props" are the inputs a component receives from its parent.
// This form gets one: a function to call when the user taps "Schedule".
type Props = {
  onSchedule: (message: ScheduledMessage) => void;
};

export default function ScheduleForm({ onSchedule }: Props) {
  // useState gives the component a "memory". Each call returns the current
  // value and a setter; calling the setter re-draws the screen with the new value.
  const [recipient, setRecipient] = useState('');
  const [text, setText] = useState('');
  const [sendAt, setSendAt] = useState(() => new Date(Date.now() + 60 * 60 * 1000)); // default: in 1 hour
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);

  function handleSubmit() {
    if (!recipient.trim() || !text.trim()) {
      Alert.alert('Missing info', 'Please fill in both the recipient and the message.');
      return;
    }
    if (sendAt <= new Date()) {
      Alert.alert('Time is in the past', 'Pick a time in the future.');
      return;
    }
    onSchedule({
      id: String(Date.now()),
      recipient: recipient.trim(),
      text: text.trim(),
      sendAt,
    });
    // Clear the form for the next message.
    setRecipient('');
    setText('');
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>To (phone number)</Text>
      <TextInput
        style={styles.input}
        placeholder="+91 98765 43210"
        keyboardType="phone-pad"
        value={recipient}
        onChangeText={setRecipient}
      />

      <Text style={styles.label}>Message</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Happy birthday! 🎉"
        multiline
        value={text}
        onChangeText={setText}
      />

      <Text style={styles.label}>Send at</Text>
      {Platform.OS === 'ios' ? (
        // On iPhone the picker is a small tappable pill, so we can always show it.
        <View style={styles.row}>
          <DateTimePicker
            value={sendAt}
            mode="datetime"
            minimumDate={new Date()}
            onValueChange={(_event, date) => setSendAt(date)}
          />
        </View>
      ) : (
        // On Android the picker is a pop-up dialog, so we open it on demand,
        // one for the date and one for the time.
        <View style={styles.row}>
          <Pressable style={styles.chip} onPress={() => setPickerMode('date')}>
            <Text>{sendAt.toLocaleDateString()}</Text>
          </Pressable>
          <Pressable style={styles.chip} onPress={() => setPickerMode('time')}>
            <Text>{sendAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </Pressable>
          {pickerMode && (
            <DateTimePicker
              value={sendAt}
              mode={pickerMode}
              minimumDate={new Date()}
              onValueChange={(_event, date) => {
                setPickerMode(null);
                setSendAt(date);
              }}
              onDismiss={() => setPickerMode(null)}
            />
          )}
        </View>
      )}

      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Schedule message</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  label: {
    fontWeight: '600',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: '#25D366', // WhatsApp green
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
