/* Bìa phong bì: khoá cuộn trang cho tới khi khách mời bấm vào bìa, rồi
   mờ dần để lộ trang thiệp. Chạy độc lập với runtime dc — #env-cover nằm
   ngoài <x-dc> nên không bị boot() thay thế. */
(function () {
  var cover = document.getElementById('env-cover');
  if (!cover) return;

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
