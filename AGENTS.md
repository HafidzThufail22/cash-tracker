# Cash Tracker — AI Agent Guidelines & Architecture Rules

This is an offline-first personal finance and budgeting mobile application built with **Expo (SDK 57) + React Native**. Prioritize performance, type-safety, and battery-friendly OLED dark luxury aesthetics.

---

## 1. User Communication Rule (Mandatory)

- **Language & Tone**: You MUST ALWAYS communicate and respond to the USER in **Bahasa Indonesia yang santai, gaul, akrab, dan seru** (casual, friendly, pair-programming buddy tone). Keep explanations crisp, exciting, and straight to the point without being stiff or overly formal.
- Internal thought processes and code comments may remain in technical English or Indonesian as appropriate, but all user-facing explanations, plans, questions, and summaries must be in casual Indonesian.

---

## 2. Single Source of Truth (Project Documentation)

Before designing, implementing, or modifying any feature, you MUST consult the authoritative specifications in the `docs/` directory:

1. **Folder Hierarchy & File Placements**: Consult `docs/Project-Structure.MD` before creating any file.
2. **Product Logic, ERD & Business Rules**: Consult `docs/PRD.MD` for entity fields, relations, and functional requirements.
3. **Database Architecture & Transfer Logic**: Consult `docs/Architecture.MD` for atomic transaction rules and data flow.
4. **Design System & Visual Tokens**: Consult `docs/Design.MD` as the primary reference for OLED palettes, typography, and card styles. *(Note: The `docs/design/` folder is strictly optional and only referenced if explicitly asked by the user).*

---

## 3. Project Architecture & Navigation

- **Domain-Driven Feature Modules**: All feature code resides under `src/features/<feature>/`:
  - `screens/`: Screen views (e.g., `DashboardScreen.tsx`, `WalletsScreen.tsx`, `TransactionListScreen.tsx`, `BudgetsScreen.tsx`)
  - `components/`: Feature-scoped UI components
  - `hooks/`: Feature state and data fetching hooks
- **Navigation**:
  - The application uses state-driven tab switching managed in `App.tsx` and `src/navigation/BottomTabs.tsx`.
  - **CRITICAL**: Do NOT create file-based routes in `src/app/`. The project does NOT use Expo Router file-based directory routing.
- **Shared Layouts & Components**:
  - Global layouts reside in `src/layouts/` (`ScreenWrapper.tsx`, `Header.tsx`, `ModalLayout.tsx`).
  - Reusable inputs and buttons reside in `src/components/common/` (`Button.tsx`, `InputField.tsx`, `CurrencyInput.tsx`).

---

## 4. Database & Financial Logic (Drizzle ORM + SQLite)

- **Local Storage**: Data is stored locally via `expo-sqlite` and managed through Drizzle ORM (`src/database/db.ts`, `src/database/schema.ts`).
- **Data Access Layer**: All database queries must be isolated inside `src/database/repositories/`:
  - `walletRepo.ts`: Wallet balances and atomic transfers.
  - `transactionRepo.ts`: Transaction ledger, monthly aggregation, and search filters.
  - `categoryRepo.ts`: Expense and income categories.
  - `budgetRepo.ts`: Category budget limits and real-time usage calculation.
- **Transfer Rule (Nabung Antar-Kantong)**:
  - Transfers between wallets are recorded as **1 single transaction row** with `type = 2`, `walletId = fromWalletId`, `toWalletId = toWalletId`, and `categoryId = null`.
  - Never record two separate expense/income rows for an internal transfer.
  - Transfers must NOT count against monthly expense budgets or distort Net Cash Flow calculations.
- **Dynamic Wallet Balance Formula**:
  $$\text{Balance} = \text{InitialBalance} + \sum(\text{Income}) - \sum(\text{Expense}) - \sum(\text{Transfer Out}) + \sum(\text{Transfer In})$$
- **Formatters**:
  - Always format currency values with `formatRupiah` or `formatSignedRupiah` from `src/utils/currency.ts`.
  - Always format dates with helpers from `src/utils/date.ts`.

---

## 5. UI/UX & Design Tokens (OLED Dark Luxury FinTech)

- **Background Palette**:
  - Primary Background: `#09090B` (True OLED Black).
  - Cards & Surfaces: `#18181B` (Zinc 900) or `#1C1C20`.
  - Borders: `rgba(79, 70, 51, 0.3)` or `#27272A`.
- **Accent & Semantic Colors**:
  - Primary Accent (Gold): `#EAB308` / `#FFD165` (CTAs, hero cards, active tabs).
  - Income (Emerald): `#10B981`.
  - Expense (Crimson): `#EF4444`.
  - Warning (Amber): `#F59E0B`.
- **Typography**:
  - Display & Currency Numbers: `SpaceGrotesk_700Bold` / `JetBrainsMono_500Medium`.
  - Body & Labels: `Manrope_400Regular`, `Manrope_600SemiBold`, `Manrope_700Bold`.

---

## 6. Commands & Verification

- **Package Installation**: ALWAYS use `npx expo install <package>` (or `bunx expo install <package>` if `bun.lock` is present) to resolve SDK-compatible dependencies.
- **Type-Check**: ALWAYS run `npx tsc --noEmit` before declaring any task complete.
- **Expo Diagnostics**: Run `npx expo-doctor` when adding native dependencies or modifying configurations.
- **Continuous Native Generation**: Never manually edit native `ios/` or `android/` folders. Configure native behavior via `app.json` and config plugins.
