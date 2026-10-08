import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
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

  let variantButtonClass = 'bg-gold active:bg-gold-hover shadow-lg shadow-gold/30';
  let variantTextClass = 'text-background font-bold';

  if (isOutline) {
    variantButtonClass = 'bg-transparent border border-border';
    variantTextClass = 'text-zinc-100';
  } else if (isDanger) {
    variantButtonClass = 'bg-red-500/15 border border-red-500/30';
    variantTextClass = 'text-semantic-expense';
  } else if (variant === 'secondary') {
    variantButtonClass = 'bg-surface border border-border';
    variantTextClass = 'text-zinc-100';
  }

  const disabledClass = disabled || loading ? 'opacity-50' : '';
  const disabledTextClass = disabled || loading ? 'text-zinc-500' : '';

  return (
    <TouchableOpacity
      className={`h-12 rounded-xl flex-row items-center justify-center px-4.5 ${variantButtonClass} ${disabledClass}`}
      style={style}
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
            className={`font-grotesk text-sm tracking-wide ${variantTextClass} ${disabledTextClass} ${icon ? 'ml-2' : ''}`}
            style={textStyle}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
