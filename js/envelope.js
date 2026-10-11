/* ============================================================================
   BÌA PHONG BÌ — dựng bìa và xử lý thao tác mở thiệp.

   Bìa được dựng bằng JS (không nằm trong index.html) để mỗi khách mời có thể
   thấy tên riêng của mình: tên lấy từ đường dẫn (?k=<mã> hoặc ?ten=<tên>) rồi
   tra trong js/khach-moi.js — sửa danh sách khách ở file đó, không cần đụng
   vào đây.

   Trang bị khoá cuộn cho tới khi khách chạm mở, sau đó bìa mờ dần rồi bị gỡ
   khỏi trang.
   Giao diện của bìa: css/envelope.css
   ========================================================================== */
(function () {
  var danhSach = window.THIEP_HIEN_TAI.khachMoi;
  var macDinh = window.THIEP_HIEN_TAI.tenMacDinh;

  /* Đọc tham số trên đường dẫn. Tự tách chuỗi thay vì dùng URLSearchParams để
     chạy được cả trên trình duyệt cũ trong ứng dụng nhắn tin. */
  function thamSo(ten) {
    var m = new RegExp('[?&]' + ten + '=([^&]*)').exec(location.search || '');
    if (!m) return '';
    try { return decodeURIComponent(m[1].replace(/\+/g, ' ')); }
    catch (e) { return ''; }
  }

  function tenKhach() {
    var ten = thamSo('ten').trim();
    if (ten) return ten;
    var ma = thamSo('k').trim().toLowerCase();
    if (ma && Object.prototype.hasOwnProperty.call(danhSach, ma)) return danhSach[ma];
    return macDinh;
  }

  function the(tag, cls, chu) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    // textContent (không phải innerHTML): tên lấy từ đường dẫn nên phải để
    // trình duyệt hiểu đó là chữ, không phải thẻ HTML.
    if (chu) el.textContent = chu;
    return el;
  }

  /* Font tên khách trên phong bì dùng bảng mã VNI cũ. Giữ dữ liệu và URL ở
     dạng Unicode, chỉ chuyển mã ngay trước khi hiển thị bằng font đó. */
  function unicodeSangVni(chu) {
    var dau = { '\u0300': 'ø', '\u0301': 'ù', '\u0309': 'û', '\u0303': 'õ', '\u0323': 'ï' };
    var dauI = { '\u0300': 'ì', '\u0301': 'í', '\u0309': 'æ', '\u0303': 'ó', '\u0323': 'ò' };
    var dauY = { '\u0300': 'yø', '\u0301': 'yù', '\u0309': 'yû', '\u0303': 'yõ', '\u0323': 'î' };
    var bienThe = {
      'a\u0302': { '': 'aâ', '\u0300': 'aà', '\u0301': 'aá', '\u0309': 'aå', '\u0303': 'aã', '\u0323': 'aä' },
      'a\u0306': { '': 'aê', '\u0300': 'aè', '\u0301': 'aé', '\u0309': 'aú', '\u0303': 'aü', '\u0323': 'aë' },
      'e\u0302': { '': 'eâ', '\u0300': 'eà', '\u0301': 'eá', '\u0309': 'eå', '\u0303': 'eã', '\u0323': 'eä' },
      'o\u0302': { '': 'oâ', '\u0300': 'oà', '\u0301': 'oá', '\u0309': 'oå', '\u0303': 'oã', '\u0323': 'oä' },
      'o\u031b': { '': 'ô', '\u0300': 'ôø', '\u0301': 'ôù', '\u0309': 'ôû', '\u0303': 'ôõ', '\u0323': 'ôï' },
      'u\u031b': { '': 'ö', '\u0300': 'öø', '\u0301': 'öù', '\u0309': 'öû', '\u0303': 'öõ', '\u0323': 'öï' }
    };

    if (!String.prototype.normalize) return chu;
    return chu.normalize('NFD').replace(/([A-Za-zĐđ])([\u0300\u0301\u0302\u0303\u0306\u0309\u031b\u0323]{0,2})/g,
      function (_, goc, cacDau) {
        if (goc === 'đ') return 'ñ';
        if (goc === 'Đ') return 'Ñ';
        var thuong = goc.toLowerCase();
        var dang = (cacDau.match(/[\u0302\u0306\u031b]/) || [''])[0];
        var thanh = (cacDau.match(/[\u0300\u0301\u0303\u0309\u0323]/) || [''])[0];
        var ketQua;
        if (dang && bienThe[thuong + dang]) ketQua = bienThe[thuong + dang][thanh || ''];
        else if (thuong === 'i') ketQua = dauI[thanh] || 'i';
        else if (thuong === 'y') ketQua = dauY[thanh] || 'y';
        else ketQua = thuong + (dau[thanh] || '');
        return goc === goc.toUpperCase() ? ketQua.toUpperCase() : ketQua;
      });
  }

  function apDungFontVni(el, chuUnicode) {
    if (!String.prototype.normalize) return;
    var chuVni = unicodeSangVni(chuUnicode);
    function apDung() {
      el.textContent = chuVni;
      el.classList.add('is-vni');
    }
    if (document.fonts && typeof document.fonts.load === 'function') {
      document.fonts.load("400 34px 'Fleur De Leah'").then(function (fontDaTai) {
        if (fontDaTai.length) apDung();
      }).catch(function () {});
    }
  }

  var tenMoi = tenKhach();

  function dungBia() {
    var cover = the('div');
    cover.id = 'env-cover';
    cover.setAttribute('role', 'button');
    cover.setAttribute('tabindex', '0');
    cover.setAttribute('aria-label', 'Mở thiệp cưới Khánh và Nhung');

    var tren = the('div', 'env-top');
    tren.appendChild(the('div', 'env-names', 'Khánh & Nhung'));

    var duoi = the('div', 'env-bottom');
    duoi.appendChild(the('div', 'env-lead', 'Thân mời'));

    if (tenMoi) {
      var khach = the('div', 'env-guest');
      // Tách phần " + ♥" để căn chỉnh khoảng cách, font và vị trí thẳng hàng
      var phan = tenMoi.split(/\s*\+\s*(.*)$/);
      if (phan.length > 1) {
        var tenVni = the('span', 'env-guest-name', phan[0]);
        khach.appendChild(tenVni);
        apDungFontVni(tenVni, phan[0]);
        var extra = the('span', 'env-guest-extra');
        extra.appendChild(the('span', 'env-guest-plus', '+'));
        var tim = phan[1] ? phan[1].trim() : '♥';
        extra.appendChild(the('span', 'env-guest-heart', tim));
        khach.appendChild(extra);
      } else {
        var tenVniDayDu = the('span', 'env-guest-name', tenMoi);
        khach.appendChild(tenVniDayDu);
        apDungFontVni(tenVniDayDu, tenMoi);
      }
      duoi.appendChild(khach);
    }

    var mo = the('div', 'env-open');
    mo.appendChild(the('span', null, 'Chạm để mở thiệp'));
    duoi.appendChild(mo);

    cover.appendChild(tren);
    cover.appendChild(duoi);
    return cover;
  }

  var cover = dungBia();
  document.body.insertBefore(cover, document.body.firstChild);

  /* Cùng tên khách trên phong bì được đặt vào ô trống của trang thiệp thứ hai. */
  var trangHai = document.getElementById('sec-page-2');
  if (trangHai && tenMoi) {
    var guestEl = the('div', 'invite-guest-name');
    var phan2 = tenMoi.split(/\s*\+\s*(.*)$/);
    if (phan2.length > 1) {
      guestEl.appendChild(the('span', 'invite-guest-name-text', phan2[0]));
      var extra2 = the('span', 'invite-guest-extra');
      extra2.appendChild(the('span', 'invite-guest-plus', '+'));
      var tim2 = phan2[1] ? phan2[1].trim() : '♥';
      extra2.appendChild(the('span', 'invite-guest-heart', tim2));
      guestEl.appendChild(extra2);
    } else {
      guestEl.appendChild(the('span', 'invite-guest-name-text', tenMoi));
    }
    trangHai.appendChild(guestEl);
  }

  var root = document.documentElement;
  root.classList.add('env-lock');
  try { window.scrollTo(0, 0); } catch (e) {}

  var opened = false;
  var nhac = new Audio('assets/LoThuongNhau.mp3');
  nhac.loop = true;
  nhac.preload = 'none';

  var nutNhac = the('button', 'music-toggle');
  nutNhac.type = 'button';
  nutNhac.hidden = true;
  var hinhDia = the('img');
  hinhDia.src = 'assets/Record.png';
  hinhDia.alt = '';
  nutNhac.appendChild(hinhDia);
  document.body.appendChild(nutNhac);

  function capNhatNutNhac() {
    var dangPhat = !nhac.paused;
    nutNhac.classList.toggle('is-playing', dangPhat);
    nutNhac.setAttribute('aria-pressed', String(dangPhat));
    nutNhac.setAttribute('aria-label', dangPhat ? 'Dừng nhạc' : 'Phát nhạc');
    nutNhac.title = dangPhat ? 'Dừng nhạc' : 'Phát nhạc';
  }

  function phatNhac() {
    try {
      var ketQuaPhat = nhac.play();
      if (ketQuaPhat && typeof ketQuaPhat.catch === 'function') {
        ketQuaPhat.catch(capNhatNutNhac);
      }
    } catch (e) {
      capNhatNutNhac();
    }
  }

  nhac.addEventListener('play', capNhatNutNhac);
  nhac.addEventListener('pause', capNhatNutNhac);
  nhac.addEventListener('error', capNhatNutNhac);
  nutNhac.addEventListener('click', function () {
    if (nhac.paused) phatNhac();
    else nhac.pause();
  });
  capNhatNutNhac();

  function open() {
    if (opened) return;
    opened = true;
    /* Phát ngay trong thao tác mở để trình duyệt cho phép âm thanh. */
    phatNhac();
    nutNhac.hidden = false;
    cover.classList.add('is-open');
    root.classList.remove('env-lock');
    root.classList.add('env-opening');
    setTimeout(function () {
      cover.classList.add('is-done');
      cover.setAttribute('aria-hidden', 'true');
      root.classList.remove('env-opening');
    }, 800);
  }

  cover.addEventListener('click', open);
  cover.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      open();
    }
  });
})();
