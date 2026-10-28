# Đặc tả Kỹ thuật Thiết kế Ứng dụng Quản lý Thu Chi MoneyNote

- **Ngày tạo:** 2026-10-28
- **Dự án:** MoneyNote - Ứng dụng Web Quản lý Thu Chi Cá nhân
- **Trạng thái:** Đã thống nhất thiết kế với người dùng (Approved)

---

## 1. Giới thiệu & Mục tiêu
MoneyNote là ứng dụng web quản lý tài chính và thu chi cá nhân hiện đại, trực quan, dễ sử dụng. Ứng dụng cung cấp bảng điều khiển (Dashboard) thông minh giúp người dùng nắm bắt tức thì tình hình tài chính trong tháng (Tổng thu, Tổng chi, Số dư), theo dõi hạn mức ngân sách với cảnh báo thời gian thực, quản lý và tìm kiếm các khoản giao dịch, phân tích cơ cấu chi tiêu theo danh mục và xuất báo cáo CSV.

---

## 2. Hệ thống Thiết kế & Design Tokens

### 2.1. Typography
- **Font gia đình:** `Be Vietnam Pro` (tải từ Google Fonts, hỗ trợ đầy đủ tiếng Việt).
- **Cỡ chữ chuẩn hóa:**
  - `28px`: Số dư lớn, tiêu đề nổi bật trong Thẻ số dư.
  - `26px`: Tiêu đề số tiền tổng thu, tổng chi trên các thẻ tóm tắt.
  - `17px`: Tiêu đề thẻ widget, tiêu đề bảng, số tiền giao dịch trong danh sách.
  - `14px`: Nội dung văn bản chính, nhãn form, ghi chú giao dịch.
  - `13px`: Văn bản phụ, ngày tháng, badge danh mục, thông số phụ.

### 2.2. Bảng Màu (Color Palette)
- **Màu chủ đạo (Primary):** `#1D4ED8` (Nút bấm chính, liên kết, tab đang chọn, viền active).
- **Màu nền trang (Background):** `#F4F6FA`.
- **Màu nền thẻ (Card Background):** `#FFFFFF`, viền `#E5E7EB`, bo góc `16px`, bóng đổ nhẹ `0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)`.
- **Thẻ Số dư (Balance Card):** Nền `#14213D`, chữ trắng `#FFFFFF` và text phụ `#94A3B8`.
- **Màu chữ chính / Chữ phụ:** `#111827` / `#4B5563`.
- **Khoản thu (Income):** `#0E7A55` (Kèm tiền tố `+`).
- **Khoản chi (Expense):** `#B42318` (Kèm tiền tố `-`).
- **Cảnh báo ngân sách (Budget Warning):** Chữ và icon `#D97706` trên nền `#FEF3C7` (bo góc `10px`).
- **Màu danh mục chi tiêu (Category Progress Colors):**
  - Ăn uống: `#F97316` (Cam san hô)
  - Đi lại: `#06B6D4` (Xanh cyan)
  - Mua sắm: `#EC4899` (Hồng phấn)
  - Học tập: `#3B82F6` (Xanh dương)
  - Giải trí: `#8B5CF6` (Tím nhạt)
  - Hóa đơn: `#EAB308` (Vàng hổ phách)
  - Khác: `#6B7280` (Xám bạc)

### 2.3. Quy chuẩn Bo góc (Border Radius)
- Thẻ (Card): `16px`.
- Nút bấm (Button): `10px` – `12px`.
- Ô nhập liệu (Input field): `10px`.
- Hộp cảnh báo (Alert banner): `10px`.

---

## 3. Kiến trúc Giao diện & Bố cục (Layout Architecture)

### 3.1. Thanh điều hướng bên trái (Sidebar - Cố định 260px)
- **Header:** Logo ví tiền sắc nét kèm tên ứng dụng thương hiệu **"MoneyNote"**.
- **Danh sách Menu:**
  1. 📊 **Tổng quan**: Trang tổng quan thu chi, ngân sách, giao dịch gần đây và cơ cấu chi.
  2. 💳 **Giao dịch**: Màn hình quản lý toàn bộ giao dịch với bộ lọc nâng cao, tìm kiếm và phân trang.
  3. 📈 **Thống kê**: Màn hình trực quan hóa cơ cấu thu chi, phân tích chi tiêu theo từng hạng mục.
  4. ⚙️ **Cài đặt**: Quản lý thông tin người dùng (đổi tên), đặt hạn mức chi tiêu mặc định, tùy chọn dữ liệu mẫu.
