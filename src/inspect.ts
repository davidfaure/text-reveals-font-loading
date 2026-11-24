// Demo plumbing, not part of the effect: the controls under the title and the log of what happened.
// It only watches the DOM: the reveal in reveal.ts doesn't know it exists.
const seconds = () => `${(performance.now() / 1000).toFixed(2)}s`;

let last = "";

function log(list: HTMLElement, text: string, tone?: "bad" | "good"): void {
  // The split and the font can both trigger a check on the same lines
  if (text === last) return;

  last = text;

  const item = document.createElement("li");
  const time = document.createElement("time");
  const message = document.createElement("span");

  time.textContent = seconds();
  message.textContent = text;
  if (tone) message.className = `is-${tone}`;

  item.append(time, message);
  list.append(item);
}

// Which font is on screen right now: the same word, once with Unbounded first, once with monospace alone.
// Different widths mean Unbounded is drawing. Measured once per split, never in a loop.
function probe(family: string): HTMLElement {
  const span = document.createElement("span");

  span.textContent = "Sites that move";
  span.setAttribute("aria-hidden", "true");
  span.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font:500 40px ${family}`;
  document.body.append(span);

  return span;
}

let probes: [HTMLElement, HTMLElement] | undefined;

function unboundedOnScreen(): boolean {
  probes ??= [probe('"Unbounded", monospace'), probe("monospace")];

  return probes[0].offsetWidth !== probes[1].offsetWidth;
}

// A line that wrapped shows as more than one row inside its mask. Measured once per event, never in a loop.
function rowsPerLine(title: HTMLElement): number[] {
  return [...title.querySelectorAll<HTMLElement>(".line")].map((line) => {
    const lineHeight = parseFloat(getComputedStyle(line).lineHeight);

    return Math.round(line.offsetHeight / lineHeight);
  });
}

function check(title: HTMLElement, list: HTMLElement): void {
  const rows = rowsPerLine(title);

  if (rows.length === 0) return;

  const broken = rows.filter((count) => count > 1).length;

  title.querySelectorAll<HTMLElement>(".line-mask").forEach((mask, index) => {
    mask.classList.toggle("is-broken", (rows[index] ?? 1) > 1);
  });

  if (broken === 0) {
    log(list, `${rows.length} lines, one row each`, "good");
  } else {
    log(list, `${broken} of ${rows.length} lines wrap onto two rows inside one mask (rows: ${rows.join(" · ")})`, "bad");
  }
}

export function inspect(title: HTMLElement, slowed: boolean): void {
  const form = document.querySelector<HTMLFormElement>("[data-controls]")!;
  const list = document.querySelector<HTMLElement>("[data-log]")!;
  const note = document.querySelector<HTMLElement>("[data-note]")!;
  const params = new URLSearchParams(location.search);
  const delay = params.get("delay") ?? "1200";

  form.querySelectorAll<HTMLInputElement>('input[name="delay"]').forEach((input) => {
    input.checked = input.value === delay;
  });

  const masks = form.querySelector<HTMLInputElement>('input[name="masks"]')!;

  masks.checked = params.get("masks") === "1";
  document.body.classList.toggle("show-masks", masks.checked);
  masks.addEventListener("change", () => document.body.classList.toggle("show-masks", masks.checked));

  // A reload is the only way to see the font arrive late again
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const next = new URLSearchParams();
    const chosen = form.querySelector<HTMLInputElement>('input[name="delay"]:checked');

    next.set("delay", chosen?.value ?? delay);
    if (masks.checked) next.set("masks", "1");
    location.search = next.toString();
  });

  if (!slowed) {
    note.hidden = false;
    note.textContent =
      "This browser doesn't let the demo hold the font back (no service worker), so the font may arrive before the split and hide the bug. Below, a recording of the bug in Chrome.";
    note.after(recording());
  }

  log(list, slowed ? "Page loaded, Unbounded on its way: Arial shows" : "Page loaded");

  // When the font is in. Not document.fonts.check(): WebKit answered true while the font was still loading.
  let fontIn = false;
  let loadingDone = false;

  const arrived = () => {
    if (fontIn) return;

    fontIn = true;
    log(list, "Unbounded loaded and swapped in");

    // After SplitText's own listener (autoSplit) and the layout: one frame later
    requestAnimationFrame(() => check(title, list));
  };

  // Added before the reveal runs, so it fires before SplitText's own listener
  document.fonts.addEventListener("loadingdone", () => {
    loadingDone = true;
    arrived();
  });

  // ready resolves in every browser, loadingdone doesn't
  document.fonts.ready.then(() => {
    arrived();

    if (slowed && !loadingDone) {
      log(list, "This browser never fired loadingdone, the event autoSplit waits for to re-split", "bad");
    }
  });

  // Every split replaces the title's children
  new MutationObserver(() => {
    if (!title.querySelector(".line")) return;

    const count = title.querySelectorAll(".line").length;
    const onFont = unboundedOnScreen();

    log(list, `SplitText cut ${count} lines on ${onFont ? "Unbounded" : "Arial, the fallback"}`, onFont ? undefined : "bad");

    if (onFont) check(title, list);
  }).observe(title, { childList: true });
}

// The fallback where the font can't be held back: a recording, labelled as one
function recording(): HTMLElement {
  const figure = document.createElement("figure");
  const video = document.createElement("video");
  const caption = document.createElement("figcaption");

  figure.className = "recording";
  video.src = `${import.meta.env.BASE_URL}recordings/bug.mp4`;
  video.muted = video.loop = video.autoplay = video.playsInline = true;
  video.controls = true;
  caption.textContent =
    "Recorded in Chrome, the font held back 0.6s, masks shown. The lines are cut on Arial; when the font lands, two of them wrap onto two rows inside one mask.";

  figure.append(video, caption);

  return figure;
}
