---
title: "Dựng Wedding Star Studio bằng WebGL"
type: feature
created: "2026-11-07"
status: done
baseline_commit: 779a695
context: []
---

<frozen-after-approval reason="Yêu cầu mới chi tiết và lệnh proceed của người dùng">

## Intent

**Problem:** Người dùng muốn dựng không gian bụi sao 3D theo `mau2.mp4`, chỉ hiển thị tên cặp đôi và ngày cưới bằng HLT Bickham Script Pro, rồi xuất video hoàn chỉnh.

**Approach:** Tạo 20.000 hạt xác định trong WebGL bằng Gaussian hai chiều theo hai elip, hai tầng quỹ đạo có phối cảnh, shader nền/cột sáng/vòng elip, rồi ghép lớp chữ Canvas 2D. Dùng cùng renderer cho preview và WebCodecs export.

## Boundaries & Constraints

**Always:** Khung 16:9, camera cố định, vùng giữa tối, hai tầng sao, lớp gần/xa, twinkle lệch pha, không logo mẫu. Chỉ có hai lớp tên/ngày cố định bằng HLT Bickham Script Pro; cho chỉnh nội dung, cỡ, màu, sáng, khoảng cách và vị trí. Có lưu cấu hình, fullscreen, xuất 1080p30 trong 15/30/60 giây.

**Never:** Ghi bảng điều khiển, phụ thuộc backend, nhấp nháy đồng loạt, rung/zoom camera hoặc đưa watermark mẫu vào sản phẩm.

</frozen-after-approval>

## Code Map

- `wedding-background/motion-engine.js` — cảnh WebGL và lớp chữ canvas.
- `wedding-background/script.js` — state, editor, timeline, lưu cấu hình và export.
- `wedding-background/index.html` — bố cục preview và ba bảng điều khiển.
- `wedding-background/style.css` — giao diện studio và fullscreen.
- `wedding-background/video-export.js` — WebCodecs MP4/WebM.

## Tasks & Acceptance

- [x] Dựng hai tầng sao WebGL với lớp gần/xa, cột sáng và vòng elip.
- [x] Dựng hai lớp tên/ngày độc lập bằng HLT Bickham Script Pro và editor cập nhật trực tiếp.
- [x] Loại bỏ monogram, tiêu đề nhỏ, lời nhắn, trái tim và timeline chuyển cảnh chữ.
- [x] Thêm lưu cấu hình, fullscreen và lựa chọn 15/30/60 giây.
- [x] Kiểm tra xuất video thực tế, timeline, tải lại cấu hình và lỗi WebGL.
- [x] Tập trung hai dải theo Gaussian và thêm điều khiển tâm/bụi mịn.
- [x] Tăng kích thước hạt có chọn lọc và bổ sung mật độ hạt có thể chỉnh ở hai rìa.
- [x] Thêm hạt rơi tròn theo lịch xác định, có công tắc và thanh tần suất.
- [x] Thêm giọt sáng, lóe điểm chạm, ba gợn elip và phản ứng hạt cục bộ ở tầng dưới.
- [x] Mở hai cụm thành Gaussian hai chiều theo elip, với mật độ giảm theo cả trục ngang và dọc.
- [x] Loại bỏ sao băng chéo và thay bằng hạt sáng tròn rơi chậm, trôi ngang nhẹ ở hai bên vùng chữ.

## Verification

- Node syntax và VS Code diagnostics.
- Playwright kiểm tra đúng 2 editor, font cục bộ, cập nhật canvas và loại bỏ các điều khiển chuyển cảnh.
- Playwright kiểm tra năm điều khiển hiệu ứng mới, hai công tắc, lịch sự kiện và khác biệt pixel khi bật/tắt.
- Xuất qua nút giao diện, xác nhận codec, 1920×1080, 30fps và thời lượng bằng `ffprobe`.
- Chụp preview đối chiếu bố cục với `mau2.mp4`.

## Results

