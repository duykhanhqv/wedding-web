/* ============================================================================
   CAROUSEL — đổi giữa hai lớp ảnh

   Ba phần #sec-strip, #sec-collage, #sec-layer mỗi phần có HAI lớp ảnh chồng
   khít lên nhau (thẻ .lop-anh trong index.html):
       lớp 1 = ảnh 01–03 (đang dùng)
       lớp 2 = ảnh 04–06 (chưa gán ảnh)

   File này chỉ làm một việc: đặt data-hien="1" cho lớp đang hiện và "0" cho
   lớp đang ẩn. Phần mờ dần khi đổi là do CSS lo (xem khối CAROUSEL ở cuối
   css/sections.css).

   HIỆN TẠI CHƯA CÓ NÚT CHUYỂN nên lúc nào cũng hiện lớp 1. Đó là cố ý: lớp 2
   chưa có ảnh. Khi nào gắn xong ảnh 04–06 vào index.html thì bật chuyển lớp
   theo một trong hai cách ở cuối file này.
   ========================================================================== */
(function () {
  'use strict';

  /* Gom các lớp ảnh theo tên phần:
       { strip: [lớp1, lớp2], collage: [...], layer: [...] }
     Tên phần lấy từ thuộc tính data-lop trong index.html. */
  var cacPhan = {};

  document.querySelectorAll('.lop-anh').forEach(function (lop) {
    var ten = lop.getAttribute('data-lop');
    if (!ten) return;
    if (!cacPhan[ten]) cacPhan[ten] = [];
    cacPhan[ten].push(lop);
  });

  /* Hiện lớp thứ `viTri` (0 là lớp đầu) của một phần, ẩn các lớp còn lại. */
  function hienLop(tenPhan, viTri) {
    var danhSach = cacPhan[tenPhan];
    if (!danhSach) return;
    danhSach.forEach(function (lop, i) {
      lop.setAttribute('data-hien', i === viTri ? '1' : '0');
    });
  }

  /* Chuyển sang lớp kế tiếp, hết lớp thì quay lại lớp đầu. */
  function lopKeTiep(tenPhan) {
    var danhSach = cacPhan[tenPhan];
    if (!danhSach || danhSach.length < 2) return;
    var dangHien = danhSach.findIndex(function (lop) {
      return lop.getAttribute('data-hien') === '1';
    });
    hienLop(tenPhan, (dangHien + 1) % danhSach.length);
  }

  /* Mở ra ngoài để chỗ khác gọi được (ví dụ nút bấm bạn thêm sau này). */
  window.carousel = {
    hienLop: hienLop,
    lopKeTiep: lopKeTiep
  };

  /* ══ CÁCH BẬT CHUYỂN LỚP KHI ĐÃ CÓ ẢNH 04–06 ════════════════════════════

     Cách 1 — tự đổi sau mỗi 5 giây:

         setInterval(function () {
           lopKeTiep('strip');
           lopKeTiep('collage');
           lopKeTiep('layer');
         }, 5000);

     Cách 2 — thêm nút bấm. Đặt nút vào index.html:

         <button type="button" id="nut-doi-anh">Xem ảnh khác</button>

     rồi thêm vào đây:

         document.getElementById('nut-doi-anh')
                 .addEventListener('click', function () { lopKeTiep('strip'); });
     ═══════════════════════════════════════════════════════════════════════ */
})();