- **Tương tác:** Mỗi mục có icon tương ứng, hiệu ứng hover mượt mà và thanh trạng thái chỉ thị tab đang hoạt động.

### 3.2. Khu vực Nội dung chính (Main Content Area)

#### A. Thanh trên cùng (Top Bar)
- **Góc trên bên trái:**
  - Lời chào cá nhân hóa: `"Xin chào, [Tên người dùng]"`.
  - Bộ chọn thời gian: Điều hướng tháng (Nút tháng trước, tháng sau và hiển thị tháng/năm hiện tại, ví dụ: `Tháng 10/2026`).
- **Góc trên bên phải:**
  - Ô tìm kiếm: Icon kính lúp + placeholder `"Tìm theo ghi chú"`. Lọc danh sách giao dịch thời gian thực (real-time filtering).
  - Nút thêm mới: Nút **"+ Thêm giao dịch"** màu xanh `#1D4ED8` bo góc `10px-12px`.

#### B. 3 Thẻ Tóm tắt Tài chính (Summary Cards - 3 Cột)
- **Ô 1 - Tổng thu:** Icon mũi tên thu vào, số tiền định dạng VNĐ (màu xanh `#0E7A55`), số lượng khoản thu trong tháng (ví dụ: `4 khoản thu`).
- **Ô 2 - Tổng chi:** Icon mũi tên chi ra, số tiền định dạng VNĐ (màu đỏ `#B42318`), số lượng khoản chi trong tháng (ví dụ: `8 khoản chi`).
- **Ô 3 - Số dư:** Nền xanh navy `#14213D`, hiển thị số dư còn lại (`Tổng thu - Tổng chi`) với cỡ chữ `28px` màu trắng nổi bật.

#### C. Thẻ Ngân sách Tháng (Monthly Budget - Trải rộng 100%)
- **Hàng tiêu đề:**
  - Tiêu đề `"Ngân sách tháng"`.
  - Dòng chỉ số: `"Đã chi: [Số tiền đã chi] / [Hạn mức tháng]"` (ví dụ: `500.000 đ / 700.000 đ`).
  - Nút **"Đặt hạn mức"** nằm ở góc trên bên phải thẻ.
- **Thanh tiến trình (Progress Bar):**
  - Thanh đo tỉ lệ % đã chi so với hạn mức (màu cam nổi bật, chuyển sang đỏ đậm khi vượt quá 100%).
- **Hộp cảnh báo (Alert Box):**
  - Nền `#FEF3C7`, chữ và biểu tượng `#D97706`.
  - Nội dung động: `"Bạn đã dùng 87% ngân sách. Còn lại 200.000 đ"` (hoặc cảnh báo vượt ngân sách nếu quá hạn mức).

#### D. Khu vực Giao dịch Gần đây & Chi theo Danh mục (Chia cột 70% / 30%)
- **Cột 70% - Giao dịch Gần đây:**
  - **Header:** Dòng chữ `"Giao dịch gần đây"` bên trái và nút **"Xuất CSV"** bên phải.
  - **Thanh lọc:**
    - Nhóm nút chuyển tab nhanh: *"Tất cả"*, *"Thu"*, *"Chi"*.
    - Dropdown chọn danh mục: *"Tất cả danh mục"*.
  - **Bảng danh sách:**
    - Cột hiển thị: **NGÀY**, **DANH MỤC** (badge có màu và icon), **GHI CHÚ**, **SỐ TIỀN** (Khoản thu màu xanh `#0E7A55` kèm dấu `+`, Khoản chi màu đỏ `#B42318` kèm dấu `-`).
    - Nút thao tác: Icon **Sửa** (bút chì) và icon **Xóa** (thùng rác) hiển thị trực quan ở từng dòng.
  - **Footer:** Nút mở rộng xem thêm: `"Xem tất cả [N] giao dịch"`.
- **Cột 30% - Chi theo Danh mục:**
  - **Header:** Tiêu đề `"Chi theo danh mục"`, hiển thị dòng tổng chi tiêu bên dưới.
  - **Danh sách hạng mục:**
    - Đầu dòng: Tên danh mục (kèm icon).
    - Cuối dòng: Số tiền chi và số phần trăm trên tổng chi.
    - Dưới mỗi hạng mục: Thanh tiến trình hiển thị phần trăm với màu sắc riêng biệt cho từng loại chi tiêu.

---

## 4. Danh mục & Dữ liệu Mẫu (Data & Categories)

