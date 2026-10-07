import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ShieldCheck, HardDrive, Cpu, Wallet, ReceiptText } from 'lucide-react-native';
import { ModalLayout } from '../../../layouts/ModalLayout';
import { db } from '../../../database/db';
import { transactions, wallets } from '../../../database/schema';
import { sql } from 'drizzle-orm';

interface AboutAppModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AboutAppModal({ visible, onClose }: AboutAppModalProps) {
  const [stats, setStats] = useState<{ walletCount: number; txCount: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    async function loadStats() {
      setLoading(true);
      try {
        const [wRes, tRes] = await Promise.all([
          db.select({ count: sql<number>`count(*)` }).from(wallets),
          db.select({ count: sql<number>`count(*)` }).from(transactions),
        ]);

        if (isMounted) {
          setStats({
            walletCount: Number(wRes[0]?.count || 0),
            txCount: Number(tRes[0]?.count || 0),
          });
        }
      } catch (err) {
        console.error('Gagal mengambil statistik database:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStats();
    return () => {
      isMounted = false;
    };
  }, [visible]);

  return (
    <ModalLayout
      visible={visible}
      onClose={onClose}
      title="Tentang Cash Tracker"
      subtitle="Informasi & Privasi Sistem"
      scrollable
    >
      <View style={styles.container}>
        {/* App Banner */}
        <View style={styles.bannerCard}>
          <Text style={styles.brandTitle}>CASH TRACKER</Text>
          <Text style={styles.versionBadge}>Versi 1.0.0 • SQLite Engine</Text>
          <Text style={styles.brandDescription}>
            Aplikasi pencatatan keuangan pribadi dengan prinsip 100% penyimpanan lokal dan
            desain hemat daya OLED Dark Luxury.
          </Text>
        </View>

        {/* Real Data Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STATUS PENYIMPANAN AKTIF</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#FFD165" />
          ) : (
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Wallet size={16} color="#FFD165" />
                <Text style={styles.statValue}>{stats?.walletCount || 0}</Text>
                <Text style={styles.statLabel}>Kantong Kas</Text>
              </View>
              <View style={styles.statBox}>
                <ReceiptText size={16} color="#10B981" />
                <Text style={styles.statValue}>{stats?.txCount || 0}</Text>
                <Text style={styles.statLabel}>Total Mutasi</Text>
              </View>
            </View>
          )}
        </View>

        {/* Architecture & Privacy Highlights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SPESIFIKASI ARSITEKTUR</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <ShieldCheck size={18} color="#10B981" />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureHeading}>Privasi 100% Terjaga</Text>
                <Text style={styles.featureDesc}>
                  Data tersimpan sepenuhnya di perangkat lokal Anda tanpa sinkronisasi cloud atau
                  pelacakan pihak ketiga.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <HardDrive size={18} color="#FFD165" />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureHeading}>Offline-First SQLite</Text>
                <Text style={styles.featureDesc}>
                  Ditenagai oleh expo-sqlite & Drizzle ORM untuk transaksi atomik instan tanpa
                  bergantung pada koneksi internet.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Cpu size={18} color="#A1A1AA" />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureHeading}>Desain Hemat Daya OLED</Text>
                <Text style={styles.featureDesc}>
                  Dominasi palet warna True OLED Black (#09090B) memaksimalkan efisiensi baterai
                  layar AMOLED/OLED.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ModalLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    paddingBottom: 8,
  },
  bannerCard: {
    backgroundColor: '#111113',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    letterSpacing: 2,
    color: '#FFD165',
  },
  versionBadge: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    color: '#A1A1AA',
  },
  brandDescription: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#71717A',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#71717A',
    marginLeft: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    color: '#F4F4F5',
  },
  statLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#A1A1AA',
  },
  featureList: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureHeading: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: '#F4F4F5',
    marginBottom: 2,
  },
  featureDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    lineHeight: 17,
    color: '#A1A1AA',
  },
});
