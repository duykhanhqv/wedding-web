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
  function chuLich(chu) {
    return chu.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n')
      .replace(/;/g, '\\;').replace(/,/g, '\\,');
  }
  // RFC 5545 giới hạn mỗi dòng ở 75 byte UTF-8. Dòng tiếp theo bắt đầu bằng
  // một dấu cách để ứng dụng lịch hiểu đây là phần nối của dòng trước.
  function soByteKyTu(ma) {
    if (ma <= 0x7f) return 1;
    if (ma <= 0x7ff) return 2;
    return 3;
  }
  function gapDongLich(dong) {
    var ketQua = [];
    var phan = '';
    var soByte = 0;
    for (var i = 0; i < dong.length; i++) {
      var kyTu = dong.charAt(i);
      var them = soByteKyTu(dong.charCodeAt(i));
      if (soByte + them > 75) {
        ketQua.push(phan);
        phan = ' ' + kyTu;
        soByte = 1 + them;
      } else {
        phan += kyTu;
        soByte += them;
      }
    }
    ketQua.push(phan);
    return ketQua.join('\r\n');
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
     Tạo một file .ics ngay trong trình duyệt rồi cho tải về. File .ics là
     định dạng lịch chuẩn, mở được bằng Lịch của iPhone, Google Calendar,
     Outlook... nên không cần liên kết riêng cho từng loại. */

  var nut = document.getElementById('nut-them-lich');

  function taoNoiDungLich() {
    /* Các dòng của file .ics phải nối bằng \r\n theo đúng chuẩn. */
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//wedding//invite//VI',
      'BEGIN:VEVENT',
      'UID:khanh-nhung-' + window.MA_THIEP + '-' + BAT_DAU_UTC + '@invite',
      'DTSTAMP:' + utc(Date.now()),
      'DTSTART:' + BAT_DAU_UTC,
      'DTEND:' + KET_THUC_UTC,
      'SUMMARY:' + chuLich(thiep.tenLe),
      'LOCATION:' + chuLich(thiep.diaDiem),
      'DESCRIPTION:' + chuLich('Ngày vui của chúng mình, rất mong có bạn.'),
      'END:VEVENT',
      'END:VCALENDAR',
      ''
    ].map(gapDongLich).join('\r\n');
  }

  function taiFileLich() {
    var duLieu = new Blob([taoNoiDungLich()], { type: 'text/calendar;charset=utf-8' });
    var duongDan = URL.createObjectURL(duLieu);

    /* Cách tải file về: tạo tạm một thẻ <a download>, bấm nó rồi bỏ đi. */
    var a = document.createElement('a');
    a.href = duongDan;
    a.download = 'le-cuoi-khanh-nhung-' + window.MA_THIEP + '.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();

    /* Dọn bộ nhớ sau khi trình duyệt đã tải xong. */
    setTimeout(function () { URL.revokeObjectURL(duongDan); }, 4000);
  }

  if (nut) nut.addEventListener('click', taiFileLich);
})();
