import { useColorScheme } from 'react-native';

import { Colors, type Palette } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';

export function useIsDark(): boolean {
  const system = useColorScheme();
  const preference = useAppStore((s) => s.settings.theme);
  return preference === 'system' ? system === 'dark' : preference === 'dark';
}

export function useTheme(): Palette {
  return useIsDark() ? Colors.dark : Colors.light;
}
