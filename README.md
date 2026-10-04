# Thiệp cưới Khánh & Nhung

Trang thiệp cưới một trang, viết bằng **HTML + CSS + JavaScript thuần**.
Không dùng framework, không cần cài đặt gì, không có bước build.

---

## Chạy thử

Mở thẳng `index.html` bằng trình duyệt là xem được.

Nếu muốn giống môi trường thật (và để font/ảnh chắc chắn tải đúng), chạy một
máy chủ tĩnh trong thư mục dự án:

```bash
python3 -m http.server 8000
# rồi mở http://localhost:8000
```

---

## Cấu trúc thư mục

```
index.html          Toàn bộ nội dung thiệp. Không có inline style.
README.md           File bạn đang đọc.
khach-moi.html      Trang phụ: xem danh sách khách + đường dẫn riêng của từng người.

css/
  fonts.css         Khai báo font (@font-face). Hiếm khi phải sửa.
  base.css          Bảng màu, font, lớp dùng chung.   ← ĐỌC FILE NÀY TRƯỚC
  sections.css      Giao diện từng phần của thiệp.
  envelope.css      Bìa phong bì mở đầu.
  reveal.css        Hiệu ứng ảnh bay vào khi cuộn.

js/
  khach-moi.js      Ba cấu hình thiệp, danh sách khách và chọn ảnh theo URL.
  envelope.js       Dựng bìa phong bì, xử lý chạm mở.
  countdown.js      Đếm ngược + nút "Thêm vào lịch".
  carousel.js       Đổi giữa hai lớp ảnh.
  wishes.js         Sổ lưu bút.
  reveal.js         Hiệu ứng ảnh bay vào khi cuộn.

assets/
  img/              Ảnh album dùng chung và ảnh nguồn của thiệp ngày 14.
  fonts/            File font.

14/, 15/, 28/       Mỗi thư mục có index.html và ba ảnh invite-1..3 của ngày đó.
```

`khach-moi.js` cần nạp trước `envelope.js` và `countdown.js` để cung cấp
cấu hình thiệp đang xem. Các phần album đến cuối dùng chung cho cả ba thiệp.

---

## Các phần của thiệp

Cuộn từ trên xuống, khách sẽ thấy theo thứ tự:

| id | Phần | Xử lý bởi |
|---|---|---|
| `#sec-page-1` | Trang ảnh thiệp 1 + tên viết tay | `js/khach-moi.js` |
| `#sec-page-2` | Trang ảnh thiệp 2 | `js/khach-moi.js` |
| `#sec-countdown` | Đếm ngược + nút thêm vào lịch | `js/countdown.js` |
| `#sec-page-3` | Trang ảnh thiệp 3 | `js/khach-moi.js` |
| `#sec-album` | Album cưới, ảnh toàn chiều ngang | — |
| `#sec-strip` | Dải ảnh ( 01 )( 02 )( 03 ) | `js/carousel.js` |
| `#sec-collage` | Collage 3 ảnh xếp lệch | `js/carousel.js` |
| `#sec-layer` | Ảnh lồng lớp | `js/carousel.js` |
| `#sec-wishes` | Sổ lưu bút | `js/wishes.js` |
| `#sec-thanks` | Cảm ơn | — |

**Quy tắc tìm code:** phần nào có id gì thì style của nó nằm đúng khối mang tên
id đó trong `css/sections.css`. Không phải dò cả file.

---

## Những việc hay làm nhất

### Đổi một tấm ảnh

Sửa `src` của thẻ `<img>` tương ứng trong `index.html`, file ảnh để trong
`assets/img/`. Mọi ảnh đều nằm trong một khung theo mẫu:

```html
<div class="khung-anh">
  <img src="assets/img/album-1.webp" alt="Ảnh cưới 1">
</div>
```

Khung lo tỉ lệ và màu nền, ảnh bên trong tự phủ kín khung (`object-fit: cover`)
nên **không bao giờ bị méo**, chỉ bị cắt bớt phần thừa.

Ảnh bị cắt mất mặt người? Thêm một trong hai lớp này cho thẻ `<img>` (đang dùng
ở album):

```html
<img src="..." alt="..." class="canh-tren">   <!-- lấy phần trên khung hình -->
<img src="..." alt="..." class="canh-duoi">   <!-- lấy phần dưới khung hình -->
```

### Đổi màu hoặc font

Sửa trong khối `:root` ở đầu `css/base.css`. Mọi màu và font khai báo ở đó
**một lần**, các file khác chỉ gọi lại bằng `var(--ten-bien)`.

### Ba thiệp và thông tin ngày cưới

| Đường dẫn | Ba ảnh trong thư mục | Ngày giờ | Địa điểm |
|---|---|---|---|
| `14/` | `invite-1.webp` → `invite-3.webp` | 14/11/2026, 11:00 | Tư gia, Tà Lài, Tân Phú, Đồng Nai |
| `15/` | `invite-1.webp` → `invite-3.webp` | 15/11/2026, 11:00 | Tâm Palace, 191 Đ. Vành Đai Trong, An Lạc, Hồ Chí Minh |
| `28/` | `invite-1.png` → `invite-3.png` | 28/11/2026, 16:00 | Tư gia, Phúc Tâm, Quảng Ngọc, Thanh Hoá |

Mỗi folder có `index.html` riêng và dùng chung `css/`, `js/`, `assets/`
ở thư mục gốc. Tên folder luôn xác định thiệp, kể cả khi URL có thêm tham số
`thiep`. Link cũ dạng `index.html?thiep=15` ở thư mục gốc vẫn chạy; tại trang
gốc, thiếu `thiep` hoặc giá trị không hợp lệ sẽ mở thiệp ngày 14.
Mỗi thiệp hiển thị theo thứ tự trang 1 → trang 2 → đếm ngược → trang 3 →
album. Phần album đến cuối vẫn dùng chung từ thư mục gốc.

