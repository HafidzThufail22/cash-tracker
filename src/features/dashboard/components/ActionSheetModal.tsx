import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  ChevronLeft,
  ChevronDown,
} from 'lucide-react-native';
import * as Crypto from 'expo-crypto';
import { CurrencyInput } from '../../../components/common/CurrencyInput';
import { InputField } from '../../../components/common/InputField';
import { db } from '../../../database/db';
import { transactions } from '../../../database/schema';
import { getAllCategories, CategoryItem } from '../../../database/repositories/categoryRepo';
import { getWalletsWithBalance, WalletWithBalance, transferBetweenWallets } from '../../../database/repositories/walletRepo';

export type ActionType = 'income' | 'expense' | 'transfer';

interface ActionSheetModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'picker' | 'form';

const ACTION_CONFIG = {
  income: {
    label: 'Catat Uang Masuk',
    sublabel: 'Gaji, bonus, side income…',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    Icon: TrendingUp,
  },
  expense: {
    label: 'Catat Uang Keluar',
    sublabel: 'Belanja, makan, tagihan…',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    Icon: TrendingDown,
  },
  transfer: {
    label: 'Pindah Kantong',
    sublabel: 'Antar rekening atau tabungan',
    color: '#EAB308',
    bgColor: 'rgba(234, 179, 8, 0.12)',
    borderColor: 'rgba(234, 179, 8, 0.25)',
    Icon: ArrowLeftRight,
  },
} as const;

