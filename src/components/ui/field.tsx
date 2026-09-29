import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';

export interface FieldProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Field({ children, style }: FieldProps) {
  return <View style={[styles.field, style]}>{children}</View>;
}

export interface LabelProps {
  children: React.ReactNode;
  isRequired?: boolean;
  style?: StyleProp<TextStyle>;
}

export function Label({ children, isRequired, style }: LabelProps) {
  return (
    <View style={styles.labelRow}>
      <Text style={[styles.label, style]}>{children}</Text>
      {isRequired && <Text style={styles.requiredMark}>*</Text>}
    </View>
  );
}

export interface DescriptionProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export function Description({ children, style }: DescriptionProps) {
  return <Text style={[styles.description, style]}>{children}</Text>;
}

export interface ErrorMessageProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export function ErrorMessage({ children, style }: ErrorMessageProps) {
  return <Text style={[styles.errorMessage, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  requiredMark: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    color: '#64748B',
  },
  errorMessage: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
});
