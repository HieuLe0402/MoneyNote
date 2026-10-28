# MoneyNote Web Application Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, responsive personal finance web application ("MoneyNote") with sidebar navigation, monthly overview dashboard (summary cards, budget progress & alerts, 70/30 split of recent transactions & category expense breakdown), transaction management with CRUD, validation, CSV export, and persistent localStorage state.

**Architecture:** Vanilla HTML5, CSS3, and ES6 modular JavaScript with a centralized reactive `Store` (managing transactions, monthly budgets, and user settings with `localStorage`), utility modules for formatting/validation/CSV generation, and modular UI renderers with modal dialog management.

**Tech Stack:** HTML5, CSS3 (Vanilla design tokens & responsive flex/grid), Vanilla JavaScript (ES6 Modules), Node.js native test runner (`node:test`, `node:assert`).

**Spec:** [docs/superpowers/specs/2026-10-28-moneynote-design.md](file:///c:/Users/HIEU%20LE/Desktop/MoneyNote/docs/superpowers/specs/2026-10-28-moneynote-design.md)

## Global Constraints

- Primary color: `#1D4ED8`, Page background: `#F4F6FA`, Card background: `#FFFFFF`, Border: `#E5E7EB`, Card border-radius: `16px`.
- Balance card background: `#14213D`, Button border-radius: `10px`–`12px`.
- Primary text: `#111827`, Secondary text: `#4B5563`, Income: `#0E7A55`, Expense: `#B42318`.
- Budget warning text: `#D97706` on background `#FEF3C7` (border-radius `10px`).
- Typography: Google Fonts `Be Vietnam Pro` with sizes `13px`, `14px`, `17px`, `26px`, `28px`.
- Layout: 260px fixed sidebar, 70% transaction list / 30% category breakdown split on dashboard.
- Default categories: Expense (Ăn uống, Đi lại, Mua sắm, Học tập, Giải trí, Hóa đơn, Khác), Income (Lương, Học bổng, Được cho, Khác).
- Currency format: Vietnamese Dong with dot thousand separator (e.g., `500.000 đ`).
- 10 sample transactions automatically populated on first run if localStorage is empty.
- CSV export must include UTF-8 BOM (`\uFEFF`) to prevent Vietnamese character corruption in Excel.

## Review Focus

1. Negative or zero transaction amount submitted -> validator rejects with error message "Số tiền phải lớn hơn 0 đ".
2. Blank or whitespace-only note field submitted -> validator rejects with error message "Vui lòng nhập ghi chú giao dịch".
3. Expense exceeding monthly budget limit -> budget percentage correctly exceeds 100% and warning dynamically switches to alert over-budget status.
4. Month navigation across years (e.g. from January 2027 back to December 2026) -> correctly calculates date string `YYYY-MM` and updates summary cards without NaN.
5. Export CSV with Vietnamese notes and categories -> exported file string contains leading `\uFEFF` and correct comma-separated column values.

---

### Task 1: Constants, Sample Data, and Utility Helper Module

**Files:**
- Create: `src/constants.js`
- Create: `src/utils.js`
- Test: `tests/utils.test.js`

**Interfaces:**
- Produces:
  - `DEFAULT_CATEGORIES`: `{ expense: Array<{id, name, icon, color}>, income: Array<{id, name, icon, color}> }`
  - `SAMPLE_TRANSACTIONS`: Array of 10 initial transaction objects with valid `id`, `type`, `amount`, `category`, `date`, `note`.
  - `formatCurrency(amount: number): string` -> e.g. `500.000 đ`
  - `formatDate(dateStr: string): string` -> e.g. `28/10/2026`
  - `formatMonthYear(yearMonthStr: string): string` -> e.g. `Tháng 10/2026`
  - `validateTransaction(data: object): { isValid: boolean, errors: Record<string, string> }`
  - `generateCSV(transactions: Array<object>): string`

- [ ] **Step 1: Write unit tests for utility functions**

```javascript
// tests/utils.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCurrency, formatDate, formatMonthYear, validateTransaction, generateCSV } from '../src/utils.js';

test('formatCurrency formats positive and negative VND correctly', () => {
  assert.equal(formatCurrency(500000), '500.000 đ');
  assert.equal(formatCurrency(0), '0 đ');
  assert.equal(formatCurrency(15000000), '15.000.000 đ');
});

test('validateTransaction rejects invalid amount and blank note', () => {
  const result1 = validateTransaction({ amount: -100, note: '  ', category: 'Ăn uống', date: '2026-10-28', type: 'expense' });
  assert.equal(result1.isValid, false);
  assert.ok(result1.errors.amount);
  assert.ok(result1.errors.note);

  const result2 = validateTransaction({ amount: 150000, note: 'Ăn trưa', category: 'Ăn uống', date: '2026-10-28', type: 'expense' });
  assert.equal(result2.isValid, true);
  assert.deepEqual(result2.errors, {});
});

test('generateCSV outputs UTF-8 BOM and correct header rows', () => {
  const sample = [{ id: '1', date: '2026-10-28', type: 'expense', category: 'Ăn uống', note: 'Phở bò', amount: 50000 }];
  const csv = generateCSV(sample);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('Mã GD,Ngày,Loại,Danh mục,Ghi chú,Số tiền (VNĐ)'));
  assert.ok(csv.includes('Chi,Ăn uống,"Phở bò",50000'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/utils.test.js`
Expected: FAIL (modules not found)

- [ ] **Step 3: Implement `src/constants.js` and `src/utils.js`**

Implement categories with exact icons and colors from spec, 10 sample transactions with diverse dates in October 2026, currency/date formatters using `Intl.NumberFormat('vi-VN')`, strict transaction validation, and BOM-prefixed CSV string builder.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/utils.test.js`
Expected: PASS (all tests green)

- [ ] **Step 5: Commit**

```bash
git add src/constants.js src/utils.js tests/utils.test.js
git commit -m "feat: add constants, sample data, and utility helpers with tests"
```

---

### Task 2: Reactive State Store with LocalStorage Persistence

**Files:**
- Create: `src/store.js`
- Test: `tests/store.test.js`

**Interfaces:**
- Consumes: `DEFAULT_CATEGORIES`, `SAMPLE_TRANSACTIONS` from `src/constants.js`.
- Produces:
  - `Store` class / singleton with methods:
    - `init()`: loads user, transactions, budgets from localStorage (or seeds sample data on first run).
    - `getUser(): { name: string }`
    - `setUserName(name: string): void`
    - `getSelectedMonth(): string` (e.g. `'2026-10'`)
    - `setSelectedMonth(monthStr: string): void`
    - `getTransactions(filter?: { month, type, category, query }): Array<object>`
    - `addTransaction(txData: object): object`
    - `updateTransaction(id: string, txData: object): object`
    - `deleteTransaction(id: string): boolean`
    - `getBudget(monthStr: string): number`
    - `setBudget(monthStr: string, amount: number): void`
    - `getCalculatedStats(monthStr: string): { totalIncome, countIncome, totalExpense, countExpense, balance, budget, budgetSpentPercent, budgetRemaining, isOverBudget, categoryBreakdown: Array<{category, icon, color, amount, percent}> }`
    - `resetToSampleData(): void`
    - `subscribe(listener: Function): Function` (returns unsubscribe)

- [ ] **Step 1: Write unit tests for Store calculations and CRUD**

```javascript
// tests/store.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { Store } from '../src/store.js';

// Mock localStorage for Node test environment
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

test('Store initializes with 10 sample transactions and calculates stats accurately', () => {
  localStorage.clear();
  const store = new Store();
  store.init();
  store.setSelectedMonth('2026-10');

  const stats = store.getCalculatedStats('2026-10');
  assert.ok(stats.totalIncome > 0);
  assert.ok(stats.totalExpense > 0);
  assert.equal(stats.balance, stats.totalIncome - stats.totalExpense);
  assert.ok(stats.categoryBreakdown.length > 0);
});

test('Store addTransaction and deleteTransaction update stats and notify listeners', () => {
  localStorage.clear();
  const store = new Store();
  store.init();
  store.setSelectedMonth('2026-10');

  let notified = false;
  store.subscribe(() => { notified = true; });

  const newTx = store.addTransaction({
    type: 'expense',
    amount: 100000,
    category: 'Ăn uống',
    date: '2026-10-28',
    note: 'Cơm tấm sườn'
  });

  assert.ok(newTx.id);
  assert.equal(notified, true);

  const deleted = store.deleteTransaction(newTx.id);
  assert.equal(deleted, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/store.test.js`
Expected: FAIL (`Store` not found)

- [ ] **Step 3: Implement `src/store.js`**

Implement the state manager with localStorage persistence, event broadcasting, filtering, robust stats calculation (including category breakdown percentage and budget tracking).

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/store.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/store.js tests/store.test.js
git commit -m "feat: add reactive store with localStorage persistence and calculations"
```

---

### Task 3: Comprehensive Design System & Layout CSS

**Files:**
- Modify: `style.css`

**Interfaces:**
- Consumes: CSS variables mapped to design tokens (`--color-primary: #1D4ED8`, `--color-bg: #F4F6FA`, `--color-card: #FFFFFF`, `--color-balance-card: #14213D`, `--color-income: #0E7A55`, `--color-expense: #B42318`, `--color-warning: #D97706`, `--color-warning-bg: #FEF3C7`, `--font-main: 'Be Vietnam Pro', sans-serif`).
- Produces: Complete styling for sidebar (260px), top bar, 3 summary cards grid, budget progress bar & alert banner, 70/30 grid layout, transaction list table, category progress bars with category colors, modals with backdrop blur, button hover micro-interactions, responsive adjustments.

- [ ] **Step 1: Write CSS variables and reset rules in `style.css`**

Import Google Font `Be Vietnam Pro` (weights 400, 500, 600, 700). Define all specified color tokens, typography sizes (`13px`, `14px`, `17px`, `26px`, `28px`), radius (`16px` for cards, `10px`-`12px` for buttons), shadow tokens.

- [ ] **Step 2: Implement Sidebar, Top Bar, and Main App Layout**

Implement 260px fixed sidebar with logo, wallet icon, menu item active indicator, main container offset, top bar flex layout with search bar, month navigator, and primary action button.

- [ ] **Step 3: Implement Cards, 70/30 Split, Progress Bars, and Modals**

Style 3 summary cards (Total Income, Total Expense, Balance in `#14213D`), 100% width budget card with orange progress bar and alert box, 70/30 split flex/grid container, category bars with distinctive colors, modal overlays with smooth fade-in and scale animation.

- [ ] **Step 4: Verify styles load without errors**

Validate syntax of `style.css`.

- [ ] **Step 5: Commit**

```bash
git add style.css
git commit -m "feat: implement complete design system and responsive CSS layout"
```

---

### Task 4: Main HTML Skeleton with Semantic Components & Modals

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `style.css`, SVG icons.
- Produces: Full semantic DOM structure with unique IDs:
  - Sidebar with `#sidebarLogo`, `#navOverview`, `#navTransactions`, `#navAnalytics`, `#navSettings`.
  - Top Bar with `#userGreeting`, `#btnPrevMonth`, `#currentMonthLabel`, `#btnNextMonth`, `#inputSearchNote`, `#btnOpenAddModal`.
  - Main Dashboard View (`#viewOverview`):
    - Cards: `#cardTotalIncome`, `#cardTotalExpense`, `#cardBalance`.
    - Monthly budget section: `#budgetAmountText`, `#btnOpenBudgetModal`, `#budgetProgressBar`, `#budgetAlertBox`.
    - 70% Recent transactions section: `#btnExportCSV`, filter buttons (`#filterAll`, `#filterIncome`, `#filterExpense`), category select `#filterCategory`, transaction list container `#recentTransactionList`, expand footer button `#btnViewAllTransactions`.
    - 30% Category breakdown section: `#categoryTotalExpenseText`, list container `#categoryBreakdownList`.
  - Other Views: `#viewTransactions`, `#viewAnalytics`, `#viewSettings`.
  - Modals:
    - `#modalWelcome`: Initial name prompt.
    - `#modalTransaction`: Add/Edit form with type toggle, amount, category, date, note, validation error spans.
    - `#modalBudget`: Set monthly budget limit.
    - `#modalDelete`: Confirm deletion dialog.

- [ ] **Step 1: Build semantic HTML structure with accessible elements and IDs**

Write the complete `index.html` including `<head>` font links, sidebar navigation, view containers, and modal dialogs with clear semantic structure.

- [ ] **Step 2: Verify HTML tags are properly closed and IDs match plan**

Check DOM tree validity.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: construct semantic HTML layout and modal markup"
```

---

### Task 5: Application Controller, Interactivity, Modals, and CSV Export

**Files:**
- Modify: `app.js`
- Test: `tests/integration.test.js`

**Interfaces:**
- Consumes: `Store` from `src/store.js`, utilities from `src/utils.js`, `DEFAULT_CATEGORIES` from `src/constants.js`.
- Produces:
  - Complete client-side application wiring:
    - First visit detection -> opens `#modalWelcome` if user name not set.
    - Sidebar navigation -> switches between Overview, Transactions, Analytics, and Settings views.
    - Month navigation -> updates selected month and re-renders current view.
    - Real-time search by note + category/type filter -> filters transaction table live.
    - Add/Edit transaction modal workflow with validation -> writes to `Store`.
    - Delete transaction workflow with confirm dialog -> removes from `Store`.
    - Monthly budget modal workflow -> updates budget and recalculates progress/alert.
    - CSV export trigger -> generates and downloads UTF-8 BOM CSV file.
    - Settings view actions -> update name, update budget, restore sample data.

- [ ] **Step 1: Write integration test for data operations and filters**

```javascript
// tests/integration.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { Store } from '../src/store.js';
import { generateCSV } from '../src/utils.js';

test('Integration: Filter transactions by note and export CSV', () => {
  const store = new Store();
  store.init();
  store.setSelectedMonth('2026-10');

  const filtered = store.getTransactions({
    month: '2026-10',
    type: 'all',
    category: 'all',
    query: 'Lương'
  });

  assert.ok(filtered.length >= 1);
  assert.ok(filtered.every(tx => tx.note.toLowerCase().includes('lương')));

  const csv = generateCSV(filtered);
  assert.ok(csv.includes('Lương'));
});
```

- [ ] **Step 2: Run test to verify integration test passes**

Run: `node --test tests/integration.test.js`
Expected: PASS

- [ ] **Step 3: Implement complete `app.js` logic**

Wire up DOM elements, event listeners, modal managers, renderers for cards, budget bar, 70/30 dashboard, full transactions view, analytics chart/bars, settings, and CSV download trigger.

- [ ] **Step 4: Run all tests together**

Run: `node --test tests/*.test.js`
Expected: PASS (all tests pass)

- [ ] **Step 5: Commit**

```bash
git add app.js tests/integration.test.js
git commit -m "feat: complete application controllers, view rendering, and modal flows"
```

---

### Task 6: Visual & Functional Verification via Browser Subagent

**Files:**
- Test/Verify in live browser

**Interfaces:**
- Consumes: Running HTTP server / local static files.
- Produces: Verified UI visual appearance, working modals, responsive design, transaction CRUD, budget alert updates, and CSV download.

- [ ] **Step 1: Launch local web server and open in browser subagent**

Run local lightweight HTTP server or open `index.html`. Launch `browser_subagent` to capture screenshots and verify:
- Welcome modal appears on first load, entering name greets the user at top left.
- 3 summary cards display formatted VND with count of transactions.
- Monthly budget bar displays spent/limit, progress bar, and warning alert.
- 70/30 split displays recent transactions list with green income and red expense badges, and category breakdown with distinct colored bars.
- Clicking "+ Thêm giao dịch" opens modal, validates fields, and adds a transaction.
- Editing and deleting transactions works with confirmation.
- CSV export downloads valid file.

- [ ] **Step 2: Fix any visual or functional discrepancies found during testing**

- [ ] **Step 3: Commit final polish**

```bash
git add .
git commit -m "chore: final UI polish and browser verification"
```
