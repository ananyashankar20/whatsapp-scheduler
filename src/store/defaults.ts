import { getLocales } from 'expo-localization';

import { countryByCode } from '@/lib/countries';
import type { Settings, Template } from '@/store/types';

function deviceCountry(): string {
  try {
    const region = getLocales()[0]?.regionCode;
    if (region && countryByCode(region)) return region;
  } catch {
    // Fall through to the default below.
  }
  return 'IN';
}

export function defaultSettings(): Settings {
  return {
    countryCode: deviceCountry(),
    followUpMinutes: 15,
    theme: 'system',
    onboarded: false,
  };
}

export const DEFAULT_TEMPLATES: Template[] = [
  { id: 'tpl-birthday', title: 'Birthday', text: 'Happy birthday {name}! 🎂 Wishing you a wonderful year ahead.' },
  { id: 'tpl-anniversary', title: 'Anniversary', text: 'Happy anniversary {name}! 💐 Have a lovely day.' },
  { id: 'tpl-morning', title: 'Good morning', text: 'Good morning {name}! ☀️ Have a great day.' },
  { id: 'tpl-meeting', title: 'Meeting reminder', text: 'Hi {name}, just a reminder about our meeting today. See you soon!' },
  { id: 'tpl-payment', title: 'Payment reminder', text: 'Hi {name}, a gentle reminder that the payment is due today. Thank you!' },
  { id: 'tpl-festival', title: 'Festival wishes', text: 'Wishing you and your family a very happy festival, {name}! ✨' },
];
