# 💰 Cash Tracker

<p align="center">
  <strong>A Self-Hosted, Offline-First Personal Finance & Budgeting Mobile App</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-SDK%2057-000020?style=flat&logo=expo" alt="Expo SDK" />
  <img src="https://img.shields.io/badge/React%20Native-0.86-61DAFB?style=flat&logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Styling-NativeWind%20v4-38BDF8?style=flat&logo=tailwindcss" alt="NativeWind" />
  <img src="https://img.shields.io/badge/Database-expo--sqlite%20%2B%20Drizzle-C5F74F?style=flat&logo=sqlite" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## 📖 About Cash Tracker

**Cash Tracker** is an independent, offline-first personal finance and budgeting mobile application built for Android and iOS. It is engineered with a strong focus on **rapid transaction entry, complete data privacy, and zero paywalls or subscription restrictions**.

Many commercial expense tracking apps today are plagued with disruptive ads, lock essential features (such as custom category colors, icons, and nested subcategories) behind premium tiers, or lack integrated inter-pocket transfers—forcing users to record duplicate transactions when moving money between accounts. Cash Tracker solves these problems with a 100% local database, atomic inter-wallet transfers, and unlimited customization forever.

---

## ✨ Key Features

- **👛 Integrated Multi-Pocket System**
  - Create unlimited custom wallets (*Cash, Savings, Bank, E-Wallets*).
  - Dynamic real-time balance calculations driven by initial balances and transaction flows.
- **🔄 Native Inter-Pocket Transfers**
  - Transfer funds between pockets (e.g., daily savings allocation) in a single atomic transaction without causing bias or distortion in Net Cash Flow calculations.
- **🏷️ Hierarchical Categories & Subcategories**
  - Flexible parent-child relationship support (e.g., *Food & Drink* ➔ *Restaurants*, *Transport* ➔ *Fuel*).
  - Full customization with hexadecimal color codes and modern vector icons with no paywalls.
- **⚡ Fast Transaction Engine**
  - Swift entries with automatic Indonesian Rupiah (IDR) currency formatting.
  - Strict transaction typing: `0` (Income), `1` (Expense), and `2` (Inter-Pocket Transfer).
  - Date-grouped ledger history with multi-pocket filtering and instant text search.
- **📊 Monthly Budgeting & Limit Tracking**
  - Set monthly category expense ceilings for active billing cycles.
  - Real-time visual threshold indicators:
    - 🟢 **Safe**: $< 80\%$ budget consumed
    - 🟡 **Warning**: $80\% - 99\%$ budget consumed
    - 🔴 **Overbudget**: $\ge 100\%$ budget exceeded
- **📥 Legacy Data Importer (1-Year Migration)**
  - Seamless migration parser for legacy JSON backup files (`moneymanager_backup_*.json`).
  - Automated deduplication that converts old double-entry savings records into native atomic transfers.
- **🔒 100% Offline-First & Data Sovereignty**
  - All data is securely stored locally on the device using SQLite.
  - Zero external servers, zero third-party telemetry, and permanently ad-free.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [React Native](https://reactnative.dev/) / [Expo SDK 57](https://expo.dev/) | Cross-platform (Android & iOS) with strict TypeScript typing |
| **Styling** | [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS v3) | Utility-first styling with a modern Dark Mode theme |
| **Local Database** | [`expo-sqlite`](https://docs.expo.dev/versions/latest/sdk/sqlite/) + [Drizzle ORM](https://orm.drizzle.team/) | High-performance relational local storage with type-safe queries |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) | Lightweight global store for active filters, date ranges, and selected wallets |
| **Iconography** | [Lucide React Native](https://lucide.dev/) | Clean, consistent, and lightweight SVG vector icons |

---

## 📂 Project Architecture

The codebase follows a **modular, domain-driven feature structure**:

```text
cash-tracker/
├── docs/                 # Technical documentation (PRD, Design System, Architecture)
├── src/
│   ├── assets/           # Local icons, images, and data storage
│   ├── components/       # Reusable global UI primitives (Buttons, Inputs, Cards, Dialogs)
│   ├── database/         # Drizzle schema, SQLite connection, repositories, & migration importer
│   ├── features/         # Domain-driven feature modules (dashboard, wallets, transactions, budgets, settings)
│   ├── layouts/          # ScreenWrapper, Header, and ModalLayout
│   ├── navigation/       # RootNavigator & BottomTabs configuration
│   ├── types/            # Centralized TypeScript definitions
│   └── utils/            # Currency formatters, date helpers, and validation utilities
├── App.tsx               # Application root entry point
└── package.json
```

> 💡 *For an in-depth breakdown of the project layout, refer to [docs/Project-Structure.MD](docs/Project-Structure.MD).*

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended, v20+)
- Package manager: `npm`, `yarn`, or `bun`
- **Expo Go** app on your physical mobile device, or a configured Android/iOS simulator

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<username>/cash-tracker.git
   cd cash-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or with bun:
   bun install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Launch on your device:**
   - Scan the terminal QR code using **Expo Go** (Android) or the default Camera app (iOS).
   - Press `a` to open in an Android Emulator, or `i` to launch in the iOS Simulator.

---

## 📜 Available Scripts

| Command | Purpose |
| :--- | :--- |
| `npx expo start` | Launches the Expo Metro bundler development server |
| `npx expo start --android` | Opens the app directly in an Android emulator or connected device |
| `npx expo start --ios` | Opens the app directly in an iOS simulator |
| `npx tsc --noEmit` | Runs the TypeScript compiler for static type verification |
| `npx expo-doctor` | Validates package versions and project configuration health |

---

## 📚 Related Documentation

- [docs/PRD.MD](docs/PRD.MD) — Complete Product Requirements Document, database schemas, and unified ERD.
- [docs/Design.MD](docs/Design.MD) — Design guidelines, dark palette tokens, and UI layout specifications.
- [docs/Project-Structure.MD](docs/Project-Structure.MD) — Granular project directory map and code layout.

---

## 📄 License

This project is open-source and distributed under the [MIT License](LICENSE).
