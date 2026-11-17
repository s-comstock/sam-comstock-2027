/*--------------------
Smooothy JS
All Smooothy-powered components live here:
- initSmoothyCarousel: infinite + snap, prev/next arrows, optional dots, active slide state
  (mirrors the "controls" example on smooothy.federic.ooo/examples)
- initSmoothyMarquee: auto-scrolling, draggable logo marquee
  (based on the "auto-scroll" example)
--------------------*/

/* Drive a Smooothy instance from the GSAP ticker */
function startSlider(slider) {
  gsap.ticker.add(() => slider.update())
  return slider
}

/*--------------------
Carousel
--------------------*/

export function initSmoothyCarousel() {
  if (typeof Smooothy === "undefined") return

  document.querySelectorAll(".smoothy-carousel_component").forEach(component => {
    const wrapper = component.querySelector(".smoothy-carousel_list")
    if (!wrapper || !wrapper.children.length) return

    const slides = [...wrapper.children]
    const arrowsEl = component.querySelector(".smoothy-carousel_arrows")
    const arrows = arrowsEl ? [...arrowsEl.querySelectorAll("button")] : []
    const dotsEl = component.querySelector(".smoothy-carousel_dots")
    let dots = []

    /* active state for current slide + dot */
    function setActive(current, previous) {
      slides[previous]?.classList.remove("is-active")
      slides[current]?.classList.add("is-active")
      dots[previous]?.classList.remove("is-active")
      dots[current]?.classList.add("is-active")
      dots.forEach((dot, i) => dot.setAttribute("aria-current", i === current ? "true" : "false"))
    }

    /* initialize Smooothy slider */
    const slider = new Smooothy(wrapper, {
      infinite: true,
      snap: true,
      onSlideChange: setActive
    })

    /* arrows: first button = prev, second = next */
    arrows.forEach((arrow, index) => {
      arrow.setAttribute("aria-label", index === 0 ? "Previous slide" : "Next slide")
      arrow.addEventListener("click", () => (index === 0 ? slider.goToPrev() : slider.goToNext()))
    })

    /* dots (optional): built from slide count if .smoothy-carousel_dots exists */
    if (dotsEl) {
      dotsEl.innerHTML = ""
      dots = slides.map((_, index) => {
        const dot = document.createElement("button")
        dot.type = "button"
        dot.className = "smoothy-carousel_dot"
        dot.setAttribute("aria-label", `Go to slide ${index + 1}`)
        dot.addEventListener("click", () => slider.goToIndex(index))
        dotsEl.appendChild(dot)
        return dot
      })
    }

    setActive(0, 0)
    startSlider(slider)
  })
}

/*--------------------
Logo Marquee
Markup: [data-logo-marquee-component] > [data-logo-marquee-track] > [data-marquee-logo-set]
Each logo set is one Smooothy item. The set is cloned enough times to cover wide screens.
Spacing between sets must come from padding on the set (not a gap on the track).
--------------------*/

export function initSmoothyMarquee() {
  if (typeof Smooothy === "undefined") return

  const SECONDS_PER_LOGO = 6
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  document.querySelectorAll("[data-logo-marquee-component]").forEach(marquee => {
    // Prevent double-initialising (e.g. if the function is called twice)
    if (marquee.dataset.marqueeInit === "true") return

    const track = marquee.querySelector("[data-logo-marquee-track]")
    const logoSet = track?.querySelector("[data-marquee-logo-set]")
    if (!track || !logoSet) return

    // Count logos in the original set only (before cloning)
    const logoCount = logoSet.children.length
    if (!logoCount) return

    // Clone the set until the loop can cover the widest screen without gaps
    const setWidth = logoSet.getBoundingClientRect().width
    const viewport = Math.max(window.innerWidth, window.screen?.width || 0)
    const copies = setWidth ? Math.max(2, Math.ceil((2 * viewport) / setWidth) + 1) : 2

    for (let i = 1; i < copies; i++) {
      const clone = logoSet.cloneNode(true)
      clone.setAttribute("aria-hidden", "true")
      clone.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"))
      clone.querySelectorAll("a, button").forEach(el => el.setAttribute("tabindex", "-1"))
      track.appendChild(clone)
    }

    marquee.dataset.marqueeInit = "true"

    // One full logo set every (logoCount * SECONDS_PER_LOGO) seconds
    const setsPerSecond = 1 / (logoCount * SECONDS_PER_LOGO)

    const slider = new Smooothy(track, {
      infinite: true,
      snap: false,
      onUpdate: core => {
        // Auto-scroll unless the user is dragging or prefers reduced motion.
        // Smooothy skips updates while off-screen; clamp deltaTime so it doesn't jump on return.
        if (reduceMotion || core.isDragging) return
        core.target -= Math.min(core.deltaTime, 0.1) * setsPerSecond
      }
    })

    startSlider(slider)
  })
}
