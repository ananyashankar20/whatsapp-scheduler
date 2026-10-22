export type Country = {
  code: string; // ISO 3166 region code, e.g. "IN"
  name: string;
  dial: string; // calling code without "+"
};

// The most common WhatsApp markets. Anyone else can still type a full
// number with "+" and it will work.
export const COUNTRIES: Country[] = [
  { code: 'IN', name: 'India', dial: '91' },
  { code: 'US', name: 'United States', dial: '1' },
  { code: 'GB', name: 'United Kingdom', dial: '44' },
  { code: 'AE', name: 'United Arab Emirates', dial: '971' },
  { code: 'SA', name: 'Saudi Arabia', dial: '966' },
  { code: 'PK', name: 'Pakistan', dial: '92' },
  { code: 'BD', name: 'Bangladesh', dial: '880' },
  { code: 'LK', name: 'Sri Lanka', dial: '94' },
  { code: 'NP', name: 'Nepal', dial: '977' },
  { code: 'ID', name: 'Indonesia', dial: '62' },
  { code: 'MY', name: 'Malaysia', dial: '60' },
  { code: 'SG', name: 'Singapore', dial: '65' },
  { code: 'PH', name: 'Philippines', dial: '63' },
  { code: 'TH', name: 'Thailand', dial: '66' },
  { code: 'VN', name: 'Vietnam', dial: '84' },
  { code: 'AU', name: 'Australia', dial: '61' },
  { code: 'NZ', name: 'New Zealand', dial: '64' },
  { code: 'CA', name: 'Canada', dial: '1' },
  { code: 'MX', name: 'Mexico', dial: '52' },
  { code: 'BR', name: 'Brazil', dial: '55' },
  { code: 'AR', name: 'Argentina', dial: '54' },
  { code: 'CO', name: 'Colombia', dial: '57' },
  { code: 'CL', name: 'Chile', dial: '56' },
  { code: 'PE', name: 'Peru', dial: '51' },
  { code: 'DE', name: 'Germany', dial: '49' },
  { code: 'FR', name: 'France', dial: '33' },
  { code: 'ES', name: 'Spain', dial: '34' },
  { code: 'IT', name: 'Italy', dial: '39' },
  { code: 'NL', name: 'Netherlands', dial: '31' },
  { code: 'PT', name: 'Portugal', dial: '351' },
  { code: 'IE', name: 'Ireland', dial: '353' },
  { code: 'TR', name: 'Türkiye', dial: '90' },
  { code: 'RU', name: 'Russia', dial: '7' },
  { code: 'EG', name: 'Egypt', dial: '20' },
  { code: 'NG', name: 'Nigeria', dial: '234' },
  { code: 'KE', name: 'Kenya', dial: '254' },
  { code: 'ZA', name: 'South Africa', dial: '27' },
  { code: 'QA', name: 'Qatar', dial: '974' },
  { code: 'KW', name: 'Kuwait', dial: '965' },
  { code: 'OM', name: 'Oman', dial: '968' },
  { code: 'BH', name: 'Bahrain', dial: '973' },
];

/** Builds the flag emoji from the two-letter region code. */
export function flagOf(code: string): string {
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export function countryByCode(code: string | null | undefined): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}