export function ActionSheetModal({ visible, onClose, onSuccess }: ActionSheetModalProps) {
  const slideAnim = useRef(new Animated.Value(600)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const [step, setStep] = useState<Step>('picker');
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);

  // Form state
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [selectedToWalletId, setSelectedToWalletId] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [wallets, setWallets] = useState<WalletWithBalance[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showWalletPicker, setShowWalletPicker] = useState(false);
  const [showToWalletPicker, setShowToWalletPicker] = useState(false);

  const openSheet = useCallback(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Staggered card entrance
      Animated.stagger(
        80,
        cardAnims.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          })
        )
      ).start();
    });
  }, []);

  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      resetState();
      onClose();
    });
  }, [onClose]);

  const resetState = () => {
    setStep('picker');
    setSelectedAction(null);
    setAmount(0);
    setNote('');
    setSelectedCategoryId(null);
    setSelectedWalletId(null);
    setSelectedToWalletId(null);
    setShowCategoryPicker(false);
    setShowWalletPicker(false);
    setShowToWalletPicker(false);
    cardAnims.forEach((a) => a.setValue(0));
  };

  useEffect(() => {
    if (visible) {
      resetState();
      openSheet();
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    const [cats, { wallets: wals }] = await Promise.all([
      getAllCategories(),
      getWalletsWithBalance(),
    ]);
    setCategories(cats);
    setWallets(wals);
    if (wals.length > 0) {
      setSelectedWalletId(wals[0].id);
      if (wals.length > 1) setSelectedToWalletId(wals[1].id);
    }
  };

  const handleSelectAction = (action: ActionType) => {
    setSelectedAction(action);
    // Reset category sesuai tipe
    setSelectedCategoryId(null);
    setStep('form');
  };

  const handleBack = () => {
    setStep('picker');
    setSelectedAction(null);
    cardAnims.forEach((a) => a.setValue(0));
    Animated.stagger(
      80,
      cardAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        })
      )
    ).start();
  };

  const handleSubmit = async () => {
    if (!selectedAction) return;
    if (amount <= 0) {
      Alert.alert('Nominal kosong', 'Masukkan nominal yang valid dulu ya!');
      return;
    }
    if (selectedAction !== 'transfer' && !selectedCategoryId) {
      Alert.alert('Kategori belum dipilih', 'Pilih kategori transaksinya dulu.');
      return;
    }
    if (!selectedWalletId) {
      Alert.alert('Kantong belum dipilih', 'Pilih kantong sumber dulu.');
      return;
    }
    if (selectedAction === 'transfer') {
      if (!selectedToWalletId) {
        Alert.alert('Kantong tujuan belum dipilih', 'Pilih kantong tujuan transfer.');
        return;
      }
      if (selectedWalletId === selectedToWalletId) {
        Alert.alert('Kantong sama', 'Kantong asal dan tujuan tidak boleh sama!');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (selectedAction === 'transfer') {
        const result = await transferBetweenWallets({
          fromWalletId: selectedWalletId,
          toWalletId: selectedToWalletId!,
          amount,
          date: new Date().toISOString(),
          notes: note || 'Pindah Saldo',
        });
        if (!result.success) {
          Alert.alert('Gagal', result.message);
          return;
        }
      } else {
        const txId = Crypto.randomUUID();
        const now = new Date().toISOString();
        await db.insert(transactions).values({
          id: txId,
          walletId: selectedWalletId,
          toWalletId: null,
          categoryId: selectedCategoryId,
          type: selectedAction === 'income' ? 0 : 1,
          amount,
          date: now,
          notes: note || null,
          createdAt: now,
          updatedAt: now,
        });
      }

      closeSheet();
      setTimeout(() => onSuccess(), 300);
    } catch (err) {
      Alert.alert('Error', `Gagal menyimpan: ${String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (selectedAction === 'income') return c.type === 0;
    if (selectedAction === 'expense') return c.type === 1;
    return false;
  });

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
  const selectedToWallet = wallets.find((w) => w.id === selectedToWalletId);

  const actionConfig = selectedAction ? ACTION_CONFIG[selectedAction] : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeSheet}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={closeSheet}>
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Drag Handle */}
        <View style={styles.handleBar} />

        {/* ── STEP 1: PICKER ── */}
        {step === 'picker' && (
          <View style={styles.stepContainer}>
            <Text style={styles.sheetTitle}>Mau ngapain?</Text>
            <Text style={styles.sheetSubtitle}>Pilih jenis transaksi</Text>

            <View style={styles.actionList}>
              {(['income', 'expense', 'transfer'] as ActionType[]).map((key, index) => {
                const cfg = ACTION_CONFIG[key];
                const cardScale = cardAnims[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.85, 1],
                });
                const cardOpacity = cardAnims[index];
                return (
                  <Animated.View
                    key={key}
                    style={{
                      opacity: cardOpacity,
                      transform: [{ scale: cardScale }],
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.actionCard,
                        {
                          backgroundColor: cfg.bgColor,
                          borderColor: cfg.borderColor,
                        },
                      ]}
                      onPress={() => handleSelectAction(key)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.actionIconCircle, { backgroundColor: cfg.bgColor, borderColor: cfg.borderColor }]}>
                        <cfg.Icon size={20} color={cfg.color} strokeWidth={2.2} />
                      </View>
                      <View style={styles.actionTextGroup}>
                        <Text style={[styles.actionCardLabel, { color: cfg.color }]}>
                          {cfg.label}
                        </Text>
                        <Text style={styles.actionCardSublabel}>{cfg.sublabel}</Text>
                      </View>
                      <ChevronDown
                        size={16}
                        color={cfg.color}
                        style={{ transform: [{ rotate: '-90deg' }] }}
                        strokeWidth={2}
                      />
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>

            <TouchableOpacity style={styles.cancelButton} onPress={closeSheet} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP 2: FORM ── */}
        {step === 'form' && selectedAction && actionConfig && (
          <View style={styles.stepContainer}>
            {/* Form Header */}
            <View style={styles.formHeader}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
                <ChevronLeft size={20} color="#A1A1AA" strokeWidth={2} />
              </TouchableOpacity>
              <View style={styles.formTitleRow}>
                <View style={[styles.formTitleIcon, { backgroundColor: actionConfig.bgColor }]}>
                  <actionConfig.Icon size={16} color={actionConfig.color} strokeWidth={2.2} />
                </View>
                <Text style={styles.formTitle}>{actionConfig.label}</Text>
              </View>
              <View style={{ width: 32 }} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.formScroll}
            >
              {/* Amount */}
              <CurrencyInput
                label="Nominal"
                value={amount}
                onChangeValue={setAmount}
                placeholder="0"
              />

              {/* Category (untuk income & expense) */}
              {selectedAction !== 'transfer' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Kategori</Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.pickerButtonText,
                        !selectedCategory && styles.pickerPlaceholder,
                      ]}
                    >
                      {selectedCategory ? selectedCategory.name : 'Pilih kategori…'}
                    </Text>
                    <ChevronDown size={16} color="#71717A" />
                  </TouchableOpacity>
                  {showCategoryPicker && (
                    <View style={styles.dropdownList}>
                      <ScrollView
                        nestedScrollEnabled
                        style={{ maxHeight: 160 }}
                        showsVerticalScrollIndicator={false}
                      >
                        {filteredCategories.map((cat) => (
                          <TouchableOpacity
                            key={cat.id}
                            style={[
                              styles.dropdownItem,
                              selectedCategoryId === cat.id && styles.dropdownItemActive,
                            ]}
                            onPress={() => {
                              setSelectedCategoryId(cat.id);
                              setShowCategoryPicker(false);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                selectedCategoryId === cat.id && styles.dropdownItemTextActive,
                              ]}
                            >
                              {cat.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        {filteredCategories.length === 0 && (
                          <Text style={styles.emptyText}>Belum ada kategori</Text>
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}

              {/* Wallet Asal */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  {selectedAction === 'transfer' ? 'Dari Kantong' : 'Kantong'}
                </Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowWalletPicker(!showWalletPicker)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.pickerButtonText,
                      !selectedWallet && styles.pickerPlaceholder,
                    ]}
                  >
                    {selectedWallet ? selectedWallet.name : 'Pilih kantong…'}
                  </Text>
                  <ChevronDown size={16} color="#71717A" />
                </TouchableOpacity>
                {showWalletPicker && (
                  <View style={styles.dropdownList}>
                    <ScrollView
                      nestedScrollEnabled
                      style={{ maxHeight: 160 }}
                      showsVerticalScrollIndicator={false}
                    >
                      {wallets.map((w) => (
                        <TouchableOpacity
                          key={w.id}
                          style={[
                            styles.dropdownItem,
                            selectedWalletId === w.id && styles.dropdownItemActive,
                          ]}
                          onPress={() => {
                            setSelectedWalletId(w.id);
                            setShowWalletPicker(false);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              selectedWalletId === w.id && styles.dropdownItemTextActive,
                            ]}
                          >
                            {w.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Wallet Tujuan (hanya transfer) */}
              {selectedAction === 'transfer' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Ke Kantong</Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowToWalletPicker(!showToWalletPicker)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.pickerButtonText,
                        !selectedToWallet && styles.pickerPlaceholder,
                      ]}
                    >
                      {selectedToWallet ? selectedToWallet.name : 'Pilih kantong tujuan…'}
                    </Text>
                    <ChevronDown size={16} color="#71717A" />
                  </TouchableOpacity>
                  {showToWalletPicker && (
                    <View style={styles.dropdownList}>
                      <ScrollView
                        nestedScrollEnabled
                        style={{ maxHeight: 160 }}
                        showsVerticalScrollIndicator={false}
                      >
                        {wallets
                          .filter((w) => w.id !== selectedWalletId)
                          .map((w) => (
                            <TouchableOpacity
                              key={w.id}
                              style={[
                                styles.dropdownItem,
                                selectedToWalletId === w.id && styles.dropdownItemActive,
                              ]}
                              onPress={() => {
                                setSelectedToWalletId(w.id);
                                setShowToWalletPicker(false);
                              }}
                              activeOpacity={0.7}
                            >
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  selectedToWalletId === w.id && styles.dropdownItemTextActive,
                                ]}
                              >
                                {w.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}

              {/* Note */}
              <InputField
                label="Catatan (opsional)"
                value={note}
                onChangeText={setNote}
                placeholder="Tambah catatan…"
                multiline
              />

              {/* Submit */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: actionConfig.color },
                  isSubmitting && styles.submitDisabled,
                ]}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#09090B" size="small" />
                ) : (
                  <Text style={styles.submitText}>Simpan Transaksi</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#18181B',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    minHeight: 300,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3F3F46',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  stepContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sheetTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 22,
    color: '#F4F4F5',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#71717A',
    marginBottom: 20,
  },
  actionList: {
    gap: 10,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  actionIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextGroup: {
    flex: 1,
  },
  actionCardLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    letterSpacing: -0.2,
  },
  actionCardSublabel: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 18,
    marginTop: 4,
  },
  cancelText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: '#71717A',
  },
  // Form styles
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  formTitleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: '#F4F4F5',
    letterSpacing: -0.2,
  },
  formScroll: {
    paddingBottom: 12,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#D3C5AC',
    marginBottom: 6,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0E0E11',
    borderWidth: 1,
    borderColor: '#27272A',
    paddingHorizontal: 14,
  },
  pickerButtonText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: '#F4F4F5',
    flex: 1,
  },
  pickerPlaceholder: {
    color: '#52525B',
  },
  dropdownList: {
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: '#1C1C20',
    borderWidth: 1,
    borderColor: '#27272A',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
  },
  dropdownItemText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
  },
  dropdownItemTextActive: {
    color: '#FFD165',
    fontFamily: 'Manrope_600SemiBold',
  },
  emptyText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#52525B',
    textAlign: 'center',
    paddingVertical: 16,
  },
  submitButton: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    color: '#09090B',
    letterSpacing: -0.2,
  },
});
