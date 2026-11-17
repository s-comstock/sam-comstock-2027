/*--------------------
Page Transition JS
Fades the page in once everything else has initialised, and fades it out
before following an internal link.

Webflow setup:
- Add data-page-transition to the page wrapper on every page
- Site-wide <head> custom code:
  <style>[data-page-transition]{opacity:0}</style>
- Add data-transition-prevent to any link that should skip the fade-out
- Call initPageTransition() LAST in index.js
--------------------*/

export function initPageTransition() {
  const wrap = document.querySelector("[data-page-transition]");
  if (!wrap) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fadeIn = reduceMotion ? 0 : 0.6;
  const fadeOut = reduceMotion ? 0 : 0.4;
  let leaving = false;

  // Fade in (runs after every other module has set up)
  gsap.to(wrap, { autoAlpha: 1, duration: fadeIn, ease: "power2.out" });

  // Fade out, then go to the next page
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented) return; // another script already handled this click
    const link = e.target.closest("a");
    const href = link?.getAttribute("href");
    if (!href || href.startsWith("#") || link.hasAttribute("data-transition-prevent")) return;

    const url = new URL(link.href, location.href);
    if (
      url.origin !== location.origin || // external, mailto:, tel:
      link.target === "_blank" ||
      link.hasAttribute("download") ||
      e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || // open in new tab/window
      (url.pathname === location.pathname && url.hash) // anchor on this page
    ) return;

    e.preventDefault();
    if (leaving) return;
    leaving = true;

    gsap.to(wrap, {
      autoAlpha: 0,
      duration: fadeOut,
      ease: "power2.in",
      overwrite: true,
      onComplete: () => {
        location.href = url.href;
      },
    });
  });

  // Back/forward can restore this page from cache while faded out: show it again
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    leaving = false;
    gsap.set(wrap, { autoAlpha: 1 });
  });
}
