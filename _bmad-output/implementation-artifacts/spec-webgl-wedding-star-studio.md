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

**Problem:** Phiên bản trước mô phỏng chuyển động từ ảnh tĩnh và không có lớp chữ biên tập được. Người dùng muốn dựng không gian bụi sao 3D theo `mau2.mp4`, có hai cảnh chữ và xuất video hoàn chỉnh.

**Approach:** Tạo 16.000 hạt xác định trong WebGL bằng hỗn hợp Gaussian tập trung ở tâm, hai tầng quỹ đạo có phối cảnh, shader nền/cột sáng/vòng elip, rồi ghép lớp chữ Canvas 2D. Dùng cùng renderer cho preview và WebCodecs export.

## Boundaries & Constraints

**Always:** Khung 16:9, camera cố định, vùng giữa tối, hai tầng sao, lớp gần/xa, twinkle lệch pha, không logo mẫu. Sáu lớp chữ chỉnh riêng nội dung/font/cỡ/màu/sáng/khoảng cách/vị trí. Có cố định và luân phiên, lưu cấu hình, fullscreen, xuất 1080p30 trong 15/30/60 giây.

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
- [x] Dựng sáu lớp chữ độc lập và editor cập nhật trực tiếp.
- [x] Thêm chế độ cố định/luân phiên và fade hai cảnh.
- [x] Thêm lưu cấu hình, fullscreen và lựa chọn 15/30/60 giây.
- [x] Kiểm tra xuất video thực tế, timeline, tải lại cấu hình và lỗi WebGL.
- [x] Tập trung hai dải theo Gaussian 70/25/5 và thêm điều khiển tâm/bụi mịn.

## Verification

- Node syntax và VS Code diagnostics.
- Playwright kiểm tra 6 editor, cập nhật canvas, lưu/tải cấu hình và hai cảnh.
- Xuất qua nút giao diện, xác nhận codec, 1920×1080, 30fps và thời lượng bằng `ffprobe`.
- Chụp preview đối chiếu bố cục với `mau2.mp4`.

## Results

- Preview dùng 16.000 hạt xác định; mặc định hiển thị khoảng 12.200 hạt với hai tầng và vùng giữa tối.
- Sáu editor cập nhật canvas ngay; cấu hình tên có dấu và chế độ hiển thị khôi phục đúng sau reload.
- HTTP và `file://` đều tải được WebGL, font Great Vibes tiếng Việt và codec xuất.
- Xuất qua nút giao diện tạo MP4 H.264 1920×1080, 30fps, 450 frame, đúng 15,000 giây.
- Dữ liệu hạt đạt 69,35% vùng tâm, 25,88% vùng chuyển tiếp và 4,78% vùng mép.
- Qua bốn pha chuyển động, trọng tâm ánh sáng luôn ở x=49,77–49,99%; vùng tâm giữ 82,35–82,98% năng lượng hạt.

## Spec Change Log

- 2026-11-07: Đổi phân bố đều sang hỗn hợp Gaussian 69,35/25,88/4,78%, tăng bụi mịn và giữ quỹ đạo quanh tâm hạt.
- 2026-11-07: Thêm điều khiển độ tập trung vào tâm và mật độ bụi mịn; giảm sao lớn và độ sáng vòng elip.

## Suggested Review Order

**Không gian WebGL**

- Bắt đầu từ dữ liệu hạt xác định cho hai tầng gần và xa.
  [`motion-engine.js:52`](../../wedding-background/motion-engine.js#L52)

- Renderer ghép shader nền, hạt và chữ vào cùng canvas xuất.
  [`motion-engine.js:192`](../../wedding-background/motion-engine.js#L192)

**Chữ và timeline**

- Sáu cấu hình mặc định đặt bố cục hai cảnh theo video mẫu.
  [`script.js:20`](../../wedding-background/script.js#L20)

- Editor sinh điều khiển riêng cho nội dung và toàn bộ thuộc tính chữ.
  [`script.js:73`](../../wedding-background/script.js#L73)

- Canvas text xử lý font, letter spacing, monogram và opacity hai cảnh.
  [`motion-engine.js:148`](../../wedding-background/motion-engine.js#L148)

**Xuất và giao diện**

- Export dùng lại renderer, thời lượng được đổi thành số frame 30fps chính xác.
  [`script.js:169`](../../wedding-background/script.js#L169)

- Ba tab tách điều khiển không gian, chữ và video trong giao diện gọn.
  [`index.html:31`](../../wedding-background/index.html#L31)

- Font thư pháp cục bộ bảo đảm tải offline và hiển thị tiếng Việt.
  [`style.css:1`](../../wedding-background/style.css#L1)
