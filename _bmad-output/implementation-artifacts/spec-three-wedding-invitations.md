---
title: 'Tách trang thành ba thiệp cưới có danh sách khách riêng'
type: 'feature'
created: '2026-10-03'
status: 'done'
baseline_commit: '1ad0a8118af944e3392894ef65458b854f81454c'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Trang hiện tại ghép cả ba ảnh `invite-1.webp`, `invite-2.webp`, `invite-3.webp` thành ba phần của cùng một thiệp và chỉ có một danh sách khách. Cần ba phiên bản thiệp cho ngày 14, 15 và 28/11/2026, mỗi phiên bản dùng một ảnh invite tương ứng và có danh sách khách độc lập.

**Approach:** Dùng một trang HTML chung, chọn cấu hình thiệp từ tham số đường dẫn để tránh nhân bản phần album trở xuống. Mỗi cấu hình cung cấp ngày cưới, ảnh invite và danh sách khách; trang quản lý khách hiển thị, tạo và sao chép đúng liên kết của từng thiệp.

## Boundaries & Constraints

**Always:** Ánh xạ ngày 14 → `invite-1.webp`, ngày 15 → `invite-2.webp`, ngày 28 → `invite-3.webp`; giữ nguyên nội dung và thứ tự từ `#sec-album` đến cuối trang; giữ hỗ trợ tên trực tiếp qua `?ten=`; đường dẫn khách phải xác định cả thiệp lẫn mã khách; dùng ngày năm 2026 và giờ 11:00 cho cả ba cấu hình để đồng bộ với nội dung ảnh hiện có.

**Ask First:** Thay đổi giờ, địa điểm hoặc nội dung lịch riêng của ngày 15 và 28; thay đổi ảnh hay bố cục từ phần album trở xuống; đổi quy ước URL đã nêu trong đặc tả.

**Never:** Tạo ba bản sao đầy đủ của `index.html`; trộn khách giữa các thiệp; đưa tên khách vào HTML bằng `innerHTML`; thêm framework hoặc bước build.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Mở thiệp hợp lệ | `?thiep=14&k=nam` | Hiện `invite-1.webp`, ngày 14/11, đếm ngược/lịch ngày 14 và tên Nam từ danh sách ngày 14 | N/A |
| Ba phiên bản | `thiep=14`, `15`, hoặc `28` | Chọn đúng ảnh, ngày và danh sách khách tương ứng | N/A |
| Thiệp không hợp lệ | Thiếu `thiep` hoặc giá trị lạ | Dùng thiệp ngày 14 làm mặc định | Không gây lỗi trang |
| Mã khách thuộc thiệp khác | Mã không tồn tại trong danh sách thiệp đang mở | Không hiện nhầm tên từ danh sách khác | Dùng tên mặc định của thiệp |
| Tên trực tiếp | `?thiep=15&ten=Anh%20Nam` | Hiện tên được truyền an toàn trên bìa | Chuỗi không hợp lệ trở về tên mặc định |

</frozen-after-approval>

## Code Map

- `index.html` -- vùng ảnh thiệp/ngày hiển thị và thứ tự nạp script trước phần album dùng chung.
- `js/khach-moi.js` -- cấu hình ba thiệp và ba danh sách khách độc lập.
- `js/envelope.js` -- chọn khách trong đúng danh sách theo phiên bản thiệp.
- `js/countdown.js` -- đếm ngược và tạo lịch từ cấu hình của thiệp đang mở.
- `khach-moi.html` -- trang quản lý hiển thị ba nhóm khách và sinh URL có `thiep` + `k`.
- `README.md` -- hướng dẫn sửa từng danh sách và chia sẻ đúng liên kết.

## Tasks & Acceptance

**Execution:**
- [x] `js/khach-moi.js` -- thay dữ liệu chung bằng cấu hình ba thiệp, giữ sẵn khách mẫu trong danh sách ngày 14 và để cấu trúc rõ ràng để nhập khách ngày 15/28.
- [x] `index.html` -- chỉ giữ một vùng ảnh invite trước countdown, gắn các điểm cập nhật ảnh/ngày bằng JavaScript và không sửa phần từ `#sec-album` trở xuống.
- [x] `js/envelope.js` -- đọc phiên bản thiệp, công bố cấu hình đang dùng và tra cứu khách trong đúng danh sách.
- [x] `js/countdown.js` -- lấy mốc thời gian từ cấu hình hiện hành, cập nhật nhãn ngày và xuất file ICS đúng ngày.
- [x] `khach-moi.html` -- hiển thị ba bảng khách, liên kết riêng theo từng ngày và nút sao chép hoạt động như hiện tại.
- [x] `README.md` -- mô tả ba URL thiệp, cách nhập khách và cách thay đổi thông tin từng ngày.

**Acceptance Criteria:**
- Given ba URL `?thiep=14`, `?thiep=15`, `?thiep=28`, when mở từng URL, then mỗi trang chỉ hiện ảnh invite tương ứng và phần album đến cuối giống nhau.
- Given cùng một mã khách xuất hiện ở nhiều danh sách với tên khác nhau, when mở từng thiệp, then bìa hiện tên của đúng danh sách thiệp đó.
- Given khách bấm “Thêm vào lịch”, when file ICS được tải, then ngày bắt đầu khớp phiên bản thiệp đang xem.
- Given trang `khach-moi.html`, when chọn sao chép một khách, then liên kết chứa cả mã thiệp và mã khách.
- Given URL cũ chỉ có `?k=...`, when mở trang, then hệ thống dùng thiệp ngày 14 mặc định để duy trì tương thích.

## Spec Change Log

## Verification

**Commands:**
- `node --check js/khach-moi.js && node --check js/envelope.js && node --check js/countdown.js` -- expected: các file JavaScript hợp lệ.
- `git diff --check` -- expected: không có lỗi khoảng trắng hoặc dấu xung đột.

**Manual checks (if no CLI):**
- Mở ba biến thể URL và xác nhận ảnh, ngày, tên khách, đếm ngược, file lịch cùng phần album dùng chung.
- Mở `khach-moi.html`, xác nhận ba nhóm khách và các URL sao chép đúng.

## Suggested Review Order

1. [`js/khach-moi.js`](../../js/khach-moi.js) -- dữ liệu ba thiệp, ảnh, ngày giờ và danh sách khách riêng.
2. [`index.html`](../../index.html) -- vùng invite dùng chung và phần album giữ nguyên.
3. [`js/envelope.js`](../../js/envelope.js) and [`js/countdown.js`](../../js/countdown.js) -- tên khách và lịch lấy theo thiệp đang mở.
4. [`khach-moi.html`](../../khach-moi.html) -- trang quản lý link khách theo từng ngày.
5. [`README.md`](../../README.md) -- hướng dẫn dùng ba URL và nhập khách.
