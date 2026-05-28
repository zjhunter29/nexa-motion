/**
 * Real Web Push notifications wired end-to-end.
 *
 *   - Service worker (public/sw.js) handles `push` + `notificationclick`.
 *   - This client module owns the permission + subscription flow on the
 *     browser side.
 *   - Subscriptions are POSTed to /api/push/subscribe and persisted in
 *     Netlify Blobs (see lib/server/push.ts).
 *   - A Netlify Scheduled Function (netlify/functions/daily-reminder.mts)
 *     runs daily at 13:00 UTC and broadcasts to every subscription.
 *
 *   Two env vars required for production:
 *     NEXT_PUBLIC_VAPID_PUBLIC_KEY  (exposed to browser)
 *     VAPID_PRIVATE_KEY             (server only)
 *     VAPID_CONTACT                 (mailto: address for push servers)
 *
 *   Generate them with: `npm run vapid`
 */

const STORAGE_KEYS = {
  pushEnabled: "nexa-motion-push-enabled",
  dailyEnabled: "nexa-motion-daily-reminder-enabled",
  lastReminderDate: "nexa-motion-last-reminder-date",
} as const;

const REMINDER_HOUR = 8; // 8 AM local — used by the in-app fallback fire
const ICON = "/nexa-logo.png";

// ─── Public API ──────────────────────────────────────────────────────────

export function isNotificationsSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof Notification !== "undefined" &&
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationsSupported()) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export function getPushEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.pushEnabled) === "true";
}

export async function setPushEnabled(enabled: boolean): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (enabled) {
    const result = await requestNotificationPermission();
    if (result !== "granted") {
      localStorage.setItem(STORAGE_KEYS.pushEnabled, "false");
      return false;
    }
    const reg = await ensureServiceWorker();
    if (!reg) {
      localStorage.setItem(STORAGE_KEYS.pushEnabled, "false");
      return false;
    }
    const subscribed = await subscribeToPush(reg);
    if (!subscribed) {
      localStorage.setItem(STORAGE_KEYS.pushEnabled, "false");
      return false;
    }
    localStorage.setItem(STORAGE_KEYS.pushEnabled, "true");
    // Trigger an immediate server-side test push so the user knows it works.
    try {
      await fetch("/api/push/test", { method: "POST" });
    } catch {
      // Network blip — local notification fallback below still confirms it.
      await showLocalNotification(
        "Notifications on",
        "We'll let you know when it's time to run.",
      );
    }
    return true;
  }
  // Unsubscribe + tell the server to forget us.
  try {
    const reg = await navigator.serviceWorker.getRegistration("/");
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe();
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ endpoint }),
      }).catch(() => {});
    }
  } catch {
    // ignore
  }
  localStorage.setItem(STORAGE_KEYS.pushEnabled, "false");
  return true;
}

export function getDailyReminderEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.dailyEnabled) === "true";
}

export async function setDailyReminderEnabled(
  enabled: boolean,
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (enabled) {
    // Daily reminders ride on the same push subscription. If push isn't
    // already on, opt-in to it first.
    if (!getPushEnabled()) {
      const ok = await setPushEnabled(true);
      if (!ok) {
        localStorage.setItem(STORAGE_KEYS.dailyEnabled, "false");
        return false;
      }
    }
    localStorage.setItem(STORAGE_KEYS.dailyEnabled, "true");
    scheduleNextDailyReminder();
    return true;
  }
  localStorage.setItem(STORAGE_KEYS.dailyEnabled, "false");
  return true;
}

/**
 * Boot the notification subsystem. Registers the service worker and, if
 * the user has opted in but the server-side cron hasn't fired today yet
 * (e.g. timezone gap), shows a local fallback notification.
 */
export async function initNotifications() {
  if (!isNotificationsSupported()) return;
  await ensureServiceWorker();
  if (getDailyReminderEnabled() && Notification.permission === "granted") {
    await maybeFireOverdueReminder();
    scheduleNextDailyReminder();
  }
}

export async function showLocalNotification(title: string, body: string) {
  if (!isNotificationsSupported()) return;
  if (Notification.permission !== "granted") return;
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body,
      icon: ICON,
      badge: ICON,
      tag: "nexa-motion",
    });
  } catch {
    try {
      new Notification(title, { body, icon: ICON });
    } catch {
      // silent
    }
  }
}

// ─── Internals ────────────────────────────────────────────────────────────

async function ensureServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator))
    return undefined;
  try {
    const existing = await navigator.serviceWorker.getRegistration("/");
    if (existing) return existing;
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    return undefined;
  }
}

async function subscribeToPush(
  reg: ServiceWorkerRegistration,
): Promise<boolean> {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    console.warn(
      "[notifications] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set — push subscription skipped.",
    );
    return false;
  }
  try {
    // Re-use existing subscription if there is one.
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }
    const json = sub.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
      console.warn("[notifications] subscription missing keys");
      return false;
    }
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn("[notifications] subscribe failed", err);
    return false;
  }
}

/**
 * VAPID public keys are base64url-encoded. The Push API needs a buffer
 * backed by a non-shared ArrayBuffer, so we allocate the buffer explicitly
 * to satisfy TypeScript's BufferSource typing.
 */
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const buffer = new ArrayBuffer(raw.length);
  const arr = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr as Uint8Array<ArrayBuffer>;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

async function maybeFireOverdueReminder() {
  const last = localStorage.getItem(STORAGE_KEYS.lastReminderDate);
  const today = todayKey();
  const now = new Date();
  if (last !== today && now.getHours() >= REMINDER_HOUR) {
    await showLocalNotification("Time to run", pickReminderLine());
    localStorage.setItem(STORAGE_KEYS.lastReminderDate, today);
  }
}

let scheduledTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleNextDailyReminder() {
  if (scheduledTimer) clearTimeout(scheduledTimer);
  const now = new Date();
  const next = new Date(now);
  next.setHours(REMINDER_HOUR, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next.getTime() - now.getTime();
  scheduledTimer = setTimeout(async () => {
    if (getDailyReminderEnabled() && Notification.permission === "granted") {
      await showLocalNotification("Time to run", pickReminderLine());
      localStorage.setItem(STORAGE_KEYS.lastReminderDate, todayKey());
    }
    scheduleNextDailyReminder();
  }, delay);
}

const REMINDER_LINES = [
  "Today's session is waiting. Lace up.",
  "Easy miles still count. Get out there.",
  "Future-you will thank present-you for this run.",
  "Even 20 minutes moves the needle.",
  "Your plan is ready when you are.",
];

function pickReminderLine() {
  return REMINDER_LINES[Math.floor(Math.random() * REMINDER_LINES.length)];
}
