import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
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
      style={[
        styles.wrapper,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={[styles.fab, isOpen && styles.fabOpen]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={isOpen ? 'Tutup menu aksi' : 'Buka menu aksi'}
      >
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Plus size={26} color={isOpen ? '#09090B' : '#09090B'} strokeWidth={2.5} />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 76 : 68,
    right: 16,
    zIndex: 200,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EAB308',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 101, 0.6)',
  },
  fabOpen: {
    backgroundColor: '#FFD165',
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
});
