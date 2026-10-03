/* ============================================================================
   ĐẾM NGƯỢC + NÚT "THÊM VÀO LỊCH"

   Mỗi giây tính lại còn bao nhiêu ngày/giờ/phút/giây tới giờ cưới rồi điền vào
   bốn ô trong #sec-countdown.

   ĐỔI NGÀY CƯỚI: sửa cấu hình đúng thiệp trong js/khach-moi.js.
   ========================================================================== */
(function () {
  'use strict';

  var thiep = window.THIEP_HIEN_TAI;
  var NGAY_CUOI = thiep.ngayCuoi;
  if (!Number.isFinite(Date.parse(NGAY_CUOI)) || !Number.isFinite(Date.parse(thiep.ketThuc))) {
    if (window.console && console.error) console.error('Ngày bắt đầu hoặc kết thúc của thiệp không hợp lệ.');
    return;
  }
  function utc(ngay) {
    return new Date(ngay).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  }
  var BAT_DAU_UTC = utc(NGAY_CUOI);
  var KET_THUC_UTC = utc(thiep.ketThuc);
  var nhan = document.querySelector('.cd-date');
  if (nhan) {
    // Dùng ngày giờ trong cấu hình (+07:00), không lệ thuộc múi giờ máy khách.
    nhan.textContent = NGAY_CUOI.slice(0, 10).split('-').reverse().join('.') +
      ' | ' + NGAY_CUOI.slice(11, 16) + ' (giờ Việt Nam)';
  }


  /* ══ 1. ĐẾM NGƯỢC ═══════════════════════════════════════════════════════ */

  /* Tìm sẵn bốn ô số. Mỗi ô đánh dấu bằng data-dem trong index.html. */
  var o = {
    ngay: document.querySelector('[data-dem="ngay"]'),
    gio:  document.querySelector('[data-dem="gio"]'),
    phut: document.querySelector('[data-dem="phut"]'),
    giay: document.querySelector('[data-dem="giay"]')
  };

  var moc = new Date(NGAY_CUOI).getTime();

  /* Thêm số 0 phía trước cho đủ hai chữ số: 7 -> "07". */
  function haiChuSo(n) {
    return String(Math.max(0, n)).padStart(2, '0');
  }

  function capNhat() {
    /* Còn bao nhiêu mili-giây nữa. Qua ngày cưới rồi thì để 0, không đếm âm. */
    var conLai = Math.max(0, moc - Date.now());

    var ngay = Math.floor(conLai / 86400000);        /* 1 ngày = 86.400.000 ms */
    var gio  = Math.floor(conLai / 3600000) % 24;    /* 1 giờ  =  3.600.000 ms */
    var phut = Math.floor(conLai / 60000) % 60;
    var giay = Math.floor(conLai / 1000) % 60;

    if (o.ngay) o.ngay.textContent = haiChuSo(ngay);
    if (o.gio)  o.gio.textContent  = haiChuSo(gio);
    if (o.phut) o.phut.textContent = haiChuSo(phut);
    if (o.giay) o.giay.textContent = haiChuSo(giay);
  }

  capNhat();                  /* điền ngay, không để trống một giây đầu */
  setInterval(capNhat, 1000); /* rồi cập nhật mỗi giây */


  /* ══ 2. NÚT "THÊM VÀO LỊCH" ═════════════════════════════════════════════
     Mở biểu mẫu Google Calendar với sự kiện đã điền sẵn cho đúng ngày thiệp. */

  var nut = document.getElementById('nut-them-lich');
  if (nut) {
    function thamSoLich(ten, giaTri) {
      return '&' + ten + '=' + encodeURIComponent(giaTri);
    }
    nut.href = 'https://calendar.google.com/calendar/r/eventedit?action=TEMPLATE' +
      thamSoLich('dates', BAT_DAU_UTC + '/' + KET_THUC_UTC) +
      thamSoLich('stz', 'Asia/Ho_Chi_Minh') +
      thamSoLich('etz', 'Asia/Ho_Chi_Minh') +
      thamSoLich('text', thiep.tenLe) +
      thamSoLich('location', thiep.diaDiem) +
      thamSoLich('details', 'Ngày vui của chúng mình, rất mong có bạn.');
  }
})();
