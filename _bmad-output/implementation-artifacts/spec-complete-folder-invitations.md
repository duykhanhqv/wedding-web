---
title: 'Hoàn thiện ba thiệp ba trang trong thư mục riêng'
type: 'feature'
created: '2026-10-03'
status: 'done'
baseline_commit: '1ad0a8118af944e3392894ef65458b854f81454c'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Ba thư mục `14`, `15`, `28` đã có trang HTML nhưng mỗi thiệp hiện chỉ hiển thị một ảnh. Ba ảnh của ngày 14 đang nằm trong `assets/img`, còn sáu ảnh PNG mới bị chia chéo giữa thư mục `15` và `28`; nội dung in trên ảnh cho biết mỗi ngày thực tế có ba trang thiệp.

**Approach:** Chuẩn hóa ba ảnh trang 1–3 vào đúng thư mục ngày, khôi phục bố cục ba trang thiệp quanh phần đếm ngược, và chọn đúng bộ ảnh, thời gian, địa điểm cùng danh sách khách dựa trên thư mục đang mở. Phần album trở xuống tiếp tục dùng chung.

## Boundaries & Constraints

**Always:** Ngày 14 dùng bộ ảnh hiện có và giờ 11:00 tại Tư gia, Tà Lài; ngày 15 dùng ảnh có nội dung 15/11, giờ 11:00 tại Tâm Palace; ngày 28 dùng ảnh có nội dung 28/11, giờ 16:00 tại Tư gia Phúc Tâm. Mỗi thiệp hiển thị theo thứ tự trang 1 → trang 2 → đếm ngược → trang 3 → album. Ba danh sách khách phải độc lập; `?k=` và `?ten=` tiếp tục hoạt động.

**Ask First:** Thay nội dung đã in sẵn trên ảnh, đổi giờ hoặc địa điểm khác với ảnh, hay sửa bố cục và ảnh từ phần album trở xuống.

**Never:** Trộn trang ảnh giữa hai ngày theo nội dung, trộn danh sách khách, thêm framework/bước build, hoặc xóa ảnh gốc người dùng vừa thêm.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Thiệp theo thư mục | `/14/`, `/15/`, `/28/` | Hiển thị đúng ba ảnh, ngày giờ, địa điểm và danh sách khách của thư mục | Thư mục không xác định dùng ngày 14 |
| Ảnh mới đặt chéo thư mục | PNG có ngày in trên ảnh không trùng tên thư mục | Sao chép thành tên chuẩn trong đúng thư mục theo nội dung ảnh | Giữ nguyên file gốc để không mất dữ liệu |
| Liên kết khách | `/15/index.html?k=nam` hoặc `?ten=Anh%20Nam` | Bìa lấy tên từ danh sách ngày 15 hoặc tên trực tiếp | Mã lạ dùng tên mặc định |
| Lịch sự kiện | Bấm “Thêm vào lịch” ở thiệp ngày 28 | ICS bắt đầu 16:00 ngày 28/11/2026, đúng địa điểm | Không phụ thuộc múi giờ máy khách |

</frozen-after-approval>

## Code Map

- `14/index.html`, `15/index.html`, `28/index.html`, `index.html` -- bố cục ba trang ảnh trước album và các điểm gắn ảnh động.
- `js/khach-moi.js` -- cấu hình ba bộ ảnh, thời gian, địa điểm và danh sách khách.
- `js/countdown.js` -- đếm ngược và tạo lịch từ cấu hình hiện hành.
- `khach-moi.html` -- sinh liên kết khách theo từng thư mục.
- `14/`, `15/`, `28/` -- nơi chứa ba ảnh invite chuẩn hóa của từng ngày.
- `README.md` -- hướng dẫn quản lý ảnh và khách theo thư mục.

## Tasks & Acceptance

**Execution:**
- [x] `14/`, `15/`, `28/` -- tạo bộ `invite-1`, `invite-2`, `invite-3` đúng ngày từ các ảnh hiện có, đồng thời giữ các file nguồn.
- [x] `index.html`, `14/index.html`, `15/index.html`, `28/index.html` -- khôi phục đủ ba vùng ảnh theo đúng thứ tự và giữ nguyên album trở xuống.
- [x] `js/khach-moi.js` -- khai báo ba đường dẫn ảnh cho mỗi ngày; cập nhật ngày 28 thành 16:00 và địa điểm ngày 15/28 theo nội dung ảnh; giữ lớp tên viết tay trên trang đầu.
- [x] `README.md` -- mô tả cấu trúc ba trang ảnh và thông tin từng thiệp.
- [x] Kiểm tra các nhánh thư mục, tên khách và dữ liệu ICS để ngăn sai ngày hoặc sai bộ ảnh.

**Acceptance Criteria:**
- Given một trong ba URL thư mục, when mở thiệp, then ba trang ảnh đều thuộc đúng ngày được in trên ảnh và phần album tiếp theo giống nhau.
- Given hai khách có cùng mã trong hai danh sách, when mở từng URL, then bìa hiện tên của đúng danh sách thư mục đó.
- Given thiệp ngày 15 hoặc 28, when xem đếm ngược và tải lịch, then ngày giờ và địa điểm khớp nội dung in trên ảnh.

## Spec Change Log

## Design Notes

Các ảnh PNG hiện được đặt chéo theo nội dung: bộ ngày 15 là `15/3.png`, `28/7.png`, `28/10.png`; bộ ngày 28 là `28/4.png`, `15/6.png`, `15/9.png`. Tạo bản sao tên chuẩn trong thư mục đúng ngày giúp HTML/JS dễ đọc mà vẫn giữ nguyên nguồn người dùng.

## Verification

**Commands:**
- `node --check js/khach-moi.js && node --check js/envelope.js && node --check js/countdown.js` -- JavaScript hợp lệ.
- Bài kiểm tra DOM cấu hình cho `/14/`, `/15/`, `/28/` -- mỗi đường dẫn chọn đúng ba ảnh, thời gian và dữ liệu khách.
- `git diff --check` -- không có lỗi khoảng trắng hoặc dấu xung đột.

**Manual checks (if no CLI):**
- Mở ba thư mục và xác nhận thứ tự ba trang ảnh, tên viết tay, đếm ngược, lịch và phần album.

## Suggested Review Order

**Cấu hình và định tuyến thiệp**

- Ba cấu hình tập trung ảnh, thời gian, địa điểm và danh sách khách riêng.
  [`khach-moi.js:26`](../../js/khach-moi.js#L26)

- Thư mục quyết định thiệp; tham số truy vấn duy trì liên kết gốc cũ.
  [`khach-moi.js:84`](../../js/khach-moi.js#L84)

**Bố cục và dữ liệu lịch**

- Ba trang ảnh bao quanh đếm ngược trước phần album dùng chung.
  [`index.html:47`](../../index.html#L47)

- Lịch kiểm tra ngày và gấp dòng UTF-8 đúng chuẩn ICS.
  [`countdown.js:12`](../../js/countdown.js#L12)

- Sự kiện tải xuống dùng đúng giờ, tên lễ và địa điểm của thiệp.
  [`countdown.js:104`](../../js/countdown.js#L104)

**Quản lý và hướng dẫn**

- Trang quản lý tạo liên kết khách theo đúng thư mục ngày.
  [`khach-moi.html:53`](../../khach-moi.html#L53)

- Hướng dẫn ghi rõ bộ ảnh, ngày giờ và địa điểm của ba thiệp.
  [`README.md:107`](../../README.md#L107)
