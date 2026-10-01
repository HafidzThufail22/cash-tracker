import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import {
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ScreenWrapper } from './src/layouts/ScreenWrapper';
import { Header } from './src/layouts/Header';
import { BottomTabs, TabRoute } from './src/navigation/BottomTabs';
import { DashboardScreen } from './src/features/dashboard/screens/DashboardScreen';
import { WalletsScreen } from './src/features/wallets/screens/WalletsScreen';
import { importLegacyData } from './src/database/importer/legacyJsonImporter';

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  const [isDbReady, setIsDbReady] = useState(false);
  const [dbStatusMessage, setDbStatusMessage] = useState('Menginisialisasi basis data...');
  const [currentTab, setCurrentTab] = useState<TabRoute>('dashboard');
  const [openTransferImmediate, setOpenTransferImmediate] = useState(false);

  useEffect(() => {
    async function setupApp() {
      try {
        setDbStatusMessage('Memeriksa & migrasi data historis...');
        const migrationRes = await importLegacyData();
        if (migrationRes.success) {
          console.log('Migrasi sukses:', migrationRes.message);
        } else {
          console.warn('Status migrasi:', migrationRes.message);
        }
        setIsDbReady(true);
      } catch (err) {
        console.error('Inisialisasi aplikasi gagal:', err);
        setIsDbReady(true);
      }
    }

    setupApp();
  }, []);

  if (!fontsLoaded || !isDbReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD165" />
        <Text style={styles.loadingTitle}>CASH TRACKER</Text>
        <Text style={styles.loadingSubtitle}>{dbStatusMessage}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ScreenWrapper scrollable={false}>
        <Header
          title={
            currentTab === 'dashboard'
              ? 'Dashboard'
              : currentTab === 'wallets'
              ? 'Wallets'
              : currentTab === 'transactions'
              ? 'Activity History'
              : 'Budgets'
          }
        />

        <View style={styles.mainContent}>
          {currentTab === 'dashboard' ? (
            <DashboardScreen
              onNavigateToWallets={() => setCurrentTab('wallets')}
              onNavigateToHistory={() => setCurrentTab('transactions')}
              onTransfer={() => {
                setOpenTransferImmediate(true);
                setCurrentTab('wallets');
              }}
            />
          ) : currentTab === 'wallets' ? (
            <WalletsScreen
              initialOpenTransfer={openTransferImmediate}
              onTransferClosed={() => setOpenTransferImmediate(false)}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderTitle}>
                {currentTab.toUpperCase()}
              </Text>
              <Text style={styles.placeholderDesc}>
                Layar {currentTab} akan dibangun pada langkah berikutnya.
              </Text>
            </View>
          )}
        </View>

        <BottomTabs
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
        />
      </ScreenWrapper>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#09090B',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    letterSpacing: 2,
    color: '#FFD165',
    marginTop: 8,
  },
  loadingSubtitle: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    color: '#71717A',
  },
  mainContent: {
    flex: 1,
    position: 'relative',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  placeholderTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#F4F4F5',
    marginBottom: 8,
  },
  placeholderDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center',
  },
});

