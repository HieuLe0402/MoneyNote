import test from 'node:test';
import assert from 'node:assert/strict';
import { Store } from '../src/store.js';

// Setup mock localStorage for Node.js test environment
function setupMockLocalStorage() {
  const store = {};
  global.localStorage = {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
  return store;
}

test('Store initializes with 10 sample transactions and calculates stats accurately', () => {
  setupMockLocalStorage();
  const store = new Store();
  store.init();
  store.setSelectedMonth('2026-10');

  const stats = store.getCalculatedStats('2026-10');
  assert.equal(typeof stats.totalIncome, 'number');
  assert.equal(typeof stats.totalExpense, 'number');
  assert.ok(stats.totalIncome > 0);
  assert.ok(stats.totalExpense > 0);
  assert.equal(stats.countIncome, 3);
  assert.equal(stats.countExpense, 7);
  assert.equal(stats.balance, stats.totalIncome - stats.totalExpense);

  assert.ok(Array.isArray(stats.categoryBreakdown));
  assert.ok(stats.categoryBreakdown.length > 0);
  const totalCategoryPercent = stats.categoryBreakdown.reduce((sum, item) => sum + item.percent, 0);
  assert.ok(Math.abs(totalCategoryPercent - 100) <= 1, 'Sum of category percent should be ~100%');
});

test('Store addTransaction, updateTransaction, and deleteTransaction trigger subscribers and persist', () => {
  setupMockLocalStorage();
  const store = new Store();
  store.init();
  store.setSelectedMonth('2026-10');

  let notifyCount = 0;
  const unsubscribe = store.subscribe(() => {
    notifyCount++;
  });

  // Add
  const newTx = store.addTransaction({
    type: 'expense',
    amount: 150000,
    category: 'Ăn uống',
    date: '2026-10-28',
    note: 'Lẩu mini với bạn'
  });

  assert.ok(newTx.id);
  assert.equal(notifyCount, 1);
  const found = store.getTransactions().find(t => t.id === newTx.id);
  assert.ok(found);
  assert.equal(found.note, 'Lẩu mini với bạn');

  // Update
  const updated = store.updateTransaction(newTx.id, {
    amount: 180000,
    note: 'Lẩu Thái hải sản'
  });
  assert.equal(updated.amount, 180000);
  assert.equal(updated.note, 'Lẩu Thái hải sản');
  assert.equal(notifyCount, 2);

  // Delete
  const deleted = store.deleteTransaction(newTx.id);
  assert.equal(deleted, true);
  assert.equal(notifyCount, 3);
  const deletedSearch = store.getTransactions().find(t => t.id === newTx.id);
  assert.equal(deletedSearch, undefined);

  unsubscribe();
  store.addTransaction({
    type: 'income',
    amount: 500000,
    category: 'Thưởng',
    date: '2026-10-28',
    note: 'Thưởng dự án'
  });
  assert.equal(notifyCount, 3, 'Should not notify after unsubscribe');
});

test('Store budget tracking and over-budget calculation', () => {
  setupMockLocalStorage();
  const store = new Store();
  store.init();
  store.setSelectedMonth('2026-10');

  // Set tight budget
  store.setBudget('2026-10', 2000000);
  let stats = store.getCalculatedStats('2026-10');
  assert.equal(stats.budget, 2000000);
  assert.ok(stats.isOverBudget, 'Should be over budget since expense > 2.000.000');
  assert.ok(stats.budgetSpentPercent > 100);

  // Set ample budget
  store.setBudget('2026-10', 20000000);
  stats = store.getCalculatedStats('2026-10');
  assert.equal(stats.isOverBudget, false);
  assert.ok(stats.budgetRemaining > 0);
  assert.ok(stats.budgetSpentPercent < 100);
});

test('Store handles user name and resetToSampleData', () => {
  setupMockLocalStorage();
  const store = new Store();
  store.init();

  assert.equal(store.getUser().name, '');
  store.setUserName('Hải Nam');
  assert.equal(store.getUser().name, 'Hải Nam');

  // Verify persistence in mock localStorage
  const savedUser = JSON.parse(global.localStorage.getItem('moneynote_user'));
  assert.equal(savedUser.name, 'Hải Nam');

  store.deleteTransaction(store.getTransactions()[0].id);
  assert.equal(store.getTransactions().length, 9);

  store.resetToSampleData();
  assert.equal(store.getTransactions().length, 10);
});
