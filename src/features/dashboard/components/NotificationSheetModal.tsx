import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FFD165" />
          <Text style={styles.loadingText}>Memeriksa status anggaran...</Text>
        </View>
      ) : alertBudgets.length > 0 ? (
        <View style={styles.contentContainer}>
          <View style={styles.summaryBanner}>
            <AlertCircle size={18} color="#EF4444" />
            <Text style={styles.summaryBannerText}>
              Perhatian: {alertBudgets.length} pos anggaran memerlukan perhatian bulan ini.
            </Text>
          </View>

          <View style={styles.listContainer}>
            {alertBudgets.map((item) => {
              const isOver = item.status === 'overbudget';
              const badgeBg = isOver ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)';
              const badgeBorder = isOver ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.35)';
              const badgeText = isOver ? '#EF4444' : '#F59E0B';
              const labelText = isOver ? 'Overbudget' : 'Mendekati Batas';

              return (
                <View key={item.id} style={styles.alertCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{item.categoryName}</Text>
                      <Text style={styles.usageText}>
                        Terpakai {formatRupiah(item.spent)} dari {formatRupiah(item.amountLimit)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: badgeBg, borderColor: badgeBorder },
                      ]}
                    >
                      <Text style={[styles.statusBadgeText, { color: badgeText }]}>
                        {labelText} ({item.percentage}%)
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(item.percentage, 100)}%`,
                          backgroundColor: badgeText,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.adviceText}>
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
        <View style={styles.emptyContainer}>
          <View style={styles.shieldCircle}>
            <ShieldCheck size={36} color="#10B981" strokeWidth={2} />
          </View>
          <Text style={styles.emptyTitle}>Semua Anggaran Terkendali</Text>
          <Text style={styles.emptyDescription}>
            {totalBudgetsCount > 0
              ? 'Seluruh pos pengeluaran bulan ini masih berada di bawah 80% dari batas limit. Sistem akan memunculkan indikator peringatan otomatis jika ada pos yang mendekati kuota.'
              : 'Belum ada batas anggaran yang ditetapkan. Anda dapat mengatur target pengeluaran di menu Anggaran (Budgets).'}
          </Text>
        </View>
      )}
    </ModalLayout>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#A1A1AA',
  },
  contentContainer: {
    gap: 14,
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  summaryBannerText: {
    flex: 1,
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#FCA5A5',
  },
  listContainer: {
    gap: 10,
  },
  alertCard: {
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    color: '#F4F4F5',
  },
  usageText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#27272A',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  adviceText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: '#71717A',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  shieldCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 18,
    color: '#F4F4F5',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: '#A1A1AA',
    textAlign: 'center',
  },
});
