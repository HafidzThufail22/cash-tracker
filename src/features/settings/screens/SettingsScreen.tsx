import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
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
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Header Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroSubtitle}>PENGATURAN SISTEM</Text>
          <Text style={styles.heroTitle}>Preferensi & Data</Text>
          <Text style={styles.heroDesc}>
            Atur kategori transaksi dinamis, preferensi bahasa, dan pencadangan basis data lokal.
          </Text>
        </View>
        <View style={styles.heroBadge}>
          <ShieldCheck size={14} color="#10B981" />
          <Text style={styles.heroBadgeText}>100% Offline</Text>
        </View>
      </View>

      {/* Section 1: Kategori */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>KLASIFIKASI KEUANGAN</Text>
        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => setShowCategoryModal(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
            <Tag size={20} color="#FFD165" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Manajemen Kategori</Text>
            <Text style={styles.cardDesc}>
              Atur pos pengeluaran & pemasukan beserta ikon kustom pilihan
            </Text>
          </View>
          <ChevronRight size={18} color="#52525B" />
        </TouchableOpacity>
      </View>

      {/* Section 2: Bahasa */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>BAHASA APLIKASI (LANGUAGE)</Text>
        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={[
              styles.languageOption,
              selectedLanguage === 'id' && styles.languageOptionActive,
            ]}
            onPress={() => handleSelectLanguage('id')}
            activeOpacity={0.7}
          >
            <View style={styles.langLeft}>
              <Globe size={18} color={selectedLanguage === 'id' ? '#FFD165' : '#71717A'} />
              <View>
                <Text
                  style={[
                    styles.langTitle,
                    selectedLanguage === 'id' && styles.langTitleActive,
                  ]}
                >
                  Bahasa Indonesia
                </Text>
                <Text style={styles.langSubtitle}>Bahasa Bawaan Sistem</Text>
              </View>
            </View>
            {selectedLanguage === 'id' && (
              <View style={styles.activeDot}>
                <Check size={14} color="#09090B" strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageOption,
              selectedLanguage === 'en' && styles.languageOptionActive,
            ]}
            onPress={() => handleSelectLanguage('en')}
            activeOpacity={0.7}
          >
            <View style={styles.langLeft}>
              <Globe size={18} color={selectedLanguage === 'en' ? '#FFD165' : '#71717A'} />
              <View>
                <Text
                  style={[
                    styles.langTitle,
                    selectedLanguage === 'en' && styles.langTitleActive,
                  ]}
                >
                  English (US)
                </Text>
                <Text style={styles.langSubtitle}>International English</Text>
              </View>
            </View>
            {selectedLanguage === 'en' && (
              <View style={styles.activeDot}>
                <Check size={14} color="#09090B" strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Section 3: Cadangkan & Pulihkan */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>CADANGAN & PEMULIHAN BASIS DATA</Text>

        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => exportBackup()}
          disabled={isExporting}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
            <Download size={20} color="#60A5FA" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Cadangkan Data (Export JSON)</Text>
            <Text style={styles.cardDesc}>
              Ekspor seluruh mutasi transaksi, kantong kas, dan anggaran
            </Text>
          </View>
          <ChevronRight size={18} color="#52525B" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => setShowRestoreModal(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Upload size={20} color="#34D399" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Pulihkan Data (Import JSON)</Text>
            <Text style={styles.cardDesc}>
              Impor kembali arsip cadangan ke dalam basis data SQLite
            </Text>
          </View>
          <ChevronRight size={18} color="#52525B" />
        </TouchableOpacity>
      </View>

      {/* Section 4: Tentang Aplikasi */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>INFORMASI APLIKASI</Text>
        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => setShowAboutModal(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(161, 161, 170, 0.15)' }]}>
            <Info size={20} color="#D4D4D8" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Tentang Cash Tracker</Text>
            <Text style={styles.cardDesc}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 88 : 80,
    gap: 20,
  },
  heroCard: {
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    borderTopColor: 'rgba(234, 179, 8, 0.4)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  heroSubtitle: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    letterSpacing: 1.2,
    color: '#FFD165',
    marginBottom: 4,
  },
  heroTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 20,
    color: '#F4F4F5',
    letterSpacing: -0.3,
  },
  heroDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#A1A1AA',
    marginTop: 6,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  heroBadgeText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    color: '#10B981',
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#71717A',
    marginLeft: 2,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 14,
    padding: 14,
    gap: 14,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 15,
    color: '#F4F4F5',
  },
  cardDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#71717A',
    marginTop: 2,
  },
  languageContainer: {
    gap: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 14,
    padding: 14,
  },
  languageOptionActive: {
    borderColor: 'rgba(234, 179, 8, 0.4)',
    backgroundColor: 'rgba(234, 179, 8, 0.05)',
  },
  langLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  langTitle: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: '#A1A1AA',
  },
  langTitleActive: {
    color: '#F4F4F5',
  },
  langSubtitle: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: '#71717A',
    marginTop: 1,
  },
  activeDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFD165',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
