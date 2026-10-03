/* ============================================================================
   SỔ LƯU BÚT — khách nhập tên + lời chúc, bấm gửi thì lời chúc hiện ngay bên
   dưới (mới nhất trên cùng) và được LƯU vào Google Sheets qua Apps Script.
   Khi mở trang, danh sách lời chúc đã lưu được tải về cho mọi khách xem.

   API_URL là URL Web App của Apps Script (dạng https://script.google.com/macros/s/
   .../exec). Để trống thì trang chạy như cũ: lời chúc chỉ hiện trên máy khách
   đó và mất khi tải lại.
   ========================================================================== */
(function () {
  'use strict';

  var API_URL = 'https://script.google.com/macros/s/AKfycbyjOwMpeTwQTQAJY3Ln0EaxTg_J_xorW8fHIipKgI7HaRT1Ehmy5CyEykr3NScS-6wT2w/exec';

  var GIOI_HAN_TEN = 60;
  var GIOI_HAN_LOI = 500;
  var GIAN_CACH_MS = 10000; /* chống gửi liên tiếp */

  var oTen  = document.getElementById('wish-ten');
  var oLoi  = document.getElementById('wish-loi');
  var oBay  = document.getElementById('wish-hp');
  var nut   = document.getElementById('nut-gui-loi-chuc');
  var danhSach = document.getElementById('wish-list');
  var trangThai = document.getElementById('wish-status');

  /* Thiếu bất kỳ phần nào thì thôi, không làm gì cả (tránh lỗi đỏ ở Console). */
  if (!oTen || !oLoi || !nut || !danhSach) return;

  var lanGuiCuoi = 0;

  function baoTrangThai(chu) {
    if (trangThai) trangThai.textContent = chu || '';
  }

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

  /* Tải các lời chúc đã lưu. Lỗi mạng thì giữ nguyên lời chúc mẫu. */
  function taiLoiChuc() {
    if (!API_URL) return;
    fetch(API_URL)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.ok || !d.wishes || !d.wishes.length) return;
        danhSach.textContent = ''; /* bỏ lời chúc mẫu */
        d.wishes.forEach(function (w) {
          danhSach.appendChild(taoKhoiLoiChuc(String(w.ten), String(w.loi)));
        });
      })
      .catch(function () { /* im lặng: vẫn hiện lời chúc mẫu */ });
  }

  function luu(ten, loiChuc) {
    return fetch(API_URL, {
      method: 'POST',
      /* Gửi dạng form + no-cors để khỏi bị chặn CORS preflight. */
      mode: 'no-cors',
      body: new URLSearchParams({
        ten: ten,
        loi: loiChuc,
        website: oBay ? oBay.value : ''
      })
    });
  }

  function gui() {
    var ten = oTen.value.trim().slice(0, GIOI_HAN_TEN);
    var loiChuc = oLoi.value.trim().slice(0, GIOI_HAN_LOI);

    /* Chưa viết lời chúc thì không gửi. Bỏ trống tên thì gọi là "Khách mời". */
    if (!loiChuc) {
      oLoi.focus();
      return;
    }
    if (!ten) ten = 'Khách mời';

    var bay = Date.now();
    if (API_URL && bay - lanGuiCuoi < GIAN_CACH_MS) {
      baoTrangThai('Bạn gửi hơi nhanh, vui lòng đợi vài giây nhé.');
      return;
    }

    /* Chèn lên ĐẦU danh sách để lời chúc mới nhất nằm trên cùng. */
    danhSach.insertBefore(taoKhoiLoiChuc(ten, loiChuc), danhSach.firstChild);

    /* Xoá trắng hai ô nhập cho người sau viết tiếp. */
    oTen.value = '';
    oLoi.value = '';

    if (!API_URL) return;

    lanGuiCuoi = bay;
    nut.disabled = true;
    baoTrangThai('Đang gửi…');
    luu(ten, loiChuc)
      .then(function () { baoTrangThai('Đã gửi, cảm ơn bạn!'); })
      .catch(function () { baoTrangThai('Chưa gửi được, bạn thử lại sau nhé.'); })
      .then(function () { nut.disabled = false; });
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

  taiLoiChuc();
})();
