/*--------------------
Sam Comstock 2027 JavaScript Compile
--------------------*/

/* Import Plugins */
// GSAP and its plugins load from CDN as globals (see Dependencies) - register, don't import
gsap.registerPlugin(ScrollTrigger);

/* Import functions */
import { initAccordion } from "./accordion";
import { initButtonCharacterStagger } from "./button-character-stagger";
import { initBunnyPlayerBackground } from "./bunny-background";
import { initBasicNavigationBar } from "./basic-nav";
import { initNavScrollBackground } from "./nav-scroll";
import { initDirectionalListHover } from "./directional-list-hover";
import { initGlobalParallax } from "./global-parallax";
import { initSmoothScroll } from "./lenis-smooth-scroll";
import { initSplideSwiper } from "./splide-swiper.js";
import { initStepByStepTimeline } from "./step-timeline.js";
import { initTabSystem } from "./tab-system";
import { initCal } from "./cal";
import { initWorkHoverIX } from "./work-hover-ix";
import { initSmoothyCarousel, initSmoothyMarquee } from "./smoothy";
import { initCursor } from "./cursor";
import { initPageTransition } from "./page-transition";


/* Initialize after Webflow finishes loading */
window.Webflow ||= [];
window.Webflow.push(() => {
  console.log("ODYN IS HERE");
  initBasicNavigationBar();
  initNavScrollBackground();
  initBunnyPlayerBackground();
  initWorkHoverIX(); // must run after Bunny init

  initStepByStepTimeline();
  initCursor();
  initButtonCharacterStagger();
  initSmoothyMarquee();
  initAccordion();
  initDirectionalListHover();
  initTabSystem();
  initSplideSwiper();
  initSmoothyCarousel();
  initGlobalParallax();

  initSmoothScroll();
  initCal();

  initPageTransition(); // keep last: fades the page in once everything is ready
});
