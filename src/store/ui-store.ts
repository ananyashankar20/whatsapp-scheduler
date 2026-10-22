import { create } from 'zustand';

import type { Recipient } from '@/store/types';

// Short-lived state that isn't saved: the toast at the bottom of the screen,
// and choices made on the contacts/country screens for the compose screen.

type Toast = { id: number; text: string; actionLabel?: string; onAction?: () => void };

type UiState = {
  toast: Toast | null;
  showToast: (text: string, action?: { label: string; onPress: () => void }) => void;
  hideToast: () => void;

  pickedRecipient: Recipient | null;
  setPickedRecipient: (recipient: Recipient | null) => void;

  /** Country chosen on the country screen for the compose screen's number field. */
  pickedCountry: string | null;
  setPickedCountry: (code: string | null) => void;
};

export const useUiStore = create<UiState>()((set) => ({
  toast: null,
  showToast: (text, action) =>
    set({ toast: { id: Date.now(), text, actionLabel: action?.label, onAction: action?.onPress } }),
  hideToast: () => set({ toast: null }),

  pickedRecipient: null,
  setPickedRecipient: (pickedRecipient) => set({ pickedRecipient }),

  pickedCountry: null,
  setPickedCountry: (pickedCountry) => set({ pickedCountry }),
}));

export const showToast = (...args: Parameters<UiState['showToast']>) => useUiStore.getState().showToast(...args);
