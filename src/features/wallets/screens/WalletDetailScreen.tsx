import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
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
import { formatRupiah } from '../../../utils/currency';
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

  const { totalIn, totalOut } = useMemo(() => {
    let inSum = 0;
    let outSum = 0;

    for (const t of transactions) {
      if (t.type === 0 && t.walletId === wallet.id) {
        inSum += t.amount;
      } else if (t.type === 2 && t.toWalletId === wallet.id) {
        inSum += t.amount;
      } else if (t.type === 1 && t.walletId === wallet.id) {
        outSum += t.amount;
      } else if (t.type === 2 && t.walletId === wallet.id) {
        outSum += t.amount;
      }
    }

    return { totalIn: inSum, totalOut: outSum };
  }, [transactions, wallet.id]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 88 : 80,
        gap: 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Navigation Bar */}
      <View className="flex-row items-center justify-between py-1">
        <TouchableOpacity
          className="w-[38px] h-[38px] rounded-full bg-surface border border-border items-center justify-center"
          onPress={onBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#F4F4F5" />
        </TouchableOpacity>
        <Text className="font-manrope-bold text-base text-zinc-100 flex-1 text-center" numberOfLines={1}>
          Detail Kantong
        </Text>
        <View
          className={`px-2.5 py-1 rounded-full border ${
            isSavings
              ? 'bg-gold/10 border-gold/25'
              : isBank
              ? 'bg-blue-500/10 border-blue-500/25'
              : 'bg-emerald-500/10 border-emerald-500/25'
          }`}
        >
          <Text
            className={`font-mono text-[11px] font-bold uppercase ${
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

      {/* Hero Wallet Balance Card */}
      <View className="p-5 rounded-[22px] bg-surface border border-gold/30 relative overflow-hidden">
        <View className="absolute -top-10 -right-10 w-[140px] h-[140px] rounded-full bg-gold/10" />

        <View className="flex-row items-center gap-3.5">
          <View
            className={`w-12 h-12 rounded-xl items-center justify-center border bg-surface-lowest ${
              isSavings
                ? 'border-gold/30'
                : isBank
                ? 'border-blue-500/30'
                : 'border-emerald-500/30'
            }`}
          >
            {isSavings ? (
              <PiggyBank size={24} color="#FFD165" strokeWidth={2.2} />
            ) : isBank ? (
              <Landmark size={24} color="#3B82F6" strokeWidth={2.2} />
            ) : (
              <Banknote size={24} color="#10B981" strokeWidth={2.2} />
            )}
          </View>
          <View className="flex-1">
            <Text className="font-mono text-xs uppercase tracking-wider text-zinc-400 mb-1">{wallet.name}</Text>
            <Text className="font-grotesk-bold text-2xl text-zinc-100 tracking-tight">{formatRupiah(wallet.balance)}</Text>
          </View>
        </View>

        {/* Micro-stats In & Out */}
        <View className="h-[1px] bg-border my-3.5" />
        <View className="flex-row gap-3">
          <View className="flex-1 flex-row items-center gap-2.5 p-2.5 rounded-xl bg-[#111113] border border-border">
            <View className="w-6 h-6 rounded-full bg-emerald-500/15 items-center justify-center">
              <ArrowUpRight size={14} color="#10B981" />
            </View>
            <View>
              <Text className="font-manrope-medium text-[10px] text-zinc-500 mb-0.5">Akumulasi Masuk</Text>
              <Text className="font-grotesk text-xs text-semantic-income">+{formatRupiah(totalIn)}</Text>
            </View>
          </View>

          <View className="flex-1 flex-row items-center gap-2.5 p-2.5 rounded-xl bg-[#111113] border border-border">
            <View className="w-6 h-6 rounded-full bg-red-500/15 items-center justify-center">
              <ArrowDownLeft size={14} color="#EF4444" />
            </View>
            <View>
              <Text className="font-manrope-medium text-[10px] text-zinc-500 mb-0.5">Akumulasi Keluar</Text>
              <Text className="font-grotesk text-xs text-semantic-expense">-{formatRupiah(totalOut)}</Text>
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
      <View className="mt-1">
        <Text className="font-manrope-bold text-base text-zinc-100 tracking-tight mb-2.5">
          Riwayat Mutasi Kantong
        </Text>

        <View className="rounded-2xl bg-surface border border-border overflow-hidden">
          {isLoading ? (
            <View className="p-8 items-center justify-center">
              <ActivityIndicator size="small" color="#FFD165" />
            </View>
          ) : transactions.length === 0 ? (
            <View className="p-8 items-center justify-center">
              <Text className="font-manrope text-sm text-zinc-500 text-center">
                Belum ada riwayat transaksi pada kantong ini.
              </Text>
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
                  className={`flex-row items-center p-3.5 ${!isLast ? 'border-b border-border/50' : ''}`}
                >
                  <View
                    className={`w-9 h-9 rounded-xl items-center justify-center bg-surface-lowest border mr-3 ${
                      isPositive
                        ? 'border-emerald-500/25'
                        : isNegative
                        ? 'border-red-500/25'
                        : 'border-yellow-500/25'
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight size={16} color="#10B981" strokeWidth={2.5} />
                    ) : (
                      <ArrowDownLeft size={16} color="#EF4444" strokeWidth={2.5} />
                    )}
                  </View>

                  <View className="flex-1 justify-center">
                    <Text className="font-manrope-semibold text-sm text-zinc-100 mb-0.5" numberOfLines={1}>
                      {tx.notes || tx.categoryName}
                    </Text>
                    <View className="flex-row items-center gap-1.5">
                      <Text className="font-mono text-[10px] uppercase text-[#9B8F79]">
                        {isTransfer
                          ? isTransferIn
                            ? `Transfer Masuk dari ${tx.walletName}`
                            : 'Transfer Keluar'
                          : tx.categoryName}
                      </Text>
                      <View className="w-[3px] h-[3px] rounded-full bg-zinc-700" />
                      <Text className="font-mono text-[10px] text-zinc-500">
                        {formatTransactionDate(tx.date)}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end ml-2">
                    <Text
                      className={`font-mono text-xs font-semibold ${
                        isPositive
                          ? 'text-semantic-income'
                          : isNegative
                          ? 'text-semantic-expense'
                          : 'text-gold-primary'
                      }`}
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
