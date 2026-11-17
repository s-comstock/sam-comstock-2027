/*--------------------
Work Hover Interaction JS
--------------------*/

// Hovering [data-work-card-img-wrap] expands its [data-work-card-vid-wrap]
// from height 0 to auto and plays the Bunny video inside it.
// Leaving collapses it and pauses the video.
//
// Requirements:
// - Must run AFTER initBunnyPlayerBackground() (it uses player._bunnyPlayer)
// - The Bunny player inside the card should have data-player-autoplay="false"
//   (otherwise its in-view observer will play it while hidden).
//   data-player-lazy="true" is recommended so videos only load on first hover.

export function initWorkHoverIX() {
  // Only on devices with a real hover (mouse/trackpad)
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = reduceMotion ? 0 : 0.6;
  const ease = "power3.inOut";

  document.querySelectorAll("[data-work-hover-element]").forEach((card) => {
    const vidWrap = card.querySelector("[data-work-card-vid-wrap]");
    if (!vidWrap) return;

    const player = vidWrap.querySelector("[data-bunny-background-init]");
    const bunny = player && player._bunnyPlayer;

    // Muted + looping so programmatic play is allowed and keeps going while hovered
    if (bunny) {
      bunny.video.muted = true;
      bunny.video.loop = true;
    }

    gsap.set(vidWrap, { height: 0, overflow: "hidden" });

    card.addEventListener("mouseenter", () => {
      if (bunny) bunny.play();
      gsap.to(vidWrap, { height: "auto", duration, ease, overwrite: true });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(vidWrap, {
        height: 0,
        duration,
        ease,
        overwrite: true,
        onComplete: () => {
          if (bunny) bunny.pause();
        },
      });
    });
  });
}
