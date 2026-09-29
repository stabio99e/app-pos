import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';

export type BadgeIntent =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline'
  | 'peach'
  | 'mint'
  | 'pink'
  | 'purple'
  | 'amber'
  | 'blue'
  | 'gray';

export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeShape = 'pill' | 'rounded';

export interface BadgeProps {
  intent?: BadgeIntent;
  size?: BadgeSize;
  shape?: BadgeShape;
  dot?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Badge({
  intent = 'secondary',
  size = 'sm',
  shape = 'pill',
  dot = false,
  prefix,
  suffix,
  children,
  style,
  textStyle,
}: BadgeProps) {
  return (
    <View
      style={[
        styles.base,
        styles[intent],
        styles[`size_${size}`],
        styles[`shape_${shape}`],
        style,
      ]}
    >
      {dot && <View style={[styles.dot, styles[`dot_${intent}`]]} />}
      {prefix && <View style={styles.prefixContainer}>{prefix}</View>}
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.text,
            styles[`text_${intent}`],
            styles[`textSize_${size}`],
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
      {suffix && <View style={styles.suffixContainer}>{suffix}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  prefixContainer: {
    marginRight: 5,
  },
  suffixContainer: {
    marginLeft: 5,
  },
  shape_pill: {
    borderRadius: 9999,
  },
  shape_rounded: {
    borderRadius: 6,
  },
  size_sm: {
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  size_md: {
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  size_lg: {
    paddingVertical: 7,
    paddingHorizontal: 16,
  },

  // Color Intents
  primary: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
  },
  secondary: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  success: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
  },
  warning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
  },
  danger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
  },
  info: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
  },
  outline: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  // Custom design pill colors
  peach: {
    backgroundColor: '#FFF4EE',
    borderColor: '#FED7AA',
    borderWidth: 0,
  },
  mint: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 0,
  },
  pink: {
    backgroundColor: '#FDF2F8',
    borderColor: '#FBCFE8',
    borderWidth: 0,
  },
  purple: {
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF',
    borderWidth: 0,
  },
  amber: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 0,
  },
  blue: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 0,
  },
  gray: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    borderWidth: 0,
  },

  // Text colors
  text: {
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  textSize_sm: {
    fontSize: 11,
  },
  textSize_md: {
    fontSize: 12,
  },
  textSize_lg: {
    fontSize: 14,
  },

  text_primary: { color: '#2563EB' },
  text_secondary: { color: '#475569' },
  text_success: { color: '#059669' },
  text_warning: { color: '#D97706' },
  text_danger: { color: '#DC2626' },
  text_info: { color: '#0284C7' },
  text_outline: { color: '#475569' },
  text_peach: { color: '#EA580C' },
  text_mint: { color: '#0D9488' },
  text_pink: { color: '#DB2777' },
  text_purple: { color: '#9333EA' },
  text_amber: { color: '#D97706' },
  text_blue: { color: '#2563EB' },
  text_gray: { color: '#6B7280' },

  // Dots
  dot_primary: { backgroundColor: '#2563EB' },
  dot_secondary: { backgroundColor: '#64748B' },
  dot_success: { backgroundColor: '#10B981' },
  dot_warning: { backgroundColor: '#F59E0B' },
  dot_danger: { backgroundColor: '#EF4444' },
  dot_info: { backgroundColor: '#0EA5E9' },
  dot_outline: { backgroundColor: '#94A3B8' },
  dot_peach: { backgroundColor: '#EA580C' },
  dot_mint: { backgroundColor: '#0D9488' },
  dot_pink: { backgroundColor: '#DB2777' },
  dot_purple: { backgroundColor: '#9333EA' },
  dot_amber: { backgroundColor: '#D97706' },
  dot_blue: { backgroundColor: '#2563EB' },
  dot_gray: { backgroundColor: '#9CA3AF' },
});
