import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ArrowDown, Check, ArrowRightLeft } from 'lucide-react-native';
import { ModalLayout } from '../../../layouts/ModalLayout';
import { CurrencyInput } from '../../../components/common/CurrencyInput';
import { InputField } from '../../../components/common/InputField';
import { Button } from '../../../components/common/Button';
import { useWalletTransfer } from '../hooks/useWalletTransfer';
import { WalletWithPercentage } from '../hooks/useWallets';
import { formatRupiah } from '../../../utils/currency';

interface TransferModalProps {
  visible: boolean;
  onClose: () => void;
  wallets: WalletWithPercentage[];
}

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

export function TransferModal({ visible, onClose, wallets }: TransferModalProps) {
  const {
    fromWalletId,
    setFromWalletId,
    toWalletId,
    setToWalletId,
    amount,
    setAmount,
    notes,
    setNotes,
    isSubmitting,
    error,
    setError,
    resetForm,
    executeTransfer,
  } = useWalletTransfer();

  // Set default from and to wallets saat modal dibuka
  useEffect(() => {
    if (visible && wallets.length >= 2) {
      if (!fromWalletId) {
        setFromWalletId(wallets[0].id);
      }
      if (!toWalletId) {
        setToWalletId(wallets[1].id);
      }
    }
  }, [visible, wallets]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleConfirm = async () => {
    const res = await executeTransfer(wallets);
    if (res.success) {
      handleClose();
    }
  };

  const selectedSourceWallet = wallets.find((w) => w.id === fromWalletId);

  return (
    <ModalLayout
      visible={visible}
      onClose={handleClose}
      title="Pindah Saldo"
      subtitle="Transfer Antar-Kantong"
    >
      <View style={styles.container}>
        {/* Selektor Kantong Asal */}
        <Text style={styles.sectionLabel}>Dari Kantong (Sumber)</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.walletsSelectorContent}
        >
          {wallets.map((w) => {
            const isSelected = fromWalletId === w.id;
            return (
              <TouchableOpacity
                key={w.id}
                style={[
                  styles.walletPill,
                  isSelected && styles.selectedWalletPill,
                ]}
                onPress={() => {
                  setFromWalletId(w.id);
                  setError(null);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.pillHeader}>
                  <Text style={[styles.pillName, isSelected && styles.selectedPillText]}>
                    {w.name}
                  </Text>
                  {isSelected && <Check size={14} color="#FFD165" strokeWidth={3} />}
                </View>
                <Text style={styles.pillBalance}>{formatRupiah(w.balance)}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Direction Indicator */}
        <View style={styles.directionIndicatorRow}>
          <View style={styles.directionLine} />
          <View style={styles.directionIconCircle}>
            <ArrowDown size={14} color="#FFD165" strokeWidth={2.5} />
          </View>
          <View style={styles.directionLine} />
        </View>

        {/* Selektor Kantong Tujuan */}
        <Text style={styles.sectionLabel}>Ke Kantong (Tujuan)</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.walletsSelectorContent}
        >
          {wallets.map((w) => {
            const isSelected = toWalletId === w.id;
            const isSameAsSource = fromWalletId === w.id;
            return (
              <TouchableOpacity
                key={w.id}
                disabled={isSameAsSource}
                style={[
                  styles.walletPill,
                  isSelected && styles.selectedWalletPill,
                  isSameAsSource && styles.disabledWalletPill,
                ]}
                onPress={() => {
                  setToWalletId(w.id);
                  setError(null);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.pillHeader}>
                  <Text
                    style={[
                      styles.pillName,
                      isSelected && styles.selectedPillText,
                      isSameAsSource && styles.disabledPillText,
                    ]}
                  >
                    {w.name}
                  </Text>
                  {isSelected && <Check size={14} color="#FFD165" strokeWidth={3} />}
                </View>
                <Text
                  style={[
                    styles.pillBalance,
                    isSameAsSource && styles.disabledPillText,
                  ]}
                >
                  {formatRupiah(w.balance)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Input Nominal Transfer */}
        <CurrencyInput
          label="Nominal Transfer"
          value={amount}
          onChangeValue={(val) => {
            setAmount(val);
            setError(null);
          }}
          helperText={
            selectedSourceWallet
              ? `Tersedia: ${formatRupiah(selectedSourceWallet.balance)}`
              : undefined
          }
          style={styles.currencyInput}
        />

        {/* Quick Amount Chips */}
        <View style={styles.quickChipsGrid}>
          {QUICK_AMOUNTS.map((amt) => (
            <TouchableOpacity
              key={amt}
              style={[
                styles.quickChip,
                amount === amt && styles.activeQuickChip,
              ]}
              onPress={() => {
                setAmount(amt);
                setError(null);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.quickChipText,
                  amount === amt && styles.activeQuickChipText,
                ]}
              >
                {formatRupiah(amt)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input Catatan */}
        <InputField
          label="Catatan (Opsional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Misal: Tabungan Harian, Alokasi Belanja"
        />

        {/* Error Notification */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Action Button */}
        <Button
          title="Konfirmasi Pindah Saldo"
          onPress={handleConfirm}
          loading={isSubmitting}
          icon={<ArrowRightLeft size={18} color="#09090B" strokeWidth={2.5} />}
          style={styles.submitButton}
        />
      </View>
    </ModalLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
  },
  sectionLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#D3C5AC',
    marginBottom: 8,
  },
  walletsSelectorContent: {
    gap: 8,
    paddingBottom: 4,
  },
  walletPill: {
    width: 140,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1F1F22',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  selectedWalletPill: {
    borderColor: '#EAB308',
    backgroundColor: 'rgba(234, 179, 8, 0.08)',
  },
  disabledWalletPill: {
    opacity: 0.35,
    backgroundColor: '#131316',
  },
  pillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  pillName: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: '#F4F4F5',
  },
  selectedPillText: {
    color: '#FFD165',
  },
  disabledPillText: {
    color: '#52525B',
  },
  pillBalance: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 13,
    color: '#A1A1AA',
  },
  directionIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  directionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(39, 39, 42, 0.8)',
  },
  directionIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.4)',
  },
  currencyInput: {
    marginTop: 14,
    marginBottom: 10,
  },
  quickChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#1F1F22',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  activeQuickChip: {
    borderColor: '#EAB308',
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  quickChipText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    color: '#A1A1AA',
  },
  activeQuickChipText: {
    color: '#FFD165',
    fontWeight: '700',
  },
  errorBox: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 14,
  },
  errorText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 6,
  },
});

