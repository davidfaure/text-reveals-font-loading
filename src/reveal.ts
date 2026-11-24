import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const DURATION = 0.9;
const STAGGER = 0.08;
const EASE = "expo.out";

// Wait for the fonts, then split: the lines are measured on the real font
export function reveal(title: HTMLElement): void {
  document.fonts.ready.then(() => {
    const split = SplitText.create(title, {
      type: "lines",
      mask: "lines",
      linesClass: "line",
    });

    gsap.set(title, { visibility: "visible" });
    gsap.from(split.lines, {
      yPercent: 110,
      duration: DURATION,
      stagger: STAGGER,
      ease: EASE,
    });
  });
}
