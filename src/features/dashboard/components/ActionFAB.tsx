import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Plus } from 'lucide-react-native';

interface ActionFABProps {
  isOpen: boolean;
  onPress: () => void;
}

export function ActionFAB({ isOpen, onPress }: ActionFABProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(rotateAnim, {
      toValue: isOpen ? 1 : 0,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  }, [isOpen]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <Animated.View
      className="absolute right-4 z-[200]"
      style={[
        { bottom: Platform.OS === 'ios' ? 76 : 68 },
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        className={`w-14 h-14 rounded-full items-center justify-center border border-gold-primary/60 shadow-xl ${
          isOpen ? 'bg-gold-primary' : 'bg-gold'
        }`}
        style={{
          shadowColor: '#EAB308',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isOpen ? 0.6 : 0.45,
          shadowRadius: isOpen ? 20 : 14,
          elevation: 10,
        }}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={isOpen ? 'Tutup menu aksi' : 'Buka menu aksi'}
      >
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Plus size={26} color="#09090B" strokeWidth={2.5} />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}
