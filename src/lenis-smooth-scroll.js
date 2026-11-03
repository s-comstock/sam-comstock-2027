/*--------------------
Lenis Smooth Scroll JS
--------------------*/

export function initSmoothScroll() {
  if (!window.Lenis) {
    console.warn("Lenis not found. Smooth scrolling will not be initialized.");
    return null;
  }

  const lenis = new window.Lenis({
    lerp: 0.06, //Adjust the lerp value to control the smoothness of the scroll
    respectReducedMotion: true // Respect user's reduced motion preference
  });

  if (window.gsap && window.ScrollTrigger) {
    // Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
    lenis.on("scroll", ScrollTrigger.update);

    // Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
    // This ensures Lenis's smooth scroll animation updates on each GSAP tick
    gsap.ticker.add(time => {
      lenis.raf(time * 1000);
    });

    // Disable lag smoothing in GSAP to prevent any delay in scroll animations
    gsap.ticker.lagSmoothing(0);
  } else {
    // No GSAP on the page: drive Lenis with its own rAF loop
    const raf = time => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  window.lenis = lenis;

  return lenis;
}
