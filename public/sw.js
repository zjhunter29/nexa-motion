// Nexa Motion — minimal service worker.
// Handles notification clicks (focus the app or open it) and acts as a
// receiver for Web Push events if you later wire up a backend (FCM,
// VAPID + Netlify Function, etc.).

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of allClients) {
        if ("focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow("/");
      }
    })(),
  );
});

// Push payload contract (when you connect a real backend):
// { "title": "Time to run", "body": "...", "url": "/" }
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Nexa Motion", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Nexa Motion";
  const options = {
    body: data.body || "",
    icon: "/nexa-logo.png",
    badge: "/nexa-logo.png",
    tag: data.tag || "nexa-motion",
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
