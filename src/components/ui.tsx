import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode, Ref } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type TextVariant = 'title' | 'heading' | 'body' | 'label' | 'caption';

export function AppText({
  variant = 'body',
  muted,
  color,
  style,
  ...props
}: TextProps & { variant?: TextVariant; muted?: boolean; color?: string }) {
  const theme = useTheme();
  return (
    <Text
      {...props}
      style={[textStyles[variant], { color: color ?? (muted ? theme.textMuted : theme.text) }, style]}
    />
  );
}

export function Icon({ name, size = 22, color }: { name: IconName; size?: number; color?: string }) {
  const theme = useTheme();
  return <MaterialCommunityIcons name={name} size={size} color={color ?? theme.text} />;
}

export function Card({ children, style, onPress, onLongPress }: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
}) {
  const theme = useTheme();
  const base = [styles.card, { backgroundColor: theme.card, borderColor: theme.border }];
  if (!onPress && !onLongPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [base, pressed && { backgroundColor: theme.cardPressed }, style]}>
      {children}
    </Pressable>
  );
}

type ButtonKind = 'primary' | 'secondary' | 'danger' | 'ghost';

export function Button({
  title,
  onPress,
  kind = 'primary',
  icon,
  disabled,
  loading,
  style,
  compact,
}: {
  title: string;
  onPress: () => void;
  kind?: ButtonKind;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}) {
  const theme = useTheme();
  const palette: Record<ButtonKind, { bg: string; fg: string; border?: string }> = {
    primary: { bg: theme.primary, fg: theme.primaryText },
    secondary: { bg: theme.card, fg: theme.text, border: theme.border },
    danger: { bg: theme.dangerSoft, fg: theme.danger },
    ghost: { bg: 'transparent', fg: theme.primary },
  };
  const { bg, fg, border } = palette[kind];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        { backgroundColor: bg, borderColor: border ?? bg, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Icon name={icon} size={compact ? 18 : 20} color={fg} />}
          <Text style={[styles.buttonText, compact && styles.buttonTextCompact, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: IconName;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.primarySoft : theme.card,
          borderColor: selected ? theme.primary : theme.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}>
      {icon && <Icon name={icon} size={16} color={selected ? theme.primary : theme.textMuted} />}
      <Text style={[styles.chipText, { color: selected ? theme.primary : theme.text }]}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({
  name,
  onPress,
  label,
  color,
  size = 24,
}: {
  name: IconName;
  onPress: () => void;
  label: string;
  color?: string;
  size?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.6 : 1 }]}>
      <Icon name={name} size={size} color={color} />
    </Pressable>
  );
}

export function Field({
  label,
  hint,
  error,
  style,
  inputStyle,
  ref,
  ...props
}: TextInputProps & {
  label?: string;
  hint?: string;
  error?: string | null;
  inputStyle?: StyleProp<TextStyle>;
  ref?: Ref<TextInput>;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.field, style as StyleProp<ViewStyle>]}>
      {label && <AppText variant="label">{label}</AppText>}
      <TextInput
        ref={ref}
        placeholderTextColor={theme.textMuted}
        {...props}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.card,
            borderColor: error ? theme.danger : theme.border,
          },
          inputStyle,
        ]}
      />
      {error ? (
        <AppText variant="caption" color={theme.danger}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" muted>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.sectionTitle}>
      <AppText variant="label" muted style={styles.sectionTitleText}>
        {children}
      </AppText>
      {right}
    </View>
  );
}

export function ListRow({
  icon,
  title,
  subtitle,
  value,
  onPress,
  right,
  danger,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  right?: ReactNode;
  danger?: boolean;
}) {
  const theme = useTheme();
  const color = danger ? theme.danger : theme.text;
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.listRow, pressed && { backgroundColor: theme.cardPressed }]}>
      {icon && (
        <View style={[styles.listIcon, { backgroundColor: danger ? theme.dangerSoft : theme.primarySoft }]}>
          <Icon name={icon} size={20} color={danger ? theme.danger : theme.primary} />
        </View>
      )}
      <View style={styles.listText}>
        <AppText color={color}>{title}</AppText>
        {subtitle && (
          <AppText variant="caption" muted>
            {subtitle}
          </AppText>
        )}
      </View>
      {value && (
        <AppText muted numberOfLines={1} style={styles.listValue}>
          {value}
        </AppText>
      )}
      {right ?? (onPress && <Icon name="chevron-right" size={20} color={theme.textMuted} />)}
    </Pressable>
  );
}

export function Divider() {
  const theme = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

export function EmptyState({ icon, title, body, action }: {
  icon: IconName;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.primarySoft }]}>
        <Icon name={icon} size={36} color={theme.primary} />
      </View>
      <AppText variant="heading" style={styles.center}>
        {title}
      </AppText>
      <AppText muted style={styles.center}>
        {body}
      </AppText>
      {action}
    </View>
  );
}

export function Badge({ label, tone = 'neutral', icon }: {
  label: string;
  tone?: 'neutral' | 'primary' | 'warning' | 'danger';
  icon?: IconName;
}) {
  const theme = useTheme();
  const tones = {
    neutral: { bg: theme.cardPressed, fg: theme.textMuted },
    primary: { bg: theme.primarySoft, fg: theme.primary },
    warning: { bg: theme.warningSoft, fg: theme.warning },
    danger: { bg: theme.dangerSoft, fg: theme.danger },
  };
  const { bg, fg } = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {icon && <Icon name={icon} size={13} color={fg} />}
      <Text style={[styles.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
}

const AVATAR_COLORS = ['#0E9F6E', '#2563EB', '#9333EA', '#DB2777', '#EA580C', '#0891B2', '#65A30D', '#B45309'];

export function Avatar({ name, size = 44, group }: { name: string; size?: number; group?: boolean }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter((w) => /^[^+\d(]/.test(w))
      .slice(0, 2)
      .map((w) => Array.from(w)[0]?.toUpperCase() ?? '')
      .join('') || '#';
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) | 0;
  const bg = AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      {group ? (
        <MaterialCommunityIcons name="account-group" size={size * 0.5} color="#fff" />
      ) : (
        <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{initials}</Text>
      )}
    </View>
  );
}

const textStyles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  heading: { fontSize: 18, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 22 },
  label: { fontSize: 14, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18 },
});

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
  },
  button: {
    minHeight: 52,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
  },
  buttonCompact: { minHeight: 40, paddingHorizontal: Spacing.md },
  buttonText: { fontSize: 16, fontWeight: '700' },
  buttonTextCompact: { fontSize: 14 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  iconButton: { padding: 6 },
  field: { gap: 6 },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 16,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitleText: { textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 12 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    minHeight: 56,
  },
  listIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  listText: { flex: 1, gap: 2 },
  listValue: { maxWidth: '45%' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
  empty: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.xl },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700' },
});
