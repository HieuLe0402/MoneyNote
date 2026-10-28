import { DEFAULT_CATEGORIES, DEFAULT_MONTHLY_BUDGET, SAMPLE_TRANSACTIONS } from './constants.js';
import { generateId } from './utils.js';

const STORAGE_KEY_USER = 'moneynote_user';
const STORAGE_KEY_TRANSACTIONS = 'moneynote_transactions';
const STORAGE_KEY_BUDGETS = 'moneynote_budgets';

export class Store {
  constructor() {
    this.user = { name: '' };
    this.transactions = [];
    this.budgets = {}; // { 'YYYY-MM': number }
    this.selectedMonth = this._getCurrentYearMonth();
    this.listeners = new Set();
  }

  _getCurrentYearMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Khởi tạo dữ liệu từ localStorage (hoặc nạp mẫu ban đầu nếu rỗng)
   */
  init() {
    try {
      // 1. Tải user
      const rawUser = localStorage.getItem(STORAGE_KEY_USER);
      if (rawUser) {
        this.user = JSON.parse(rawUser);
      } else {
        this.user = { name: '' };
      }

      // 2. Tải giao dịch
      const rawTx = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      if (rawTx) {
        this.transactions = JSON.parse(rawTx);
      } else {
        // Tự động nạp 10 giao dịch mẫu nếu chưa có dữ liệu
        this.transactions = JSON.parse(JSON.stringify(SAMPLE_TRANSACTIONS));
        this._saveTransactions();
      }

      // 3. Tải ngân sách
      const rawBudgets = localStorage.getItem(STORAGE_KEY_BUDGETS);
      if (rawBudgets) {
        this.budgets = JSON.parse(rawBudgets);
      } else {
        this.budgets = {
          [this.selectedMonth]: DEFAULT_MONTHLY_BUDGET
        };
        this._saveBudgets();
      }
    } catch (err) {
      console.error('Lỗi khi đọc dữ liệu từ localStorage:', err);
      this.transactions = JSON.parse(JSON.stringify(SAMPLE_TRANSACTIONS));
      this.budgets = { [this.selectedMonth]: DEFAULT_MONTHLY_BUDGET };
    }
  }

