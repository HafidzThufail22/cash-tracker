import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
        <Animated.View className="absolute inset-0 bg-black/70" style={{ opacity: backdropAnim }} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-[28px] border-t border-white/10 min-h-[300px] max-h-[90%]"
        style={[
          {
            paddingBottom: Platform.OS === 'ios' ? 36 : 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -6 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
            elevation: 20,
          },
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Drag Handle */}
        <View className="w-10 h-1 rounded-full bg-zinc-700 self-center mt-3 mb-1" />

        {/* ── STEP 1: PICKER ── */}
        {step === 'picker' && (
          <View className="px-5 pt-3">
            <Text className="font-manrope-bold text-[22px] text-zinc-100 tracking-tight mb-1">
              Mau ngapain?
            </Text>
            <Text className="font-manrope text-[13px] text-zinc-500 mb-5">
              Pilih jenis transaksi
            </Text>

            <View className="gap-2.5">
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
                      className="flex-row items-center p-4 rounded-2xl border gap-3"
                      style={{
                        backgroundColor: cfg.bgColor,
                        borderColor: cfg.borderColor,
                      }}
                      onPress={() => handleSelectAction(key)}
                      activeOpacity={0.75}
                    >
                      <View
                        className="w-[42px] h-[42px] rounded-full border items-center justify-center"
                        style={{ backgroundColor: cfg.bgColor, borderColor: cfg.borderColor }}
                      >
                        <cfg.Icon size={20} color={cfg.color} strokeWidth={2.2} />
                      </View>
                      <View className="flex-1">
                        <Text className="font-manrope-bold text-[15px] tracking-tight" style={{ color: cfg.color }}>
                          {cfg.label}
                        </Text>
                        <Text className="font-manrope text-xs text-zinc-500 mt-0.5">{cfg.sublabel}</Text>
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

            <TouchableOpacity className="items-center py-4.5 mt-1" onPress={closeSheet} activeOpacity={0.7}>
              <Text className="font-manrope-semibold text-sm text-zinc-500">Batal</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP 2: FORM ── */}
        {step === 'form' && selectedAction && actionConfig && (
          <View className="px-5 pt-3">
            {/* Form Header */}
            <View className="flex-row items-center justify-between mb-5">
              <TouchableOpacity onPress={handleBack} className="w-8 h-8 rounded-full bg-[#27272A] items-center justify-center" activeOpacity={0.7}>
                <ChevronLeft size={20} color="#A1A1AA" strokeWidth={2} />
              </TouchableOpacity>
              <View className="flex-row items-center gap-2">
                <View className="w-7 h-7 rounded-full items-center justify-center" style={{ backgroundColor: actionConfig.bgColor }}>
                  <actionConfig.Icon size={16} color={actionConfig.color} strokeWidth={2.2} />
                </View>
                <Text className="font-manrope-bold text-base text-zinc-100 tracking-tight">{actionConfig.label}</Text>
              </View>
              <View style={{ width: 32 }} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 12 }}
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
                <View className="mb-3.5">
                  <Text className="font-mono text-[11px] uppercase tracking-wider text-[#D3C5AC] mb-1.5">Kategori</Text>
                  <TouchableOpacity
                    className="flex-row items-center justify-between h-12 rounded-xl bg-surface-lowest border border-border px-3.5"
                    onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                    activeOpacity={0.75}
                  >
                    <Text
                      className={`font-manrope-semibold text-sm flex-1 ${
                        !selectedCategory ? 'text-zinc-500' : 'text-zinc-100'
                      }`}
                    >
                      {selectedCategory ? selectedCategory.name : 'Pilih kategori…'}
                    </Text>
                    <ChevronDown size={16} color="#71717A" />
                  </TouchableOpacity>
                  {showCategoryPicker && (
                    <View className="mt-1 rounded-xl bg-[#1C1C20] border border-border overflow-hidden">
                      <ScrollView
                        nestedScrollEnabled
                        style={{ maxHeight: 160 }}
                        showsVerticalScrollIndicator={false}
                      >
                        {filteredCategories.map((cat) => (
                          <TouchableOpacity
                            key={cat.id}
                            className={`px-3.5 py-3 border-b border-white/5 ${
                              selectedCategoryId === cat.id ? 'bg-gold/10' : ''
                            }`}
                            onPress={() => {
                              setSelectedCategoryId(cat.id);
                              setShowCategoryPicker(false);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text
                              className={`text-sm ${
                                selectedCategoryId === cat.id
                                  ? 'text-gold-primary font-manrope-semibold'
                                  : 'font-manrope text-zinc-400'
                              }`}
                            >
                              {cat.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        {filteredCategories.length === 0 && (
                          <Text className="font-manrope text-[13px] text-zinc-500 text-center py-4">Belum ada kategori</Text>
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}

              {/* Wallet Asal */}
              <View className="mb-3.5">
                <Text className="font-mono text-[11px] uppercase tracking-wider text-[#D3C5AC] mb-1.5">
                  {selectedAction === 'transfer' ? 'Dari Kantong' : 'Kantong'}
                </Text>
                <TouchableOpacity
                  className="flex-row items-center justify-between h-12 rounded-xl bg-surface-lowest border border-border px-3.5"
                  onPress={() => setShowWalletPicker(!showWalletPicker)}
                  activeOpacity={0.75}
                >
                  <Text
                    className={`font-manrope-semibold text-sm flex-1 ${
                      !selectedWallet ? 'text-zinc-500' : 'text-zinc-100'
                    }`}
                  >
                    {selectedWallet ? selectedWallet.name : 'Pilih kantong…'}
                  </Text>
                  <ChevronDown size={16} color="#71717A" />
                </TouchableOpacity>
                {showWalletPicker && (
                  <View className="mt-1 rounded-xl bg-[#1C1C20] border border-border overflow-hidden">
                    <ScrollView
                      nestedScrollEnabled
                      style={{ maxHeight: 160 }}
                      showsVerticalScrollIndicator={false}
                    >
                      {wallets.map((w) => (
                        <TouchableOpacity
                          key={w.id}
                          className={`px-3.5 py-3 border-b border-white/5 ${
                            selectedWalletId === w.id ? 'bg-gold/10' : ''
                          }`}
                          onPress={() => {
                            setSelectedWalletId(w.id);
                            setShowWalletPicker(false);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            className={`text-sm ${
                              selectedWalletId === w.id
                                ? 'text-gold-primary font-manrope-semibold'
                                : 'font-manrope text-zinc-400'
                            }`}
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
                <View className="mb-3.5">
                  <Text className="font-mono text-[11px] uppercase tracking-wider text-[#D3C5AC] mb-1.5">Ke Kantong</Text>
                  <TouchableOpacity
                    className="flex-row items-center justify-between h-12 rounded-xl bg-surface-lowest border border-border px-3.5"
                    onPress={() => setShowToWalletPicker(!showToWalletPicker)}
                    activeOpacity={0.75}
                  >
                    <Text
                      className={`font-manrope-semibold text-sm flex-1 ${
                        !selectedToWallet ? 'text-zinc-500' : 'text-zinc-100'
                      }`}
                    >
                      {selectedToWallet ? selectedToWallet.name : 'Pilih kantong tujuan…'}
                    </Text>
                    <ChevronDown size={16} color="#71717A" />
                  </TouchableOpacity>
                  {showToWalletPicker && (
                    <View className="mt-1 rounded-xl bg-[#1C1C20] border border-border overflow-hidden">
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
                              className={`px-3.5 py-3 border-b border-white/5 ${
                                selectedToWalletId === w.id ? 'bg-gold/10' : ''
                              }`}
                              onPress={() => {
                                setSelectedToWalletId(w.id);
                                setShowToWalletPicker(false);
                              }}
                              activeOpacity={0.7}
                            >
                              <Text
                                className={`text-sm ${
                                  selectedToWalletId === w.id
                                    ? 'text-gold-primary font-manrope-semibold'
                                    : 'font-manrope text-zinc-400'
                                }`}
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
                className={`h-[52px] rounded-[14px] items-center justify-center mt-2 shadow-lg ${
                  isSubmitting ? 'opacity-60' : ''
                }`}
                style={{
                  backgroundColor: actionConfig.color,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 5,
                }}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#09090B" size="small" />
                ) : (
                  <Text className="font-manrope-bold text-[15px] text-background tracking-tight">Simpan Transaksi</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}
