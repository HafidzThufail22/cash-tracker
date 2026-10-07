import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.touchTarget}
          onPress={onNotificationPress}
          activeOpacity={0.7}
          accessibilityLabel="Notifikasi dan Pengingat"
          accessibilityRole="button"
        >
          <View style={styles.iconButton}>
            <Bell size={20} color="#D4D4D8" strokeWidth={2} />
            {hasAlerts && <View style={styles.alertBadge} />}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 70,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#09090B',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(39, 39, 42, 0.4)',
  },
  textContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  subtitle: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#A1A1AA',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 22,
    letterSpacing: -0.4,
    color: '#F4F4F5',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  touchTarget: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    position: 'relative',
  },
  alertBadge: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#18181B',
  },
});
