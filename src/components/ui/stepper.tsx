import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface StepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

export function Stepper({
  value,
  onIncrement,
  onDecrement,
  min = 1,
  max = 99,
  size = 'md',
  style,
}: StepperProps) {
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <View style={[styles.container, styles[`size_${size}`], style]}>
      <TouchableOpacity
        onPress={onDecrement}
        disabled={!canDecrement}
        activeOpacity={0.7}
        style={[
          styles.btn,
          styles[`btnSize_${size}`],
          !canDecrement && styles.btnDisabled,
        ]}
      >
        <Ionicons
          name="remove"
          size={size === 'sm' ? 14 : size === 'md' ? 16 : 18}
          color={canDecrement ? '#334155' : '#CBD5E1'}
        />
      </TouchableOpacity>

      <Text style={[styles.valueText, styles[`textSize_${size}`]]}>{value}</Text>

      <TouchableOpacity
        onPress={onIncrement}
        disabled={!canIncrement}
        activeOpacity={0.7}
        style={[
          styles.btn,
          styles[`btnSize_${size}`],
          !canIncrement && styles.btnDisabled,
        ]}
      >
        <Ionicons
          name="add"
          size={size === 'sm' ? 14 : size === 'md' ? 16 : 18}
          color={canIncrement ? '#334155' : '#CBD5E1'}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
  },
  size_sm: {
    paddingHorizontal: 4,
    height: 30,
  },
  size_md: {
    paddingHorizontal: 6,
    height: 38,
  },
  size_lg: {
    paddingHorizontal: 8,
    height: 46,
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      } as any,
    }),
  },
  btnSize_sm: {
    width: 22,
    height: 22,
  },
  btnSize_md: {
    width: 28,
    height: 28,
  },
  btnSize_lg: {
    width: 34,
    height: 34,
  },
  btnDisabled: {
    opacity: 0.4,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      } as any,
    }),
  },
  valueText: {
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    minWidth: 26,
    paddingHorizontal: 4,
  },
  textSize_sm: {
    fontSize: 13,
  },
  textSize_md: {
    fontSize: 15,
  },
  textSize_lg: {
    fontSize: 17,
  },
});
