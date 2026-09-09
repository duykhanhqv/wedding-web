/* ============================================================================
   ĐẾM NGƯỢC + NÚT "THÊM VÀO LỊCH"

   Mỗi giây tính lại còn bao nhiêu ngày/giờ/phút/giây tới giờ cưới rồi điền vào
   bốn ô trong #sec-countdown.

   ĐỔI NGÀY CƯỚI: sửa ba dòng trong khối THÔNG TIN ĐÁM CƯỚI ngay bên dưới.
   Nhớ sửa cả dòng chữ "14.11.2026 | 10:00 AM" trong index.html cho khớp.
   ========================================================================== */
(function () {
  'use strict';

  /* ══ THÔNG TIN ĐÁM CƯỚI — sửa ở đây ═════════════════════════════════════ */

  var NGAY_CUOI = '2026-11-14T10:00:00+07:00';   /* +07:00 là giờ Việt Nam */
  var TEN_LE    = 'Lễ cưới Khánh & Nhung';
  var DIA_DIEM  = 'Tư gia, Tà Lài, Tân Phú, Đồng Nai';

  /* Giờ bắt đầu và kết thúc để ghi vào file lịch, viết theo giờ UTC.
     Giờ Việt Nam sớm hơn UTC 7 tiếng, nên 10:00 ngày 14/11 ở Việt Nam
     = 03:00 cùng ngày theo UTC. Dạng chuỗi: NĂM THÁNG NGÀY "T" GIỜ PHÚT GIÂY "Z". */
  var BAT_DAU_UTC = '20261114T030000Z';   /* 10:00 giờ Việt Nam */
  var KET_THUC_UTC = '20261114T070000Z';  /* 14:00 giờ Việt Nam */


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
      'UID:khanh-nhung-20261114@invite',
      'DTSTAMP:' + BAT_DAU_UTC,
      'DTSTART:' + BAT_DAU_UTC,
      'DTEND:' + KET_THUC_UTC,
      'SUMMARY:' + TEN_LE,
      'LOCATION:' + DIA_DIEM,
      'DESCRIPTION:Ngày vui của chúng mình, rất mong có bạn.',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  }

  function taiFileLich() {
    var duLieu = new Blob([taoNoiDungLich()], { type: 'text/calendar;charset=utf-8' });
    var duongDan = URL.createObjectURL(duLieu);

    /* Cách tải file về: tạo tạm một thẻ <a download>, bấm nó rồi bỏ đi. */
    var a = document.createElement('a');
    a.href = duongDan;
    a.download = 'le-cuoi-khanh-nhung.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();

    /* Dọn bộ nhớ sau khi trình duyệt đã tải xong. */
    setTimeout(function () { URL.revokeObjectURL(duongDan); }, 4000);
  }

  if (nut) nut.addEventListener('click', taiFileLich);
})();
