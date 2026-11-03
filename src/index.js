/*--------------------
Sam Comstock 2027 JavaScript Compile
--------------------*/

/* Import Plugins */
// GSAP and its plugins load from CDN as globals (see Dependencies) - register, don't import
gsap.registerPlugin(ScrollTrigger);

/* Import functions */
import { initAccordion } from "./accordion";
import { initBasicNavigationBar } from './basic-nav';
import { initDisplayTime } from "./display-time";
import { initSmoothScroll } from "./lenis-smooth-scroll";
import { initLogoMarquee } from "./logo-marquee";
import { initTabSystem } from "./tab-system";


/* Initialize after Webflow finishes loading */
window.Webflow ||= [];
window.Webflow.push(() => {
  console.log("ODYN IS HERE");
  initBasicNavigationBar();
  initLogoMarquee();
  initAccordion();
  initTabSystem();
  initDisplayTime();
  initSmoothScroll();
});
