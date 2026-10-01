import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, Minus, ArrowLeftRight } from 'lucide-react-native';

interface QuickActionButtonsProps {
  onIncomePress?: () => void;
  onExpensePress?: () => void;
  onTransferPress?: () => void;
}

export function QuickActionButtons({
  onIncomePress,
  onExpensePress,
  onTransferPress,
}: QuickActionButtonsProps) {
  return (
    <View style={styles.container}>
      {/* Income Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onIncomePress}
        activeOpacity={0.7}
      >
        <View style={styles.incomeIconCircle}>
          <Plus size={18} color="#10B981" strokeWidth={2.5} />
        </View>
        <Text style={styles.actionLabel}>Income</Text>
      </TouchableOpacity>

      {/* Expense Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onExpensePress}
        activeOpacity={0.7}
      >
        <View style={styles.expenseIconCircle}>
          <Minus size={18} color="#EF4444" strokeWidth={2.5} />
        </View>
        <Text style={styles.actionLabel}>Expense</Text>
      </TouchableOpacity>

      {/* Transfer / Pindah Saldo Button (Highlight Gold) */}
      <TouchableOpacity
        style={styles.transferButton}
        onPress={onTransferPress}
        activeOpacity={0.8}
      >
        <View style={styles.transferIconCircle}>
          <ArrowLeftRight size={18} color="#EAB308" strokeWidth={2.5} />
        </View>
        <Text style={styles.transferLabel}>Transfer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: '#1F1F22',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 51, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  incomeIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(14, 14, 17, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  expenseIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(14, 14, 17, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#F4F4F5',
  },
  transferButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: '#EAB308',
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 101, 0.5)',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  transferIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#251A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  transferLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#251A00',
    fontWeight: '700',
  },
});

