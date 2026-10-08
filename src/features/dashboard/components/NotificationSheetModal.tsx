import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { ShieldCheck, AlertCircle } from 'lucide-react-native';
import { ModalLayout } from '../../../layouts/ModalLayout';
import { getBudgetsWithUsage, BudgetItemWithUsage } from '../../../database/repositories/budgetRepo';
import { formatRupiah } from '../../../utils/currency';

interface NotificationSheetModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateToBudgets?: () => void;
}

export function NotificationSheetModal({
  visible,
  onClose,
  onNavigateToBudgets,
}: NotificationSheetModalProps) {
  const [loading, setLoading] = useState(true);
  const [alertBudgets, setAlertBudgets] = useState<BudgetItemWithUsage[]>([]);
  const [totalBudgetsCount, setTotalBudgetsCount] = useState(0);

  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    async function loadAlerts() {
      setLoading(true);
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const res = await getBudgetsWithUsage(year, month);

        if (!isMounted) return;
        setTotalBudgetsCount(res.budgets.length);
        const alerts = res.budgets.filter(
          (b) => b.status === 'overbudget' || b.status === 'warning'
        );
        setAlertBudgets(alerts);
      } catch (err) {
        console.error('Gagal mengambil alert anggaran:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAlerts();
    return () => {
      isMounted = false;
    };
  }, [visible]);

  return (
    <ModalLayout
      visible={visible}
      onClose={onClose}
      title="Pengingat Keuangan"
      subtitle="Financial Alert Center"
      scrollable
    >
      {loading ? (
        <View className="py-9 items-center justify-center gap-3">
          <ActivityIndicator size="small" color="#FFD165" />
          <Text className="font-manrope text-[13px] text-zinc-400">Memeriksa status anggaran...</Text>
        </View>
      ) : alertBudgets.length > 0 ? (
        <View className="gap-3.5">
          <View className="flex-row items-center gap-2.5 bg-red-500/10 border border-red-500/25 rounded-xl px-3.5 py-2.5">
            <AlertCircle size={18} color="#EF4444" />
            <Text className="flex-1 font-manrope-medium text-[13px] text-red-300">
              Perhatian: {alertBudgets.length} pos anggaran memerlukan perhatian bulan ini.
            </Text>
          </View>

          <View className="gap-2.5">
            {alertBudgets.map((item) => {
              const isOver = item.status === 'overbudget';
              const badgeBg = isOver ? 'bg-red-500/15 border-red-500/35' : 'bg-amber-500/15 border-amber-500/35';
              const badgeText = isOver ? 'text-semantic-expense' : 'text-amber-400';
              const barFillColor = isOver ? '#EF4444' : '#F59E0B';
              const labelText = isOver ? 'Overbudget' : 'Mendekati Batas';

              return (
                <View key={item.id} className="bg-surface border border-border rounded-[14px] p-3.5 gap-2.5">
                  <View className="flex-row justify-between items-start gap-2">
                    <View className="flex-1">
                      <Text className="font-manrope-bold text-[15px] text-zinc-100">{item.categoryName}</Text>
                      <Text className="font-mono text-xs text-zinc-400 mt-0.5">
                        Terpakai {formatRupiah(item.spent)} dari {formatRupiah(item.amountLimit)}
                      </Text>
                    </View>
                    <View className={`px-2 py-1 rounded-md border ${badgeBg}`}>
                      <Text className={`font-mono text-[11px] font-medium ${badgeText}`}>
                        {labelText} ({item.percentage}%)
                      </Text>
                    </View>
                  </View>

                  <View className="h-1.5 rounded-full bg-border overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(item.percentage, 100)}%`,
                        backgroundColor: barFillColor,
                      }}
                    />
                  </View>

                  <Text className="font-manrope text-xs text-zinc-500">
                    {isOver
                      ? `Melebihi kuota sebesar ${formatRupiah(Math.abs(item.remaining))}`
                      : `Sisa anggaran tersisa ${formatRupiah(item.remaining)} (${100 - item.percentage}% tersisa)`}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <View className="items-center justify-center py-8 px-4">
          <View className="w-[68px] h-[68px] rounded-full bg-emerald-500/15 border-[1.5px] border-emerald-500/30 items-center justify-center mb-4">
            <ShieldCheck size={36} color="#10B981" strokeWidth={2} />
          </View>
          <Text className="font-manrope-bold text-lg text-zinc-100 mb-2 text-center">
            Semua Anggaran Terkendali
          </Text>
          <Text className="font-manrope text-[13px] leading-5 text-zinc-400 text-center">
            {totalBudgetsCount > 0
              ? 'Seluruh pos pengeluaran bulan ini masih berada di bawah 80% dari batas limit. Sistem akan memunculkan indikator peringatan otomatis jika ada pos yang mendekati kuota.'
              : 'Belum ada batas anggaran yang ditetapkan. Anda dapat mengatur target pengeluaran di menu Anggaran (Budgets).'}
          </Text>
        </View>
      )}
    </ModalLayout>
  );
}
