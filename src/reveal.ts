import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const DURATION = 0.9;
const STAGGER = 0.08;
const EASE = "expo.out";

// Split now, split again when the font arrives: the animation is rebuilt on the new lines
export function reveal(title: HTMLElement): void {
  SplitText.create(title, {
    type: "lines",
    mask: "lines",
    linesClass: "line",
    autoSplit: true,
    onSplit(self) {
      return gsap.from(self.lines, {
        yPercent: 110,
        duration: DURATION,
        stagger: STAGGER,
        ease: EASE,
      });
    },
  });

  gsap.set(title, { visibility: "visible" });
}
