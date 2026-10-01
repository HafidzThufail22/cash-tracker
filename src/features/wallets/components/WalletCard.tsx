import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Wallet, PiggyBank, Plus, Banknote } from 'lucide-react-native';
import { formatRupiah } from '../../../utils/currency';

interface WalletCardProps {
  id: string;
  name: string;
  type: string;
  balance: number;
  color?: string | null;
  icon?: string | null;
  isBalanceHidden?: boolean;
  onPress?: () => void;
}

export function WalletCard({
  name,
  balance,
  isBalanceHidden = false,
  onPress,
}: WalletCardProps) {
  const isSavings = name.toLowerCase().includes('tabungan');
  const displayBalance = isBalanceHidden ? '••••••••' : formatRupiah(balance);

  return (
    <TouchableOpacity
      style={[styles.card, isSavings ? styles.savingsCard : styles.regularCard]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isSavings && <View style={styles.savingsAmbientGlow} />}

      <View style={styles.topRow}>
        <View
          style={[
            styles.iconWrapper,
            isSavings ? styles.savingsIconWrapper : styles.regularIconWrapper,
          ]}
        >
          {isSavings ? (
            <PiggyBank size={20} color="#FFD165" strokeWidth={2.2} />
          ) : (
            <Banknote size={20} color="#10B981" strokeWidth={2.2} />
          )}
        </View>

        <View
          style={[
            styles.badge,
            isSavings ? styles.savingsBadge : styles.regularBadge,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              isSavings ? styles.savingsBadgeText : styles.regularBadgeText,
            ]}
          >
            {isSavings ? 'Tabungan' : 'Cash'}
          </Text>
        </View>
      </View>

      <View style={styles.bottomInfo}>
        <Text style={styles.walletName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.balanceText} numberOfLines={1}>
          {displayBalance}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function NewPocketCard({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.newPocketCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.newPocketIconWrapper}>
        <Plus size={20} color="#71717A" strokeWidth={2} />
      </View>
      <Text style={styles.newPocketLabel}>New Pocket</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 230,
    height: 130,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    marginRight: 12,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  regularCard: {
    backgroundColor: '#1F1F22',
    borderColor: 'rgba(79, 70, 51, 0.3)',
  },
  savingsCard: {
    backgroundColor: '#232228',
    borderColor: 'rgba(234, 179, 8, 0.35)',
  },
  savingsAmbientGlow: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(234, 179, 8, 0.08)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E0E11',
    borderWidth: 1,
  },
  regularIconWrapper: {
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  savingsIconWrapper: {
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  regularBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  savingsBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  badgeText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  regularBadgeText: {
    color: '#10B981',
  },
  savingsBadgeText: {
    color: '#FFD165',
  },
  bottomInfo: {
    marginTop: 10,
  },
  walletName: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#A1A1AA',
    marginBottom: 4,
  },
  balanceText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#F4F4F5',
    letterSpacing: -0.3,
  },
  newPocketCard: {
    width: 120,
    height: 130,
    borderRadius: 16,
    backgroundColor: 'rgba(27, 27, 30, 0.5)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(79, 70, 51, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginRight: 12,
  },
  newPocketIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newPocketLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#71717A',
    textAlign: 'center',
  },
});

