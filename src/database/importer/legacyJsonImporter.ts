import { db, initDatabase } from '../db';
import { wallets, categories, transactions } from '../schema';

// Mengimpor file cadangan JSON lokal
import legacyData from '../../assets/data/moneymanager_backup.json';

export interface MigrationResult {
    success: boolean;
    message: string;
    stats?: {
        walletsCount: number;
        categoriesCount: number;
        transactionsCount: number;
    };
}

export async function importLegacyData(): Promise<MigrationResult> {
    try {
        // 1. Pastikan tabel SQLite sudah terbuat
        initDatabase();

        // 2. Cek apakah migrasi sudah pernah berjalan sebelumnya
        const existingWallets = await db.select().from(wallets);
        if (existingWallets.length > 0) {
            const existingTransactions = await db.select().from(transactions);
            return {
                success: true,
                message: 'Data sudah ada di database lokal. Migrasi dilewati.',
                stats: {
                    walletsCount: existingWallets.length,
                    categoriesCount: (await db.select().from(categories)).length,
                    transactionsCount: existingTransactions.length,
                },
            };
        }

        console.log('Memulai proses migrasi data cadangan 1 tahun...');

        // 3. Ekstraksi Dompet Unik dari Data Transaksi
        const walletMap = new Map<string, { id: string; name: string; type: string }>();

        for (const item of legacyData.transactions) {
            if (item.wallet && !walletMap.has(item.wallet.id)) {
                walletMap.set(item.wallet.id, {
                    id: item.wallet.id,
                    name: item.wallet.name,
                    type: item.wallet.walletType || 'cash',
                });
            }
        }

        // 4. Masukkan Dompet ke SQLite
        for (const w of walletMap.values()) {
            const isSavings = w.name.toLowerCase().includes('tabungan');
            await db.insert(wallets).values({
                id: w.id,
                name: w.name,
                type: w.type,
                initialBalance: 0,
                color: isSavings ? '#EAB308' : '#10B981', // Tabungan: Emas, Cash: Hijau
                icon: isSavings ? 'piggy-bank' : 'wallet',
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }

        // 5. Masukkan Kategori (Parent dulu, lalu Sub-kategori)
        const parentCategories = legacyData.categories.filter((c: any) => !c.parentCategoryId);
        const childCategories = legacyData.categories.filter((c: any) => c.parentCategoryId);

        for (const cat of parentCategories) {
            await db.insert(categories).values({
                id: cat.id,
                name: cat.name,
                type: cat.type,
                icon: 'tag',
                color: '#71717A',
                parentId: null,
                orderNum: cat.order ?? 0,
            });
        }

        for (const cat of childCategories) {
            await db.insert(categories).values({
                id: cat.id,
                name: cat.name,
                type: cat.type,
                icon: 'tag',
                color: '#A1A1AA',
                parentId: cat.parentCategoryId,
                orderNum: cat.order ?? 0,
            });
        }

        // 6. Masukkan Seluruh Baris Transaksi
        const transactionRows = legacyData.transactions.map((t: any) => ({
            id: t.id,
            walletId: t.wallet.id,
            toWalletId: null,
            categoryId: t.category ? t.category.id : null,
            type: t.transactionType, // 0: Income, 1: Expense
            amount: t.amount,
            date: t.date,
            notes: t.notes || null,
            createdAt: t.createdAt || new Date().toISOString(),
            updatedAt: t.updatedAt || new Date().toISOString(),
        }));

        // Insert batch bertahap (50 baris per batch) agar aman di memori perangkat
        const BATCH_SIZE = 50;
        for (let i = 0; i < transactionRows.length; i += BATCH_SIZE) {
            const batch = transactionRows.slice(i, i + BATCH_SIZE);
            await db.insert(transactions).values(batch);
        }

        return {
            success: true,
            message: 'Migrasi berhasil diselesaikan!',
            stats: {
                walletsCount: walletMap.size,
                categoriesCount: legacyData.categories.length,
                transactionsCount: transactionRows.length,
            },
        };
    } catch (error) {
        console.error('Terjadi kesalahan saat migrasi:', error);
        return {
            success: false,
            message: `Gagal migrasi: ${String(error)}`,
        };
    }
}