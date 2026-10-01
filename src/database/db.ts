import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";

// 1. Buka database SQLite lokal bernama 'cashtracker.db'
export const expoDb = openDatabaseSync("cashtracker.db");

// 2. Hubungkan ke klien Drizzle ORM
export const db = drizzle(expoDb, { schema });

// 3. Eksekusi pembuatan tabel DDL otomatis saat runtime
export const initDatabase = () => {
    expoDb.execSync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'cash',
      initial_balance REAL NOT NULL DEFAULT 0,
      color TEXT DEFAULT '#EAB308',
      icon TEXT DEFAULT 'wallet',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type INTEGER NOT NULL,
      icon TEXT DEFAULT 'tag',
      color TEXT DEFAULT '#71717A',
      parent_id TEXT,
      order_num INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      wallet_id TEXT NOT NULL,
      to_wallet_id TEXT,
      category_id TEXT,
      type INTEGER NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
      FOREIGN KEY (to_wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      wallet_id TEXT,
      period_month INTEGER NOT NULL,
      period_year INTEGER NOT NULL,
      amount_limit REAL NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
      FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
    );
  `);
};