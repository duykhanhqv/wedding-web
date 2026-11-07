# Wedding Star Studio

Trang chạy hoàn toàn trong trình duyệt, dựng hai tầng bụi sao bằng WebGL và ghép chữ bằng Canvas 2D. Không cần backend hay kết nối mạng khi sử dụng.

## Sử dụng

Mở `index.html` trực tiếp hoặc qua một static server. Bảng **Không gian** điều chỉnh tốc độ, mật độ tổng, độ tập trung vào tâm, bụi mịn, kích thước/độ sáng hạt, mật độ rìa, độ lấp lánh và độ sáng. Sao băng và giọt sáng có công tắc riêng cùng thanh tần suất; cường độ gợn sóng cũng cập nhật tức thời. Bảng **Chữ** cho sửa riêng sáu lớp: monogram, tiêu đề, tên, ngày, lời nhắn và trái tim. Nút **Lưu cấu hình** ghi thiết lập vào `localStorage` của trình duyệt.

Toàn màn hình chỉ mở khung canvas nên bảng điều khiển tự ẩn. Tab **Xuất video** ghi đúng canvas 1920×1080 ở 30fps, bao gồm cả nền và chữ, với thời lượng 15, 30 hoặc 60 giây. MP4 được ưu tiên; WebM được dùng khi trình duyệt không hỗ trợ H.264.

## Kỹ thuật

- `motion-engine.js`: 16.000 hạt xác định với hỗn hợp Gaussian 70/25/5, hai mặt phẳng quỹ đạo 3D, lớp gần/xa, twinkle lệch pha, sao băng, giọt sáng và gợn sóng có lịch xác định.
- `script.js`: trình biên tập trực tiếp, timeline hai cảnh, lưu cấu hình, toàn màn hình và vòng đời xuất video.
- `video-export.js`: WebCodecs cùng muxer cục bộ, không ghi giao diện.
- `GreatVibes-Regular.ttf`: font thư pháp Great Vibes có bộ ký tự tiếng Việt, phát hành theo SIL Open Font License trong `GreatVibes-OFL.txt`.

Preview và export dùng cùng timeline 60 giây, nên các hiệu ứng ngẫu nhiên có kiểm soát xuất hiện giống nhau trong video. API chẩn đoán `window.weddingApp` cung cấp state, renderer và trạng thái codec cho kiểm thử trình duyệt.
