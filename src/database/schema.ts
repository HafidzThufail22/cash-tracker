import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// 1. TABEL WALLETS (Pos Kantong / Rekening)
export const wallets = sqliteTable("wallets", {
    id: text("id").primaryKey(), // UUID string asli dari backup
    name: text("name").notNull(),
    type: text("type").notNull().default("cash"), // 'cash', 'bank', 'savings'
    initialBalance: real("initial_balance").notNull().default(0),
    color: text("color").default("#EAB308"), // Aksen Emas
    icon: text("icon").default("wallet"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
});

// 2. TABEL CATEGORIES (Kategori & Sub-kategori)
export const categories = sqliteTable("categories", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    type: integer("type").notNull(), // 0: Income, 1: Expense, 2: Transfer/System
    icon: text("icon").default("tag"),
    color: text("color").default("#71717A"),
    parentId: text("parent_id"), // Self-referencing untuk sub-kategori
    orderNum: integer("order_num").notNull().default(0),
});

// 3. TABEL TRANSACTIONS (Pemasukan, Pengeluaran, Transfer)
export const transactions = sqliteTable("transactions", {
    id: text("id").primaryKey(),
    walletId: text("wallet_id")
        .notNull()
        .references(() => wallets.id, { onDelete: "cascade" }),
    toWalletId: text("to_wallet_id")
        .references(() => wallets.id, { onDelete: "cascade" }), // Terisi jika type = 2 (Transfer)
    categoryId: text("category_id")
        .references(() => categories.id, { onDelete: "set null" }),
    type: integer("type").notNull(), // 0: Pemasukan, 1: Pengeluaran, 2: Transfer/Nabung
    amount: real("amount").notNull(),
    date: text("date").notNull(), // Format ISO8601
    notes: text("notes"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
});

// 4. TABEL BUDGETS (Plafon Anggaran Bulanan)
export const budgets = sqliteTable("budgets", {
    id: text("id").primaryKey(),
    categoryId: text("category_id")
        .notNull()
        .references(() => categories.id, { onDelete: "cascade" }),
    walletId: text("wallet_id")
        .references(() => wallets.id, { onDelete: "cascade" }),
    periodMonth: integer("period_month").notNull(), // 1 - 12
    periodYear: integer("period_year").notNull(), // Contoh: 2026
    amountLimit: real("amount_limit").notNull(),
    createdAt: text("created_at").notNull(),
});

// RELASI ANTAR-TABEL UNTUK QUERY DRIZZLE
export const walletsRelations = relations(wallets, ({ many }) => ({
    transactions: many(transactions, { relationName: "wallet_transactions" }),
    incomingTransfers: many(transactions, { relationName: "incoming_transfers" }),
    budgets: many(budgets),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
    parent: one(categories, {
        fields: [categories.parentId],
        references: [categories.id],
        relationName: "sub_categories",
    }),
    subCategories: many(categories, { relationName: "sub_categories" }),
    transactions: many(transactions),
    budgets: many(budgets),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
    wallet: one(wallets, {
        fields: [transactions.walletId],
        references: [wallets.id],
        relationName: "wallet_transactions",
    }),
    toWallet: one(wallets, {
        fields: [transactions.toWalletId],
        references: [wallets.id],
        relationName: "incoming_transfers",
    }),
    category: one(categories, {
        fields: [transactions.categoryId],
        references: [categories.id],
    }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
    category: one(categories, {
        fields: [budgets.categoryId],
        references: [categories.id],
    }),
    wallet: one(wallets, {
        fields: [budgets.walletId],
        references: [wallets.id],
    }),
}));