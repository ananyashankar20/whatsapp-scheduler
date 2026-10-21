import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScheduledMessage } from '../types';

type Props = {
  messages: ScheduledMessage[];
  onDelete: (id: string) => void;
};

export default function MessageList({ messages, onDelete }: Props) {
  if (messages.length === 0) {
    return <Text style={styles.empty}>No messages scheduled yet.</Text>;
  }

  // .map() turns each piece of data into a piece of UI. The "key" lets React
  // keep track of which row is which when the list changes.
  return (
    <View style={styles.list}>
      {messages.map((message) => (
        <View key={message.id} style={styles.item}>
          <View style={styles.itemText}>
            <Text style={styles.recipient}>{message.recipient}</Text>
            <Text numberOfLines={2}>{message.text}</Text>
            <Text style={styles.time}>{message.sendAt.toLocaleString()}</Text>
          </View>
          <Pressable onPress={() => onDelete(message.id)} hitSlop={10}>
            <Text style={styles.delete}>Delete</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  empty: {
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
  recipient: {
    fontWeight: '600',
  },
  time: {
    color: '#128C7E',
    fontSize: 13,
  },
  delete: {
    color: '#d33',
  },
});
