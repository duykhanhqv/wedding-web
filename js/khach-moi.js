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
      'nguyen': 'Nguyên iu dấu',
    }
  },
  '15': {
    anh: [
      '15/invite-1.webp',
      '15/invite-2.webp',
      '15/invite-3.webp'
    ],
    ngayCuoi: '2026-11-15T11:00:00+07:00',
    ketThuc: '2026-11-15T14:00:00+07:00',
    tenLe: 'Lễ cưới Khánh & Nhung',
    diaDiem: 'Nhà hàng tiệc cưới Tâm Palace, 191 Đ. Vành Đai Trong, An Lạc, Hồ Chí Minh',
    tenMacDinh: '',
    khachMoi: {

      // Danh sách khách mời ngày 15
      'hoa-phuong': 'bạn Hoa Phượng + ♥',
      'khoa': 'bạn Khoa + ♥',
      'minh-hieu': 'bạn Minh Hiếu + ♥',
      'khanh-pham': 'bạn Khánh Phạm + ♥',
      'gia-dinh-ban-duc': 'Gia đình bạn Đức',
      'minh-duc': 'bạn Minh Đức + ♥',
      'tam': 'bạn Tâm + ♥',
      'thuong': 'bạn Thương + ♥',
      'gia-dinh-ban-viet': 'Gia đình bạn Việt',
      'gia-dinh-ban-uyen': 'Gia đình bạn Uyên',
      'gia-dinh-ban-truong': 'Gia đình bạn Trường',
      'chi-anh': 'Chị Ánh + ♥',
      'em-phuong': 'Em Phương + ♥',
      'em-sang': 'Em Sang + ♥',
      'em-linh': 'Em Linh + ♥'
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
      'gia-dinh-ban-huyen-anh': 'Gia đình bạn Huyền Anh',
      'gia-dinh-ban-dung': 'Gia đình bạn Dung',
      'thuy': 'Bạn Thuỷ',
      'gia-dinh-ban-ha': 'Gia đình bạn Hà',
      'gia-dinh-ban-hong': 'Gia đình bạn Hồng',
      'gia-dinh-ban-thuong': 'Gia đình bạn Thương',
      'diem-quynh': 'Diễm Quỳnh + ♥',
      'quynh-anh': 'Bạn Quỳnh Anh + ♥',
      'gia-dinh-ban-phuong': 'Gia đình bạn Phương',
      'gia-dinh-ban-huyen-le': 'Gia đình bạn Huyền Lê',
      'gia-dinh-ban-bui-huyen': 'Gia đình bạn Bùi Huyền',
      'ngan': 'Ngân + ♥',
      'gia-dinh-ban-dung-2': 'Gia đình bạn Dung',
      'gia-dinh-ban-quan': 'Gia đình bạn Quân',
      'gia-dinh-ban-hung': 'Gia đình bạn Hùng',
      'gia-dinh-ban-toan': 'Gia đình bạn Toàn',
      'ha': 'Hà + ♥',
      'em-hai': 'Em Hải + ♥',
      'hoang': 'Hoàng',
      'gia-dinh-ban-hien': 'Gia đình bạn Hiền',
      'gia-dinh-ban-le-anh': 'Gia đình bạn Lê Anh',
      'quy': 'Bạn Quý + ♥',
      'thuat': 'Bạn Thuật + ♥',
      'hung': 'Bạn Hùng',
      'anh': 'Bạn Ánh + ♥',
      'huy': 'Bạn Huy + ♥',
      'han-huong': 'Hàn Hương + ♥'
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
  var lichBia = document.querySelector('.hero-schedule');
  if (lichBia) {
    var gio = Number(thiep.ngayCuoi.slice(11, 13));
    var phut = thiep.ngayCuoi.slice(14, 16);
    var buoi = gio >= 12 ? 'PM' : 'AM';
    var gio12 = gio % 12 || 12;
    lichBia.dateTime = thiep.ngayCuoi;
    var ngayBia = lichBia.querySelector('.hero-date');
    var gioBia = lichBia.querySelector('.hero-time');
    if (ngayBia) ngayBia.textContent = ngayHienThi.replace(/\//g, '.');
    if (gioBia) gioBia.textContent = 'AT ' + gio12 + (phut === '00' ? '' : ':' + phut) + ' ' + buoi;
  }
  var anh = document.querySelectorAll('[data-trang-thiep]');
  for (var i = 0; i < anh.length; i++) {
    var trang = Number(anh[i].getAttribute('data-trang-thiep')) - 1;
    if (thiep.anh[trang]) anh[i].src = thiep.anh[trang];
    anh[i].alt = 'Thiệp mời ngày ' + ngayHienThi + ' — trang ' + (trang + 1);
  }
})();
