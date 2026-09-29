import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { Field, Label, Description, ErrorMessage } from './field';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  description?: string;
  errorMessage?: string;
  isRequired?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  shape?: 'rounded' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export function TextField({
  label,
  description,
  errorMessage,
  isRequired,
  prefix,
  suffix,
  shape = 'rounded',
  size = 'md',
  containerStyle,
  inputContainerStyle,
  inputStyle,
  onFocus,
  onBlur,
  ...props
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isInvalid = !!errorMessage;

  return (
    <Field style={containerStyle}>
      {label && <Label isRequired={isRequired}>{label}</Label>}
      <View
        style={[
          styles.inputContainer,
          styles[`shape_${shape}`],
          styles[`size_${size}`],
          isFocused && styles.focused,
          isInvalid && styles.invalid,
          inputContainerStyle,
        ]}
      >
        {prefix && <View style={styles.prefixContainer}>{prefix}</View>}
        <TextInput
          placeholderTextColor="#94A3B8"
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, inputStyle]}
          {...props}
        />
        {suffix && <View style={styles.suffixContainer}>{suffix}</View>}
      </View>
      {description && !errorMessage && <Description>{description}</Description>}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </Field>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      } as any,
    }),
  },
  shape_rounded: {
    borderRadius: 12,
  },
  shape_pill: {
    borderRadius: 9999,
  },
  size_sm: {
    height: 36,
    paddingHorizontal: 12,
  },
  size_md: {
    height: 46,
    paddingHorizontal: 16,
  },
  size_lg: {
    height: 52,
    paddingHorizontal: 18,
  },
  focused: {
    borderColor: '#2563EB',
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)',
      } as any,
    }),
  },
  invalid: {
    borderColor: '#EF4444',
  },
  prefixContainer: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suffixContainer: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
});
