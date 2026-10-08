import { db } from '../db';
import { wallets, transactions, categories } from '../schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import * as Crypto from 'expo-crypto';

const toWallets = alias(wallets, 'to_wallets');

export interface WalletWithBalance {
  id: string;
  name: string;
  type: string;
  initialBalance: number;
  color: string | null;
  icon: string | null;
  isActive: boolean;
  balance: number;
}

export async function getWalletsWithBalance(): Promise<{
  wallets: WalletWithBalance[];
  totalNetBalance: number;
}> {
  const allWallets = await db.select().from(wallets).where(eq(wallets.isActive, true));

  const result: WalletWithBalance[] = [];
  let totalNetBalance = 0;

  for (const w of allWallets) {
    const incomingRes = await db
      .select({
        total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .where(
        sql`(${transactions.type} = 0 AND ${transactions.walletId} = ${w.id}) OR (${transactions.type} = 2 AND ${transactions.toWalletId} = ${w.id})`
      );

    const outgoingRes = await db
      .select({
        total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .where(
        sql`(${transactions.type} = 1 OR ${transactions.type} = 2) AND ${transactions.walletId} = ${w.id}`
      );

    const incoming = Number(incomingRes[0]?.total || 0);
    const outgoing = Number(outgoingRes[0]?.total || 0);
    const currentBalance = w.initialBalance + incoming - outgoing;

    result.push({
      id: w.id,
      name: w.name,
      type: w.type,
      initialBalance: w.initialBalance,
      color: w.color,
      icon: w.icon,
      isActive: w.isActive,
      balance: currentBalance,
    });

    totalNetBalance += currentBalance;
  }

  return { wallets: result, totalNetBalance };
}

/**
 * Mutasi Pindah Saldo (Transfer Antar-Kantong) secara Atomik
 * Menghasilkan 1 baris transaksi bertipe 2 (Transfer)
 */
export async function transferBetweenWallets(params: {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  date?: string;
  notes?: string;
}): Promise<{ success: boolean; message: string; transactionId?: string }> {
  if (params.fromWalletId === params.toWalletId) {
    return { success: false, message: 'Kantong asal dan tujuan tidak boleh sama.' };
  }
  if (params.amount <= 0) {
    return { success: false, message: 'Nominal transfer harus lebih besar dari Rp 0.' };
  }

  try {
    const txId = Crypto.randomUUID();
    const txDate = params.date || new Date().toISOString();

    await db.transaction(async (tx) => {
      await tx.insert(transactions).values({
        id: txId,
        walletId: params.fromWalletId,
        toWalletId: params.toWalletId,
        categoryId: null, // Transfer murni tidak memotong kuota anggaran belanja
        type: 2,          // 2: Transfer
        amount: params.amount,
        date: txDate,
        notes: params.notes || 'Pindah Saldo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    return { success: true, message: 'Transfer saldo berhasil diproses!', transactionId: txId };
  } catch (error) {
    console.error('Error saat transferBetweenWallets:', error);
    return { success: false, message: `Gagal transfer: ${String(error)}` };
  }
}

/**
 * Tambah Kantong Baru ke SQLite
 */
export async function createWallet(params: {
  name: string;
  type?: string;
  initialBalance?: number;
  color?: string;
  icon?: string;
}): Promise<{ success: boolean; walletId?: string; message: string }> {
  const trimmedName = params.name?.trim();
  if (!trimmedName) {
    return { success: false, message: 'Nama kantong wajib diisi.' };
  }

  try {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();

    await db.insert(wallets).values({
      id,
      name: trimmedName,
      type: params.type || 'cash',
      initialBalance: params.initialBalance || 0,
      color: params.color || '#EAB308',
      icon: params.icon || 'wallet',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, walletId: id, message: 'Kantong baru berhasil dibuat!' };
  } catch (error) {
    console.error('Error saat createWallet:', error);
    return { success: false, message: `Gagal membuat kantong: ${String(error)}` };
  }
}

/**
 * Mengambil Seluruh Transaksi yang Terkait dengan Suatu Kantong Tertentu
 * Mendukung filter opsional berdasarkan tahun & bulan
 */
export async function getWalletTransactions(
  walletId: string,
  year?: number,
  month?: number,
  limit: number = 100
) {
  const conditions = [
    sql`(${transactions.walletId} = ${walletId} OR ${transactions.toWalletId} = ${walletId})`,
  ];

  if (year !== undefined && month !== undefined) {
    const monthStr = month.toString().padStart(2, '0');
    conditions.push(sql`${transactions.date} LIKE ${`${year}-${monthStr}%`}`);
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


