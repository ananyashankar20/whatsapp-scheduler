import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import ScheduleForm from './src/components/ScheduleForm';
import MessageList from './src/components/MessageList';
import { ScheduledMessage } from './src/types';

// App is the top-level component: the whole screen. It owns the list of
// messages and passes pieces of it down to the form and the list.
export default function App() {
  // For now the list lives only in memory, so it resets when the app reloads.
  // A later step saves it to a backend instead.
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);

  function addMessage(message: ScheduledMessage) {
    // Make a new array (never edit state in place), sorted soonest first.
    setMessages((current) =>
      [...current, message].sort((a, b) => a.sendAt.getTime() - b.sendAt.getTime()),
    );
  }

  function deleteMessage(id: string) {
    setMessages((current) => current.filter((m) => m.id !== id));
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>WhatsApp Scheduler</Text>
            <ScheduleForm onSchedule={addMessage} />
            <Text style={styles.heading}>Scheduled ({messages.length})</Text>
            <MessageList messages={messages} onDelete={deleteMessage} />
          </ScrollView>
        </KeyboardAvoidingView>
        <StatusBar style="dark" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE5DD', // WhatsApp chat background
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
});
