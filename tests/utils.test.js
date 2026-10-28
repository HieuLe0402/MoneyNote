import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCurrency,
  formatDate,
  formatMonthYear,
  validateTransaction,
  generateCSV
} from '../src/utils.js';
import { DEFAULT_CATEGORIES, SAMPLE_TRANSACTIONS } from '../src/constants.js';

test('DEFAULT_CATEGORIES contains expense and income lists with valid attributes', () => {
  assert.ok(Array.isArray(DEFAULT_CATEGORIES.expense));
  assert.ok(Array.isArray(DEFAULT_CATEGORIES.income));
  assert.equal(DEFAULT_CATEGORIES.expense.length, 7);
  assert.equal(DEFAULT_CATEGORIES.income.length, 4);

  const food = DEFAULT_CATEGORIES.expense.find(c => c.name === 'Ăn uống');
  assert.ok(food);
  assert.equal(food.color, '#F97316');
});

test('SAMPLE_TRANSACTIONS has 10 valid initial transactions', () => {
  assert.equal(SAMPLE_TRANSACTIONS.length, 10);
  SAMPLE_TRANSACTIONS.forEach(tx => {
    assert.ok(tx.id);
    assert.ok(['expense', 'income'].includes(tx.type));
    assert.ok(typeof tx.amount === 'number' && tx.amount > 0);
    assert.ok(tx.category);
    assert.ok(tx.date);
    assert.ok(tx.note);
  });
});

test('formatCurrency formats positive and zero VND values correctly', () => {
  assert.equal(formatCurrency(500000), '500.000 đ');
  assert.equal(formatCurrency(0), '0 đ');
  assert.equal(formatCurrency(15000000), '15.000.000 đ');
  assert.equal(formatCurrency(700000), '700.000 đ');
});

test('formatDate formats YYYY-MM-DD to DD/MM/YYYY', () => {
  assert.equal(formatDate('2026-10-28'), '28/10/2026');
  assert.equal(formatDate('2026-05-01'), '01/05/2026');
});

test('formatMonthYear formats YYYY-MM to Tháng MM/YYYY', () => {
  assert.equal(formatMonthYear('2026-10'), 'Tháng 10/2026');
  assert.equal(formatMonthYear('2027-01'), 'Tháng 01/2027');
});

test('validateTransaction rejects invalid amount and blank note', () => {
  const result1 = validateTransaction({
    amount: -100,
    note: '   ',
    category: 'Ăn uống',
    date: '2026-10-28',
    type: 'expense'
  });
  assert.equal(result1.isValid, false);
  assert.ok(result1.errors.amount);
  assert.ok(result1.errors.note);

  const resultZero = validateTransaction({
    amount: 0,
    note: 'Mua nước',
    category: 'Ăn uống',
    date: '2026-10-28',
    type: 'expense'
  });
  assert.equal(resultZero.isValid, false);
  assert.ok(resultZero.errors.amount);

  const resultValid = validateTransaction({
    amount: 150000,
    note: 'Ăn trưa',
    category: 'Ăn uống',
    date: '2026-10-28',
    type: 'expense'
  });
  assert.equal(resultValid.isValid, true);
  assert.deepEqual(resultValid.errors, {});
});

test('generateCSV outputs UTF-8 BOM and correct header rows', () => {
  const sample = [
    {
      id: 'tx_1',
      date: '2026-10-28',
      type: 'expense',
      category: 'Ăn uống',
      note: 'Phở bò Hà Nội',
      amount: 55000
    },
    {
      id: 'tx_2',
      date: '2026-10-28',
      type: 'income',
      category: 'Lương',
      note: 'Lương cứng tháng 10',
      amount: 15000000
    }
  ];

  const csv = generateCSV(sample);
  assert.ok(csv.startsWith('\uFEFF'), 'CSV must start with UTF-8 BOM');
  assert.ok(csv.includes('Mã GD,Ngày,Loại,Danh mục,Ghi chú,Số tiền (VNĐ)'));
  assert.ok(csv.includes('Chi,Ăn uống,"Phở bò Hà Nội",55000'));
  assert.ok(csv.includes('Thu,Lương,"Lương cứng tháng 10",15000000'));
});
