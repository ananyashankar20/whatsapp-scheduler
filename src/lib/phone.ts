// Phone numbers are stored as digits only, in international form without the
// leading "+" (for example "919876543210"). That's the format WhatsApp links use.

const MIN_DIGITS = 8;
const MAX_DIGITS = 15; // E.164 limit

/**
 * Turns whatever the user typed (or what's saved in their address book) into
 * international digits. Numbers without a country code get `defaultCallingCode`.
 * Returns null when the result can't be a real phone number.
 */
export function toInternational(raw: string, defaultCallingCode: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const hasPlus = trimmed.startsWith('+');
  let digits = trimmed.replace(/\D/g, '');
  if (!digits) return null;

  if (!hasPlus) {
    if (digits.startsWith('00')) {
      // 00 is the international dialling prefix in most countries.
      digits = digits.slice(2);
    } else {
      // A leading 0 is a local "trunk" prefix (e.g. 098765 43210 in India).
      digits = digits.replace(/^0+/, '');
      const alreadyHasCode = digits.length > 10 && digits.startsWith(defaultCallingCode);
      if (!alreadyHasCode) digits = defaultCallingCode + digits;
    }
  }

  if (digits.length < MIN_DIGITS || digits.length > MAX_DIGITS) return null;
  return digits;
}

/** "+919876543210" style, for showing on screen. */
export function formatPhone(digits: string): string {
  return `+${digits}`;
}
