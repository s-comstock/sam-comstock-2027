/*--------------------
Logo Marquee JS
--------------------*/

export function initLogoMarquee() {
  const marquees = document.querySelectorAll('[data-logo-marquee-component]');
  if (!marquees.length) return;

  const SECONDS_PER_LOGO = 4;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  marquees.forEach((marquee) => {
    // Prevent double-initialising (e.g. if the function is called twice)
    if (marquee.dataset.marqueeInit === 'true') return;

    const track = marquee.querySelector('[data-logo-marquee-track]');
    const logoSet = track?.querySelector('[data-marquee-logo-set]');
    if (!track || !logoSet) return;

    // Count logos in the original set only (before cloning)
    const logoCount = logoSet.children.length;
    if (!logoCount) return;

    // Duplicate the set so the loop is seamless
    const clone = logoSet.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    clone.querySelectorAll('a, button').forEach((el) => el.setAttribute('tabindex', '-1'));
    track.appendChild(clone);

    marquee.dataset.marqueeInit = 'true';

    if (reduceMotion) return;

    // Move each set by its own width, so the loop stays exact at any screen size
    const tween = gsap.to([logoSet, clone], {
      xPercent: -100,
      ease: 'none',
      duration: logoCount * SECONDS_PER_LOGO,
      repeat: -1,
    });

    // Pause while off-screen to save CPU/battery
    const observer = new IntersectionObserver(([entry]) => {
      entry.isIntersecting ? tween.play() : tween.pause();
    });
    observer.observe(marquee);
  });
}
