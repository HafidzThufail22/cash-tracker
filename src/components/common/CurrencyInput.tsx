import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';

interface CurrencyInputProps {
  value: number;
  onChangeValue: (value: number) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  style?: ViewStyle;
}

export function CurrencyInput({
  value,
  onChangeValue,
  label,
  placeholder = '0',
  error,
  helperText,
  style,
}: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const formatRawToDisplay = (num: number): string => {
    if (!num || num === 0) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleChangeText = (text: string) => {
    const cleanNumbers = text.replace(/[^0-9]/g, '');
    const numericValue = cleanNumbers ? parseInt(cleanNumbers, 10) : 0;
    onChangeValue(numericValue);
  };

  const handleClear = () => {
    onChangeValue(0);
  };

  const displayString = formatRawToDisplay(value);

  return (
    <View className="w-full mb-3.5" style={style}>
      {label && (
        <Text className="font-mono text-[11px] uppercase tracking-wider text-[#D3C5AC] mb-1.5">
          {label}
        </Text>
      )}

      <View
        className={`flex-row items-center h-[52px] rounded-xl bg-surface-lowest border px-3.5 ${
          error
            ? 'border-semantic-expense'
            : isFocused
              ? 'border-gold bg-surface-dark shadow-sm shadow-gold/20'
              : 'border-border'
        }`}
      >
        <Text className="font-grotesk text-lg text-gold-primary mr-2">Rp</Text>

        <TextInput
          className="flex-1 font-grotesk-bold text-xl text-zinc-100 p-0"
          value={displayString}
          onChangeText={handleChangeText}
          keyboardType="number-pad"
          placeholder={placeholder}
          placeholderTextColor="#52525B"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {value > 0 && (
          <TouchableOpacity
            className="w-6 h-6 rounded-full bg-[#1F1F22] items-center justify-center ml-1.5"
            onPress={handleClear}
            activeOpacity={0.7}
          >
            <X size={14} color="#71717A" />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text className="font-manrope text-[11px] text-semantic-expense mt-1">{error}</Text>
      ) : helperText ? (
        <Text className="font-manrope text-[11px] text-zinc-500 mt-1">{helperText}</Text>
      ) : null}
    </View>
  );
}