Sửa `ngayCuoi`, `ketThuc`, `tenLe`, `diaDiem` trong cấu hình tương ứng của
`window.THIEP_CUOI` ở `js/khach-moi.js`. Giữ đuôi `+07:00` cho giờ Việt Nam.
Ngày hiển thị, đếm ngược và lịch tải xuống tự lấy từ cấu hình này.
Chữ/ngày đã in sẵn trong ảnh không đổi theo JavaScript. Khi thay một trang,
hãy giữ đúng tên `invite-1`, `invite-2` hoặc `invite-3` trong thư mục ngày đó,
đồng thời cập nhật phần mở rộng trong `js/khach-moi.js` nếu đổi định dạng file.
Các PNG nguồn (`3.png`, `4.png`, `6.png`, `7.png`, `9.png`, `10.png`) vẫn được
giữ lại để đối chiếu hoặc chỉnh sửa về sau.

### Thêm khách mời

Sửa `khachMoi` trong đúng nhóm `'14'`, `'15'` hoặc `'28'` của
`js/khach-moi.js`, mỗi người một dòng:

```js
"nam": "Anh Nam",
```

Ví dụ thêm Nam vào nhóm `'15'`, gửi `.../15/index.html?k=nam`.
Mỗi nhóm có danh sách riêng; cùng mã `nam` có thể mang tên khác ở nhóm khác.
Nhóm ngày 14 giữ khách mẫu cũ; ngày 15 và 28 để trống để bạn nhập khách thật.
Mã không thuộc danh sách thiệp đang xem dùng `tenMacDinh` của thiệp đó.
Để `tenMacDinh: ''` sẽ chỉ hiện “Thân mời”.

Mở `khach-moi.html` để xem ba nhóm và sao chép đường dẫn của từng người.
Link cũ `index.html?k=nam` vẫn tra danh sách ngày 14. Có thể mời nhanh bằng
`15/index.html?ten=Anh%20Nam`; tên trực tiếp được ưu tiên hơn mã khách.
Trang này đọc dữ liệu từ file, không lưu tên mới qua giao diện.

### Chỉnh hiệu ứng bay vào

Sửa các biến ở `css/reveal.css`, không cần đụng vào JS:

| Biến | Ý nghĩa |
|---|---|
| `--rv-x` | lệch ngang lúc chờ (dương = bay từ phải vào) |
| `--rv-y` | lệch dọc lúc chờ (dương = nổi từ dưới lên) |
| `--rv-s` | cỡ ảnh lúc chờ (`1` = đúng cỡ) |
| `--rv-d` | chờ bao lâu rồi mới bay (để ảnh vào lần lượt) |

---

## Ba điều dễ vấp — đọc trước khi sửa

### 1. Lưới chứa ảnh phải viết `minmax(0, 1fr)`, không viết `1fr`

```css
/* ĐÚNG */   grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
/* SAI  */   grid-template-columns: 1fr 1fr;
```

Viết `1fr` thì mỗi cột có bề rộng tối thiểu tự động bằng nội dung bên trong.
Ảnh to sẽ đẩy cột phình ra, và trên **Safari/iPhone** cả phần đó vỡ tung, đẩy
những phần bên dưới đi mất. Chrome trên máy tính không bị nên rất dễ tưởng là
vẫn ổn. Đây là lỗi đã từng xảy ra thật với phần album.

### 2. Lề trái/phải dùng biến `--le-ngang`, không viết @media riêng

```css
#sec-album{ padding: 76px var(--le-ngang) 84px; }
```

Biến này tự nhỏ lại trên điện thoại (khai báo ở cuối `css/base.css`). Không cần
viết thêm `@media` chỉ để thu lề.

### 3. Chữ do khách gõ phải dùng `textContent`, không dùng `innerHTML`

Xem `js/wishes.js`. Ghép chữ của khách thẳng vào HTML thì người ta gõ thẻ HTML
vào sẽ chạy thật (lỗ hổng XSS).

---

## Hai lớp ảnh (carousel)

Ba phần `#sec-strip`, `#sec-collage`, `#sec-layer` mỗi phần có **hai lớp ảnh**
chồng khít lên nhau:

- lớp 1 = ảnh 01–03 (đang dùng)
- lớp 2 = ảnh 04–06 (**chưa gán ảnh**, để dành thêm sau)

Lớp nào đang hiện thì mang `data-hien="1"`, lớp ẩn mang `data-hien="0"`.

Hiện chưa có nút chuyển lớp nên lúc nào cũng hiện lớp 1 — đó là cố ý vì lớp 2
chưa có ảnh. Cách thêm ảnh và bật chuyển lớp ghi ở cuối `js/carousel.js`.

---

## Một điều cần biết về sổ lưu bút

Lời chúc khách gửi **chỉ hiện trên máy của chính họ** và mất khi tải lại trang.
Thiệp này là trang tĩnh, không có máy chủ để lưu. Muốn thật sự nhận được lời
chúc thì phải nối vào một dịch vụ lưu trữ — gợi ý cách làm bằng Google Form ghi
ở cuối `js/wishes.js`.

---

## Hỗ trợ trình duyệt

Chạy tốt trên Chrome, Safari (kể cả iPhone), Firefox, Edge bản mới, và trình
duyệt trong ứng dụng nhắn tin (Messenger, Zalo).

Trình duyệt quá cũ không có `IntersectionObserver` thì mất hiệu ứng bay vào,
**ảnh vẫn hiện đầy đủ bình thường** — hiệu ứng được thiết kế để hỏng một cách
an toàn, không bao giờ làm ảnh kẹt ở trạng thái ẩn.
