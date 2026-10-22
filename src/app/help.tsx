import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Card } from '@/components/ui';
import { Spacing } from '@/constants/theme';

const FAQ: { q: string; a: string }[] = [
  {
    q: 'How does sending work?',
    a: 'At the time you chose, ChatLater shows a notification. Tap it (or its “Send now” button) and WhatsApp opens with the chat and your message already typed. Press send in WhatsApp and you’re done.',
  },
  {
    q: 'Why do I have to press send myself?',
    a: 'WhatsApp doesn’t let other apps send from your personal account. Apps that tap “send” for you break WhatsApp’s rules and can get your number banned. One tap keeps your account safe.',
  },
  {
    q: 'Can I message a group?',
    a: 'Yes. Choose “Any chat or group” when scheduling. At send time WhatsApp opens its chat list with your message ready, and you pick the group.',
  },
  {
    q: 'What does {name} do?',
    a: 'It’s replaced with the person’s first name from your contacts, so one template works for everyone: “Happy birthday {name}!” becomes “Happy birthday Priya!”.',
  },
  {
    q: 'My reminder came late',
    a: 'Some phones delay notifications to save battery. In Settings, allow “On-time reminders”, and in your phone’s battery settings set ChatLater to “Unrestricted” or “Don’t optimise”.',
  },
  {
    q: 'I missed a reminder',
    a: 'Missed messages stay at the top of the Scheduled tab under “Ready to send” until you send or skip them.',
  },
  {
    q: 'Does it work with WhatsApp Business?',
    a: 'Yes. If you have both WhatsApp and WhatsApp Business, Android asks which one to open. Choose “Always” to skip the question next time.',
  },
];

export default function HelpScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      {FAQ.map((item) => (
        <Card key={item.q} style={styles.card}>
          <AppText variant="label">{item.q}</AppText>
          <View>
            <AppText muted>{item.a}</AppText>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  card: { gap: Spacing.sm },
});
