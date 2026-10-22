export const Brand = {
  name: 'ChatLater',
  tagline: 'Schedule WhatsApp messages',
  green: '#0E9F6E',
};

const light = {
  background: '#F4F6F8',
  card: '#FFFFFF',
  cardPressed: '#EEF1F4',
  text: '#0B1215',
  textMuted: '#5B6670',
  border: '#E1E6EA',
  primary: '#0E9F6E',
  primaryText: '#FFFFFF',
  primarySoft: '#DDF5EB',
  warning: '#B45309',
  warningSoft: '#FEF3C7',
  danger: '#DC2626',
  dangerSoft: '#FDE8E8',
  overlay: 'rgba(11,18,21,0.45)',
  toast: '#1F2A30',
  toastText: '#FFFFFF',
};

const dark: typeof light = {
  background: '#0B0F12',
  card: '#151B20',
  cardPressed: '#1C242A',
  text: '#ECEFF1',
  textMuted: '#9AA5AE',
  border: '#252E35',
  primary: '#22C38E',
  primaryText: '#05140E',
  primarySoft: '#12372A',
  warning: '#FBBF24',
  warningSoft: '#3A2C0A',
  danger: '#F87171',
  dangerSoft: '#3B1717',
  overlay: 'rgba(0,0,0,0.6)',
  toast: '#E8ECEF',
  toastText: '#0B1215',
};

export const Colors = { light, dark };
export type Palette = typeof light;

export const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const Radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;
