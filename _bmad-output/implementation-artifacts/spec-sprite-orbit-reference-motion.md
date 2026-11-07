---
title: "Chuyển nền cưới sang quỹ đạo sprite có chiều sâu"
type: feature
created: "2026-11-07"
status: done
baseline_commit: 2d639bc567cc5c5d328126e531dd53cab26ed9ac
context: []
---

<frozen-after-approval reason="Yêu cầu chi tiết và lệnh triển khai trực tiếp của người dùng">

## Intent

**Problem:** Hiệu ứng hiện tại chỉ biến dạng texture nên các chấm lắc đồng loạt, thiếu danh tính và chiều sâu. Người dùng muốn giữ hình ảnh của `background.png` nhưng chuyển động gần cảm giác bụi sao trong `mau.mp4`.

**Approach:** Phân tích ảnh nguồn một lần, tách chấm nhận diện được thành sprite tồn tại xuyên suốt và chuyển chúng theo quỹ đạo elip phối cảnh cùng chiều. Phần sáng quá dày dùng residual texture near/far rất nhẹ; nền, tia dọc, vùng giữa và camera giữ nguyên.

## Boundaries & Constraints

**Always:** Pha 0/1, biên độ 0 và chế độ xem gốc phải khớp ảnh nguồn. Hai dải cùng chiều góc, chu kỳ mặc định 30 giây, near chuyển động khoảng 2,5–3 lần far. Sprite giữ hình gọn, kích thước/màu/độ sáng gần nguồn, danh tính cố định và nhấp sáng riêng ±3–6%. Vùng y≈0,35–0,63, tia dọc và letterbox đứng yên. Tái sử dụng cùng motion asset cho preview và exporter. Giữ điều khiển tốc độ, fullscreen, tải ảnh, so sánh ảnh gốc và xuất 1920×1080 30fps.

**Ask First:** Thay ảnh nguồn, thêm hạt không có trong ảnh, thay chu kỳ mặc định hoặc thêm dịch vụ/backend.

**Never:** Dịch/zoom cả ảnh; dùng một sóng sin trên toàn vùng; cho hai dải quay ngược chiều; sinh/hủy hạt, sao rơi, phun hạt, lốc xoáy, vệt kéo dài; để chấm gốc đứng yên dưới sprite; làm sáng tối cả dải đồng pha.

## I/O & Edge-Case Matrix

| Tình huống   | Trạng thái                      | Kết quả mong đợi                                                | Xử lý lỗi                            |
| ------------ | ------------------------------- | --------------------------------------------------------------- | ------------------------------------ |
| Ảnh mặc định | `background.png`                | Phân tích thành base, sprite và residual; hiện đúng ảnh ở pha 0 | Báo lỗi WebGL/phân tích rõ ràng      |
| Ảnh khác     | PNG/JPEG/WebP                   | Phân tích xác định, giữ tỷ lệ                                   | Giữ ảnh trước nếu lỗi hoặc vượt GPU  |
| Vùng dày     | Component chồng lấp             | Chuyển residual near/far nhẹ, không nhân đôi                    | Giới hạn atlas, phần dư vào residual |
| GPU/export   | Context preview và export riêng | Dùng chung dữ liệu CPU, không phân tích lại                     | Hủy sạch khi mất context/ẩn tab      |
| Không hỗ trợ | Thiếu Canvas readback/WebGL     | Không chạy hiệu ứng sai                                         | Thông báo hướng dẫn trình duyệt      |

</frozen-after-approval>

## Code Map

- `wedding-background/motion-engine.js` — phân tích ảnh, tạo MotionAsset và renderer nhiều pass.
- `wedding-background/script.js` — vòng đời ảnh, điều khiển, preview và tích hợp exporter.
- `wedding-background/index.html` — tải motion engine và giữ giao diện điều khiển.
- `wedding-background/video-export.js` — gọi renderer theo pha xác định; không đổi codec/muxer.
- `wedding-background/background.png` — chuẩn hình ảnh.
- `wedding-background/mau.mp4` — chuẩn cảm giác chuyển động, không dùng làm texture runtime.

## Tasks & Acceptance

**Execution:**

- [x] `motion-engine.js` — phân tích high-pass/component ổn định, tạo clean base, atlas sprite, residual near/far và số liệu reconstruction.
- [x] `motion-engine.js` — render base tĩnh, hai residual và sprite theo quỹ đạo cùng chiều, lớp sâu và twinkle lệch pha.
- [x] `script.js` — tải/phân tích bất đồng bộ, cache MotionAsset, khôi phục context, dùng lại asset trong export và giữ chức năng hiện tại.
- [x] `index.html`/`README.md` — nối engine, cập nhật nhãn biên độ và mô tả cách hoạt động.
- [x] Kiểm chứng pixel, chuyển động, hiệu năng và tạo bản xem trước 10 giây để so với `mau.mp4`.

