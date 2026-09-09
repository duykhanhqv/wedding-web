/* Hiệu ứng "bay vào" khi cuộn tới — phần điều khiển.

   Việc duy nhất của file này: khi một phần lọt vào màn hình thì gắn cờ của
   phần đó (.rv-album / .rv-strip / .rv-collage / .rv-layer) lên thẻ <html>.
   Hình dáng hiệu ứng (lệch bao nhiêu, trễ bao lâu, bay từ hướng nào) nằm hết
   trong css/reveal.css.

   Cờ gắn lên <html>, KHÔNG gắn lên chính <section>: <section> nằm trong phần
   trang do runtime dc (React) dựng và quản lý, class gắn thêm vào đó không
   chắc còn hiệu lực sau mỗi lần vẽ lại. <html> nằm ngoài tầm đó.

   Nguyên tắc an toàn: chỉ bật hiệu ứng khi chắc chắn tắt được. Trình duyệt
   không có IntersectionObserver thì thoát ngay, không gắn .reveal-on, ảnh
   hiện bình thường — thà không có hiệu ứng còn hơn ảnh bị ẩn luôn.

   VÌ SAO PHẢI ĐỂ js/component.js GỌI VÀO:
   Runtime dc dựng lại toàn bộ phần thân trang sau khi file này chạy. Mọi
   setInterval / MutationObserver đặt trước lúc đó đều bị huỷ, và các <section>
   cũ bị thay bằng phần tử mới — nên nếu chỉ tự chạy một lần ở đây thì hiệu ứng
   im lặng không bao giờ gắn được. Biến trên window thì vẫn còn, nên file này
   chỉ ĐỊNH NGHĨA sẵn window.hieuUngCuon(), rồi js/component.js gọi nó trong
   componentDidMount/componentDidUpdate — lúc đó DOM đã là bản cuối cùng.

   Gọi bao nhiêu lần cũng được: phần nào theo dõi rồi thì bỏ qua. */
(function () {
  'use strict';

  if (!('IntersectionObserver' in window) || !document.documentElement) return;

  /* phần trong trang  ->  cờ tương ứng gắn lên <html> */
  var PHAN = {
    '#sec-album':   'rv-album',
    '#sec-strip':   'rv-strip',
    '#sec-collage': 'rv-collage',
    '#sec-layer':   'rv-layer'
  };
  var TEN = Object.keys(PHAN);
  var root = document.documentElement;

  /* Bật khối CSS ngay, trước khi runtime dc dựng nội dung, để ảnh sinh ra là
     đã ở sẵn trạng thái chờ — không bị loé lên rồi mới ẩn đi. */
  root.classList.add('reveal-on');

  var theoDoi = new IntersectionObserver(function (dsach) {
    dsach.forEach(function (muc) {
      if (!muc.isIntersecting) return;
      var co = muc.target.getAttribute('data-rv-co');
      if (co) root.classList.add(co);
      theoDoi.unobserve(muc.target);   /* hiện rồi thì thôi, cuộn lại không lặp */
    });
  }, {
    /* Đợi thấy khoảng 1/8 phần và qua khỏi mép dưới một chút mới chạy, để ảnh
       không bắt đầu bay khi còn nằm ngoài tầm mắt. */
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px'
  });

  var daGan = [];   /* các <section> đang được theo dõi */

  /* Gắn theo dõi cho những phần đã có mặt trong trang. Trả về true khi đủ cả
     bốn phần. An toàn khi gọi lặp lại: phần tử đã gắn thì bỏ qua, phần tử mới
     (do runtime dựng lại trang) thì gắn thêm. */
  window.hieuUngCuon = function () {
    var du = true;
    TEN.forEach(function (ten) {
      var el = document.querySelector(ten);
      if (!el) { du = false; return; }
      if (daGan.indexOf(el) === -1) {
        el.setAttribute('data-rv-co', PHAN[ten]);
        daGan.push(el);
        theoDoi.observe(el);
      }
    });
    return du;
  };

  window.hieuUngCuon();

  /* Chốt an toàn: component.js không gọi được (runtime lỗi, máy quá chậm...)
     thì sau 10 giây cho hiện thẳng những phần chưa gắn ra, không để ảnh kẹt ở
     trạng thái ẩn. */
  setTimeout(function () {
    if (window.hieuUngCuon()) return;
    TEN.forEach(function (ten) {
      var el = document.querySelector(ten);
      if (!el || daGan.indexOf(el) === -1) root.classList.add(PHAN[ten]);
    });
  }, 10000);
})();
