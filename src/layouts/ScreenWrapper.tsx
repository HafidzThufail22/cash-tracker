import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  withTopInset?: boolean;
  withBottomInset?: boolean;
}

export function ScreenWrapper({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  withTopInset = true,
  withBottomInset = false,
}: ScreenWrapperProps) {
  const edges: ('top' | 'bottom' | 'left' | 'right')[] = ['left', 'right'];
  if (withTopInset) edges.push('top');
  if (withBottomInset) edges.push('bottom');

  return (
    <SafeAreaView style={[styles.container, style]} edges={edges}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scrollable ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.contentContainer, contentContainerStyle]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 110, // Memberikan ruang cukup agar tidak tertutup floating bottom tab bar
  },
});

