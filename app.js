import { DEFAULT_CATEGORIES } from './src/constants.js';
import {
  formatCurrency,
  formatDate,
  formatMonthYear,
  validateTransaction,
  generateCSV
} from './src/utils.js';
import { Store } from './src/store.js';

// Khởi tạo instance Store
const store = new Store();

// State quản lý filter cục bộ
let currentFilter = {
  type: 'all',
  category: 'all',
  query: ''
};

// ID giao dịch đang chọn xóa hoặc sửa
let deletingTxId = null;

// ==========================================================================
// Khởi chạy Ứng dụng
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  store.init();

  // Kiểm tra tên người dùng lần đầu
  checkFirstVisitUserName();

  // Đăng ký các sự kiện tương tác
  bindNavigationEvents();
  bindMonthNavigatorEvents();
  bindFilterEvents();
  bindModalEvents();
  bindSettingsEvents();

  // Đăng ký subscriber: khi store thay đổi -> render lại UI
  store.subscribe(() => {
    renderApp();
  });

  // Render lần đầu
  populateCategorySelects();
  renderApp();
});

// ==========================================================================
// 1. Kiểm tra Tên người dùng & Modal Chào mừng
// ==========================================================================
function checkFirstVisitUserName() {
  const user = store.getUser();
  const modalWelcome = document.getElementById('modalWelcome');
  const inputWelcomeName = document.getElementById('welcomeInputName');
  const errorWelcome = document.getElementById('welcomeErrorMsg');

  if (!user.name) {
    modalWelcome.classList.add('show');
  } else {
    document.getElementById('userNameDisplay').textContent = user.name;
    const settingsInput = document.getElementById('settingsInputName');
    if (settingsInput) settingsInput.value = user.name;
  }

  document.getElementById('btnWelcomeSubmit').addEventListener('click', () => {
    const enteredName = inputWelcomeName.value.trim();
    if (!enteredName) {
      errorWelcome.textContent = 'Vui lòng nhập tên của bạn để tiếp tục';
      inputWelcomeName.classList.add('error');
      return;
    }
    inputWelcomeName.classList.remove('error');
    errorWelcome.textContent = '';
    store.setUserName(enteredName);
    document.getElementById('userNameDisplay').textContent = enteredName;
    modalWelcome.classList.remove('show');
  });
}

// ==========================================================================
// 2. Chuyển đổi Trang (Sidebar SPA Navigation)
// ==========================================================================
function bindNavigationEvents() {
  const navButtons = document.querySelectorAll('.sidebar-nav .nav-item');
  const viewSections = document.querySelectorAll('.view-section');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');
      if (!targetView) return;

      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      viewSections.forEach(sec => {
        sec.classList.remove('active');
      });

      const activeSection = document.getElementById(
        targetView === 'overview' ? 'viewOverview' :
        targetView === 'transactions' ? 'viewTransactions' :
        targetView === 'analytics' ? 'viewAnalytics' :
        'viewSettings'
      );
      if (activeSection) {
        activeSection.classList.add('active');
        if (targetView === 'transactions') renderFullTransactionsView();
        if (targetView === 'analytics') renderAnalyticsView();
      }
    });
  });

  // Nút footer "Xem tất cả giao dịch" ở dashboard
  const btnViewAll = document.getElementById('btnViewAllTransactions');
  if (btnViewAll) {
    btnViewAll.addEventListener('click', () => {
      document.getElementById('navTransactions').click();
    });
  }
}

// ==========================================================================
// 3. Điều hướng Tháng (Month Navigator)
// ==========================================================================
function bindMonthNavigatorEvents() {
  const btnPrev = document.getElementById('btnPrevMonth');
  const btnNext = document.getElementById('btnNextMonth');

  btnPrev.addEventListener('click', () => {
    navigateMonth(-1);
  });

  btnNext.addEventListener('click', () => {
    navigateMonth(1);
  });
}

function navigateMonth(direction) {
  const current = store.getSelectedMonth(); // YYYY-MM
  const [yearStr, monthStr] = current.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);

  month += direction;
  if (month < 1) {
    month = 12;
    year -= 1;
  } else if (month > 12) {
    month = 1;
    year += 1;
  }

  const newMonthStr = `${year}-${String(month).padStart(2, '0')}`;
  store.setSelectedMonth(newMonthStr);
}

