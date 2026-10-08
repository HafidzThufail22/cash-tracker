import React from 'react';
import { View, Text, ViewProps } from 'react-native';

interface BadgeProps extends ViewProps {
  label: string;
  variant?: 'income' | 'expense' | 'transfer' | 'gold' | 'neutral' | 'warning';
  icon?: React.ReactNode;
}

export function Badge({
  label,
  variant = 'neutral',
  icon,
  className = '',
  style,
  ...props
}: BadgeProps) {
  let badgeStyle = 'bg-zinc-800 border-zinc-700';
  let textStyle = 'text-zinc-300';

  if (variant === 'income') {
    badgeStyle = 'bg-emerald-500/10 border-emerald-500/20';
    textStyle = 'text-semantic-income';
  } else if (variant === 'expense') {
    badgeStyle = 'bg-red-500/10 border-red-500/20';
    textStyle = 'text-semantic-expense';
  } else if (variant === 'transfer' || variant === 'gold') {
    badgeStyle = 'bg-yellow-500/10 border-yellow-500/20';
    textStyle = 'text-gold-primary';
  } else if (variant === 'warning') {
    badgeStyle = 'bg-amber-500/10 border-amber-500/20';
    textStyle = 'text-amber-400';
  }

  return (
    <View
      className={`self-start flex-row items-center rounded-full px-2.5 py-1 border ${badgeStyle} ${className}`}
      style={style}
      {...props}
    >
      {icon}
      <Text className={`font-manrope-semibold text-xs tracking-tight ${icon ? 'ml-1' : ''} ${textStyle}`}>
        {label}
      </Text>
    </View>
  );
}
