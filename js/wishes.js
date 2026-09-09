/* ============================================================================
   SỔ LƯU BÚT — khách nhập tên + lời chúc, bấm gửi thì lời chúc hiện ngay bên
   dưới, mới nhất nằm trên cùng.

   LƯU Ý QUAN TRỌNG: lời chúc chỉ hiện trên MÁY CỦA CHÍNH KHÁCH ĐÓ và mất khi
   tải lại trang — thiệp này là trang tĩnh, không có máy chủ để lưu. Muốn thật
   sự nhận được lời chúc thì phải nối vào một dịch vụ lưu trữ (Google Form,
   Firebase, Google Sheets...) — xem gợi ý ở cuối file.
   ========================================================================== */
(function () {
  'use strict';

  var oTen  = document.getElementById('wish-ten');
  var oLoi  = document.getElementById('wish-loi');
  var nut   = document.getElementById('nut-gui-loi-chuc');
  var danhSach = document.getElementById('wish-list');

  /* Thiếu bất kỳ phần nào thì thôi, không làm gì cả (tránh lỗi đỏ ở Console). */
  if (!oTen || !oLoi || !nut || !danhSach) return;

  /* Dựng một khối lời chúc mới.
     Dùng textContent chứ KHÔNG dùng innerHTML: chữ do khách gõ vào, nếu ghép
     thẳng vào HTML thì người ta gõ thẻ HTML vào sẽ chạy thật (lỗ hổng XSS). */
  function taoKhoiLoiChuc(ten, loiChuc) {
    var khoi = document.createElement('div');
    khoi.className = 'wish-item';

    var doTen = document.createElement('div');
    doTen.className = 'wish-name';
    doTen.textContent = ten;

    var doLoi = document.createElement('div');
    doLoi.className = 'wish-msg';
    doLoi.textContent = loiChuc;

    khoi.appendChild(doTen);
    khoi.appendChild(doLoi);
    return khoi;
  }

  function gui() {
    var ten = oTen.value.trim();
    var loiChuc = oLoi.value.trim();

    /* Chưa viết lời chúc thì không gửi. Bỏ trống tên thì gọi là "Khách mời". */
    if (!loiChuc) {
      oLoi.focus();
      return;
    }
    if (!ten) ten = 'Khách mời';

    /* Chèn lên ĐẦU danh sách để lời chúc mới nhất nằm trên cùng. */
    danhSach.insertBefore(taoKhoiLoiChuc(ten, loiChuc), danhSach.firstChild);

    /* Xoá trắng hai ô nhập cho người sau viết tiếp. */
    oTen.value = '';
    oLoi.value = '';
  }

  nut.addEventListener('click', gui);

  /* Đang gõ trong ô tên mà bấm Enter thì gửi luôn cho tiện.
     (Ô lời chúc không làm vậy vì Enter ở đó là xuống dòng.) */
  oTen.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      gui();
    }
  });

  /* ══ MUỐN THẬT SỰ NHẬN ĐƯỢC LỜI CHÚC ════════════════════════════════════
     Cách nhẹ nhất là gửi thêm về một Google Form: tạo form có 2 câu hỏi (tên,
     lời chúc), lấy mã "entry.xxx" của từng ô rồi thêm vào hàm gui() ở trên:

         fetch('https://docs.google.com/forms/d/e/<MÃ_FORM>/formResponse', {
           method: 'POST',
           mode: 'no-cors',
           body: new URLSearchParams({
             'entry.111111': ten,
             'entry.222222': loiChuc
           })
         });

     Lời chúc sẽ chảy về bảng tính của Google Form, còn phần hiện trên trang
     vẫn giữ nguyên như hiện tại.
     ═══════════════════════════════════════════════════════════════════════ */
})();
