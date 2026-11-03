/*--------------------
Basic Nav JS
--------------------*/

export function initBasicNavigationBar() {
  document.querySelectorAll('[data-nav-status]').forEach((nav) => {
    const controls = nav.querySelectorAll('[data-nav-control]');
    const subNavs = nav.querySelectorAll('[data-nav-sub-status]');
    const toggle = nav.querySelector('[data-nav-control="toggle"]');

    function setNav(active) {
      nav.setAttribute('data-nav-status', active ? 'active' : 'not-active');
      toggle?.setAttribute('aria-expanded', active);
      toggle?.setAttribute('aria-label', active ? 'Close navigation' : 'Open navigation');

      if (!active) subNavs.forEach((subNav) => {
        subNav.setAttribute('data-nav-sub-status', 'not-active');
        subNav.querySelector('[data-nav-sub-control]')?.setAttribute('aria-expanded',
          'false');
      });
    }

    controls.forEach((control) => {
      control.addEventListener('click', () => {
        const action = control.getAttribute('data-nav-control');
        const active = nav.getAttribute('data-nav-status') === 'active';
        setNav(action === 'open' || (action === 'toggle' && !active));
      });
    });

    subNavs.forEach((subNav) => {
      const control = subNav.querySelector('[data-nav-sub-control]');
      if (!control) return;

      control.addEventListener('click', () => {
        if (!window.matchMedia('(max-width: 991px)').matches) return;

        const active = subNav.getAttribute('data-nav-sub-status') === 'active';

        subNavs.forEach((item) => {
          item.setAttribute('data-nav-sub-status', 'not-active');
          item.querySelector('[data-nav-sub-control]')?.setAttribute(
            'aria-expanded', 'false');
        });

        if (!active) {
          subNav.setAttribute('data-nav-sub-status', 'active');
          control.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.getAttribute('data-nav-status') === 'active') {
        setNav(false);
        toggle?.focus();
      }
    });

    setNav(false);
  });
}
