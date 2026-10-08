import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'gold' | 'subtle';
  children: React.ReactNode;
}

export function Card({
  variant = 'default',
  children,
  className = '',
  style,
  ...props
}: CardProps) {
  let variantStyle = 'bg-surface border border-border';
  if (variant === 'elevated') {
    variantStyle = 'bg-surface border border-border shadow-lg shadow-black/40';
  } else if (variant === 'gold') {
    variantStyle = 'bg-surface border border-gold/40 shadow-sm shadow-gold/10';
  } else if (variant === 'subtle') {
    variantStyle = 'bg-surface-lowest border border-border-subtle';
  }

  return (
    <View
      className={`rounded-2xl p-4 ${variantStyle} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
}
