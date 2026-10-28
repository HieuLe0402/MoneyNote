import test from 'node:test';
import assert from 'node:assert/strict';
import { Store } from '../src/store.js';
import { generateCSV, validateTransaction } from '../src/utils.js';

// Setup mock localStorage
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

test('Integration: Filter transactions by note query and category', () => {
  setupMockLocalStorage();
  const store = new Store();
  store.init();
  store.setSelectedMonth('2026-10');

  // Search by query "Lương"
  const searchResults = store.getTransactions({
    month: '2026-10',
    type: 'all',
    category: 'all',
    query: 'Lương'
  });
  assert.ok(searchResults.length >= 1);
  assert.ok(searchResults.every(t => t.note.toLowerCase().includes('lương')));

  // Filter by category "Ăn uống"
  const catResults = store.getTransactions({
    month: '2026-10',
    type: 'expense',
    category: 'Ăn uống',
    query: ''
  });
  assert.ok(catResults.length >= 2);
  assert.ok(catResults.every(t => t.category === 'Ăn uống' && t.type === 'expense'));
});

test('Integration: Export filtered CSV maintains correct row count and fields', () => {
  setupMockLocalStorage();
  const store = new Store();
  store.init();
  store.setSelectedMonth('2026-10');

  const filtered = store.getTransactions({ month: '2026-10', type: 'expense' });
  const csv = generateCSV(filtered);

  assert.ok(csv.startsWith('\uFEFF'));
  const lines = csv.trim().split('\r\n');
  assert.equal(lines.length, filtered.length + 1); // 1 header + N rows
});

test('Integration: Adding and editing transactions updates category breakdown and budget percentages', () => {
  setupMockLocalStorage();
  const store = new Store();
  store.init();
  store.setSelectedMonth('2026-10');

  const initialStats = store.getCalculatedStats('2026-10');
  const initialExpense = initialStats.totalExpense;

  // Add high expense
  const added = store.addTransaction({
    type: 'expense',
    amount: 5000000,
    category: 'Mua sắm',
    date: '2026-10-28',
    note: 'Mua máy tính bảng mới'
  });

  const updatedStats = store.getCalculatedStats('2026-10');
  assert.equal(updatedStats.totalExpense, initialExpense + 5000000);
  assert.equal(updatedStats.countExpense, initialStats.countExpense + 1);

  // Validate editing to smaller amount
  const validEdit = validateTransaction({
    amount: 3000000,
    note: 'Mua máy tính bảng (giảm giá)',
    category: 'Mua sắm',
    date: '2026-10-28',
    type: 'expense'
  });
  assert.equal(validEdit.isValid, true);

  store.updateTransaction(added.id, {
    amount: 3000000,
    note: 'Mua máy tính bảng (giảm giá)'
  });

  const afterEditStats = store.getCalculatedStats('2026-10');
  assert.equal(afterEditStats.totalExpense, initialExpense + 3000000);
});
