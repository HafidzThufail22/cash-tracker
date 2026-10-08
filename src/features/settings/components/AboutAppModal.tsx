import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
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
      <View className="gap-4.5 pb-2">
        {/* App Banner */}
        <View className="bg-[#111113] border border-border rounded-[14px] p-4 items-center gap-1.5">
          <Text className="font-grotesk-bold text-xl tracking-[2px] text-gold-primary">
            CASH TRACKER
          </Text>
          <Text className="font-mono text-[11px] text-zinc-400">
            Versi 1.0.0 • SQLite Engine
          </Text>
          <Text className="font-manrope text-xs leading-[18px] text-zinc-500 text-center mt-1">
            Aplikasi pencatatan keuangan pribadi dengan prinsip 100% penyimpanan lokal dan
            desain hemat daya OLED Dark Luxury.
          </Text>
        </View>

        {/* Real Data Metrics */}
        <View className="gap-2">
          <Text className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 ml-0.5">
            STATUS PENYIMPANAN AKTIF
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color="#FFD165" />
          ) : (
            <View className="flex-row gap-2.5">
              <View className="flex-1 bg-surface border border-border rounded-xl p-3.5 items-center gap-1.5">
                <Wallet size={16} color="#FFD165" />
                <Text className="font-grotesk-bold text-[22px] text-zinc-100">{stats?.walletCount || 0}</Text>
                <Text className="font-manrope-medium text-xs text-zinc-400">Kantong Kas</Text>
              </View>
              <View className="flex-1 bg-surface border border-border rounded-xl p-3.5 items-center gap-1.5">
                <ReceiptText size={16} color="#10B981" />
                <Text className="font-grotesk-bold text-[22px] text-zinc-100">{stats?.txCount || 0}</Text>
                <Text className="font-manrope-medium text-xs text-zinc-400">Total Mutasi</Text>
              </View>
            </View>
          )}
        </View>

        {/* Architecture & Privacy Highlights */}
        <View className="gap-2">
          <Text className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 ml-0.5">
            SPESIFIKASI ARSITEKTUR
          </Text>
          <View className="gap-2.5">
            <View className="flex-row items-start bg-surface border border-border rounded-xl p-3 gap-3">
              <View className="w-8 h-8 rounded-full bg-border items-center justify-center mt-0.5">
                <ShieldCheck size={18} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="font-manrope-semibold text-[13px] text-zinc-100 mb-0.5">Privasi 100% Terjaga</Text>
                <Text className="font-manrope text-xs leading-[17px] text-zinc-400">
                  Data tersimpan sepenuhnya di perangkat lokal Anda tanpa sinkronisasi cloud atau
                  pelacakan pihak ketiga.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start bg-surface border border-border rounded-xl p-3 gap-3">
              <View className="w-8 h-8 rounded-full bg-border items-center justify-center mt-0.5">
                <HardDrive size={18} color="#FFD165" />
              </View>
              <View className="flex-1">
                <Text className="font-manrope-semibold text-[13px] text-zinc-100 mb-0.5">Offline-First SQLite</Text>
                <Text className="font-manrope text-xs leading-[17px] text-zinc-400">
                  Ditenagai oleh expo-sqlite & Drizzle ORM untuk transaksi atomik instan tanpa
                  bergantung pada koneksi internet.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start bg-surface border border-border rounded-xl p-3 gap-3">
              <View className="w-8 h-8 rounded-full bg-border items-center justify-center mt-0.5">
                <Cpu size={18} color="#A1A1AA" />
              </View>
              <View className="flex-1">
                <Text className="font-manrope-semibold text-[13px] text-zinc-100 mb-0.5">Desain Hemat Daya OLED</Text>
                <Text className="font-manrope text-xs leading-[17px] text-zinc-400">
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