// ==========================================================================
// 4. Bộ lọc Giao dịch (Tìm kiếm, Tabs loại, Dropdown danh mục)
// ==========================================================================
function bindFilterEvents() {
  // Tìm kiếm theo ghi chú thời gian thực
  const inputSearch = document.getElementById('inputSearchNote');
  inputSearch.addEventListener('input', (e) => {
    currentFilter.query = e.target.value.trim();
    renderRecentTransactions();
  });

  // Tabs: Tất cả / Thu / Chi
  const filterTabs = document.querySelectorAll('.type-filter-group .filter-tab-btn');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter.type = tab.getAttribute('data-type') || 'all';
      renderRecentTransactions();
    });
  });

  // Dropdown Danh mục
  const selectCat = document.getElementById('filterCategorySelect');
  selectCat.addEventListener('change', (e) => {
    currentFilter.category = e.target.value;
    renderRecentTransactions();
  });

  // Xuất CSV tại Dashboard
  document.getElementById('btnExportCSV').addEventListener('click', () => {
    exportCurrentTransactionsToCSV();
  });

  // Xuất CSV tại Full Transactions view
  const btnExportFull = document.getElementById('btnExportCSVFull');
  if (btnExportFull) {
    btnExportFull.addEventListener('click', () => {
      exportCurrentTransactionsToCSV();
    });
  }
}

function exportCurrentTransactionsToCSV() {
  const selectedMonth = store.getSelectedMonth();
  const transactions = store.getTransactions({
    month: selectedMonth,
    type: currentFilter.type,
    category: currentFilter.category,
    query: currentFilter.query
  });

  if (!transactions.length) {
    alert('Không có giao dịch nào trong danh sách lọc để xuất CSV.');
    return;
  }

  const csvContent = generateCSV(transactions);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `MoneyNote_GiaoDich_${selectedMonth}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==========================================================================
// 5. Render Giao diện Tổng thể
// ==========================================================================
function renderApp() {
  const selectedMonth = store.getSelectedMonth();
  const user = store.getUser();

  // Hiển thị tháng và tên
  document.getElementById('currentMonthLabel').textContent = formatMonthYear(selectedMonth);
  if (user.name) {
    document.getElementById('userNameDisplay').textContent = user.name;
  }

  // Thống kê tổng hợp
  const stats = store.getCalculatedStats(selectedMonth);

  // 1. 3 Thẻ Tổng quan
  document.getElementById('valTotalIncome').textContent = formatCurrency(stats.totalIncome);
  document.getElementById('valCountIncome').textContent = `${stats.countIncome} khoản thu trong tháng`;

  document.getElementById('valTotalExpense').textContent = formatCurrency(stats.totalExpense);
  document.getElementById('valCountExpense').textContent = `${stats.countExpense} khoản chi trong tháng`;

  document.getElementById('valBalance').textContent = formatCurrency(stats.balance);

  // 2. Thẻ Ngân sách
  document.getElementById('budgetRatioText').innerHTML =
    `Đã chi: <strong>${formatCurrency(stats.totalExpense)} / ${formatCurrency(stats.budget)}</strong>`;

  const progressFill = document.getElementById('budgetProgressFill');
  const alertBox = document.getElementById('budgetAlertBox');
  const alertText = document.getElementById('budgetAlertText');

  const displayPercent = Math.min(stats.budgetSpentPercent, 100);
  progressFill.style.width = `${displayPercent}%`;

  if (stats.isOverBudget) {
    progressFill.classList.add('over-budget');
    alertBox.classList.add('danger');
    const overAmount = stats.totalExpense - stats.budget;
    alertText.textContent = `Bạn đã vượt ngân sách ${stats.budgetSpentPercent}%! Vượt hạn mức ${formatCurrency(overAmount)}. Hãy thắt chặt chi tiêu!`;
  } else if (stats.budgetSpentPercent >= 80) {
    progressFill.classList.remove('over-budget');
    alertBox.classList.remove('danger');
    alertText.textContent = `Bạn đã dùng ${stats.budgetSpentPercent}% ngân sách. Còn lại ${formatCurrency(stats.budgetRemaining)}.`;
  } else {
    progressFill.classList.remove('over-budget');
    alertBox.classList.remove('danger');
    alertText.textContent = `Bạn đã dùng ${stats.budgetSpentPercent}% ngân sách. Chi tiêu đang ở mức an toàn. Còn lại ${formatCurrency(stats.budgetRemaining)}.`;
  }

  // 3. Danh sách Giao dịch gần đây (70%)
  renderRecentTransactions();

  // 4. Chi theo Danh mục (30%)
  renderCategoryBreakdown(stats);
}

// Render danh sách giao dịch gần đây (70%)
function renderRecentTransactions() {
  const selectedMonth = store.getSelectedMonth();
  const txList = store.getTransactions({
    month: selectedMonth,
    type: currentFilter.type,
    category: currentFilter.category,
    query: currentFilter.query
  });

  const container = document.getElementById('recentTxListBody');
  const btnViewAll = document.getElementById('btnViewAllTransactions');

  if (!txList.length) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Chưa có giao dịch nào trong tháng này phù hợp với bộ lọc.</p>
      </div>
    `;
    if (btnViewAll) btnViewAll.style.display = 'none';
    return;
  }

  // Ở dashboard hiển thị tối đa 8 giao dịch gần nhất
  const displayItems = txList.slice(0, 8);
  if (btnViewAll) {
    btnViewAll.style.display = 'inline-block';
    btnViewAll.textContent = `Xem tất cả ${txList.length} giao dịch`;
  }

  container.innerHTML = displayItems.map(tx => renderTransactionRowHtml(tx)).join('');
  bindTxActionButtons(container);
}

