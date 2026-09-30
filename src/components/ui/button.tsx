import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
} from 'react-native';

export type ButtonIntent =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'plain'
  | 'danger'
  | 'success'
  | 'dark';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';
export type ButtonShape = 'rounded' | 'pill' | 'circle' | 'square';

export interface ButtonProps {
  intent?: ButtonIntent;
  size?: ButtonSize;
  shape?: ButtonShape;
  isDisabled?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  activeOpacity?: number;
  accessibilityLabel?: string;
}

export function Button({
  intent = 'primary',
  size = 'md',
  shape = 'rounded',
  isDisabled,
  disabled,
  isLoading,
  prefix,
  suffix,
  children,
  style,
  textStyle,
  onPress,
  activeOpacity = 0.75,
  accessibilityLabel,
}: ButtonProps) {
  const isButtonDisabled = isDisabled || disabled || isLoading;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={isButtonDisabled}
      onPress={onPress}
      activeOpacity={activeOpacity}
      style={[
        styles.base,
        styles[intent],
        styles[`size_${size}`],
        styles[`shape_${shape}`],
        isButtonDisabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={
            intent === 'outline' || intent === 'plain' || intent === 'secondary'
              ? '#2563EB'
              : '#FFFFFF'
          }
        />
      ) : (
        <>
          {prefix && <>{prefix}</>}
          {React.isValidElement(children) && typeof children.type !== 'string' ? (
            children
          ) : (
            <Text
              style={[
                styles.textBase,
                styles[`text_${intent}`],
                styles[`textSize_${size}`],
                (intent === 'primary' || intent === 'danger' || intent === 'success' || intent === 'dark') && {
                  color: '#FFFFFF',
                  fontWeight: '700',
                },
                prefix ? { marginLeft: 8 } : null,
                suffix ? { marginRight: 8 } : null,
                textStyle,
              ]}
            >
              {children}
            </Text>
          )}
          {suffix && <>{suffix}</>}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 0.15s ease-in-out',
      } as any,
    }),
  },
  // Intents
  primary: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
    borderWidth: 1,
  },
  secondary: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  outline: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1.5,
  },
  plain: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
  },
  danger: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  success: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  dark: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.5,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      } as any,
    }),
  },

  // Shapes
  shape_rounded: {
    borderRadius: 12,
  },
  shape_pill: {
    borderRadius: 9999,
  },
  shape_circle: {
    borderRadius: 9999,
    aspectRatio: 1,
  },
  shape_square: {
    borderRadius: 0,
  },

  // Sizes
  size_sm: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 32,
  },
  size_md: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  size_lg: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 52,
  },
  size_icon: {
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Text Styles
  textBase: {
    fontWeight: '600',
    textAlign: 'center',
  },
  text_primary: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  text_secondary: {
    color: '#334155',
  },
  text_outline: {
    color: '#334155',
  },
  text_plain: {
    color: '#475569',
  },
  text_danger: {
    color: '#FFFFFF',
  },
  text_success: {
    color: '#FFFFFF',
  },
  text_dark: {
    color: '#FFFFFF',
  },

  textSize_sm: {
    fontSize: 13,
  },
  textSize_md: {
    fontSize: 14,
  },
  textSize_lg: {
    fontSize: 16,
    fontWeight: '700',
  },
  textSize_icon: {
    fontSize: 14,
  },
});
