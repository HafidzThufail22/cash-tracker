import { db } from '../db';
import { categories } from '../schema';
import { eq, asc } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

export interface CategoryItem {
  id: string;
  name: string;
  type: number; // 0: Income, 1: Expense, 2: System/Transfer
  icon: string | null;
  color: string | null;
  parentId: string | null;
  orderNum: number;
}

/**
 * Mengambil seluruh kategori pengeluaran (type = 1) untuk penetapan anggaran belanja
 */
export async function getExpenseCategories(): Promise<CategoryItem[]> {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      type: categories.type,
      icon: categories.icon,
      color: categories.color,
      parentId: categories.parentId,
      orderNum: categories.orderNum,
    })
    .from(categories)
    .where(eq(categories.type, 1))
    .orderBy(asc(categories.orderNum), asc(categories.name));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    icon: r.icon,
    color: r.color,
    parentId: r.parentId,
    orderNum: r.orderNum,
  }));
}

/**
 * Mengambil seluruh kategori (pemasukan dan pengeluaran)
 */
export async function getAllCategories(): Promise<CategoryItem[]> {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      type: categories.type,
      icon: categories.icon,
      color: categories.color,
      parentId: categories.parentId,
      orderNum: categories.orderNum,
    })
    .from(categories)
    .orderBy(asc(categories.type), asc(categories.orderNum), asc(categories.name));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    icon: r.icon,
    color: r.color,
    parentId: r.parentId,
    orderNum: r.orderNum,
  }));
}

/**
 * Menambahkan kategori baru ke basis data
 */
export async function createCategory(params: {
  name: string;
  type: number; // 0: Income, 1: Expense
  icon?: string;
  color?: string;
}): Promise<CategoryItem> {
  const newId = Crypto.randomUUID();
  const newCat = {
    id: newId,
    name: params.name.trim(),
    type: params.type,
    icon: params.icon || 'tag',
    color: params.color || (params.type === 1 ? '#EF4444' : '#10B981'),
    parentId: null,
    orderNum: 99,
  };

  await db.insert(categories).values(newCat);
  return newCat;
}

/**
 * Memperbarui nama, icon, atau warna kategori
 */
export async function updateCategory(
  id: string,
  params: {
    name?: string;
    icon?: string;
    color?: string;
  }
): Promise<boolean> {
  await db
    .update(categories)
    .set({
      ...(params.name ? { name: params.name.trim() } : {}),
      ...(params.icon ? { icon: params.icon } : {}),
      ...(params.color ? { color: params.color } : {}),
    })
    .where(eq(categories.id, id));

  return true;
}

/**
 * Menghapus kategori berdasarkan ID
 */
export async function deleteCategory(id: string): Promise<boolean> {
  await db.delete(categories).where(eq(categories.id, id));
  return true;
}

