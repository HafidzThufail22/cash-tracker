import { db } from '../db';
import { transactions, categories, wallets } from '../schema';
import { desc, eq, sql } from 'drizzle-orm';

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

export async function getRecentTransactions(limit: number = 10): Promise<RecentTransactionItem[]> {
  const rows = await db
    .select({
      id: transactions.id,
      walletId: transactions.walletId,
      walletName: wallets.name,
      toWalletId: transactions.toWalletId,
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
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .orderBy(desc(transactions.date))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    walletId: r.walletId,
    walletName: r.walletName,
    toWalletId: r.toWalletId,
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

