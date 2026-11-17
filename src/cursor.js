/*--------------------
Cursor JS
--------------------*/

// One [data-cursor-component] on the page follows the mouse.
// Hovering any element with data-cursor-text="..." expands the cursor
// from height 0 to auto and shows that text, with the letters rolling up
// like the Button Animate component. Leaving collapses it.
//
// Webflow setup:
// - [data-cursor-component] once on the page (e.g. in the page wrapper)
// - Inside it, give the text element data-cursor-text-target
//   (if it's missing, the component's first child is used)
// - On any element that should trigger it: data-cursor-text="See project"
// - Set [data-cursor-component] to display: none (hidden) in the Designer;
//   the JS shows it on hover and hides it again after it closes
// - Keep vertical padding and min-height off [data-cursor-component]
//   (they'd keep part of it showing at height 0). Put any vertical
//   spacing on the text element inside it instead.
//
// The JS fixes the cursor to the viewport and centres it on the pointer,
// so its place in the Webflow layout doesn't matter.

const CURSOR_DISPLAY = "inline-flex"; // display while visible (matches .cursor_component)
const CHAR_STAGGER = 0.01; // seconds between letters (same as Button Animate)
const CHAR_TRANSITION = "transform 0.6s cubic-bezier(0.625, 0.05, 0, 1)";

export function initCursor() {
  // Only on devices with a real hover (mouse/trackpad)
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const cursor = document.querySelector("[data-cursor-component]");
  if (!cursor) return;

  const textEl =
    cursor.querySelector("[data-cursor-text-target]") || cursor.firstElementChild || cursor;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = reduceMotion ? 0 : 0.4;
  const ease = "power3.inOut";

  gsap.set(cursor, {
    display: "none",
    position: "fixed",
    top: 0,
    left: 0,
    xPercent: -50,
    yPercent: -50,
    height: 0,
    minHeight: 0, // a min-height in Webflow would stop it closing fully
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: 1000,
  });

  /* Letter roll (same technique as button-character-stagger.js) */

  // Each letter is its own span with a copy of itself 1.3em below (text-shadow).
  // Rolling the spans up 1.3em swaps the letter for its copy.
  Object.assign(textEl.style, {
    overflow: "hidden",
    position: "relative",
    display: "inline-block",
    whiteSpace: "nowrap", // letter spans must never wrap onto a second line
  });

  let chars = [];
  let currentText = "";

  const setText = (text) => {
    if (text === currentText) return;
    currentText = text;
    textEl.textContent = "";
    chars = [...text].map((char) => {
      const span = document.createElement("span");
      span.textContent = char;
      Object.assign(span.style, {
        display: "inline-block",
        position: "relative",
        textShadow: "currentColor 0px 1.3em",
        transform: "translateY(0em) rotate(0.001deg)",
        whiteSpace: char === " " ? "pre" : "",
      });
      return span;
    });
    textEl.append(...chars);
  };

  const playText = () => {
    if (reduceMotion) return;
    // Jump back to the start without animating, then roll up
    chars.forEach((span) => {
      span.style.transition = "none";
      span.style.transform = "translateY(0em) rotate(0.001deg)";
    });
    void textEl.offsetWidth; // apply the reset before re-enabling the transition
    chars.forEach((span, i) => {
      span.style.transition = `${CHAR_TRANSITION} ${i * CHAR_STAGGER}s`;
      span.style.transform = "translateY(-1.3em) rotate(0.001deg)";
    });
  };

  setText(textEl.textContent.trim());

  /* Follow the mouse */

  const followDuration = reduceMotion ? 0 : 0.45;
  const xTo = gsap.quickTo(cursor, "x", { duration: followDuration, ease: "power3.out" });
  const yTo = gsap.quickTo(cursor, "y", { duration: followDuration, ease: "power3.out" });

  let mouseX = 0;
  let mouseY = 0;
  let hasMoved = false;
  let activeTrigger = null;

  const isHidden = () => !activeTrigger && gsap.getProperty(cursor, "height") < 1;

  /* Show / hide */

  // overwrite "auto" (not true) so the x/y follow tweens keep running
  // The cursor is hidden by default in Webflow (display: none) so it never flashes
  // before this runs. Show it right before opening, hide it again once fully closed.
  let hideTween = null;

  const show = (trigger) => {
    if (hideTween) hideTween.kill(); // cancel a close that's still running
    gsap.set(cursor, { display: CURSOR_DISPLAY, autoAlpha: 1 });
    setText(trigger.getAttribute("data-cursor-text") || currentText);
    playText();
    gsap.to(cursor, { height: "auto", duration, ease, overwrite: "auto" });
  };

  const hide = () => {
    hideTween = gsap.to(cursor, {
      height: 0,
      duration,
      ease,
      overwrite: "auto",
      onComplete: () => {
        if (!activeTrigger) gsap.set(cursor, { display: "none" });
      },
    });
  };

  const update = (target) => {
    const trigger = target && target.closest ? target.closest("[data-cursor-text]") : null;
    if (trigger === activeTrigger) return;
    activeTrigger = trigger;
    if (trigger) show(trigger);
    else hide();
  };

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    hasMoved = true;

    // While hidden, sit right on the pointer so it doesn't fly in when it appears
    if (isHidden()) {
      xTo(mouseX, mouseX);
      yTo(mouseY, mouseY);
    } else {
      xTo(mouseX);
      yTo(mouseY);
    }

    update(e.target);
  });

  // Scrolling moves elements under a still mouse, so re-check what's under it
  window.addEventListener(
    "scroll",
    () => {
      if (hasMoved) update(document.elementFromPoint(mouseX, mouseY));
    },
    { passive: true }
  );

  // Mouse left the browser window
  document.documentElement.addEventListener("mouseleave", () => update(null));
}
