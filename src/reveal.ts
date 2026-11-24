import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const DURATION = 0.9;
const STAGGER = 0.08;
const EASE = "expo.out";

// Wait for the fonts, then split with autoSplit: ready works in every browser, autoSplit re-splits on width changes
export function reveal(title: HTMLElement): void {
  document.fonts.ready.then(() => {
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
  });
}
