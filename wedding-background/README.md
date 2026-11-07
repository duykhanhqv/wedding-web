# Nền cưới chuyển động

Mở [index.html](./index.html) bằng trình duyệt máy tính có WebGL. Không cần cài thư viện hay backend. Trang khởi động ở trạng thái tạm dừng, đúng ảnh gốc. Nhấn **Chạy** để bắt đầu.

- **Độ rộng quỹ đạo** tính theo độ rộng ảnh 1920 px; mặc định 28 px cho lớp gần. Chấm ở lớp xa tự động chuyển động nhẹ hơn khoảng 2,5–3 lần. Đặt 0 để xem đúng ảnh gốc.
- **Tốc độ** mặc định 1×, tương ứng vòng 30 giây. Tốc độ 2× cho vòng 15 giây.
- Mỗi vùng có công tắc riêng và mục **Vị trí & phạm vi mặt nạ**. Tâm, kích thước tính theo phần trăm ảnh; độ mềm là phần chuyển tiếp bên trong mặt nạ. Mặc định khóa cứng vùng giữa khoảng 35–63% chiều cao.
- **Xem ảnh gốc** chỉ thay đổi bản xem trước. Video luôn ghi chuyển động theo các thông số đã chọn, bắt đầu từ ảnh gốc.
- **Đặt lại** khôi phục thông số, dừng tại đầu vòng và giữ ảnh hiện tại.
- **Toàn màn hình** chỉ hiển thị ảnh nền. Nhấn Esc để thoát.

## Ghi video

Nút ghi tạo video 1920 × 1080, 30 fps, một vòng chuyển động. Trình duyệt hỗ trợ WebCodecs sẽ mã hóa từng khung hình với thời điểm xác định, nên tốc độ xử lý không làm thay đổi thời lượng video. Trang ưu tiên MP4 khi trình duyệt hỗ trợ; nếu không sẽ dùng WebM. Tên tệp tải về khớp định dạng thực tế. Không ghi âm thanh hoặc giao diện.

Giữ tab hiển thị trong lúc tạo video. Thời gian xử lý tùy máy, có thể nhanh hoặc chậm hơn thời lượng video. Nếu trình duyệt không có bộ mã hóa phù hợp, nút xuất bị vô hiệu hóa và trang hướng dẫn dùng trình duyệt hỗ trợ. Có thể hủy; ẩn tab hoặc mất WebGL sẽ hủy ghi để tránh tải video không hoàn chỉnh. Ảnh khác tỷ lệ được giữ nguyên tỷ lệ với phần dư màu đen.

## Tệp nguồn

- [background.png](./background.png): ảnh gốc, không thay đổi.
- [background-source.js](./background-source.js): cùng các byte PNG mã hóa base64, chỉ tải khi trình duyệt chặn texture ảnh khi mở trực tiếp qua `file://`. Nếu thay ảnh mặc định, cần cập nhật cả bản dự phòng này; chọn ảnh trong giao diện không cần cập nhật tệp.
- [motion-engine.js](./motion-engine.js): phân tích ảnh thành nền tĩnh, 2.800 sprite có danh tính cố định và hai lớp high-pass cho vùng sáng dày. Sprite quay cùng chiều theo quỹ đạo elip phối cảnh; không sinh thêm hạt.
- [script.js](./script.js): quản lý ảnh, MotionAsset, bảng điều khiển, fullscreen và dùng lại chính MotionAsset đó khi xuất video.
- [video-export.js](./video-export.js): WebCodecs tạo từng khung hình có timestamp và kiểm tra đủ số khung trước khi tải xuống.
- [vendor/](./vendor/): bản browser của mp4-muxer 5.2.2 và webm-muxer 5.1.4, kèm giấy phép MIT; tải từ tệp cục bộ, không dùng CDN.

Để kiểm tra kỹ thuật, `window.weddingApp` cung cấp `renderer`, `asset`, `stats`, `state`, `TextureRenderer`, `render()`, `getSprite(id)`, `getSpritePosition(id, phase)` và `recording`. `renderer.render(phase, state)` nhận pha theo số vòng; 0 và 1 cho cùng ảnh. `stats` cho biết số sprite, lượng residual, thời gian phân tích và checksum xác định. Đây là API chẩn đoán, không cần dùng để trình chiếu.
