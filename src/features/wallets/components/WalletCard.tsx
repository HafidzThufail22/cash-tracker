import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { PiggyBank, Plus, Banknote } from 'lucide-react-native';
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
      className={`w-[230px] h-[130px] rounded-2xl p-4 justify-between mr-3 border relative overflow-hidden ${
        isSavings ? 'bg-[#232228] border-gold/35' : 'bg-[#1F1F22] border-gold/20'
      }`}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isSavings && <View className="absolute -right-5 -bottom-5 w-[90px] h-[90px] rounded-full bg-gold/10" />}

      <View className="flex-row items-center justify-between">
        <View
          className={`w-9 h-9 rounded-[10px] items-center justify-center bg-surface-lowest border ${
            isSavings ? 'border-yellow-500/30' : 'border-emerald-500/25'
          }`}
        >
          {isSavings ? (
            <PiggyBank size={20} color="#FFD165" strokeWidth={2.2} />
          ) : (
            <Banknote size={20} color="#10B981" strokeWidth={2.2} />
          )}
        </View>

        <View
          className={`px-2 py-0.5 rounded-full border ${
            isSavings
              ? 'bg-yellow-500/10 border-yellow-500/30'
              : 'bg-emerald-500/10 border-emerald-500/20'
          }`}
        >
          <Text
            className={`font-mono text-[10px] uppercase tracking-wider font-semibold ${
              isSavings ? 'text-gold-primary' : 'text-semantic-income'
            }`}
          >
            {isSavings ? 'Tabungan' : 'Cash'}
          </Text>
        </View>
      </View>

      <View className="mt-2.5">
        <Text className="font-mono text-[11px] uppercase tracking-wide text-zinc-400 mb-1" numberOfLines={1}>
          {name}
        </Text>
        <Text className="font-grotesk-bold text-xl text-zinc-100 tracking-tight" numberOfLines={1}>
          {displayBalance}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function NewPocketCard({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity
      className="w-[120px] h-[130px] rounded-2xl bg-[#1B1B1E]/50 border border-dashed border-gold/30 items-center justify-center gap-2 mr-3"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-8 h-8 rounded-full bg-surface items-center justify-center">
        <Plus size={20} color="#71717A" strokeWidth={2} />
      </View>
      <Text className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 text-center">New Pocket</Text>
    </TouchableOpacity>
  );
}
