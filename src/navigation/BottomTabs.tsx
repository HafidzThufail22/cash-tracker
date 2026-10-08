import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import {
  LayoutDashboard,
  Wallet,
  ReceiptText,
  PieChart,
  Settings,
} from 'lucide-react-native';

export type TabRoute = 'dashboard' | 'wallets' | 'transactions' | 'budgets' | 'settings';

interface BottomTabsProps {
  currentTab: TabRoute;
  onTabChange: (tab: TabRoute) => void;
}

interface TabItemProps {
  label: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  isActive: boolean;
  onPress: () => void;
}

function TabItem({ label, Icon, isActive, onPress }: TabItemProps) {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.95)).current;
  const dotAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 90,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(dotAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnim, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActive]);

  return (
    <TouchableOpacity
      className="flex-1 h-full items-center justify-center relative px-0.5"
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Icon
          size={21}
          color={isActive ? '#FFD165' : '#71717A'}
          strokeWidth={isActive ? 2.4 : 1.8}
        />
      </Animated.View>
      <Text
        className={`text-[9.5px] mt-1 text-center ${
          isActive
            ? 'text-gold-primary font-manrope-bold'
            : 'text-zinc-500 font-manrope-semibold'
        }`}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {label}
      </Text>
      <Animated.View
        className="absolute bottom-1.5 w-1 h-1 rounded-full bg-gold-primary"
        style={{
          opacity: dotAnim,
          transform: [{ scale: dotAnim }],
          shadowColor: '#EAB308',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 3,
          elevation: 3,
        }}
      />
    </TouchableOpacity>
  );
}

export function BottomTabs({ currentTab, onTabChange }: BottomTabsProps) {
  const tabs = [
    {
      id: 'dashboard' as TabRoute,
      label: 'Dashboard',
      Icon: LayoutDashboard,
    },
    {
      id: 'wallets' as TabRoute,
      label: 'Wallets',
      Icon: Wallet,
    },
    {
      id: 'transactions' as TabRoute,
      label: 'History',
      Icon: ReceiptText,
    },
    {
      id: 'budgets' as TabRoute,
      label: 'Budgets',
      Icon: PieChart,
    },
    {
      id: 'settings' as TabRoute,
      label: 'Settings',
      Icon: Settings,
    },
  ];

  return (
    <View
      className="absolute left-0 right-0 items-center px-3 z-50"
      style={{ bottom: Platform.OS === 'ios' ? 24 : 16 }}
      pointerEvents="box-none"
    >
      <View
        className="flex-row items-center justify-around w-full max-w-[420px] h-16 rounded-full bg-[#1B1B1E]/95 border border-white/10 px-1 shadow-2xl"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.5,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            label={tab.label}
            Icon={tab.Icon}
            isActive={currentTab === tab.id}
            onPress={() => onTabChange(tab.id)}
          />
        ))}
      </View>
    </View>
  );
}
