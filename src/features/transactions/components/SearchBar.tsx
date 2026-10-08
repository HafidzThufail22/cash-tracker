import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Cari catatan atau kategori...',
}: SearchBarProps) {
  return (
    <View className="px-4 my-1">
      <View className="flex-row items-center bg-surface rounded-[14px] border border-gold/30 px-3 h-11">
        <Search size={16} color="#71717A" style={{ marginRight: 8 }} />
        <TextInput
          className="flex-1 font-manrope-medium text-[13px] text-zinc-100 py-0"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#52525B"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <TouchableOpacity
            className="w-[22px] h-[22px] rounded-full bg-border items-center justify-center ml-1.5"
            onPress={() => onChangeText('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={14} color="#A1A1AA" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
