/* ============================================================================
   DANH SÁCH KHÁCH MỜI — đây là file duy nhất bạn cần sửa để thêm tên.

   Thêm vào khachMoi của đúng thiệp. Mỗi dòng có dạng:
       "mã": "Tên hiện trên bìa thiệp",

   • Mã viết không dấu, không khoảng trắng (dùng gạch ngang nếu dài):
       nam, chi-lan, gia-dinh-cau-tu
   • Tên thì viết thoải mái, có dấu, có "Anh/Chị/Gia đình..." tuỳ bạn.

   Gửi cho từng người đường dẫn kèm mã của họ:
       .../14/index.html?k=nam    → bìa hiện “Thân mời — Anh Nam”
       .../14/index.html?k=gia-dinh-cau-tu

   Muốn mời nhanh một người chưa có trong danh sách, gắn thẳng tên vào
   đường dẫn cũng được:
       .../15/index.html?ten=Anh%20Nam

   Mở file khach-moi.html bằng trình duyệt để xem danh sách kèm đường dẫn
   của từng người và bấm sao chép.

   Không có mã (hoặc mã sai) thì bìa dùng tenMacDinh của thiệp; để trống
   thì bìa không hiện dòng tên, đúng như bản chung.
   ========================================================================== */

window.THIEP_CUOI = {
  '14': {
    anh: [
      '14/invite-1.webp',
      '14/invite-2.webp',
      '14/invite-3.webp'
    ],
    ngayCuoi: '2026-11-14T11:00:00+07:00',
    ketThuc: '2026-11-14T14:00:00+07:00',
    tenLe: 'Lễ cưới Khánh & Nhung',
    diaDiem: 'Tư gia, Tà Lài, Tân Phú, Đồng Nai',
    tenMacDinh: '',
    khachMoi: {
      'nam': 'Anh Nam',
      'lan': 'Chị Lan',
      'gia-dinh-cau-tu': 'Gia đình cậu Tư'
    }
  },
  '15': {
    anh: [
      '15/invite-1.png',
      '15/invite-2.png',
      '15/invite-3.png'
    ],
    ngayCuoi: '2026-11-15T11:00:00+07:00',
    ketThuc: '2026-11-15T14:00:00+07:00',
    tenLe: 'Lễ cưới Khánh & Nhung',
    diaDiem: 'Nhà hàng tiệc cưới Tâm Palace, 91 Đ. Vành Đai Trong, An Lạc, Hồ Chí Minh',
    tenMacDinh: '',
    khachMoi: {
      // Thêm khách ngày 15 ở đây, ví dụ: 'nam': 'Anh Nam',
    }
  },
  '28': {
    anh: [
      '28/invite-1.png',
      '28/invite-2.png',
      '28/invite-3.png'
    ],
    ngayCuoi: '2026-11-28T16:00:00+07:00',
    ketThuc: '2026-11-28T19:00:00+07:00',
    tenLe: 'Lễ cưới Khánh & Nhung',
    diaDiem: 'Tư gia, Phúc Tâm, Quảng Ngọc, Thanh Hoá',
    tenMacDinh: '',
    khachMoi: {
      // Thêm khách ngày 28 ở đây, ví dụ: 'lan': 'Chị Lan',
    }
  }
};

/* Chọn cấu hình dùng chung cho ảnh, bìa và lịch. Thiệp thiếu/sai → ngày 14. */
(function () {
  function thamSo(ten) {
    var m = new RegExp('[?&]' + ten + '=([^&]*)').exec(location.search || '');
    if (!m) return '';
    try { return decodeURIComponent(m[1].replace(/\+/g, ' ')); }
    catch (e) { return ''; }
  }
  function thiepTuFolder() {
    var duongDan = (location.pathname || '').replace(/\/+$/, '');
    var phan = duongDan.split('/');
    var cuoi = phan[phan.length - 1];
    var thuMuc = cuoi === 'index.html' ? phan[phan.length - 2] : cuoi;
    return Object.prototype.hasOwnProperty.call(window.THIEP_CUOI, thuMuc) ? thuMuc : '';
  }
  // Trong trang của một thư mục, tên thư mục là nguồn xác định thiệp.
  // Tham số ?thiep=... chỉ phục vụ liên kết cũ mở từ index.html ở thư mục gốc.
  var ma = thiepTuFolder() || thamSo('thiep');
  if (!Object.prototype.hasOwnProperty.call(window.THIEP_CUOI, ma)) ma = '14';
  var thiep = window.THIEP_CUOI[ma];
  window.MA_THIEP = ma;
  window.THIEP_HIEN_TAI = thiep;
  window.thamSoThiep = thamSo;
  var ngayHienThi = thiep.ngayCuoi.slice(8, 10) + '/' +
    thiep.ngayCuoi.slice(5, 7) + '/' + thiep.ngayCuoi.slice(0, 4);
  document.title = 'Thiệp cưới Khánh & Nhung | ' + ngayHienThi;
  var anh = document.querySelectorAll('[data-trang-thiep]');
  for (var i = 0; i < anh.length; i++) {
    var trang = Number(anh[i].getAttribute('data-trang-thiep')) - 1;
    if (thiep.anh[trang]) anh[i].src = thiep.anh[trang];
    anh[i].alt = 'Thiệp mời ngày ' + ngayHienThi + ' — trang ' + (trang + 1);
  }
})();
