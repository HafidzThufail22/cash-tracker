import { db } from '../db';
import { wallets, transactions } from '../schema';
import { eq, sql } from 'drizzle-orm';

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

