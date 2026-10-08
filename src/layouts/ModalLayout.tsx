import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';

interface ModalLayoutProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  scrollable?: boolean;
}

export function ModalLayout({
  visible,
  onClose,
  title,
  subtitle,
  children,
  scrollable = true,
}: ModalLayoutProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/75 justify-end">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="w-full justify-end"
          >
            <TouchableWithoutFeedback>
              <View
                className="w-full max-h-[90%] bg-surface rounded-t-3xl border border-border pb-6"
                style={{
                  paddingBottom: Platform.OS === 'ios' ? 36 : 24,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: 0.5,
                  shadowRadius: 16,
                  elevation: 16,
                }}
              >
                {/* Drag Handle Bar */}
                <View className="w-10 h-1 rounded-full bg-zinc-700 self-center mt-2.5 mb-2" />

                {/* Modal Header */}
                <View className="flex-row items-center justify-between px-5 py-3 border-b border-border/60">
                  <View className="flex-1">
                    {subtitle && (
                      <Text className="font-mono text-[10px] uppercase tracking-wider text-gold-primary mb-0.5">
                        {subtitle}
                      </Text>
                    )}
                    <Text className="font-manrope-bold text-lg text-zinc-100 tracking-tight">
                      {title}
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="w-[34px] h-[34px] rounded-full bg-border items-center justify-center ml-3"
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <X size={18} color="#A1A1AA" />
                  </TouchableOpacity>
                </View>

                {/* Content Container */}
                {scrollable ? (
                  <ScrollView
                    className="max-h-[520px]"
                    contentContainerStyle={{ padding: 20 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {children}
                  </ScrollView>
                ) : (
                  <View className="max-h-[520px] p-5">{children}</View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