  _saveUser() {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.user));
    } catch (err) {
      console.error('Lỗi lưu user vào localStorage:', err);
    }
  }

  _saveTransactions() {
    try {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(this.transactions));
    } catch (err) {
      console.error('Lỗi lưu giao dịch vào localStorage:', err);
    }
  }

  _saveBudgets() {
    try {
      localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(this.budgets));
    } catch (err) {
      console.error('Lỗi lưu ngân sách vào localStorage:', err);
    }
  }

  _notify() {
    this.listeners.forEach(fn => {
      try {
        fn(this);
      } catch (err) {
        console.error('Lỗi trong subscriber listener:', err);
      }
    });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getUser() {
    return { ...this.user };
  }

  setUserName(name) {
    this.user.name = String(name || '').trim();
    this._saveUser();
    this._notify();
  }

  getSelectedMonth() {
    return this.selectedMonth;
  }

  setSelectedMonth(yearMonth) {
    if (yearMonth && /^\d{4}-\d{2}$/.test(yearMonth)) {
      this.selectedMonth = yearMonth;
      if (!this.budgets[yearMonth]) {
        this.budgets[yearMonth] = DEFAULT_MONTHLY_BUDGET;
        this._saveBudgets();
      }
      this._notify();
    }
  }

  getBudget(yearMonth = this.selectedMonth) {
    return this.budgets[yearMonth] ?? DEFAULT_MONTHLY_BUDGET;
  }

  setBudget(yearMonth, amount) {
    const num = Math.max(0, Number(amount) || 0);
    this.budgets[yearMonth] = num;
    this._saveBudgets();
    this._notify();
  }

  /**
   * Lấy danh sách giao dịch có lọc
   * @param {object} filter { month, type, category, query }
   * @returns {Array<object>}
   */
  getTransactions(filter = {}) {
    let list = [...this.transactions];

    // Lọc theo tháng
    if (filter.month) {
      list = list.filter(tx => tx.date && tx.date.startsWith(filter.month));
    }

    // Lọc theo loại (all, income, expense)
    if (filter.type && filter.type !== 'all') {
      list = list.filter(tx => tx.type === filter.type);
    }

    // Lọc theo danh mục
    if (filter.category && filter.category !== 'all') {
      list = list.filter(tx => tx.category === filter.category);
    }

    // Lọc theo từ khóa ghi chú
    if (filter.query) {
      const q = String(filter.query).trim().toLowerCase();
      list = list.filter(tx => String(tx.note || '').toLowerCase().includes(q));
    }

    // Sắp xếp ngày mới nhất lên đầu, nếu cùng ngày thì theo createdAt giảm dần
    return list.sort((a, b) => {
      const cmpDate = (b.date || '').localeCompare(a.date || '');
      if (cmpDate !== 0) return cmpDate;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }

  addTransaction(txData) {
    const item = {
      id: generateId(),
      type: txData.type,
      amount: Math.round(Number(txData.amount) || 0),
      category: txData.category,
      date: txData.date,
      note: String(txData.note || '').trim(),
      createdAt: Date.now()
    };

    this.transactions.unshift(item);
    this._saveTransactions();
    this._notify();
    return item;
  }

  updateTransaction(id, txData) {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) return null;

    const current = this.transactions[index];
    const updated = {
      ...current,
      ...(txData.type !== undefined ? { type: txData.type } : {}),
      ...(txData.amount !== undefined ? { amount: Math.round(Number(txData.amount) || 0) } : {}),
      ...(txData.category !== undefined ? { category: txData.category } : {}),
      ...(txData.date !== undefined ? { date: txData.date } : {}),
      ...(txData.note !== undefined ? { note: String(txData.note).trim() } : {})
    };

    this.transactions[index] = updated;
    this._saveTransactions();
    this._notify();
    return updated;
  }

  deleteTransaction(id) {
    const prevLength = this.transactions.length;
    this.transactions = this.transactions.filter(t => t.id !== id);
    if (this.transactions.length !== prevLength) {
      this._saveTransactions();
      this._notify();
      return true;
    }
    return false;
  }

  /**
   * Tính toán các chỉ số thống kê trong tháng đã chọn
   * @param {string} yearMonth
   */
  getCalculatedStats(yearMonth = this.selectedMonth) {
    const monthTx = this.transactions.filter(tx => tx.date && tx.date.startsWith(yearMonth));

    let totalIncome = 0;
    let countIncome = 0;
    let totalExpense = 0;
    let countExpense = 0;
    const expenseByCategory = {};

    monthTx.forEach(tx => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
        countIncome++;
      } else if (tx.type === 'expense') {
        totalExpense += tx.amount;
        countExpense++;
        expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
      }
    });

    const balance = totalIncome - totalExpense;
    const budget = this.getBudget(yearMonth);
    const budgetSpentPercent = budget > 0 ? Math.round((totalExpense / budget) * 100) : 0;
    const budgetRemaining = budget - totalExpense;
    const isOverBudget = totalExpense > budget;

    // Cơ cấu chi theo danh mục (30% bên phải)
    const categoryBreakdown = Object.entries(expenseByCategory)
      .map(([catName, amount]) => {
        const catConfig = DEFAULT_CATEGORIES.expense.find(c => c.name === catName) || {
          icon: '🏷️',
          color: '#6B7280'
        };
        const percent = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
        return {
          category: catName,
          icon: catConfig.icon,
          color: catConfig.color,
          amount,
          percent
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return {
      yearMonth,
      totalIncome,
      countIncome,
      totalExpense,
      countExpense,
      balance,
      budget,
      budgetSpentPercent,
      budgetRemaining,
      isOverBudget,
      categoryBreakdown
    };
  }

  resetToSampleData() {
    this.transactions = JSON.parse(JSON.stringify(SAMPLE_TRANSACTIONS));
    this.budgets[this.selectedMonth] = DEFAULT_MONTHLY_BUDGET;
    this._saveTransactions();
    this._saveBudgets();
    this._notify();
  }

  clearAllData() {
    this.transactions = [];
    this._saveTransactions();
    this._notify();
  }
}
