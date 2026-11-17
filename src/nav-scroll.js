/*--------------------
Nav Scroll Background JS
Fades .nav_bar-inner to the theme foreground color once the page is scrolled.
--------------------*/

export function initNavScrollBackground() {
  const navInners = document.querySelectorAll(".nav_bar-inner");
  if (!navInners.length) return;

  const THRESHOLD = 50; // px scrolled before the background fades in
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  navInners.forEach((inner) => {
    inner.style.transition = reduceMotion
      ? "none"
      : "background-color 0.4s cubic-bezier(0.625, 0.05, 0, 1), padding 0.4s cubic-bezier(0.625, 0.05, 0, 1)";
  });

  let scrolled = null;
  const setScrolled = (state) => {
    if (state === scrolled) return;
    scrolled = state;
    navInners.forEach((inner) => {
      // Uses the nav's own color scheme token, so it follows the nav variant (dark/light)
      inner.style.backgroundColor = state ? "var(--_color-schemes---foreground)" : "";
      // Add side padding so the logo/links aren't flush against the filled background
      inner.style.paddingLeft = state ? "1rem" : "";
      inner.style.paddingRight = state ? "1rem" : "";
    });
  };

  // Only depends on distance from the top, so the nav stays filled all the way
  // to the bottom of the page, even if the page grows after load.
  // Lenis scrolls the window natively, so this fires with smooth scroll too.
  const onScroll = () => setScrolled(window.scrollY > THRESHOLD);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}
