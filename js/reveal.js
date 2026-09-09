/* ============================================================================
   HIỆU ỨNG ẢNH BAY VÀO KHI CUỘN TỚI

   Ảnh của bốn phần album / strip / collage / layer nằm sẵn hơi lệch và mờ;
   cuộn tới đâu thì ảnh phần đó trôi về đúng chỗ và hiện rõ dần.

   File này chỉ làm một việc: gắn class .da-hien cho phần vừa lọt vào màn hình.
   Hình dáng hiệu ứng (lệch bao nhiêu, trễ bao lâu, bay từ hướng nào) nằm hết
   trong css/reveal.css.

   AN TOÀN: chỉ bật hiệu ứng khi chắc chắn tắt được. Trình duyệt quá cũ, không
   có IntersectionObserver, thì thoát ngay và không gắn .reveal-on — khi đó
   css/reveal.css không áp dụng gì cả và ảnh hiện bình thường. Thà không có
   hiệu ứng còn hơn để ảnh kẹt ở trạng thái ẩn.
   ========================================================================== */
(function () {
  'use strict';

  var CAC_PHAN = ['#sec-album', '#sec-strip', '#sec-collage', '#sec-layer'];
  var root = document.documentElement;

  if (!('IntersectionObserver' in window)) return;

  /* Bật khối CSS: từ giờ ảnh của bốn phần trên nằm ở trạng thái chờ. */
  root.classList.add('reveal-on');

  var theoDoi = new IntersectionObserver(function (danhSach) {
    danhSach.forEach(function (muc) {
      if (!muc.isIntersecting) return;
      muc.target.classList.add('da-hien');
      /* Hiện rồi thì thôi theo dõi nữa — cuộn lên cuộn xuống không lặp lại. */
      theoDoi.unobserve(muc.target);
    });
  }, {
    /* Thấy khoảng 1/8 phần và qua khỏi mép dưới một chút mới chạy, để ảnh
       không bắt đầu bay khi còn nằm ngoài tầm mắt. */
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px'
  });

  CAC_PHAN.forEach(function (ten) {
    var phan = document.querySelector(ten);
    if (phan) theoDoi.observe(phan);
  });
})();
