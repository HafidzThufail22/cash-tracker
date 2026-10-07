import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
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

  // Jika sedang membuka detail kantong tertentu, tampilkan WalletDetailScreen
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
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
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
      <View style={styles.heroCard}>
        <View style={styles.goldenBloom} />

        <View style={styles.heroHeader}>
          <Text style={styles.heroSubtitle}>Total Saldo Terdistribusi</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{wallets.length} Kantong</Text>
          </View>
        </View>

        <Text style={styles.heroBalance}>{formatRupiah(totalAssets)}</Text>

        <Text style={styles.heroNote}>
          Semua kantong kas fisik, rekening bank, dan tabungan terakumulasi mandiri secara lokal.
        </Text>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={styles.transferButton}
          onPress={() => setIsTransferModalOpen(true)}
          activeOpacity={0.8}
        >
          <ArrowRightLeft size={18} color="#09090B" strokeWidth={2.5} />
          <Text style={styles.transferButtonText}>Pindah Saldo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addWalletButton}
          onPress={() => setIsAddWalletModalOpen(true)}
          activeOpacity={0.7}
        >
          <Plus size={18} color="#F4F4F5" strokeWidth={2.2} />
          <Text style={styles.addWalletButtonText}>Tambah Kantong</Text>
        </TouchableOpacity>
      </View>

      {/* Wallets Vertical List */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Daftar Pos Finansial</Text>

        <View style={styles.walletsList}>
          {wallets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <WalletIcon size={32} color="#71717A" />
              <Text style={styles.emptyTitle}>Belum Ada Kantong</Text>
              <Text style={styles.emptySubtitle}>
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
                  style={styles.walletCard}
                  onPress={() => selectWalletForDetail(wallet)}
                  activeOpacity={0.7}
                >
                  <View style={styles.walletCardTop}>
                    <View
                      style={[
                        styles.iconCircle,
                        isSavings
                          ? styles.savingsIconCircle
                          : isBank
                          ? styles.bankIconCircle
                          : styles.cashIconCircle,
                      ]}
                    >
                      {isSavings ? (
                        <PiggyBank size={20} color="#FFD165" strokeWidth={2.2} />
                      ) : isBank ? (
                        <Landmark size={20} color="#3B82F6" strokeWidth={2.2} />
                      ) : (
                        <Banknote size={20} color="#10B981" strokeWidth={2.2} />
                      )}
                    </View>

                    <View style={styles.walletDetails}>
                      <View style={styles.nameBadgeRow}>
                        <Text style={styles.walletName} numberOfLines={1}>
                          {wallet.name}
                        </Text>
                        <View
                          style={[
                            styles.typeBadge,
                            isSavings
                              ? styles.savingsBadge
                              : isBank
                              ? styles.bankBadge
                              : styles.cashBadge,
                          ]}
                        >
                          <Text
                            style={[
                              styles.typeBadgeText,
                              isSavings
                                ? styles.savingsBadgeText
                                : isBank
                                ? styles.bankBadgeText
                                : styles.cashBadgeText,
                            ]}
                          >
                            {isSavings ? 'Tabungan' : isBank ? 'Bank' : 'Cash'}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.walletBalance}>
                        {formatRupiah(wallet.balance)}
                      </Text>
                    </View>

                    <ChevronRight size={18} color="#71717A" />
                  </View>

                  {/* Allocation Progress Bar */}
                  <View style={styles.progressRow}>
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.min(100, Math.max(2, wallet.percentage))}%`,
                            backgroundColor: isSavings
                              ? '#FFD165'
                              : isBank
                              ? '#3B82F6'
                              : '#10B981',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.percentageText}>{wallet.percentage}%</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 88 : 80,
    gap: 16,
  },
  heroCard: {
    borderRadius: 20,
    backgroundColor: '#1C1C20',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.28)',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  goldenBloom: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(234, 179, 8, 0.08)',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#D3C5AC',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  countBadgeText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    color: '#FFD165',
    fontWeight: '600',
  },
  heroBalance: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 32,
    color: '#F4F4F5',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  heroNote: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: '#A1A1AA',
    lineHeight: 16,
    marginTop: 6,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  transferButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EAB308',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  transferButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#09090B',
    letterSpacing: 0.2,
  },
  addWalletButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addWalletButtonText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 13,
    color: '#F4F4F5',
    letterSpacing: 0.2,
  },
  listSection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: '#F4F4F5',
    marginBottom: 12,
  },
  walletsList: {
    gap: 12,
  },
  walletCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 51, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  walletCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E0E11',
    borderWidth: 1,
    marginRight: 14,
  },
  cashIconCircle: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  savingsIconCircle: {
    borderColor: 'rgba(234, 179, 8, 0.35)',
  },
  bankIconCircle: {
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  walletDetails: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  walletName: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: '#F4F4F5',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  cashBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  savingsBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  bankBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  typeBadgeText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 9,
    textTransform: 'uppercase',
  },
  cashBadgeText: {
    color: '#10B981',
  },
  savingsBadgeText: {
    color: '#FFD165',
  },
  bankBadgeText: {
    color: '#3B82F6',
  },
  walletBalance: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#F4F4F5',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  progressBarTrack: {
    flex: 1,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#27272A',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  percentageText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    color: '#A1A1AA',
    width: 34,
    textAlign: 'right',
  },
  emptyContainer: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181B',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  emptyTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#F4F4F5',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 18,
  },
});

