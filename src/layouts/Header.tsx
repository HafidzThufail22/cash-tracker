import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onNotificationPress?: () => void;
  hasAlerts?: boolean;
}

export function Header({
  title = 'Dashboard',
  subtitle = 'Cash Tracker',
  onNotificationPress,
  hasAlerts = false,
}: HeaderProps) {
  return (
    <View className="min-h-[70px] py-3 px-4 flex-row items-center justify-between bg-background border-b border-border/40">
      <View className="justify-center flex-1">
        <Text className="font-mono text-[10px] uppercase tracking-[1.5px] text-zinc-400 mb-1">
          {subtitle}
        </Text>
        <Text className="font-manrope-bold text-[22px] tracking-[-0.4px] text-zinc-100">
          {title}
        </Text>
      </View>
      <View className="flex-row items-center">
        <TouchableOpacity
          className="w-11 h-11 items-center justify-center"
          onPress={onNotificationPress}
          activeOpacity={0.7}
          accessibilityLabel="Notifikasi dan Pengingat"
          accessibilityRole="button"
        >
          <View className="w-10 h-10 rounded-full items-center justify-center bg-surface border border-border relative">
            <Bell size={20} color="#D4D4D8" strokeWidth={2} />
            {hasAlerts && (
              <View className="absolute top-[9px] right-[9px] w-[7px] h-[7px] rounded-full bg-semantic-expense border-[1.5px] border-surface" />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