### 4.1. Danh mục Mặc định
- **Khoản chi (Expense):**
  1. `Ăn uống` (Icon: 🍜)
  2. `Đi lại` (Icon: 🚗)
  3. `Mua sắm` (Icon: 🛍️)
  4. `Học tập` (Icon: 📚)
  5. `Giải trí` (Icon: 🎮)
  6. `Hóa đơn` (Icon: ⚡)
  7. `Khác` (Icon: 📦)
- **Khoản thu (Income):**
  1. `Lương` (Icon: 💵)
  2. `Học bổng` (Icon: 🎓)
  3. `Được cho` (Icon: 🎁)
  4. `Khác` (Icon: 🪙)

### 4.2. Dữ liệu Mẫu Ban đầu (10 Giao dịch)
Khởi tạo tự động khi người dùng mở ứng dụng lần đầu:
1. Thu: Lương tháng - 15.000.000 đ (Lương)
2. Thu: Học bổng kỳ 1 - 3.500.000 đ (Học bổng)
3. Chi: Tiền trọ và điện nước - 3.200.000 đ (Hóa đơn)
4. Chi: Đi siêu thị thực phẩm - 650.000 đ (Ăn uống)
5. Chi: Đổ xăng xe máy - 90.000 đ (Đi lại)
6. Chi: Mua sách lập trình - 280.000 đ (Học tập)
7. Chi: Cà phê gặp bạn bè - 85.000 đ (Ăn uống)
8. Chi: Mua áo khoác thu đông - 450.000 đ (Mua sắm)
9. Chi: Xem phim rạp cuối tuần - 180.000 đ (Giải trí)
10. Thu: Bố mẹ gửi thêm - 1.000.000 đ (Được cho)

---

## 5. Các Modal & Luồng Tương tác (Modals & Interactive Flows)

### 5.1. Modal Hỏi tên người dùng (Lần đầu truy cập)
- Kiểm tra `localStorage.getItem('moneynote_user')`. Nếu rỗng, hiển thị Modal chào mừng.
- Input nhập tên với validation bắt buộc. Sau khi lưu, cập nhật dòng chào `"Xin chào, [Tên]"`.

### 5.2. Modal Thêm / Chỉnh sửa Giao dịch
- Toggle loại giao dịch: **Chi tiền** / **Thu tiền** (tự động cập nhật danh sách danh mục tương ứng).
- Các trường:
  - **Số tiền:** Định dạng số, bắt buộc > 0.
  - **Danh mục:** Chọn từ danh sách hợp lệ.
  - **Ngày:** Định dạng ngày YYYY-MM-DD.
  - **Ghi chú:** Text mô tả, không để trống.
- **Validation:** Bắt lỗi tức thì, hiển thị thông báo lỗi màu đỏ dưới từng trường nếu người dùng nhập sai, vô hiệu hóa gửi form rỗng.

### 5.3. Modal Đặt hạn mức Ngân sách
- Cho phép chỉnh sửa hạn mức ngân sách của tháng đang xem.
- Kiểm tra giá trị nhập > 0, cập nhật ngay lập tức thanh tiến trình và cảnh báo.

### 5.4. Modal Xác nhận Xóa Giao dịch
- Hiển thị hộp thoại cảnh báo: `"Bạn có chắc chắn muốn xóa giao dịch này không? Thao tác này không thể hoàn tác."`
- Nút **Hủy** và nút **Xóa** màu đỏ.

### 5.5. Chức năng Xuất CSV
- Sinh chuỗi CSV có tiền tố BOM `\uFEFF` chuẩn UTF-8 tiếng Việt.
- Tải về file `MoneyNote_GiaoDich_[Thang-Nam].csv`.

---

## 6. Chiến lược Kiểm thử & Đảm bảo Chất lượng (Testing & QA)
- Kiểm tra hiển thị chuẩn trên mọi độ phân giải màn hình máy tính (từ 1024px trở lên).
- Kiểm tra logic tính toán: Thu, Chi, Số dư, % Ngân sách, Số tiền còn lại, Cơ cấu danh mục chi tiêu.
- Kiểm tra tính hợp lệ của Form: ngăn chặn dữ liệu rỗng, số tiền âm, ký tự lạ.
- Kiểm tra việc lưu trữ `localStorage`: tải lại trang dữ liệu vẫn nguyên vẹn.
- Kiểm tra file CSV tải về mở trên Excel không bị lỗi font tiếng Việt.