function renderTransactionRowHtml(tx) {
  const isIncome = tx.type === 'income';
  const prefix = isIncome ? '+' : '-';
  const amountClass = isIncome ? 'income' : 'expense';
  const badgeClass = isIncome ? 'category-badge income' : 'category-badge';

  const catObj = isIncome
    ? DEFAULT_CATEGORIES.income.find(c => c.name === tx.category)
    : DEFAULT_CATEGORIES.expense.find(c => c.name === tx.category);
  const icon = catObj?.icon || '🏷️';

  return `
    <div class="tx-item-row" data-id="${tx.id}">
      <div class="tx-date">${formatDate(tx.date)}</div>
      <div>
        <span class="${badgeClass}">${icon} ${escapeHtml(tx.category)}</span>
      </div>
      <div class="tx-note" title="${escapeHtml(tx.note)}">${escapeHtml(tx.note)}</div>
      <div class="tx-amount ${amountClass}">${prefix} ${formatCurrency(tx.amount)}</div>
      <div class="tx-actions">
        <button class="action-btn edit-tx-btn" title="Chỉnh sửa giao dịch" aria-label="Sửa" data-id="${tx.id}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </button>
        <button class="action-btn delete delete-tx-btn" title="Xóa giao dịch" aria-label="Xóa" data-id="${tx.id}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

function bindTxActionButtons(container) {
  container.querySelectorAll('.edit-tx-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openEditTransactionModal(id);
    });
  });

  container.querySelectorAll('.delete-tx-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openDeleteConfirmModal(id);
    });
  });
}

// Render Chi theo danh mục (30%)
function renderCategoryBreakdown(stats) {
  document.getElementById('catTotalExpenseSummary').textContent = formatCurrency(stats.totalExpense);
  const container = document.getElementById('categoryBreakdownContainer');

  if (!stats.categoryBreakdown.length) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 20px 0;">
        <p>Chưa có khoản chi nào trong tháng.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = stats.categoryBreakdown.map(item => `
    <div class="category-item">
      <div class="cat-item-top">
        <span class="cat-name-icon">${item.icon} ${escapeHtml(item.category)}</span>
        <span class="cat-amount-percent">
          ${formatCurrency(item.amount)}
          <span class="cat-percent-tag">(${item.percent}%)</span>
        </span>
      </div>
      <div class="cat-progress-track">
        <div class="cat-progress-fill" style="width: ${item.percent}%; background-color: ${item.color};"></div>
      </div>
    </div>
  `).join('');
}

// ==========================================================================
// 6. Quản lý Modal Thêm / Chỉnh Sửa Giao Dịch
// ==========================================================================
let currentModalType = 'expense'; // 'expense' hoặc 'income'

function bindModalEvents() {
  const modalTx = document.getElementById('modalTransaction');
  const btnOpenAdd = document.getElementById('btnOpenAddModal');
  const btnCloseTx = document.getElementById('btnCloseTxModal');
  const btnCancelTx = document.getElementById('btnCancelTxModal');
  const btnSaveTx = document.getElementById('btnSaveTransaction');

  const btnToggleExpense = document.getElementById('btnToggleExpense');
  const btnToggleIncome = document.getElementById('btnToggleIncome');

  // Mở modal thêm
  btnOpenAdd.addEventListener('click', () => {
    openAddTransactionModal();
  });

  btnCloseTx.addEventListener('click', () => closeModal(modalTx));
  btnCancelTx.addEventListener('click', () => closeModal(modalTx));

  // Chuyển loại Thu / Chi
  btnToggleExpense.addEventListener('click', () => {
    setModalTxType('expense');
  });

  btnToggleIncome.addEventListener('click', () => {
    setModalTxType('income');
  });

  // Lưu giao dịch
  btnSaveTx.addEventListener('click', () => {
    handleSaveTransaction();
  });

  // Modal Ngân sách
  const modalBudget = document.getElementById('modalBudget');
  const btnOpenBudget = document.getElementById('btnOpenBudgetModal');
  const btnCloseBudget = document.getElementById('btnCloseBudgetModal');
  const btnCancelBudget = document.getElementById('btnCancelBudgetModal');
  const btnSaveBudget = document.getElementById('btnSaveBudget');

  btnOpenBudget.addEventListener('click', () => {
    const curMonth = store.getSelectedMonth();
    document.getElementById('budgetModalMonthName').textContent = formatMonthYear(curMonth);
    document.getElementById('inputBudgetLimit').value = store.getBudget(curMonth);
    document.getElementById('errorBudgetLimit').textContent = '';
    modalBudget.classList.add('show');
  });

  btnCloseBudget.addEventListener('click', () => closeModal(modalBudget));
  btnCancelBudget.addEventListener('click', () => closeModal(modalBudget));

  btnSaveBudget.addEventListener('click', () => {
    const amount = Number(document.getElementById('inputBudgetLimit').value);
    if (isNaN(amount) || amount <= 0) {
      document.getElementById('errorBudgetLimit').textContent = 'Hạn mức phải là số lớn hơn 0 đ';
      return;
    }
    store.setBudget(store.getSelectedMonth(), amount);
    closeModal(modalBudget);
  });

  // Modal Xóa
  const modalDelete = document.getElementById('modalDelete');
  const btnCloseDelete = document.getElementById('btnCloseDeleteModal');
  const btnCancelDelete = document.getElementById('btnCancelDelete');
  const btnConfirmDelete = document.getElementById('btnConfirmDelete');

  btnCloseDelete.addEventListener('click', () => closeModal(modalDelete));
  btnCancelDelete.addEventListener('click', () => closeModal(modalDelete));

  btnConfirmDelete.addEventListener('click', () => {
    if (deletingTxId) {
      store.deleteTransaction(deletingTxId);
      deletingTxId = null;
    }
    closeModal(modalDelete);
  });
}

function closeModal(modalEl) {
  modalEl.classList.remove('show');
}

function setModalTxType(type, selectedCategory = '') {
  currentModalType = type;
  const btnExpense = document.getElementById('btnToggleExpense');
  const btnIncome = document.getElementById('btnToggleIncome');
  const selectCat = document.getElementById('selectTxCategory');

  if (type === 'expense') {
    btnExpense.classList.add('active');
    btnIncome.classList.remove('active');
    selectCat.innerHTML = DEFAULT_CATEGORIES.expense.map(c => `
      <option value="${c.name}">${c.icon} ${c.name}</option>
    `).join('');
  } else {
    btnIncome.classList.add('active');
    btnExpense.classList.remove('active');
    selectCat.innerHTML = DEFAULT_CATEGORIES.income.map(c => `
      <option value="${c.name}">${c.icon} ${c.name}</option>
    `).join('');
  }

  if (selectedCategory) {
    selectCat.value = selectedCategory;
  }
}

function openAddTransactionModal() {
  document.getElementById('modalTxTitle').textContent = 'Thêm giao dịch mới';
  document.getElementById('txEditId').value = '';
  document.getElementById('inputTxAmount').value = '';
  document.getElementById('inputTxNote').value = '';
  clearTxErrors();

  // Mặc định ngày hôm nay (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('inputTxDate').value = today;

  setModalTxType('expense');
  document.getElementById('modalTransaction').classList.add('show');
}

function openEditTransactionModal(id) {
  const tx = store.getTransactions().find(t => t.id === id);
  if (!tx) return;

  document.getElementById('modalTxTitle').textContent = 'Chỉnh sửa giao dịch';
  document.getElementById('txEditId').value = tx.id;
  document.getElementById('inputTxAmount').value = tx.amount;
  document.getElementById('inputTxDate').value = tx.date;
  document.getElementById('inputTxNote').value = tx.note;
  clearTxErrors();

  setModalTxType(tx.type, tx.category);
  document.getElementById('modalTransaction').classList.add('show');
}

function openDeleteConfirmModal(id) {
  const tx = store.getTransactions().find(t => t.id === id);
  if (!tx) return;

  deletingTxId = id;
  const promptEl = document.getElementById('deleteConfirmPrompt');
  promptEl.innerHTML = `
    Bạn có chắc chắn muốn xóa giao dịch <strong>"${escapeHtml(tx.note)}"</strong> 
    (số tiền: <strong>${formatCurrency(tx.amount)}</strong>, ngày: <strong>${formatDate(tx.date)}</strong>) không?
    <br><br>Hành động này sẽ không thể hoàn tác.
  `;
  document.getElementById('modalDelete').classList.add('show');
}

function clearTxErrors() {
  ['Amount', 'Category', 'Date', 'Note'].forEach(field => {
    const errEl = document.getElementById(`errorTx${field}`);
    const inputEl = document.getElementById(`inputTx${field}`) || document.getElementById(`selectTx${field}`);
    if (errEl) errEl.textContent = '';
    if (inputEl) inputEl.classList.remove('error');
  });
}

function handleSaveTransaction() {
  clearTxErrors();

  const editId = document.getElementById('txEditId').value;
  const amountVal = document.getElementById('inputTxAmount').value;
  const categoryVal = document.getElementById('selectTxCategory').value;
  const dateVal = document.getElementById('inputTxDate').value;
  const noteVal = document.getElementById('inputTxNote').value;

  const data = {
    amount: amountVal,
    category: categoryVal,
    date: dateVal,
    note: noteVal,
    type: currentModalType
  };

  const validation = validateTransaction(data);
  if (!validation.isValid) {
    if (validation.errors.amount) {
      document.getElementById('errorTxAmount').textContent = validation.errors.amount;
      document.getElementById('inputTxAmount').classList.add('error');
    }
    if (validation.errors.category) {
      document.getElementById('errorTxCategory').textContent = validation.errors.category;
      document.getElementById('selectTxCategory').classList.add('error');
    }
    if (validation.errors.date) {
      document.getElementById('errorTxDate').textContent = validation.errors.date;
      document.getElementById('inputTxDate').classList.add('error');
    }
    if (validation.errors.note) {
      document.getElementById('errorTxNote').textContent = validation.errors.note;
      document.getElementById('inputTxNote').classList.add('error');
    }
    return;
  }

  if (editId) {
    store.updateTransaction(editId, data);
  } else {
    store.addTransaction(data);
  }

  // Tự động chuyển tháng xem sang tháng của giao dịch vừa thêm để người dùng nhìn thấy ngay
  const txYearMonth = dateVal.substring(0, 7);
  if (store.getSelectedMonth() !== txYearMonth) {
    store.setSelectedMonth(txYearMonth);
  }

  closeModal(document.getElementById('modalTransaction'));
}

// ==========================================================================
// 7. Cài Đặt (Settings View)
// ==========================================================================
function bindSettingsEvents() {
  document.getElementById('btnSaveUserName').addEventListener('click', () => {
    const newName = document.getElementById('settingsInputName').value.trim();
    if (!newName) {
      alert('Vui lòng nhập tên người dùng');
      return;
    }
    store.setUserName(newName);
    alert('Đã cập nhật tên người dùng thành công!');
  });

  document.getElementById('btnRestoreSampleData').addEventListener('click', () => {
    if (confirm('Khôi phục lại 10 giao dịch mẫu ban đầu của MoneyNote?')) {
      store.resetToSampleData();
      alert('Đã khôi phục dữ liệu mẫu thành công!');
    }
  });

  document.getElementById('btnClearAllData').addEventListener('click', () => {
    if (confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ giao dịch trên trình duyệt này không?')) {
      store.clearAllData();
      alert('Đã xóa toàn bộ dữ liệu!');
    }
  });
}

// ==========================================================================
// 8. Quản Lý Giao Dịch Toàn Bộ (View 2) & Thống Kê (View 3)
// ==========================================================================
function renderFullTransactionsView() {
  const container = document.getElementById('fullTxListBody');
  const allTx = store.getTransactions();

  if (!allTx.length) {
    container.innerHTML = `<div class="empty-state"><p>Chưa có giao dịch nào.</p></div>`;
    return;
  }

  container.innerHTML = allTx.map(tx => renderTransactionRowHtml(tx)).join('');
  bindTxActionButtons(container);
}

function renderAnalyticsView() {
  const selectedMonth = store.getSelectedMonth();
  const stats = store.getCalculatedStats(selectedMonth);

  const containerVs = document.getElementById('analyticsIncomeVsExpense');
  const totalBoth = stats.totalIncome + stats.totalExpense;
  const incomePercent = totalBoth > 0 ? Math.round((stats.totalIncome / totalBoth) * 100) : 50;
  const expensePercent = totalBoth > 0 ? (100 - incomePercent) : 50;

  containerVs.innerHTML = `
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; font-weight: 600;">
      <span style="color: var(--color-income);">Thu: ${formatCurrency(stats.totalIncome)} (${incomePercent}%)</span>
      <span style="color: var(--color-expense);">Chi: ${formatCurrency(stats.totalExpense)} (${expensePercent}%)</span>
    </div>
    <div style="width: 100%; height: 20px; border-radius: 9999px; overflow: hidden; display: flex; background: #E2E8F0;">
      <div style="width: ${incomePercent}%; background: var(--color-income); height: 100%;"></div>
      <div style="width: ${expensePercent}%; background: var(--color-expense); height: 100%;"></div>
    </div>
    <div style="margin-top: 24px; padding: 16px; background: #F8FAFC; border-radius: 12px; font-size: 14px;">
      <p style="margin-bottom: 6px;"><strong>Số dư tháng này:</strong> <span style="font-size: 16px; color: ${stats.balance >= 0 ? 'var(--color-income)' : 'var(--color-expense)'}">${formatCurrency(stats.balance)}</span></p>
      <p style="color: var(--color-text-sub);">Hạn mức chi tiêu đặt ra: <strong>${formatCurrency(stats.budget)}</strong> (${stats.budgetSpentPercent}% đã dùng)</p>
    </div>
  `;

  const containerCat = document.getElementById('analyticsCategoryList');
  if (!stats.categoryBreakdown.length) {
    containerCat.innerHTML = `<p class="empty-state">Chưa có chi tiêu trong tháng này.</p>`;
    return;
  }

  containerCat.innerHTML = stats.categoryBreakdown.map(item => `
    <div class="category-item">
      <div class="cat-item-top">
        <span class="cat-name-icon">${item.icon} ${escapeHtml(item.category)}</span>
        <span class="cat-amount-percent">
          ${formatCurrency(item.amount)}
          <span class="cat-percent-tag">(${item.percent}%)</span>
        </span>
      </div>
      <div class="cat-progress-track">
        <div class="cat-progress-fill" style="width: ${item.percent}%; background-color: ${item.color};"></div>
      </div>
    </div>
  `).join('');
}

// Điền danh mục vào dropdown bộ lọc
function populateCategorySelects() {
  const select = document.getElementById('filterCategorySelect');
  const allCats = [...DEFAULT_CATEGORIES.expense, ...DEFAULT_CATEGORIES.income];
  const uniqueNames = Array.from(new Set(allCats.map(c => c.name)));

  select.innerHTML = `<option value="all">Tất cả danh mục</option>` +
    uniqueNames.map(name => `<option value="${name}">${name}</option>`).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
