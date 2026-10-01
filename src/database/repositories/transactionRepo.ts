import { db } from '../db';
import { transactions, categories, wallets } from '../schema';
import { desc, eq, sql, and, like, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';

export interface RecentTransactionItem {
  id: string;
  walletId: string;
  walletName: string;
  toWalletId: string | null;
  toWalletName?: string | null;
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string | null;
  type: number; // 0: Income, 1: Expense, 2: Transfer
  amount: number;
  date: string;
  notes: string | null;
}

export interface AvailableMonth {
  year: number;
  month: number;
  label: string; // misal: "Okt 2026"
  key: string;   // misal: "2026-10"
}

export interface TransactionFilterOptions {
  year: number;
  month: number;
  type?: number | 'all'; // 0, 1, 2, or 'all'
  searchQuery?: string;
}

const toWallets = alias(wallets, 'to_wallets');

export async function getRecentTransactions(limit: number = 10): Promise<RecentTransactionItem[]> {
  const rows = await db
    .select({
      id: transactions.id,
      walletId: transactions.walletId,
      walletName: wallets.name,
      toWalletId: transactions.toWalletId,
      toWalletName: toWallets.name,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      type: transactions.type,
      amount: transactions.amount,
      date: transactions.date,
      notes: transactions.notes,
    })
    .from(transactions)
    .innerJoin(wallets, eq(transactions.walletId, wallets.id))
    .leftJoin(toWallets, eq(transactions.toWalletId, toWallets.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .orderBy(desc(transactions.date))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    walletId: r.walletId,
    walletName: r.walletName,
    toWalletId: r.toWalletId,
    toWalletName: r.toWalletName,
    categoryId: r.categoryId,
    categoryName: r.categoryName || (r.type === 2 ? 'Pindah Saldo' : r.type === 0 ? 'Pemasukan' : 'Pengeluaran'),
    categoryIcon: r.categoryIcon || (r.type === 2 ? 'repeat' : r.type === 0 ? 'trending-up' : 'shopping-bag'),
    type: r.type,
    amount: r.amount,
    date: r.date,
    notes: r.notes,
  }));
}

export async function getMonthlySummary(
  year: number,
  month: number
): Promise<{ totalIncome: number; totalExpense: number }> {
  const monthStr = month.toString().padStart(2, '0');
  const pattern = `${year}-${monthStr}%`;

  const incomeRes = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(sql`${transactions.type} = 0 AND ${transactions.date} LIKE ${pattern}`);

  const expenseRes = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(sql`${transactions.type} = 1 AND ${transactions.date} LIKE ${pattern}`);

  return {
    totalIncome: Number(incomeRes[0]?.total || 0),
    totalExpense: Number(expenseRes[0]?.total || 0),
  };
}

export async function getMonthlyTotals(
  year: number,
  month: number
): Promise<{ totalIncome: number; totalExpense: number; totalTransfer: number; netCashFlow: number }> {
  const monthStr = month.toString().padStart(2, '0');
  const pattern = `${year}-${monthStr}%`;

  const res = await db
    .select({
      type: transactions.type,
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(sql`${transactions.date} LIKE ${pattern}`)
    .groupBy(transactions.type);

  let totalIncome = 0;
  let totalExpense = 0;
  let totalTransfer = 0;

  for (const row of res) {
    if (row.type === 0) totalIncome = Number(row.total || 0);
    else if (row.type === 1) totalExpense = Number(row.total || 0);
    else if (row.type === 2) totalTransfer = Number(row.total || 0);
  }

  return {
    totalIncome,
    totalExpense,
    totalTransfer,
    netCashFlow: totalIncome - totalExpense,
  };
}

export async function getLatestTransactionPeriod(): Promise<{ year: number; month: number }> {
  const latest = await db
    .select({ date: transactions.date })
    .from(transactions)
    .orderBy(desc(transactions.date))
    .limit(1);

  if (latest.length > 0 && latest[0].date) {
    const d = new Date(latest[0].date);
    if (!isNaN(d.getTime())) {
      return {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
      };
    }
  }

  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Mengambil daftar tahun & bulan yang memiliki transaksi, diurutkan dari terbaru
 */
export async function getAvailableTransactionMonths(): Promise<AvailableMonth[]> {
  const rows = await db
    .select({
      yearMonth: sql<string>`SUBSTR(${transactions.date}, 1, 7)`,
    })
    .from(transactions)
    .groupBy(sql`SUBSTR(${transactions.date}, 1, 7)`)
    .orderBy(sql`SUBSTR(${transactions.date}, 1, 7) DESC`);

  const results: AvailableMonth[] = [];

  for (const row of rows) {
    if (!row.yearMonth || row.yearMonth.length < 7) continue;
    const parts = row.yearMonth.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
      results.push({
        year,
        month,
        label: `${MONTH_NAMES_SHORT[month - 1]} ${year}`,
        key: `${year}-${month.toString().padStart(2, '0')}`,
      });
    }
  }

  // Jika belum ada data transaksi, fallback ke bulan saat ini
  if (results.length === 0) {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;
    results.push({
      year: curYear,
      month: curMonth,
      label: `${MONTH_NAMES_SHORT[curMonth - 1]} ${curYear}`,
      key: `${curYear}-${curMonth.toString().padStart(2, '0')}`,
    });
  }

  return results;
}

/**
 * Mengambil transaksi berdasarkan bulan aktif dan filter (tipe, kata kunci pencarian)
 */
export async function getTransactionsByMonthAndFilters(
  options: TransactionFilterOptions
): Promise<RecentTransactionItem[]> {
  const { year, month, type, searchQuery } = options;
  const monthStr = month.toString().padStart(2, '0');
  const monthPattern = `${year}-${monthStr}%`;

  const conditions = [sql`${transactions.date} LIKE ${monthPattern}`];

  if (type !== undefined && type !== 'all') {
    conditions.push(eq(transactions.type, type));
  }

  if (searchQuery && searchQuery.trim().length > 0) {
    const query = `%${searchQuery.trim().toLowerCase()}%`;
    conditions.push(
      sql`(LOWER(${transactions.notes}) LIKE ${query} OR LOWER(${categories.name}) LIKE ${query})`
    );
  }

  const rows = await db
    .select({
      id: transactions.id,
      walletId: transactions.walletId,
      walletName: wallets.name,
      toWalletId: transactions.toWalletId,
      toWalletName: toWallets.name,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      type: transactions.type,
      amount: transactions.amount,
      date: transactions.date,
      notes: transactions.notes,
    })
    .from(transactions)
    .innerJoin(wallets, eq(transactions.walletId, wallets.id))
    .leftJoin(toWallets, eq(transactions.toWalletId, toWallets.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.date));

  return rows.map((r) => ({
    id: r.id,
    walletId: r.walletId,
    walletName: r.walletName,
    toWalletId: r.toWalletId,
    toWalletName: r.toWalletName,
    categoryId: r.categoryId,
    categoryName: r.categoryName || (r.type === 2 ? 'Pindah Saldo' : r.type === 0 ? 'Pemasukan' : 'Pengeluaran'),
    categoryIcon: r.categoryIcon || (r.type === 2 ? 'repeat' : r.type === 0 ? 'trending-up' : 'shopping-bag'),
    type: r.type,
    amount: r.amount,
    date: r.date,
    notes: r.notes,
  }));
}

/**
 * Menghapus transaksi berdasarkan ID
 */
export async function deleteTransaction(transactionId: string): Promise<boolean> {
  const result = await db
    .delete(transactions)
    .where(eq(transactions.id, transactionId));

  return true;
}