**Acceptance Criteria:**

- Given pha 0/1, biên độ 0 hoặc xem gốc, when đọc pixel, then output khớp ảnh nguồn trong sai số rasterization.
- Given các pha 0,.25,.5,.75, when đọc vùng giữa, then hash vùng y=.35–.63 không đổi.
- Given sprite được lấy mẫu, when theo dõi 30 giây, then ID tồn tại, góc tăng cùng dấu, near dịch nhiều hơn far và vị trí khép kín.
- Given chuyển động thường, when so t=0 và t=10 giây, then chấm gọn, dịch thấy được, không nhân đôi và tổng thể vẫn giữ hai dải.
- Given xuất ở tốc độ 1× hoặc 3×, when dùng ffprobe, then video đủ 30fps, đúng một vòng 30 hoặc 10 giây và đúng kích thước 1920×1080.

## Spec Change Log

- 2026-11-07: Tách 2.800 chấm xác định thành sprite, thêm residual near/far và renderer WebGL nhiều pass.
- 2026-11-07: Sau review, đồng bộ hướng quay hai dải, loại quầng chấm tĩnh, chỉnh near/far 2,6× và twinkle tối đa ±6%.
- 2026-11-07: Giới hạn ảnh 16,8 MP, video 60 giây và làm mới liên kết tải khi thiết lập thay đổi.

## Design Notes

Video mẫu có intro/reveal và không loop kín; chỉ dùng cảm giác chuyển động sau giây đầu. Đo được lớp gần khoảng 5–8 px/s ngang và 3–5 px/s dọc ở 1920, lớp xa 1–3 px/s; bottom rõ hơn top khoảng 1,35×. Vòng 30 giây dùng cùng dấu `theta += 2π phase`: near rx 24–32/ry 8–14 px, mid 14–22/5–8, far 7–12/2,5–4,5. Quỹ đạo tính delta so với pha đầu để không nhảy seam. Residual chỉ chứa phần high-pass đã trừ khỏi base, tránh chồng chấm gốc.

## Verification

- `node --check` và VS Code diagnostics.
- Playwright đọc pixel pha 0/1, amplitude 0, center/edge, letterbox, context restore và ảnh lỗi.
- API chẩn đoán báo sprite count, residual pixels, reconstruction MAE, ID/depth/theta và checksum xác định.
- Xuất MP4/WebM ngắn, preview 10 giây và vòng 30 giây; xác nhận bằng `ffprobe`.

## Results

- Pha 0/1, biên độ 0, mặt nạ tắt và vùng giữa đều sai khác 0 pixel so với nguồn.
- 2.800 sprite ổn định; tất cả góc tăng cùng dấu; near/far đo được 2,52×.
- Preview H.264 1920×1080, 30fps, 300 frame, đúng 10,000 giây.
- Xuất qua giao diện dùng chung MotionAsset và chỉ ghi canvas nền.

## Suggested Review Order

**Tách ảnh và mô hình chuyển động**

- Bắt đầu tại pipeline tạo base sạch, atlas sprite và residual chiều sâu.
  [`motion-engine.js:77`](../../wedding-background/motion-engine.js#L77)

- Hai shader residual và sprite giữ quỹ đạo cùng chiều, độ sâu và twinkle riêng.
  [`motion-engine.js:454`](../../wedding-background/motion-engine.js#L454)

- Renderer ghép nền tĩnh, residual và sprite với seam khép kín.
  [`motion-engine.js:616`](../../wedding-background/motion-engine.js#L616)

**Vòng đời giao diện và xuất video**

- Ảnh được phân tích một lần rồi dùng lại cho xem trước và exporter.
  [`script.js:179`](../../wedding-background/script.js#L179)

- WebCodecs xuất vòng lặp xác định và giới hạn bộ nhớ ở 60 giây.
  [`video-export.js:9`](../../wedding-background/video-export.js#L9)

- Trang nạp motion engine trước bộ điều khiển và giữ giao diện gọn.
  [`index.html:78`](../../wedding-background/index.html#L78)

**Hướng dẫn vận hành**

- README mô tả điều khiển, cơ chế sprite và API chẩn đoán.
  [`README.md:5`](../../wedding-background/README.md#L5)
