import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<any>;
}

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search something sweet on your mind...',
  onClear,
  iconPosition = 'right',
  style,
  inputStyle,
}: SearchFieldProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View
      style={[
        styles.container,
        isFocused && styles.focused,
        style,
      ]}
    >
      {iconPosition === 'left' && (
        <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.leftIcon} />
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[styles.input, inputStyle]}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.clearBtn}
        >
          <Ionicons name="close-circle" size={16} color="#94A3B8" />
        </TouchableOpacity>
      )}
      {iconPosition === 'right' && (
        <TouchableOpacity style={styles.searchIconBtn}>
          <Ionicons name="search" size={18} color="#64748B" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    height: 48,
    width: '100%',
    ...Platform.select({
      web: {
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      } as any,
    }),
  },
  focused: {
    borderColor: '#2563EB',
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)',
      } as any,
    }),
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  leftIcon: {
    marginRight: 10,
  },
  clearBtn: {
    padding: 4,
    marginRight: 4,
  },
  searchIconBtn: {
    padding: 4,
    marginLeft: 4,
  },
});
