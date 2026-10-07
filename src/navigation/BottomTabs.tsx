import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LayoutDashboard, Wallet, ReceiptText, PieChart, Settings } from 'lucide-react-native';

export type TabRoute = 'dashboard' | 'wallets' | 'transactions' | 'budgets' | 'settings';

interface BottomTabsProps {
  currentTab: TabRoute;
  onTabChange: (tab: TabRoute) => void;
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
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const IconComponent = tab.Icon;

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              {isActive && <View style={styles.activeIndicator} />}
              <IconComponent
                size={22}
                color={isActive ? '#FFD165' : '#71717A'}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    paddingHorizontal: 20,
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
    paddingHorizontal: 8,
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
  },
  activeIndicator: {
    position: 'absolute',
    top: 6,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFD165',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  tabLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    letterSpacing: 0.2,
    color: '#71717A',
    marginTop: 4,
  },
  activeTabLabel: {
    color: '#FFD165',
    fontFamily: 'JetBrainsMono_500Medium',
  },
});

