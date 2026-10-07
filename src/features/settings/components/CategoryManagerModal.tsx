import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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
      <View style={styles.container}>
        {mode === 'list' ? (
          <>
            {/* Segmented Tab */}
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[styles.segmentBtn, activeTab === 'expense' && styles.segmentBtnActive]}
                onPress={() => setActiveTab('expense')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentText,
                    activeTab === 'expense' && styles.segmentTextActive,
                  ]}
                >
                  Pengeluaran
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, activeTab === 'income' && styles.segmentBtnActive]}
                onPress={() => setActiveTab('income')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentText,
                    activeTab === 'income' && styles.segmentTextActive,
                  ]}
                >
                  Pemasukan
                </Text>
              </TouchableOpacity>
            </View>

            {/* List */}
            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="small" color="#FFD165" />
                <Text style={styles.loadingText}>Memuat daftar kategori...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredCategories}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const IconComp = getCategoryIconComponent(item.icon);
                  const color = item.color || '#A1A1AA';

                  return (
                    <View style={styles.categoryItemCard}>
                      <View style={[styles.iconWrap, { backgroundColor: `${color}18` }]}>
                        <IconComp size={18} color={color} strokeWidth={2.2} />
                      </View>
                      <View style={styles.categoryInfo}>
                        <Text style={styles.categoryName}>{item.name}</Text>
                        <Text style={styles.categoryMeta}>
                          {item.type === 1 ? 'Pos Belanja' : 'Pos Pemasukan'}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.deleteBtn}
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
                  <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>Belum ada kategori pada tab ini.</Text>
                  </View>
                }
              />
            )}

            {/* Add Button */}
            <TouchableOpacity
              style={styles.addCategoryBtn}
              onPress={handleOpenCreate}
              activeOpacity={0.8}
            >
              <Plus size={18} color="#09090B" strokeWidth={2.5} />
              <Text style={styles.addCategoryBtnText}>
                Tambah Kategori {activeTab === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          /* Form Tambah Kategori Dinamis */
          <ScrollView
            style={styles.formContainer}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Input Nama */}
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>NAMA KATEGORI</Text>
              <TextInput
                style={styles.textInput}
                value={newCatName}
                onChangeText={setNewCatName}
                placeholder="Misal: Tagihan Listrik, Hiburan, Hadiah"
                placeholderTextColor="#71717A"
                autoFocus
              />
            </View>

            {/* Icon Picker */}
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>PILIH IKON</Text>
              <View style={styles.iconGrid}>
                {AVAILABLE_CATEGORY_ICONS.map((opt) => {
                  const isSelected = newCatIcon === opt.id;
                  const IconComp = opt.Icon;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.iconPickerItem,
                        isSelected && { borderColor: newCatColor, backgroundColor: `${newCatColor}20` },
                      ]}
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
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>PILIH WARNA AKSEN</Text>
              <View style={styles.colorRow}>
                {AVAILABLE_CATEGORY_COLORS.map((col) => {
                  const isSelected = newCatColor === col;
                  return (
                    <TouchableOpacity
                      key={col}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: col },
                        isSelected && styles.colorCircleSelected,
                      ]}
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
            <View style={styles.formActionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setMode('list')}
                activeOpacity={0.7}
              >
                <ArrowLeft size={16} color="#A1A1AA" />
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
                onPress={handleSaveCategory}
                disabled={isSaving}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#09090B" />
                ) : (
                  <Text style={styles.saveBtnText}>Simpan Kategori</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </ModalLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 480,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#111113',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#27272A',
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#27272A',
  },
  segmentText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: '#71717A',
  },
  segmentTextActive: {
    color: '#FFD165',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#A1A1AA',
  },
  emptyText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#71717A',
  },
  listContent: {
    gap: 8,
    paddingBottom: 14,
  },
  categoryItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: '#F4F4F5',
  },
  categoryMeta: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: '#71717A',
    marginTop: 2,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F1F23',
  },
  addCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD165',
    height: 48,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  addCategoryBtnText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: '#09090B',
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    gap: 14,
    paddingBottom: 16,
  },
  formField: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#A1A1AA',
  },
  textInput: {
    backgroundColor: '#111113',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: '#F4F4F5',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconPickerItem: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#18181B',
    borderWidth: 1.5,
    borderColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  formActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272A',
    backgroundColor: '#18181B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cancelBtnText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: '#A1A1AA',
  },
  saveBtn: {
    flex: 2,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFD165',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: '#09090B',
  },
});
