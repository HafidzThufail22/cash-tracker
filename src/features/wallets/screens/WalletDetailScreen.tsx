import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  PiggyBank,
  Banknote,
  Landmark,
} from 'lucide-react-native';
import { WalletWithBalance } from '../../../database/repositories/walletRepo';
import { RecentTransactionItem } from '../../../database/repositories/transactionRepo';
import { formatRupiah, formatSignedRupiah } from '../../../utils/currency';
import { formatTransactionDate } from '../../../utils/date';
import { Button } from '../../../components/common/Button';

interface WalletDetailScreenProps {
  wallet: WalletWithBalance;
  transactions: RecentTransactionItem[];
  isLoading: boolean;
  onBack: () => void;
  onTransferPress: () => void;
}

export function WalletDetailScreen({
  wallet,
  transactions,
  isLoading,
  onBack,
  onTransferPress,
}: WalletDetailScreenProps) {
  const isSavings = wallet.name.toLowerCase().includes('tabungan');
  const isBank = wallet.type === 'bank';

  // Hitung total masuk dan keluar khusus kantong ini dari riwayat
  const { totalIn, totalOut } = useMemo(() => {
    let inSum = 0;
    let outSum = 0;

    for (const t of transactions) {
      if (t.type === 0 && t.walletId === wallet.id) {
        inSum += t.amount;
      } else if (t.type === 2 && t.toWalletId === wallet.id) {
        inSum += t.amount; // Transfer masuk
      } else if (t.type === 1 && t.walletId === wallet.id) {
        outSum += t.amount; // Pengeluaran
      } else if (t.type === 2 && t.walletId === wallet.id) {
        outSum += t.amount; // Transfer keluar
      }
    }

    return { totalIn: inSum, totalOut: outSum };
  }, [transactions, wallet.id]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#F4F4F5" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          Detail Kantong
        </Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {isSavings ? 'Tabungan' : isBank ? 'Bank' : 'Cash'}
          </Text>
        </View>
      </View>

      {/* Hero Wallet Balance Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroGlow} />

        <View style={styles.heroTop}>
          <View style={styles.iconCircle}>
            {isSavings ? (
              <PiggyBank size={24} color="#FFD165" strokeWidth={2.2} />
            ) : isBank ? (
              <Landmark size={24} color="#3B82F6" strokeWidth={2.2} />
            ) : (
              <Banknote size={24} color="#10B981" strokeWidth={2.2} />
            )}
          </View>
          <View style={styles.heroHeaderInfo}>
            <Text style={styles.walletNameLabel}>{wallet.name}</Text>
            <Text style={styles.balanceNominal}>{formatRupiah(wallet.balance)}</Text>
          </View>
        </View>

        {/* Micro-stats In & Out */}
        <View style={styles.divider} />
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <View style={styles.inIconWrapper}>
              <ArrowUpRight size={14} color="#10B981" />
            </View>
            <View>
              <Text style={styles.statLabel}>Akumulasi Masuk</Text>
              <Text style={styles.inValue}>+{formatRupiah(totalIn)}</Text>
            </View>
          </View>

          <View style={styles.statCol}>
            <View style={styles.outIconWrapper}>
              <ArrowDownLeft size={14} color="#EF4444" />
            </View>
            <View>
              <Text style={styles.statLabel}>Akumulasi Keluar</Text>
              <Text style={styles.outValue}>-{formatRupiah(totalOut)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Shortcut */}
      <Button
        title="Pindah Saldo dari/ke Kantong Ini"
        onPress={onTransferPress}
        variant="primary"
        icon={<ArrowRightLeft size={18} color="#09090B" strokeWidth={2.5} />}
      />

      {/* Transaction History Section */}
      <View style={styles.historySection}>
        <Text style={styles.historySectionTitle}>Riwayat Mutasi Kantong</Text>

        <View style={styles.ledgerCard}>
          {isLoading ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="small" color="#FFD165" />
            </View>
          ) : transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Belum ada riwayat transaksi pada kantong ini.</Text>
            </View>
          ) : (
            transactions.map((tx, idx) => {
              const isIncome = tx.type === 0;
              const isExpense = tx.type === 1;
              const isTransfer = tx.type === 2;
              const isTransferIn = isTransfer && tx.toWalletId === wallet.id;
              const isTransferOut = isTransfer && tx.walletId === wallet.id;

              const isPositive = isIncome || isTransferIn;
              const isNegative = isExpense || isTransferOut;

              const isLast = idx === transactions.length - 1;

              return (
                <View
                  key={tx.id}
                  style={[styles.txRow, !isLast && styles.txBorderBottom]}
                >
                  <View
                    style={[
                      styles.txIconBox,
                      isPositive
                        ? styles.incomeIconBox
                        : isNegative
                        ? styles.expenseIconBox
                        : styles.transferIconBox,
                    ]}
                  >
                    {isPositive ? (
                      <ArrowUpRight size={16} color="#10B981" strokeWidth={2.5} />
                    ) : (
                      <ArrowDownLeft size={16} color="#EF4444" strokeWidth={2.5} />
                    )}
                  </View>

                  <View style={styles.txCenter}>
                    <Text style={styles.txTitle} numberOfLines={1}>
                      {tx.notes || tx.categoryName}
                    </Text>
                    <View style={styles.txMeta}>
                      <Text style={styles.txCategory}>
                        {isTransfer
                          ? isTransferIn
                            ? `Transfer Masuk dari ${tx.walletName}`
                            : 'Transfer Keluar'
                          : tx.categoryName}
                      </Text>
                      <View style={styles.dot} />
                      <Text style={styles.txDate}>
                        {formatTransactionDate(tx.date)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.txRight}>
                    <Text
                      style={[
                        styles.txAmount,
                        isPositive
                          ? styles.positiveText
                          : isNegative
                          ? styles.negativeText
                          : styles.neutralText,
                      ]}
                    >
                      {isPositive ? '+' : '-'}
                      {formatRupiah(tx.amount)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>
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
    paddingBottom: 110,
    gap: 16,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#F4F4F5',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  typeBadgeText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#FFD165',
    fontWeight: '600',
  },
  heroCard: {
    borderRadius: 20,
    backgroundColor: '#1C1C20',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(234, 179, 8, 0.08)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#0E0E11',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 51, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHeaderInfo: {
    flex: 1,
  },
  walletNameLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#D3C5AC',
    marginBottom: 4,
  },
  balanceNominal: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 26,
    color: '#F4F4F5',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(79, 70, 51, 0.3)',
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 9,
    textTransform: 'uppercase',
    color: '#71717A',
    marginBottom: 2,
  },
  inValue: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  outValue: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  historySection: {
    marginTop: 6,
  },
  historySectionTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: '#F4F4F5',
    marginBottom: 10,
  },
  ledgerCard: {
    borderRadius: 18,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 51, 0.3)',
    overflow: 'hidden',
  },
  centerLoading: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#71717A',
    textAlign: 'center',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  txBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(39, 39, 42, 0.6)',
  },
  txIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E0E11',
    borderWidth: 1,
    marginRight: 12,
  },
  incomeIconBox: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  expenseIconBox: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  transferIconBox: {
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  txCenter: {
    flex: 1,
  },
  txTitle: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: '#F4F4F5',
    marginBottom: 3,
  },
  txMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txCategory: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#9B8F79',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#3F3F46',
  },
  txDate: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    color: '#71717A',
  },
  txRight: {
    marginLeft: 8,
    alignItems: 'flex-end',
  },
  txAmount: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 13,
    fontWeight: '600',
  },
  positiveText: {
    color: '#10B981',
  },
  negativeText: {
    color: '#EF4444',
  },
  neutralText: {
    color: '#FFD165',
  },
});

