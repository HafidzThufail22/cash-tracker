import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import { Plus, Trash2, ArrowLeft, Check } from 'lucide-react-native';
import { ModalLayout } from '../../../layouts/ModalLayout';
import {
  getAllCategories,
  createCategory,
  deleteCategory,
  CategoryItem,
} from '../../../database/repositories/categoryRepo';
import {
  AVAILABLE_CATEGORY_ICONS,
  AVAILABLE_CATEGORY_COLORS,
  getCategoryIconComponent,
} from '../../../utils/categoryIcons';

interface CategoryManagerModalProps {
  visible: boolean;
  onClose: () => void;
  onCategoriesChanged?: () => void;
}

export function CategoryManagerModal({
  visible,
  onClose,
  onCategoriesChanged,
}: CategoryManagerModalProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

  // Form mode: 'list' or 'create'
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('tag');
  const [newCatColor, setNewCatColor] = useState('#EF4444');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Gagal mengambil kategori:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setMode('list');
      setNewCatName('');
      loadData();
    }
  }, [visible]);

  const filteredCategories = categories.filter((c) =>
    activeTab === 'expense' ? c.type === 1 : c.type === 0
  );

  const handleOpenCreate = () => {
    setNewCatName('');
    setNewCatIcon('tag');
    setNewCatColor(activeTab === 'expense' ? '#EF4444' : '#10B981');
    setMode('create');
  };

  const handleSaveCategory = async () => {
    if (!newCatName.trim()) {
      Alert.alert('Perhatian', 'Nama kategori tidak boleh kosong.');
      return;
    }

    setIsSaving(true);
    try {
      await createCategory({
        name: newCatName.trim(),
        type: activeTab === 'expense' ? 1 : 0,
        icon: newCatIcon,
        color: newCatColor,
      });

      await loadData();
      if (onCategoriesChanged) onCategoriesChanged();
      setMode('list');
      setNewCatName('');
    } catch (err) {
      console.error('Gagal menyimpan kategori:', err);
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan kategori.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = (item: CategoryItem) => {
    Alert.alert(
      'Hapus Kategori',
      `Apakah Anda yakin ingin menghapus kategori "${item.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(item.id);
              await loadData();
              if (onCategoriesChanged) onCategoriesChanged();
            } catch (err) {
              console.error('Gagal menghapus kategori:', err);
              Alert.alert('Gagal', 'Kategori tidak dapat dihapus.');
            }
          },
        },
      ]
    );
  };

  return (
    <ModalLayout
      visible={visible}
      onClose={onClose}
      title={mode === 'create' ? 'Tambah Kategori Baru' : 'Atur Kategori'}
      subtitle={mode === 'create' ? 'Kustomisasi Kategori' : 'Klasifikasi Dinamis'}
      scrollable={false}
    >
      <View className="h-[480px]">
        {mode === 'list' ? (
          <>
            {/* Segmented Tab */}
            <View className="flex-row bg-[#111113] rounded-xl p-1 border border-border mb-3">
              <TouchableOpacity
                className={`flex-1 h-9 items-center justify-center rounded-lg ${
                  activeTab === 'expense' ? 'bg-[#27272A]' : ''
                }`}
                onPress={() => setActiveTab('expense')}
                activeOpacity={0.7}
              >
                <Text
                  className={`font-manrope-semibold text-xs ${
                    activeTab === 'expense' ? 'text-gold-primary' : 'text-text-muted'
                  }`}
                >
                  Pengeluaran
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 h-9 items-center justify-center rounded-lg ${
                  activeTab === 'income' ? 'bg-[#27272A]' : ''
                }`}
                onPress={() => setActiveTab('income')}
                activeOpacity={0.7}
              >
                <Text
                  className={`font-manrope-semibold text-xs ${
                    activeTab === 'income' ? 'text-gold-primary' : 'text-text-muted'
                  }`}
                >
                  Pemasukan
                </Text>
              </TouchableOpacity>
            </View>

            {/* List */}
            {loading ? (
              <View className="flex-1 items-center justify-center gap-2">
                <ActivityIndicator size="small" color="#FFD165" />
                <Text className="font-manrope text-xs text-text-secondary">Memuat daftar kategori...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredCategories}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ gap: 8, paddingBottom: 14 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const IconComp = getCategoryIconComponent(item.icon);
                  const color = item.color || '#A1A1AA';

                  return (
                    <View className="flex-row items-center bg-surface border border-border rounded-xl p-3 gap-3">
                      <View
                        className="w-[38px] h-[38px] rounded-full items-center justify-center"
                        style={{ backgroundColor: `${color}18` }}
                      >
                        <IconComp size={18} color={color} strokeWidth={2.2} />
                      </View>
                      <View className="flex-1">
                        <Text className="font-manrope-semibold text-sm text-text-primary">{item.name}</Text>
                        <Text className="font-mono text-[11px] text-text-muted mt-0.5">
                          {item.type === 1 ? 'Pos Belanja' : 'Pos Pemasukan'}
                        </Text>
                      </View>

                      <TouchableOpacity
                        className="w-9 h-9 rounded-full items-center justify-center bg-[#1F1F23]"
                        onPress={() => handleDeleteCategory(item)}
                        activeOpacity={0.7}
                        accessibilityLabel={`Hapus ${item.name}`}
                      >
                        <Trash2 size={16} color="#71717A" />
                      </TouchableOpacity>
                    </View>
                  );
                }}
                ListEmptyComponent={
                  <View className="flex-1 items-center justify-center gap-2">
                    <Text className="font-manrope text-xs text-text-muted">Belum ada kategori pada tab ini.</Text>
                  </View>
                }
              />
            )}

            {/* Add Button */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-gold-primary h-12 rounded-xl gap-2 mt-2"
              onPress={handleOpenCreate}
              activeOpacity={0.8}
            >
              <Plus size={18} color="#09090B" strokeWidth={2.5} />
              <Text className="font-manrope-bold text-sm text-background">
                Tambah Kategori {activeTab === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          /* Form Tambah Kategori Dinamis */
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ gap: 14, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Input Nama */}
            <View className="gap-1.5">
              <Text className="font-mono text-[10px] uppercase tracking-wider text-text-muted">NAMA KATEGORI</Text>
              <TextInput
                className="bg-[#111113] border border-border rounded-xl px-3.5 h-[46px] font-manrope-medium text-sm text-text-primary"
                value={newCatName}
                onChangeText={setNewCatName}
                placeholder="Misal: Tagihan Listrik, Hiburan, Hadiah"
                placeholderTextColor="#71717A"
                autoFocus
              />
            </View>

            {/* Icon Picker */}
            <View className="gap-1.5">
              <Text className="font-mono text-[10px] uppercase tracking-wider text-text-muted">PILIH IKON</Text>
              <View className="flex-row flex-wrap gap-2">
                {AVAILABLE_CATEGORY_ICONS.map((opt) => {
                  const isSelected = newCatIcon === opt.id;
                  const IconComp = opt.Icon;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      className={`w-11 h-11 rounded-xl bg-surface border-[1.5px] items-center justify-center ${
                        isSelected ? '' : 'border-border'
                      }`}
                      style={isSelected ? { borderColor: newCatColor, backgroundColor: `${newCatColor}20` } : undefined}
                      onPress={() => setNewCatIcon(opt.id)}
                      activeOpacity={0.7}
                    >
                      <IconComp
                        size={20}
                        color={isSelected ? newCatColor : '#A1A1AA'}
                        strokeWidth={isSelected ? 2.5 : 1.8}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Color Picker */}
            <View className="gap-1.5">
              <Text className="font-mono text-[10px] uppercase tracking-wider text-text-muted">PILIH WARNA AKSEN</Text>
              <View className="flex-row flex-wrap gap-2.5">
                {AVAILABLE_CATEGORY_COLORS.map((col) => {
                  const isSelected = newCatColor === col;
                  return (
                    <TouchableOpacity
                      key={col}
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        isSelected ? 'border-2 border-white' : ''
                      }`}
                      style={{ backgroundColor: col }}
                      onPress={() => setNewCatColor(col)}
                      activeOpacity={0.8}
                    >
                      {isSelected && <Check size={14} color="#09090B" strokeWidth={3} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-2.5 mt-2">
              <TouchableOpacity
                className="flex-1 h-[46px] rounded-xl border border-border bg-surface flex-row items-center justify-center gap-1.5"
                onPress={() => setMode('list')}
                activeOpacity={0.7}
              >
                <ArrowLeft size={16} color="#A1A1AA" />
                <Text className="font-manrope-semibold text-xs text-text-secondary">Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-[2] h-[46px] rounded-xl bg-gold-primary items-center justify-center ${
                  isSaving ? 'opacity-60' : ''
                }`}
                onPress={handleSaveCategory}
                disabled={isSaving}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#09090B" />
                ) : (
                  <Text className="font-manrope-bold text-sm text-background">Simpan Kategori</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </ModalLayout>
  );
}
