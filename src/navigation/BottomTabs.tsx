import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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
      style={styles.tabButton}
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
        style={[styles.tabLabel, isActive && styles.activeTabLabel]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {label}
      </Text>
      <Animated.View
        style={[
          styles.activeIndicator,
          {
            opacity: dotAnim,
            transform: [{ scale: dotAnim }],
          },
        ]}
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
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <View style={styles.pillContainer}>
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

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 12,
    zIndex: 100,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 420,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(27, 27, 30, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 2,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFD165',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  tabLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 9.5,
    color: '#71717A',
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#FFD165',
    fontFamily: 'Manrope_700Bold',
  },
});