- Preview dùng 20.000 hạt xác định; mặc định hiển thị khoảng 15.260 hạt với hai tầng và vùng giữa tối.
- Hai editor tên/ngày cập nhật canvas ngay; cấu hình tên có dấu khôi phục đúng sau reload.
- HTTP và `file://` đều tải được WebGL, font HLT Bickham Script Pro tiếng Việt và codec xuất.
- Xuất qua nút giao diện tạo MP4 H.264 1920×1080, 30fps, 450 frame, đúng 15,000 giây.
- Dữ liệu Gaussian hai chiều đạt 61,69% vùng tâm, 32,13% vùng chuyển tiếp và 6,19% vùng mép.
- Mặc định tăng hạt lên 1,35×; hạt rìa được giữ ở mức 78% nhưng vẫn giảm sáng mềm so với lõi trung tâm.
- Điểm chạm mặc định cách nhau 4,91–6,69 giây; nằm quanh 42–58% chiều rộng và gợn tan sau 2,6 giây.
- Cảnh dùng 20.000 hạt; 12.337 hạt nằm trong lõi elip, 6.426 hạt ở vùng chuyển tiếp và 1.237 hạt sát viền.
- Hạt rơi không dùng đường stroke hay đuôi sáng; mỗi hạt tồn tại 2,1–3,8 giây và chỉ trôi ngang tối đa 3,5% chiều rộng.

## Spec Change Log

- 2026-11-07: Đổi phân bố đều sang hỗn hợp Gaussian 69,35/25,88/4,78%, tăng bụi mịn và giữ quỹ đạo quanh tâm hạt.
- 2026-11-07: Thêm điều khiển độ tập trung vào tâm và mật độ bụi mịn; giảm sao lớn và độ sáng vòng elip.
- 2026-11-07: Tăng kích thước hạt có chọn lọc, thêm hạt rìa, sao băng và giọt sáng tạo gợn elip có phản ứng hạt cục bộ.
- 2026-11-08: Chuyển sang Gaussian hai chiều 61,69/32,13/6,19%, mở rộng hai elip theo chiều dọc và thay sao băng bằng hạt rơi tròn không đuôi.
- 2026-11-08: Chỉ giữ tên cặp đôi và ngày cưới, khóa font HLT Bickham Script Pro và bỏ timeline cùng bốn lớp chữ còn lại.

## Suggested Review Order

**Không gian WebGL**

- Bắt đầu từ dữ liệu hạt xác định cho hai tầng gần và xa.
  [`motion-engine.js:52`](../../wedding-background/motion-engine.js#L52)

- Renderer ghép shader nền, hạt và chữ vào cùng canvas xuất.
  [`motion-engine.js:277`](../../wedding-background/motion-engine.js#L277)

- Timeline hạt rơi, điểm chạm và gợn elip dùng cùng dữ liệu cho preview và export.
  [`motion-engine.js:100`](../../wedding-background/motion-engine.js#L100)

**Tên và ngày cưới**

- Hai cấu hình mặc định đặt tên và ngày ở giữa khung hình.
  [`script.js:16`](../../wedding-background/script.js#L16)

- Editor sinh điều khiển riêng cho nội dung và toàn bộ thuộc tính chữ.
  [`script.js:83`](../../wedding-background/script.js#L83)

- Canvas text xử lý HLT Bickham Script Pro, letter spacing và vị trí của hai lớp cố định.
  [`motion-engine.js:195`](../../wedding-background/motion-engine.js#L195)

**Xuất và giao diện**

- Export dùng lại renderer, thời lượng được đổi thành số frame 30fps chính xác.
  [`script.js:168`](../../wedding-background/script.js#L168)

- Ba tab tách điều khiển không gian, chữ và video trong giao diện gọn.
  [`index.html:31`](../../wedding-background/index.html#L31)

- Font thư pháp cục bộ bảo đảm tải offline và hiển thị tiếng Việt.
  [`style.css:1`](../../wedding-background/style.css#L1)
