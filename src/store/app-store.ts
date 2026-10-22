import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { newId } from '@/lib/id';
import { pendingOccurrence } from '@/lib/status';
import { DEFAULT_TEMPLATES, defaultSettings } from '@/store/defaults';
import type {
  HistoryEntry,
  MessageInput,
  ScheduledMessage,
  Settings,
  Template,
} from '@/store/types';

const MAX_HISTORY = 500;

type AppState = {
  messages: ScheduledMessage[];
  history: HistoryEntry[];
  templates: Template[];
  settings: Settings;

  addMessage: (input: MessageInput) => string;
  updateMessage: (id: string, input: MessageInput) => void;
  deleteMessage: (id: string) => void;
  /** Records the pending occurrence (or `occurrence`) as sent or skipped. */
  handleMessage: (id: string, outcome: HistoryEntry['outcome'], occurrence?: Date) => void;
  snoozeMessage: (id: string, minutes: number) => Date | null;
  stopRepeating: (id: string) => void;

  deleteHistoryEntry: (id: string) => void;
  clearHistory: () => void;

  saveTemplate: (template: Omit<Template, 'id'> & { id?: string }) => void;
  deleteTemplate: (id: string) => void;

  updateSettings: (patch: Partial<Settings>) => void;
  resetEverything: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      messages: [],
      history: [],
      templates: DEFAULT_TEMPLATES,
      settings: defaultSettings(),

      addMessage: (input) => {
        const now = new Date().toISOString();
        const id = newId();
        const message: ScheduledMessage = { ...input, id, active: true, createdAt: now, updatedAt: now };
        set((s) => ({ messages: [...s.messages, message] }));
        return id;
      },

      updateMessage: (id, input) => {
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === id
              ? // Editing starts the schedule fresh from the new time.
                { ...m, ...input, active: true, lastHandled: undefined, snoozedUntil: undefined, updatedAt: new Date().toISOString() }
              : m,
          ),
        }));
      },

      deleteMessage: (id) => {
        set((s) => ({ messages: s.messages.filter((m) => m.id !== id) }));
      },

      handleMessage: (id, outcome, occurrence) => {
        const message = get().messages.find((m) => m.id === id);
        if (!message) return;
        const now = new Date();
        const occ = occurrence ?? pendingOccurrence(message, now) ?? now;
        const entry: HistoryEntry = {
          id: newId(),
          messageId: id,
          recipient: message.recipient,
          text: message.text,
          occurrence: occ.toISOString(),
          handledAt: now.toISOString(),
          outcome,
        };
        set((s) => ({
          history: [entry, ...s.history].slice(0, MAX_HISTORY),
          messages: s.messages.map((m) => {
            if (m.id !== id) return m;
            if (m.repeat === 'none') return { ...m, active: false, snoozedUntil: undefined, lastHandled: occ.toISOString() };
            const last = m.lastHandled && new Date(m.lastHandled) > occ ? m.lastHandled : occ.toISOString();
            return { ...m, lastHandled: last, snoozedUntil: undefined };
          }),
        }));
      },

      snoozeMessage: (id, minutes) => {
        const until = new Date(Date.now() + minutes * 60_000);
        let found = false;
        set((s) => ({
          messages: s.messages.map((m) => {
            if (m.id !== id) return m;
            found = true;
            return { ...m, snoozedUntil: until.toISOString() };
          }),
        }));
        return found ? until : null;
      },

      stopRepeating: (id) => {
        set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, active: false, snoozedUntil: undefined } : m)) }));
      },

      deleteHistoryEntry: (id) => set((s) => ({ history: s.history.filter((h) => h.id !== id) })),
      clearHistory: () => set({ history: [] }),

      saveTemplate: (template) => {
        set((s) => {
          if (template.id && s.templates.some((t) => t.id === template.id)) {
            return { templates: s.templates.map((t) => (t.id === template.id ? { ...t, ...template, id: t.id } : t)) };
          }
          return { templates: [...s.templates, { title: template.title, text: template.text, id: newId() }] };
        });
      },
      deleteTemplate: (id) => set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      resetEverything: () =>
        set({
          messages: [],
          history: [],
          templates: DEFAULT_TEMPLATES,
          settings: { ...defaultSettings(), onboarded: true },
        }),
    }),
    {
      name: 'chatlater-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ messages, history, templates, settings }) => ({ messages, history, templates, settings }),
      // Settings added in later versions get their defaults.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        return { ...current, ...p, settings: { ...current.settings, ...p.settings } };
      },
    },
  ),
);

/** Resolves once saved data has been loaded from the phone's storage. */
export function whenHydrated(): Promise<void> {
  if (useAppStore.persist.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const unsub = useAppStore.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}
