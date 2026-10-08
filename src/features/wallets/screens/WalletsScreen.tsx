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
    selectedWalletTransactions,
    isLoadingDetail,
    fetchWallets,
    selectWalletForDetail,
    clearSelectedWallet,
  } = useWallets();

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(initialOpenTransfer);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);

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
          transactions={selectedWalletTransactions}
          isLoading={isLoadingDetail}
          onBack={clearSelectedWallet}
          onTransferPress={() => setIsTransferModalOpen(true)}
        />
        <TransferModal
          visible={isTransferModalOpen}
          onClose={handleCloseTransferModal}
          wallets={wallets}
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
      {/* Hero Total Assets Card */}
      <View className="p-5 rounded-[22px] bg-surface border border-gold/30 mb-4 relative overflow-hidden">
        <View className="absolute -top-12 -right-12 w-[160px] h-[160px] rounded-full bg-gold/10" />

        <View className="flex-row items-center justify-between mb-2">
          <Text className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Total Saldo Terdistribusi
          </Text>
          <View className="px-2.5 py-1 rounded-full bg-gold/10 border border-gold/25">
            <Text className="font-mono text-[11px] text-gold-primary font-bold">
              {wallets.length} Kantong
            </Text>
          </View>
        </View>

        <Text className="font-grotesk-bold text-3xl text-zinc-100 tracking-tight mb-2.5">
          {formatRupiah(totalAssets)}
        </Text>

        <Text className="font-manrope text-xs text-zinc-400 leading-4">
          Semua kantong kas fisik, rekening bank, dan tabungan terakumulasi mandiri secara lokal.
        </Text>
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
