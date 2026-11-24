// Demo plumbing, not part of the effect: public/sw.js holds the font back so the bug shows on every load.
// Resolves true once the worker controls the page, false where service workers aren't available.
// One key per demo: demos embedded in the same page share sessionStorage
const RELOADED = `slow-network-reloaded:${import.meta.env.BASE_URL}`;
const READY_TIMEOUT = 1000;

export async function slowNetwork(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;

  try {
    await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
  } catch {
    // Blocked, for example in a private window in Firefox
    return false;
  }

  if (navigator.serviceWorker.controller) return true;

  // First visit, or a hard reload: the worker only sees the font from the next load.
  // Once per tab, so a browser that never hands the page over can't loop.
  if (sessionStorage.getItem(RELOADED)) return false;

  sessionStorage.setItem(RELOADED, "1");

  // A browser can accept the registration and never activate the worker: give up after 1s
  const active = await Promise.race([
    navigator.serviceWorker.ready.then(() => true),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), READY_TIMEOUT)),
  ]);

  if (!active) return false;

  location.reload();

  return new Promise<boolean>(() => {});
}
