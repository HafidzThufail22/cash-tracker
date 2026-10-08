import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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

  const defaultContentStyle: ViewStyle = {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 88 : 80,
  };

  return (
    <SafeAreaView className="flex-1 bg-background" style={style} edges={edges}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scrollable ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={[defaultContentStyle, contentContainerStyle]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View
            className="flex-1"
            style={[defaultContentStyle, contentContainerStyle]}
          >
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
