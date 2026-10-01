import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell, User } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export function Header({
  title = 'Dashboard',
  subtitle = 'Cash Tracker',
  onNotificationPress,
  onProfilePress,
}: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
          accessibilityLabel="Notifications"
        >
          <Bell size={20} color="#A1A1AA" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={onProfilePress}
          activeOpacity={0.8}
          accessibilityLabel="Profile"
        >
          <User size={18} color="#09090B" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
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
  },
  subtitle: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#9B8F79',
    marginBottom: 2,
  },
  title: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 20,
    letterSpacing: -0.3,
    color: '#F4F4F5',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD165',
    borderWidth: 1.5,
    borderColor: '#EAB308',
  },
});

