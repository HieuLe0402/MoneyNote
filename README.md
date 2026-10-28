# 💰 MoneyNote - Ứng Dụng Quản Lý Thu Chi Cá Nhân

MoneyNote là ứng dụng web quản lý tài chính và thu chi cá nhân hiện đại, trực quan, dễ sử dụng. Ứng dụng giúp bạn theo dõi thu nhập, chi phí hàng tháng, quản lý ngân sách và phân tích cơ cấu chi tiêu với giao diện thân thiện, hiện đại.

---

## ✨ Tính Năng Nổi Bật

- **📊 Bảng điều khiển Tổng quan (Dashboard):**
  - **3 Thẻ Thống kê:** Hiển thị tức thì Tổng thu, Tổng chi và Số dư của tháng hiện tại với định dạng tiền tệ Việt Nam (VNĐ).
  - **Theo dõi Ngân sách tháng:** Thanh tiến trình màu cam đo lường tỉ lệ phần trăm đã chi tiêu / hạn mức kèm cảnh báo thời gian thực khi vượt hoặc chạm ngưỡng ngân sách.
  - **Bố cục 70% / 30% Thông minh:**
    - **70% Giao dịch gần đây:** Danh sách giao dịch mới nhất (Khoản thu màu xanh `#0E7A55`, Khoản chi màu đỏ `#B42318`), hỗ trợ chỉnh sửa và xóa an toàn có xác nhận.
    - **30% Cơ cấu chi theo danh mục:** Thống kê tổng chi và phần trăm từng hạng mục chi với thanh màu sắc nhận diện riêng biệt.
- **🔍 Tìm kiếm & Lọc Nhanh:**
  - Tìm kiếm theo ghi chú theo thời gian thực (real-time filtering).
  - Bộ lọc nhanh theo loại giao dịch (Tất cả / Thu / Chi) và theo từng danh mục cụ thể.
  - Bộ điều hướng xem chi tiêu theo từng tháng trong năm.
- **📥 Xuất Dữ Liệu CSV:**
  - Xuất báo cáo giao dịch ra file CSV có hỗ trợ **UTF-8 BOM (`\uFEFF`)**, mở trên Microsoft Excel không bị lỗi font tiếng Việt.
- **💾 Lưu Trữ & Dữ Liệu Mẫu:**
  - Lưu trữ dữ liệu an toàn trên trình duyệt người dùng qua `localStorage` (không mất khi reload trang).
  - Khởi tạo sẵn **10 giao dịch mẫu** trong tháng khi mở lần đầu giúp người dùng trải nghiệm ngay giao diện hoàn chỉnh.
  - Khôi phục dữ liệu mẫu hoặc xóa dữ liệu tùy chỉnh trong mục Cài đặt.

---

## 🎨 Hệ Thống Thiết Kế (Design System)

- **Font chữ:** `Be Vietnam Pro` (Google Fonts)
- **Màu chủ đạo (Primary):** `#1D4ED8`
- **Nền trang:** `#F4F6FA`
- **Nền thẻ (Card):** `#FFFFFF`, viền `#E5E7EB`, bo góc `16px`
- **Thẻ Số dư:** Nền xanh navy `#14213D`
- **Khoản thu / Khoản chi:** `#0E7A55` / `#B42318`
- **Cảnh báo ngân sách:** `#D97706` trên nền `#FEF3C7`

---

## 🚀 Cài Đặt & Chạy Ứng Dụng

Ứng dụng được xây dựng hoàn toàn bằng **HTML5, CSS3 và Vanilla JavaScript (ES6 Modules)** thuần, không phụ thuộc thư viện bên ngoài:

### Cách 1: Mở trực tiếp
Mở file `index.html` bằng trình duyệt web bất kỳ (Google Chrome, Microsoft Edge, Firefox, Brave...).

### Cách 2: Khởi chạy qua Node.js Local Server
```bash
# Chạy local server tại cổng 3000
node tests/server.js
```
Truy cập: [http://localhost:3000](http://localhost:3000)

### Chạy Kiểm Thử (Unit & Integration Tests)
```bash
node --test tests/*.test.js
```

---

## 📁 Cấu Trúc Dự Án

```
MoneyNote/
├── index.html                  # Khung giao diện chính và các modal dialogs
├── style.css                   # Design tokens, typography và CSS responsive
├── app.js                      # Bộ điều khiển trung tâm và xử lý sự kiện DOM
├── src/
│   ├── constants.js            # Danh mục thu/chi và 10 giao dịch mẫu ban đầu
│   ├── store.js                # Quản lý reactive state và đồng bộ localStorage
│   └── utils.js                # Các hàm tiện ích format tiền, ngày, validate, CSV
├── tests/                      # Bộ kiểm thử tự động (Unit & Integration)
│   ├── utils.test.js
│   ├── store.test.js
│   ├── integration.test.js
│   └── server.js               # Dev server tĩnh phục vụ kiểm thử
└── docs/superpowers/           # Tài liệu đặc tả kỹ thuật và kế hoạch phát triển
    ├── specs/2026-10-28-moneynote-design.md
    └── plans/2026-10-28-moneynote.md
```

---

## 📝 Giấy Phép (License)
Dự án được phân phối dưới giấy phép [MIT](LICENSE).
