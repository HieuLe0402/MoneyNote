/**
 * Định dạng số tiền sang định dạng tiền Việt Nam (VNĐ)
 * Ví dụ: 500000 -> "500.000 đ", 0 -> "0 đ"
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  const num = typeof amount === 'number' && !isNaN(amount) ? Math.round(amount) : 0;
  return `${new Intl.NumberFormat('vi-VN').format(num)} đ`;
}

/**
 * Định dạng chuỗi ngày YYYY-MM-DD sang DD/MM/YYYY
 * @param {string} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  return dateStr;
}

/**
 * Định dạng YYYY-MM sang Tháng MM/YYYY
 * @param {string} yearMonthStr
 * @returns {string}
 */
export function formatMonthYear(yearMonthStr) {
  if (!yearMonthStr || typeof yearMonthStr !== 'string') return '';
  const parts = yearMonthStr.split('-');
  if (parts.length === 2) {
    const [year, month] = parts;
    return `Tháng ${month.padStart(2, '0')}/${year}`;
  }
  return yearMonthStr;
}

/**
 * Kiểm tra tính hợp lệ của dữ liệu giao dịch trước khi thêm/sửa
 * Không cho phép nhập dữ liệu sai
 * @param {object} data { amount, note, category, date, type }
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateTransaction(data) {
  const errors = {};

  // Kiểm tra số tiền
  const numAmount = Number(data?.amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    errors.amount = 'Số tiền phải lớn hơn 0 đ';
  }

  // Kiểm tra ghi chú
  const note = String(data?.note || '').trim();
  if (!note) {
    errors.note = 'Vui lòng nhập ghi chú giao dịch';
  } else if (note.length < 2) {
    errors.note = 'Ghi chú phải có ít nhất 2 ký tự';
  }

  // Kiểm tra danh mục
  const category = String(data?.category || '').trim();
  if (!category) {
    errors.category = 'Vui lòng chọn danh mục';
  }

  // Kiểm tra ngày
  const date = String(data?.date || '').trim();
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.date = 'Vui lòng chọn ngày hợp lệ';
  }

  // Kiểm tra loại giao dịch
  if (!['expense', 'income'].includes(data?.type)) {
    errors.type = 'Loại giao dịch không hợp lệ';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Tạo chuỗi CSV có UTF-8 BOM (\uFEFF) cho danh sách giao dịch
 * @param {Array<object>} transactions
 * @returns {string}
 */
export function generateCSV(transactions) {
  const headers = ['Mã GD', 'Ngày', 'Loại', 'Danh mục', 'Ghi chú', 'Số tiền (VNĐ)'];
  const rows = (transactions || []).map(tx => {
    const typeLabel = tx.type === 'income' ? 'Thu' : 'Chi';
    const escapedNote = `"${String(tx.note || '').replace(/"/g, '""')}"`;
    const escapedCategory = String(tx.category || '').replace(/"/g, '""');
    return [
      tx.id,
      tx.date,
      typeLabel,
      escapedCategory,
      escapedNote,
      tx.amount
    ].join(',');
  });

  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * Tạo ID ngẫu nhiên cho giao dịch mới
 * @returns {string}
 */
export function generateId() {
  return 'tx_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}
