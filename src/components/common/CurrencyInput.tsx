import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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
    // Hanya ambil karakter angka murni
    const cleanNumbers = text.replace(/[^0-9]/g, '');
    const numericValue = cleanNumbers ? parseInt(cleanNumbers, 10) : 0;
    onChangeValue(numericValue);
  };

  const handleClear = () => {
    onChangeValue(0);
  };

  const displayString = formatRawToDisplay(value);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          Boolean(error) && styles.inputError,
        ]}
      >
        <Text style={styles.prefixText}>Rp</Text>

        <TextInput
          style={styles.textInput}
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
            style={styles.clearButton}
            onPress={handleClear}
            activeOpacity={0.7}
          >
            <X size={14} color="#71717A" />
          </TouchableOpacity>
        )}
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
    height: 52,
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
  prefixText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 18,
    color: '#FFD165',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#F4F4F5',
    padding: 0,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1F1F22',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
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

