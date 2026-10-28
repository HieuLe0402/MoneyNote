/**
 * Danh mục mặc định cho khoản chi và khoản thu
 */
export const DEFAULT_CATEGORIES = {
  expense: [
    { id: 'an-uong', name: 'Ăn uống', icon: '🍜', color: '#F97316' },
    { id: 'di-lai', name: 'Đi lại', icon: '🚗', color: '#06B6D4' },
    { id: 'mua-sam', name: 'Mua sắm', icon: '🛍️', color: '#EC4899' },
    { id: 'hoc-tap', name: 'Học tập', icon: '📚', color: '#3B82F6' },
    { id: 'giai-tri', name: 'Giải trí', icon: '🎮', color: '#8B5CF6' },
    { id: 'hoa-don', name: 'Hóa đơn', icon: '⚡', color: '#EAB308' },
    { id: 'khac-chi', name: 'Khác', icon: '📦', color: '#6B7280' }
  ],
  income: [
    { id: 'luong', name: 'Lương', icon: '💵', color: '#0E7A55' },
    { id: 'hoc-bong', name: 'Học bổng', icon: '🎓', color: '#10B981' },
    { id: 'duoc-cho', name: 'Được cho', icon: '🎁', color: '#34D399' },
    { id: 'khac-thu', name: 'Khác', icon: '🪙', color: '#6EE7B7' }
  ]
};

/**
 * Hạn mức ngân sách mặc định mỗi tháng
 */
export const DEFAULT_MONTHLY_BUDGET = 10000000; // 10.000.000 đ

/**
 * 10 Giao dịch mẫu ban đầu khi ứng dụng khởi chạy lần đầu
 */
export const SAMPLE_TRANSACTIONS = [
  {
    id: 'tx_sample_1',
    type: 'income',
    amount: 15000000,
    category: 'Lương',
    date: '2026-10-05',
    note: 'Lương chuyển khoản tháng 10',
    createdAt: 1728086400000
  },
  {
    id: 'tx_sample_2',
    type: 'income',
    amount: 3500000,
    category: 'Học bổng',
    date: '2026-10-10',
    note: 'Học bổng sinh viên giỏi học kỳ 1',
    createdAt: 1728518400000
  },
  {
    id: 'tx_sample_3',
    type: 'expense',
    amount: 3200000,
    category: 'Hóa đơn',
    date: '2026-10-06',
    note: 'Tiền trọ, điện và nước sinh hoạt',
    createdAt: 1728172800000
  },
  {
    id: 'tx_sample_4',
    type: 'expense',
    amount: 650000,
    category: 'Ăn uống',
    date: '2026-10-12',
    note: 'Đi siêu thị mua thực phẩm tuần',
    createdAt: 1728691200000
  },
  {
    id: 'tx_sample_5',
    type: 'expense',
    amount: 90000,
    category: 'Đi lại',
    date: '2026-10-14',
    note: 'Đổ xăng xe máy',
    createdAt: 1728864000000
  },
  {
    id: 'tx_sample_6',
    type: 'expense',
    amount: 280000,
    category: 'Học tập',
    date: '2026-10-18',
    note: 'Mua sách lập trình & giáo trình',
    createdAt: 1729209600000
  },
  {
    id: 'tx_sample_7',
    type: 'expense',
    amount: 85000,
    category: 'Ăn uống',
    date: '2026-10-21',
    note: 'Cà phê gặp bạn bè',
    createdAt: 1729468800000
  },
  {
    id: 'tx_sample_8',
    type: 'expense',
    amount: 450000,
    category: 'Mua sắm',
    date: '2026-10-23',
    note: 'Mua áo khoác thu đông',
    createdAt: 1729641600000
  },
  {
    id: 'tx_sample_9',
    type: 'expense',
    amount: 180000,
    category: 'Giải trí',
    date: '2026-10-26',
    note: 'Xem phim rạp cuối tuần',
    createdAt: 1729900800000
  },
  {
    id: 'tx_sample_10',
    type: 'income',
    amount: 1000000,
    category: 'Được cho',
    date: '2026-10-27',
    note: 'Bố mẹ gửi thêm tiền sinh hoạt',
    createdAt: 1729987200000
  }
];
