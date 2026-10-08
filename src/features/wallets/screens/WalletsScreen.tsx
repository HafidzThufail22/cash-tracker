import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import {
  ArrowRightLeft,
  Plus,
  ChevronRight,
  PiggyBank,
  Banknote,
  Landmark,
  Wallet as WalletIcon,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { useWallets } from '../hooks/useWallets';
import { TransferModal } from '../components/TransferModal';
import { AddWalletModal } from '../components/AddWalletModal';
import { WalletDetailScreen } from './WalletDetailScreen';
import { formatRupiah } from '../../../utils/currency';

interface WalletsScreenProps {
  initialOpenTransfer?: boolean;
  onTransferClosed?: () => void;
}

export function WalletsScreen({
  initialOpenTransfer = false,
  onTransferClosed,
}: WalletsScreenProps) {
  const {
    wallets,
    totalAssets,
    isLoading,
    selectedWallet,
    fetchWallets,
    selectWalletForDetail,
    clearSelectedWallet,
  } = useWallets();

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(initialOpenTransfer);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    if (initialOpenTransfer) {
      setIsTransferModalOpen(true);
    }
  }, [initialOpenTransfer]);

  const handleCloseTransferModal = () => {
    setIsTransferModalOpen(false);
    onTransferClosed?.();
  };

  if (selectedWallet) {
    return (
      <>
        <WalletDetailScreen
          wallet={selectedWallet}
          onBack={clearSelectedWallet}
          onTransferPress={() => setIsTransferModalOpen(true)}
        />
        <TransferModal
          visible={isTransferModalOpen}
          onClose={handleCloseTransferModal}
          wallets={wallets}
          initialFromWalletId={selectedWallet.id}
        />
      </>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 88 : 80,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={fetchWallets}
          tintColor="#FFD165"
          colors={['#FFD165']}
        />
      }
    >
      {/* Hero Total Assets Card (Aligned with Dashboard TotalBalanceCard) */}
      <View
        className="rounded-2xl bg-surface border border-border overflow-hidden mb-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        <View className="px-4 py-3.5">
          {/* Header: Indicator & Right Controls */}
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center gap-1.5 flex-1">
              <View className="w-1.5 h-1.5 rounded-full bg-gold-primary" />
              <Text className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                Total Saldo Terdistribusi
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => setIsBalanceHidden(!isBalanceHidden)}
                className="p-1"
                activeOpacity={0.7}
                accessibilityLabel="Sembunyikan atau tampilkan saldo"
                accessibilityRole="button"
              >
                {isBalanceHidden ? (
                  <EyeOff size={16} color="#A1A1AA" />
                ) : (
                  <Eye size={16} color="#A1A1AA" />
                )}
              </TouchableOpacity>

              <View className="px-2 py-0.5 rounded-full bg-surface-highest border border-border">
                <Text className="font-mono text-[10px] text-zinc-300 font-medium">
                  {wallets.length} Kantong
                </Text>
              </View>
            </View>
          </View>

          {/* Amount Display */}
          <View className="flex-row items-baseline gap-1.5 my-1">
            <Text className="font-mono text-base text-gold-primary font-bold">Rp</Text>
            <Text className="font-grotesk-bold text-[32px] text-zinc-100 tracking-tight">
              {isBalanceHidden
                ? '••••••••'
                : formatRupiah(totalAssets).replace('Rp\u00A0', '').replace('Rp ', '')}
            </Text>
          </View>

          <Text className="font-manrope text-[11px] text-zinc-400 leading-4 mt-0.5">
            Akumulasi dana terdistribusi di seluruh kas fisik, rekening bank, & tabungan.
          </Text>
        </View>
      </View>

      {/* Quick Action Buttons */}
      <View className="flex-row gap-2.5 mb-5">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 h-12 rounded-xl bg-gold shadow-md shadow-gold/30"
          onPress={() => setIsTransferModalOpen(true)}
          activeOpacity={0.8}
        >
          <ArrowRightLeft size={18} color="#09090B" strokeWidth={2.5} />
          <Text className="font-manrope-bold text-sm text-background">Pindah Saldo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 h-12 rounded-xl bg-surface border border-border"
          onPress={() => setIsAddWalletModalOpen(true)}
          activeOpacity={0.7}
        >
          <Plus size={18} color="#F4F4F5" strokeWidth={2.2} />
          <Text className="font-manrope-semibold text-sm text-zinc-100">Tambah Kantong</Text>
        </TouchableOpacity>
      </View>

      {/* Wallets Vertical List */}
      <View className="mb-6">
        <Text className="font-manrope-bold text-lg text-zinc-100 tracking-tight mb-3">
          Daftar Pos Finansial
        </Text>

        <View className="gap-2.5">
          {wallets.length === 0 ? (
            <View className="p-8 items-center justify-center bg-surface rounded-2xl border border-border">
              <WalletIcon size={32} color="#71717A" />
              <Text className="font-manrope-bold text-base text-zinc-100 mt-3 mb-1">
                Belum Ada Kantong
              </Text>
              <Text className="font-manrope text-xs text-zinc-400 text-center leading-4">
                Klik tombol "Tambah Kantong" untuk mulai mengalokasikan pos dana Anda.
              </Text>
            </View>
          ) : (
            wallets.map((wallet) => {
              const isSavings = wallet.name.toLowerCase().includes('tabungan');
              const isBank = wallet.type === 'bank';

              return (
                <TouchableOpacity
                  key={wallet.id}
                  className="p-4 rounded-2xl bg-surface border border-border"
                  onPress={() => selectWalletForDetail(wallet)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center mb-3">
                    <View
                      className={`w-11 h-11 rounded-xl items-center justify-center border mr-3.5 ${
                        isSavings
                          ? 'bg-gold/10 border-gold/25'
                          : isBank
                          ? 'bg-blue-500/10 border-blue-500/25'
                          : 'bg-emerald-500/10 border-emerald-500/25'
                      }`}
                    >
                      {isSavings ? (
                        <PiggyBank size={20} color="#FFD165" strokeWidth={2.2} />
                      ) : isBank ? (
                        <Landmark size={20} color="#3B82F6" strokeWidth={2.2} />
                      ) : (
                        <Banknote size={20} color="#10B981" strokeWidth={2.2} />
                      )}
                    </View>

                    <View className="flex-1 justify-center">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className="font-manrope-bold text-base text-zinc-100 flex-1" numberOfLines={1}>
                          {wallet.name}
                        </Text>
                        <View
                          className={`px-2 py-0.5 rounded-full border ${
                            isSavings
                              ? 'bg-gold/10 border-gold/25'
                              : isBank
                              ? 'bg-blue-500/10 border-blue-500/25'
                              : 'bg-emerald-500/10 border-emerald-500/25'
                          }`}
                        >
                          <Text
                            className={`font-mono text-[10px] uppercase font-semibold ${
                              isSavings
                                ? 'text-gold-primary'
                                : isBank
                                ? 'text-blue-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {isSavings ? 'Tabungan' : isBank ? 'Bank' : 'Cash'}
                          </Text>
                        </View>
                      </View>

                      <Text className="font-grotesk-bold text-lg text-zinc-100">
                        {formatRupiah(wallet.balance)}
                      </Text>
                    </View>

                    <ChevronRight size={18} color="#71717A" />
                  </View>

                  {/* Allocation Progress Bar */}
                  <View className="flex-row items-center gap-3">
                    <View className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(2, wallet.percentage))}%`,
                          backgroundColor: isSavings
                            ? '#FFD165'
                            : isBank
                            ? '#3B82F6'
                            : '#10B981',
                        }}
                      />
                    </View>
                    <Text className="font-mono text-xs text-zinc-400 w-9 text-right">
                      {wallet.percentage}%
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </View>

      {/* Modals */}
      <TransferModal
        visible={isTransferModalOpen}
        onClose={handleCloseTransferModal}
        wallets={wallets}
      />

      <AddWalletModal
        visible={isAddWalletModalOpen}
        onClose={() => setIsAddWalletModalOpen(false)}
      />
    </ScrollView>
  );
}
