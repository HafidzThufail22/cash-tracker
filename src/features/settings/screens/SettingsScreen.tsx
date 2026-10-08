import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Tag,
  Globe,
  Download,
  Upload,
  Info,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react-native';
import { CategoryManagerModal } from '../components/CategoryManagerModal';
import { RestoreDataModal } from '../components/RestoreDataModal';
import { AboutAppModal } from '../components/AboutAppModal';
import { useDataBackup } from '../hooks/useDataBackup';

interface SettingsScreenProps {
  onDataRestored?: () => void;
}

export function SettingsScreen({ onDataRestored }: SettingsScreenProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<'id' | 'en'>('id');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const { exportBackup, isExporting } = useDataBackup();

  const handleSelectLanguage = (lang: 'id' | 'en') => {
    setSelectedLanguage(lang);
    Alert.alert(
      'Bahasa Diperbarui',
      lang === 'id'
        ? 'Bahasa aplikasi diatur ke Bahasa Indonesia.'
        : 'App language set to English (US).'
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-4 pt-4 pb-24 gap-5"
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Header Card */}
      <View className="bg-surface border border-border border-t-gold-primary/40 rounded-2xl p-4 flex-row justify-between items-start">
        <View className="flex-1 pr-2.5">
          <Text className="font-mono text-[10px] tracking-widest text-gold-primary mb-1">
            PENGATURAN SISTEM
          </Text>
          <Text className="font-manrope-bold text-xl text-text-primary tracking-tight">
            Preferensi & Data
          </Text>
          <Text className="font-manrope text-xs leading-[18px] text-text-secondary mt-1.5">
            Atur kategori transaksi dinamis, preferensi bahasa, dan pencadangan basis data lokal.
          </Text>
        </View>
        <View className="flex-row items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/25">
          <ShieldCheck size={14} color="#10B981" />
          <Text className="font-mono text-[10px] text-semantic-income">100% Offline</Text>
        </View>
      </View>

      {/* Section 1: Kategori */}
      <View className="gap-2.5">
        <Text className="font-mono text-[11px] tracking-wider uppercase text-text-muted ml-0.5">
          KLASIFIKASI KEUANGAN
        </Text>
        <TouchableOpacity
          className="flex-row items-center bg-surface border border-border rounded-xl p-3.5 gap-3.5"
          onPress={() => setShowCategoryModal(true)}
          activeOpacity={0.7}
        >
          <View className="w-[42px] h-[42px] rounded-full items-center justify-center bg-gold-primary/15">
            <Tag size={20} color="#FFD165" />
          </View>
          <View className="flex-1">
            <Text className="font-manrope-semibold text-[15px] text-text-primary">Manajemen Kategori</Text>
            <Text className="font-manrope text-xs leading-4 text-text-muted mt-0.5">
              Atur pos pengeluaran & pemasukan beserta ikon kustom pilihan
            </Text>
          </View>
          <ChevronRight size={18} color="#52525B" />
        </TouchableOpacity>
      </View>

      {/* Section 2: Bahasa */}
      <View className="gap-2.5">
        <Text className="font-mono text-[11px] tracking-wider uppercase text-text-muted ml-0.5">
          BAHASA APLIKASI (LANGUAGE)
        </Text>
        <View className="gap-2">
          <TouchableOpacity
            className={`flex-row items-center justify-between bg-surface border rounded-xl p-3.5 ${
              selectedLanguage === 'id'
                ? 'border-gold-primary/40 bg-gold-primary/5'
                : 'border-border'
            }`}
            onPress={() => handleSelectLanguage('id')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-3">
              <Globe size={18} color={selectedLanguage === 'id' ? '#FFD165' : '#71717A'} />
              <View>
                <Text
                  className={`font-manrope-semibold text-sm ${
                    selectedLanguage === 'id' ? 'text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  Bahasa Indonesia
                </Text>
                <Text className="font-mono text-[11px] text-text-muted mt-0.5">Bahasa Bawaan Sistem</Text>
              </View>
            </View>
            {selectedLanguage === 'id' && (
              <View className="w-6 h-6 rounded-full bg-gold-primary items-center justify-center">
                <Check size={14} color="#09090B" strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-row items-center justify-between bg-surface border rounded-xl p-3.5 ${
              selectedLanguage === 'en'
                ? 'border-gold-primary/40 bg-gold-primary/5'
                : 'border-border'
            }`}
            onPress={() => handleSelectLanguage('en')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-3">
              <Globe size={18} color={selectedLanguage === 'en' ? '#FFD165' : '#71717A'} />
              <View>
                <Text
                  className={`font-manrope-semibold text-sm ${
                    selectedLanguage === 'en' ? 'text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  English (US)
                </Text>
                <Text className="font-mono text-[11px] text-text-muted mt-0.5">International English</Text>
              </View>
            </View>
            {selectedLanguage === 'en' && (
              <View className="w-6 h-6 rounded-full bg-gold-primary items-center justify-center">
                <Check size={14} color="#09090B" strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Section 3: Cadangkan & Pulihkan */}
      <View className="gap-2.5">
        <Text className="font-mono text-[11px] tracking-wider uppercase text-text-muted ml-0.5">
          CADANGAN & PEMULIHAN BASIS DATA
        </Text>

        <TouchableOpacity
          className="flex-row items-center bg-surface border border-border rounded-xl p-3.5 gap-3.5"
          onPress={() => exportBackup()}
          disabled={isExporting}
          activeOpacity={0.7}
        >
          <View className="w-[42px] h-[42px] rounded-full items-center justify-center bg-blue-500/15">
            <Download size={20} color="#60A5FA" />
          </View>
          <View className="flex-1">
            <Text className="font-manrope-semibold text-[15px] text-text-primary">Cadangkan Data (Export JSON)</Text>
            <Text className="font-manrope text-xs leading-4 text-text-muted mt-0.5">
              Ekspor seluruh mutasi transaksi, kantong kas, dan anggaran
            </Text>
          </View>
          <ChevronRight size={18} color="#52525B" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center bg-surface border border-border rounded-xl p-3.5 gap-3.5"
          onPress={() => setShowRestoreModal(true)}
          activeOpacity={0.7}
        >
          <View className="w-[42px] h-[42px] rounded-full items-center justify-center bg-emerald-500/15">
            <Upload size={20} color="#34D399" />
          </View>
          <View className="flex-1">
            <Text className="font-manrope-semibold text-[15px] text-text-primary">Pulihkan Data (Import JSON)</Text>
            <Text className="font-manrope text-xs leading-4 text-text-muted mt-0.5">
              Impor kembali arsip cadangan ke dalam basis data SQLite
            </Text>
          </View>
          <ChevronRight size={18} color="#52525B" />
        </TouchableOpacity>
      </View>

      {/* Section 4: Tentang Aplikasi */}
      <View className="gap-2.5">
        <Text className="font-mono text-[11px] tracking-wider uppercase text-text-muted ml-0.5">
          INFORMASI APLIKASI
        </Text>
        <TouchableOpacity
          className="flex-row items-center bg-surface border border-border rounded-xl p-3.5 gap-3.5"
          onPress={() => setShowAboutModal(true)}
          activeOpacity={0.7}
        >
          <View className="w-[42px] h-[42px] rounded-full items-center justify-center bg-zinc-500/15">
            <Info size={20} color="#D4D4D8" />
          </View>
          <View className="flex-1">
            <Text className="font-manrope-semibold text-[15px] text-text-primary">Tentang Cash Tracker</Text>
            <Text className="font-manrope text-xs leading-4 text-text-muted mt-0.5">
              Versi 1.0.0 • Arsitektur Drizzle SQLite & Jaminan Privasi
            </Text>
          </View>
          <ChevronRight size={18} color="#52525B" />
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <CategoryManagerModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCategoriesChanged={() => {
          if (onDataRestored) onDataRestored();
        }}
      />

      <RestoreDataModal
        visible={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        onRestoreSuccess={() => {
          if (onDataRestored) onDataRestored();
        }}
      />

      <AboutAppModal
        visible={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </ScrollView>
  );
}
