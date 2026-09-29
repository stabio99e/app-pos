import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
} from 'react-native';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outline' | 'flat' | 'active';
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  activeOpacity?: number;
}

export function Card({
  children,
  variant = 'default',
  style,
  onPress,
  activeOpacity = 0.8,
}: CardProps) {
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={[
          styles.card,
          styles[variant],
          styles.clickable,
          style,
        ]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, styles[variant], style]}>
      {children}
    </View>
  );
}

export function CardHeader({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function CardTitle({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function CardDescription({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[styles.description, style]}>{children}</Text>;
}

export function CardContent({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.content, style]}>{children}</View>;
}

export function CardFooter({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
      } as any,
    }),
  },
  clickable: {
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
    }),
  },
  default: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      } as any,
    }),
  },
  elevated: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      } as any,
    }),
  },
  outline: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1.5,
  },
  flat: {
    backgroundColor: '#F8FAFC',
    borderColor: 'transparent',
    borderWidth: 0,
  },
  active: {
    backgroundColor: '#FFFFFF',
    borderColor: '#2563EB',
    borderWidth: 1.5,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.15)',
      } as any,
    }),
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  content: {
    padding: 16,
  },
  footer: {
    padding: 16,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
