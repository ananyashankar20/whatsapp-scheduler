import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Field } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';
import { showToast } from '@/store/ui-store';

export default function TemplateScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const existing = useAppStore((s) => s.templates.find((t) => t.id === id));
  const saveTemplate = useAppStore((s) => s.saveTemplate);
  const deleteTemplate = useAppStore((s) => s.deleteTemplate);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [text, setText] = useState(existing?.text ?? '');
  const [showErrors, setShowErrors] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: existing ? 'Edit template' : 'New template' });
  }, [navigation, existing]);

  const save = () => {
    if (!title.trim() || !text.trim()) {
      setShowErrors(true);
      return;
    }
    saveTemplate({ id: existing?.id, title: title.trim(), text: text.trim() });
    showToast('Template saved');
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Field
        label="Name"
        placeholder="e.g. Birthday"
        value={title}
        onChangeText={setTitle}
        error={showErrors && !title.trim() ? 'Give it a name' : null}
      />
      <Field
        label="Message"
        placeholder="Happy birthday {name}!"
        multiline
        value={text}
        onChangeText={setText}
        inputStyle={styles.textArea}
        hint="{name} becomes the person's first name."
        error={showErrors && !text.trim() ? 'Write the message' : null}
      />
      <View style={styles.actions}>
        <Button title="Save template" icon="content-save-outline" onPress={save} />
        {existing && (
          <Button
            title="Delete template"
            kind="danger"
            icon="trash-can-outline"
            onPress={() =>
              Alert.alert('Delete template?', existing.title, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    deleteTemplate(existing.id);
                    router.back();
                  },
                },
              ])
            }
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, gap: Spacing.lg },
  textArea: { minHeight: 140, textAlignVertical: 'top' },
  actions: { gap: Spacing.sm },
});
