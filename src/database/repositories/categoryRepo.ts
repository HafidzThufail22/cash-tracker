import { db } from '../db';
import { categories } from '../schema';
import { eq, asc } from 'drizzle-orm';

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
