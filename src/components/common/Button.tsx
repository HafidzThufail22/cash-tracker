import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';

  return (
    <TouchableOpacity
      style={[
        styles.buttonBase,
        isPrimary && styles.primaryButton,
        isOutline && styles.outlineButton,
        isDanger && styles.dangerButton,
        (disabled || loading) && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary ? '#09090B' : '#FFD165'}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.textBase,
              isPrimary && styles.primaryText,
              isOutline && styles.outlineText,
              isDanger && styles.dangerText,
              (disabled || loading) && styles.disabledText,
              Boolean(icon) && styles.textWithIcon,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryButton: {
    backgroundColor: '#EAB308',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  textBase: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  primaryText: {
    color: '#09090B',
    fontWeight: '700',
  },
  outlineText: {
    color: '#F4F4F5',
  },
  dangerText: {
    color: '#EF4444',
  },
  disabledText: {
    color: '#71717A',
  },
  textWithIcon: {
    marginLeft: 8,
  },
});

