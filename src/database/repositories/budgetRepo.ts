import { db } from '../db';
import { budgets, categories, transactions, wallets } from '../schema';
import { eq, sql, and, desc, inArray } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

export type BudgetStatus = 'safe' | 'warning' | 'overbudget';

export interface BudgetItemWithUsage {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  amountLimit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
  transactionCount: number;
}

export interface BudgetOverallSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentage: number;
  status: BudgetStatus;
  budgetCount: number;
  overbudgetCount: number;
}

export interface CategoryTransactionItem {
  id: string;
  walletName: string;
  categoryName: string;
  amount: number;
  date: string;
  notes: string | null;
}

/**
 * Mengambil seluruh anggaran belanja terdaftar beserta pemakaian riil pada bulan dan tahun aktif
 */
export async function getBudgetsWithUsage(
  year: number,
  month: number
): Promise<{ budgets: BudgetItemWithUsage[]; summary: BudgetOverallSummary }> {
  const monthStr = month.toString().padStart(2, '0');
  const monthPattern = `${year}-${monthStr}%`;

  // 1. Ambil seluruh data anggaran terdaftar
  const budgetList = await db
    .select({
      id: budgets.id,
      categoryId: budgets.categoryId,
      amountLimit: budgets.amountLimit,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
    })
    .from(budgets)
    .innerJoin(categories, eq(budgets.categoryId, categories.id));

  if (budgetList.length === 0) {
    return {
      budgets: [],
      summary: {
        totalBudget: 0,
        totalSpent: 0,
        totalRemaining: 0,
        overallPercentage: 0,
        status: 'safe',
        budgetCount: 0,
        overbudgetCount: 0,
      },
    };
  }

  // 2. Ambil seluruh sub-kategori untuk mendukung pemetaan pengeluaran hierarki
  const allSubCategories = await db
    .select({
      id: categories.id,
      parentId: categories.parentId,
    })
    .from(categories)
    .where(sql`${categories.parentId} IS NOT NULL`);

  // Map parentId -> list of child IDs
  const subCategoryMap = new Map<string, string[]>();
  for (const sub of allSubCategories) {
    if (sub.parentId) {
      const existing = subCategoryMap.get(sub.parentId) || [];
      existing.push(sub.id);
      subCategoryMap.set(sub.parentId, existing);
    }
  }

  // 3. Untuk setiap anggaran, hitung pengeluaran aktual di bulan ini
  const results: BudgetItemWithUsage[] = [];
  let totalBudget = 0;
  let totalSpent = 0;
  let overbudgetCount = 0;

  for (const b of budgetList) {
    // Kategori target = kategori anggaran itu sendiri + seluruh sub-kategorinya
    const childIds = subCategoryMap.get(b.categoryId) || [];
    const targetCategoryIds = [b.categoryId, ...childIds];

    // Ambil SUM transaksi pengeluaran (type = 1) di bulan ini
    const usageRes = await db
      .select({
        totalSpent: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
        count: sql<number>`COUNT(${transactions.id})`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, 1),
          sql`${transactions.date} LIKE ${monthPattern}`,
          inArray(transactions.categoryId, targetCategoryIds)
        )
      );

    const spent = Number(usageRes[0]?.totalSpent || 0);
    const transactionCount = Number(usageRes[0]?.count || 0);
    const remaining = b.amountLimit - spent;
    const percentage = b.amountLimit > 0 ? Math.round((spent / b.amountLimit) * 100) : 0;

    let status: BudgetStatus = 'safe';
    if (percentage >= 100) {
      status = 'overbudget';
      overbudgetCount++;
    } else if (percentage >= 80) {
      status = 'warning';
    }

    totalBudget += b.amountLimit;
    totalSpent += spent;

    results.push({
      id: b.id,
      categoryId: b.categoryId,
      categoryName: b.categoryName,
      categoryIcon: b.categoryIcon,
      categoryColor: b.categoryColor,
      amountLimit: b.amountLimit,
      spent,
      remaining,
      percentage,
      status,
      transactionCount,
    });
  }

  // Urutkan anggaran: yang overbudget & persentase tertinggi di atas
  results.sort((a, b) => b.percentage - a.percentage);

  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  let overallStatus: BudgetStatus = 'safe';
  if (overallPercentage >= 100) {
    overallStatus = 'overbudget';
  } else if (overallPercentage >= 80) {
    overallStatus = 'warning';
  }

  const summary: BudgetOverallSummary = {
    totalBudget,
    totalSpent,
    totalRemaining,
    overallPercentage,
    status: overallStatus,
    budgetCount: results.length,
    overbudgetCount,
  };

  return { budgets: results, summary };
}

/**
 * Menyimpan / memperbarui batas anggaran kategori (upsert)
 */
export async function saveBudget(categoryId: string, amountLimit: number): Promise<boolean> {
  const existing = await db
    .select({ id: budgets.id })
    .from(budgets)
    .where(eq(budgets.categoryId, categoryId))
    .limit(1);

  if (existing.length > 0) {
    // Update batas limit yang sudah ada
    await db
      .update(budgets)
      .set({
        amountLimit,
      })
      .where(eq(budgets.id, existing[0].id));
  } else {
    // Buat baru
    await db.insert(budgets).values({
      id: Crypto.randomUUID(),
      categoryId,
      walletId: null,
      periodMonth: 1, // template berulang tiap bulan
      periodYear: 2026,
      amountLimit,
      createdAt: new Date().toISOString(),
    });
  }

  return true;
}

/**
 * Menghapus anggaran berdasarkan ID
 */
export async function deleteBudget(budgetId: string): Promise<boolean> {
  await db.delete(budgets).where(eq(budgets.id, budgetId));
  return true;
}

/**
 * Mengambil daftar riwayat transaksi pengeluaran khusus kategori tersebut pada bulan tertentu
 */
export async function getCategoryTransactionsForMonth(
  categoryId: string,
  year: number,
  month: number
): Promise<CategoryTransactionItem[]> {
  const monthStr = month.toString().padStart(2, '0');
  const monthPattern = `${year}-${monthStr}%`;

  // Cari apakah ada sub-kategori
  const childCategories = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.parentId, categoryId));

  const targetCategoryIds = [categoryId, ...childCategories.map((c) => c.id)];

  const rows = await db
    .select({
      id: transactions.id,
      walletName: wallets.name,
      categoryName: categories.name,
      amount: transactions.amount,
      date: transactions.date,
      notes: transactions.notes,
    })
    .from(transactions)
    .innerJoin(wallets, eq(transactions.walletId, wallets.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.type, 1),
        sql`${transactions.date} LIKE ${monthPattern}`,
        inArray(transactions.categoryId, targetCategoryIds)
      )
    )
    .orderBy(desc(transactions.date));

  return rows.map((r) => ({
    id: r.id,
    walletName: r.walletName,
    categoryName: r.categoryName || 'Pengeluaran',
    amount: r.amount,
    date: r.date,
    notes: r.notes,
  }));
}
