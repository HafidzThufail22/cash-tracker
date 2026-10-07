import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Layers, Check, Wallet as WalletIcon } from 'lucide-react-native';
import { ModalLayout } from '../../../layouts/ModalLayout';
import { WalletWithBalance } from '../../../database/repositories/walletRepo';
import { formatRupiah } from '../../../utils/currency';

interface WalletPickerModalProps {
  visible: boolean;
  wallets: WalletWithBalance[];
  selectedWalletId: string | null;
  onClose: () => void;
  onSelectWallet: (walletId: string | null) => void;
}

export function WalletPickerModal({
  visible,
  wallets,
  selectedWalletId,
  onClose,
  onSelectWallet,
}: WalletPickerModalProps) {
  return (
    <ModalLayout
      visible={visible}
      onClose={onClose}
      title="Pilih Kantong Kas"
      subtitle="Filter Saldo & Mutasi"
      scrollable={false}
    >
      <View style={styles.container}>
        {/* Option 1: Semua Kantong Kas */}
        <TouchableOpacity
          style={[
            styles.walletItemCard,
            selectedWalletId === null && styles.walletItemCardActive,
          ]}
          onPress={() => {
            onSelectWallet(null);
            onClose();
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, styles.allWalletsIconWrap]}>
            <Layers size={18} color="#FFD165" />
          </View>
          <View style={styles.walletInfo}>
            <Text
              style={[
                styles.walletName,
                selectedWalletId === null && styles.walletNameActive,
              ]}
            >
              Semua Kantong
            </Text>
            <Text style={styles.walletMeta}>Gabungan seluruh rekening & kas</Text>
          </View>
          {selectedWalletId === null && (
            <View style={styles.checkCircle}>
              <Check size={14} color="#09090B" strokeWidth={3} />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* List of Individual Wallets */}
        <FlatList
          data={wallets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = selectedWalletId === item.id;
            const color = item.color || '#EAB308';

            return (
              <TouchableOpacity
                style={[
                  styles.walletItemCard,
                  isSelected && styles.walletItemCardActive,
                ]}
                onPress={() => {
                  onSelectWallet(item.id);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.iconWrap, { backgroundColor: `${color}20` }]}>
                  <WalletIcon size={18} color={color} />
                </View>

                <View style={styles.walletInfo}>
                  <Text
                    style={[
                      styles.walletName,
                      isSelected && styles.walletNameActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.walletBalanceText}>
                    {formatRupiah(item.balance)}
                  </Text>
                </View>

                {isSelected && (
                  <View style={styles.checkCircle}>
                    <Check size={14} color="#09090B" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </ModalLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 440,
    gap: 8,
  },
  walletItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  walletItemCardActive: {
    borderColor: 'rgba(234, 179, 8, 0.5)',
    backgroundColor: 'rgba(234, 179, 8, 0.08)',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allWalletsIconWrap: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: '#F4F4F5',
  },
  walletNameActive: {
    color: '#FFD165',
    fontFamily: 'Manrope_700Bold',
  },
  walletMeta: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 11,
    color: '#71717A',
    marginTop: 2,
  },
  walletBalanceText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFD165',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#27272A',
    marginVertical: 4,
  },
  listContent: {
    gap: 8,
    paddingBottom: 12,
  },
});
