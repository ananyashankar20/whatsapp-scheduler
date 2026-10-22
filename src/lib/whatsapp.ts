import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import type { Recipient } from '@/store/types';

/** whatsapp://send?... opens the app directly, pre-filled. */
export function appUrl(recipient: Recipient, text: string): string {
  // Built by hand: React Native's URLSearchParams doesn't support every method.
  const phone = recipient.kind === 'phone' ? `phone=${recipient.phone}&` : '';
  return `whatsapp://send?${phone}text=${encodeURIComponent(text)}`;
}

/** wa.me works anywhere, including the browser, as a fallback. */
export function webUrl(recipient: Recipient, text: string): string {
  const path = recipient.kind === 'phone' ? recipient.phone : '';
  return `https://wa.me/${path}?text=${encodeURIComponent(text)}`;
}

/**
 * Opens WhatsApp with the chat and message ready. If both WhatsApp and
 * WhatsApp Business are installed, Android asks which one to use.
 * Returns false if nothing could be opened.
 */
export async function openWhatsApp(recipient: Recipient, text: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    window.open(webUrl(recipient, text), '_blank');
    return true;
  }
  try {
    await Linking.openURL(appUrl(recipient, text));
    return true;
  } catch {
    // WhatsApp isn't installed: wa.me shows a page with download links.
    try {
      await Linking.openURL(webUrl(recipient, text));
      return true;
    } catch {
      return false;
    }
  }
}
