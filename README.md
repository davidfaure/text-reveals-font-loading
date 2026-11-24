# Text reveals that survive font loading

A line-by-line SplitText reveal that breaks when the web font arrives after the split, two ways to fix it, and the one that works in every browser. Tutorial: [davidfaure.eu/lab/text-reveals-font-loading](https://davidfaure.eu/lab/text-reveals-font-loading).

| Branch      | What it shows                                                              |
| ----------- | -------------------------------------------------------------------------- |
| `main`      | The bug: the lines are cut on the fallback font, the real font breaks them |
| `ready`     | Fix 1: split inside `document.fonts.ready`                                 |
| `autosplit` | Fix 2: `autoSplit: true`, the animation built in `onSplit()`               |
| `both`      | Both: wait for `document.fonts.ready`, then split with `autoSplit`         |

`autosplit` doesn't fix the bug in Safari: `autoSplit` waits for the `loadingdone` event of `document.fonts`, which Safari never fires ([WebKit bug 279661](https://bugs.webkit.org/show_bug.cgi?id=279661)). `both` is the version to use.

The effect is `src/reveal.ts`. It's the only file that changes from one branch to the next.

## The slow network

On a fast connection, or with the font in the cache, the font often arrives before the split and the bug hides. So the demo holds it back on purpose: `public/sw.js` is a service worker that answers the font request after a delay, read from the page's URL (`?delay=1200`, in milliseconds). The browser really starts on Arial and really swaps to the web font. Nothing is simulated.

The first visit registers the worker and reloads once, so the worker sees the font from the start. Where service workers are blocked (a private window in Firefox, some in-app browsers), the demo says so, runs without the delay, and shows a recording of the bug made in Chrome (`public/recordings/bug.mp4`).

`src/inspect.ts` writes the log under the title: when SplitText cut the lines, on which font, and how many rows each line takes once the real font is in. It only reads the DOM.

## Font

[Unbounded](https://github.com/googlefonts/unbounded), weight 500, latin subset, under the SIL Open Font License 1.1 (`public/fonts/OFL.txt`).

## Frame

The title, branch and links around the demo live in `src/frame/` and aren't part of the effect. The text is in `src/frame/config.ts`, the branch comes from git when Vite starts, and the frame hides itself when the demo is embedded in an iframe.

## Getting started

```bash
npm install
npm run dev
```

## Stack

- TypeScript
- Vite
- GSAP and SplitText 3.15
