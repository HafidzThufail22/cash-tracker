import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function InputField({
  label,
  error,
  helperText,
  leftIcon,
  containerStyle,
  style,
  ...props
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          Boolean(error) && styles.inputError,
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          style={[styles.textInput, style]}
          placeholderTextColor="#52525B"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 14,
  },
  label: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#D3C5AC',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0E0E11',
    borderWidth: 1,
    borderColor: '#27272A',
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: '#EAB308',
    backgroundColor: '#131316',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  leftIconContainer: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: '#F4F4F5',
    padding: 0,
  },
  errorText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
  },
  helperText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 11,
    color: '#71717A',
    marginTop: 4,
  },
});

