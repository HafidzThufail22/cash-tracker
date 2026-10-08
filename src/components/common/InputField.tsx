import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
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
    <View className="w-full mb-3.5" style={containerStyle}>
      {label && (
        <Text className="font-mono text-[11px] uppercase tracking-wider text-[#D3C5AC] mb-1.5">
          {label}
        </Text>
      )}

      <View
        className={`flex-row items-center h-12 rounded-xl bg-surface-lowest border px-3.5 ${
          error
            ? 'border-semantic-expense'
            : isFocused
              ? 'border-gold bg-surface-dark shadow-sm shadow-gold/20'
              : 'border-border'
        }`}
      >
        {leftIcon && <View className="mr-2.5">{leftIcon}</View>}

        <TextInput
          className="flex-1 font-manrope-medium text-sm text-zinc-100 p-0"
          style={style}
          placeholderTextColor="#52525B"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>

      {error ? (
        <Text className="font-manrope text-[11px] text-semantic-expense mt-1">{error}</Text>
      ) : helperText ? (
        <Text className="font-manrope text-[11px] text-zinc-500 mt-1">{helperText}</Text>
      ) : null}
    </View>
  );
}
