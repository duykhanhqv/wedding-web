/* ============================================================================
   BÌA PHONG BÌ — dựng bìa và xử lý thao tác mở thiệp.

   Bìa được dựng bằng JS (không nằm trong index.html) để mỗi khách mời có thể
   thấy tên riêng của mình: tên lấy từ đường dẫn (?k=<mã> hoặc ?ten=<tên>) rồi
   tra trong js/khach-moi.js — sửa danh sách khách ở file đó, không cần đụng
   vào đây.

   Bìa nằm ngoài <x-dc> nên runtime dc không đụng tới. Trang bị khoá cuộn cho
   tới khi khách chạm mở, sau đó bìa mờ dần rồi bị gỡ khỏi trang.
   Giao diện của bìa: css/envelope.css
   ========================================================================== */
(function () {
  var danhSach = window.KHACH_MOI || {};
  var macDinh = window.KHACH_MAC_DINH || '';

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

    var ten = tenKhach();
    if (ten) duoi.appendChild(the('div', 'env-guest', ten));

    var mo = the('div', 'env-open');
    mo.appendChild(the('span', null, 'Chạm để mở thiệp'));
    duoi.appendChild(mo);

    cover.appendChild(tren);
    cover.appendChild(duoi);
    return cover;
  }

  var cover = dungBia();
  document.body.insertBefore(cover, document.body.firstChild);

  var root = document.documentElement;
  root.classList.add('env-lock');
  try { window.scrollTo(0, 0); } catch (e) {}

  var opened = false;

  function open() {
    if (opened) return;
    opened = true;
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
