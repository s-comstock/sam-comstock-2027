/*--------------------
Tab System JS
--------------------*/

export function initTabSystem() {
  const wrappers = document.querySelectorAll('[data-tabs="wrapper"]');

  wrappers.forEach((wrapper) => {
    const contentItems = wrapper.querySelectorAll('[data-tabs="content-item"]');
    const visualItems = wrapper.querySelectorAll('[data-tabs="visual-item"]');

    const autoplay = wrapper.dataset.tabsAutoplay === "true";
    const autoplayDuration = parseInt(wrapper.dataset.tabsAutoplayDuration) || 5000;

    let activeContent = null; // keep track of active item/link
    let activeVisual = null;
    let isAnimating = false;
    let progressBarTween = null; // to stop/start the progress bar
    let inView = false; // whether the component is currently in the viewport

    if (!contentItems.length || !visualItems.length) return;

    // Starting state: hide everything, then show the first tab right away (no intro animation)
    contentItems.forEach((item) => item.classList.remove("active"));
    visualItems.forEach((item) => item.classList.remove("active"));
    gsap.set(visualItems, { autoAlpha: 0 });
    gsap.set(wrapper.querySelectorAll('[data-tabs="item-details"]'), { height: 0 });
    gsap.set(wrapper.querySelectorAll('[data-tabs="item-progress"]'), { scaleX: 0, transformOrigin: "left center" });

    activeContent = contentItems[0];
    activeVisual = visualItems[0];
    activeContent.classList.add("active");
    activeVisual.classList.add("active");
    gsap.set(activeVisual, { autoAlpha: 1 });
    gsap.set(activeContent.querySelector('[data-tabs="item-details"]'), { height: "auto" });

    function startProgressBar(index) {
      if (progressBarTween) progressBarTween.kill();
      const bar = contentItems[index].querySelector('[data-tabs="item-progress"]');
      if (!bar) return;

      // In this function, you can basically do anything you want, that should happen as a tab is active
      // Maybe you have a circle filling, some other element growing, you name it.
      gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });
      progressBarTween = gsap.to(bar, {
        scaleX: 1,
        duration: autoplayDuration / 1000,
        ease: "power1.inOut",
        onComplete: () => {
          if (!isAnimating) {
            const nextIndex = (index + 1) % contentItems.length;
            switchTab(nextIndex); // once bar is full, set next to active – this is important
          }
        },
      });
      if (!inView) progressBarTween.pause(); // don't autoplay while off-screen
    }

    function switchTab(index) {
      if (isAnimating || contentItems[index] === activeContent) return;

      isAnimating = true;
      if (progressBarTween) progressBarTween.kill(); // Stop any running progress bar here

      const outgoingContent = activeContent;
      const outgoingVisual = activeVisual;
      const outgoingBar = outgoingContent?.querySelector('[data-tabs="item-progress"]');

      const incomingContent = contentItems[index];
      const incomingVisual = visualItems[index];
      const incomingBar = incomingContent.querySelector('[data-tabs="item-progress"]');

      outgoingContent?.classList.remove("active");
      outgoingVisual?.classList.remove("active");
      incomingContent.classList.add("active");
      incomingVisual.classList.add("active");

      const tl = gsap.timeline({
        defaults: { duration: 0.65, ease: "power3" },
        onComplete: () => {
          activeContent = incomingContent;
          activeVisual = incomingVisual;
          isAnimating = false;
          if (autoplay) startProgressBar(index); // Start autoplay bar here
        },
      });

      // Wrap 'outgoing' in a check to prevent warnings on first run of the function
      // Of course, during first run (on page load), there's no 'outgoing' tab yet!
      if (outgoingContent) {
        outgoingContent.classList.remove("active");
        outgoingVisual?.classList.remove("active");
        tl.set(outgoingBar, { transformOrigin: "right center" })
          .to(outgoingBar, { scaleX: 0, duration: 0.3 }, 0)
          .set(outgoingVisual, { zIndex: 1 }, 0) // old image stays fully visible underneath
          .to(outgoingContent.querySelector('[data-tabs="item-details"]'), { height: 0 }, 0);
      }

      incomingContent.classList.add("active");
      incomingVisual.classList.add("active");
      // New image fades in on top of the old one, so the background never shows through
      tl.set(incomingVisual, { zIndex: 2 }, 0)
        .fromTo(incomingVisual, { autoAlpha: 0 }, { autoAlpha: 1 }, 0)
        .fromTo(incomingContent.querySelector('[data-tabs="item-details"]'), { height: 0 }, { height: "auto" }, 0)
        .set(incomingBar, { scaleX: 0, transformOrigin: "left center" }, 0);

      // Once the new image is fully in, hide the old one underneath it
      if (outgoingVisual) tl.set(outgoingVisual, { autoAlpha: 0, clearProps: "zIndex" });
    }

    // The first tab is already visible – scrolling only starts/pauses the autoplay timer
    function onEnterView() {
      inView = true;
      if (progressBarTween) {
        progressBarTween.resume(); // coming back: continue autoplay
      } else if (autoplay && !isAnimating) {
        startProgressBar(Array.from(contentItems).indexOf(activeContent)); // first time in view
      }
    }

    function onLeaveView() {
      inView = false;
      progressBarTween?.pause(); // stop autoplay while off-screen
    }

    ScrollTrigger.create({
      trigger: wrapper,
      start: "top 75%", // starts when the top of the component is 75% down the viewport
      end: "bottom 25%",
      onEnter: onEnterView,
      onEnterBack: onEnterView,
      onLeave: onLeaveView,
      onLeaveBack: onLeaveView,
    });

    // switch tabs on click
    contentItems.forEach((item, i) =>
      item.addEventListener("click", () => {
        if (item === activeContent) return; // ignore click if current one is already active
        switchTab(i);
      })
    );

  });
}