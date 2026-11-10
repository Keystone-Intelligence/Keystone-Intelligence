/* Services dropdown in the site header.
   Without this script the panel still opens on hover and keyboard focus
   (see site.css). With it, the button also toggles on click, reports its
   state through aria-expanded, and closes on Escape, on an outside click,
   or when focus leaves the menu. */
(function () {
  'use strict';
  var menus = document.querySelectorAll('.nav-dd');
  if (!menus.length) return;

  menus.forEach(function (menu) {
    var btn = menu.querySelector('.nav-dd__btn');
    if (!btn) return;
    menu.setAttribute('data-enhanced', '');

    function setOpen(open) {
      menu.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    btn.addEventListener('click', function () {
      setOpen(!menu.classList.contains('is-open'));
    });

    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        setOpen(false);
        btn.focus();
      }
    });

    menu.addEventListener('focusout', function (e) {
      if (!menu.contains(e.relatedTarget)) setOpen(false);
    });

    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target)) setOpen(false);
    });
  });
})();
