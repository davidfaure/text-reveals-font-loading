// Demo plumbing, not part of the effect: holds the web font back to imitate a slow network.
// The delay comes from the page's URL (?delay=1200). Plain JS: the browser loads this file as is.
const DEFAULT_DELAY = 1200;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  if (!new URL(event.request.url).pathname.endsWith(".woff2")) return;

  event.respondWith(
    (async () => {
      const client = await self.clients.get(event.clientId);
      const delay = Number(new URL(client ? client.url : self.location.href).searchParams.get("delay") ?? DEFAULT_DELAY);

      await new Promise((resolve) => setTimeout(resolve, delay));

      // Never from the HTTP cache: every reload waits again
      return fetch(event.request, { cache: "no-store" });
    })(),
  );
});
