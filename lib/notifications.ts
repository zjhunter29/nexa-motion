/**
 * Notifications + daily reminder layer.
 *
 * Strategy:
 * 1. Use the Web Notifications API for permission + display. Works on every
 *    modern browser, including iOS 16.4+ once the PWA is added to the home
 *    screen.
 * 2. Register a service worker so notifications can render even when the
 *    app tab is in the background.
 * 3. For the "Daily AI reminder", we don't have a backend cron + push
 *    infrastructure (would need FCM / OneSignal / a VAPID + Netlify
 *    Function combo). Instead we:
 *       - schedule a setTimeout that fires the next 8 AM reminder while
 *         the tab is open,
 *       - and every time the app opens, check whether a reminder is due
 *         and fire one immediately if so.
 *    To actually deliver reminders when the app is closed, swap the
 *    `scheduleNext()` block out for a push subscription against your
 *    server.
 */

const STORAGE_KEYS = {
  pushEnabled: "nexa-motion-push-enabled",
  dailyEnabled: "nexa-motion-daily-reminder-enabled",
  lastReminderDate: "nexa-motion-last-reminder-date",
} as const;

const REMINDER_HOUR = 8; // 8 AM local time
const ICON = "/nexa-logo.png";
const BADGE = "/nexa-logo.png";

// ─── Public API ──────────────────────────────────────────────────────────

export function isNotificationsSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof Notification !== "undefined" &&
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator
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
    await ensureServiceWorker();
    localStorage.setItem(STORAGE_KEYS.pushEnabled, "true");
    // Confirm it actually works with a one-off test notification.
    await showNotification(
      "Notifications on",
      "We'll let you know when it's time to run.",
    );
    return true;
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
    const result = await requestNotificationPermission();
    if (result !== "granted") {
      localStorage.setItem(STORAGE_KEYS.dailyEnabled, "false");
      return false;
    }
    await ensureServiceWorker();
    localStorage.setItem(STORAGE_KEYS.dailyEnabled, "true");
    scheduleNextDailyReminder();
    return true;
  }
  localStorage.setItem(STORAGE_KEYS.dailyEnabled, "false");
  return true;
}

/**
 * Run on app start. Registers the SW, fires any overdue daily reminder, and
 * schedules the next one.
 */
export async function initNotifications() {
  if (!isNotificationsSupported()) return;
  await ensureServiceWorker();
  if (getDailyReminderEnabled() && Notification.permission === "granted") {
    await maybeFireOverdueReminder();
    scheduleNextDailyReminder();
  }
}

export async function showNotification(title: string, body: string) {
  if (!isNotificationsSupported()) return;
  if (Notification.permission !== "granted") return;
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body,
      icon: ICON,
      badge: BADGE,
      tag: "nexa-motion",
    });
  } catch {
    // Fallback for environments where SW isn't available
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
    return;
  try {
    const existing = await navigator.serviceWorker.getRegistration("/");
    if (existing) return existing;
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    return undefined;
  }
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
  // Only fire if it's past the reminder hour today AND we haven't reminded
  // today yet.
  if (last !== today && now.getHours() >= REMINDER_HOUR) {
    await fireDailyReminder();
  }
}

async function fireDailyReminder() {
  await showNotification(
    "Time to run",
    pickReminderLine(),
  );
  localStorage.setItem(STORAGE_KEYS.lastReminderDate, todayKey());
}

let scheduledTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleNextDailyReminder() {
  if (scheduledTimer) clearTimeout(scheduledTimer);
  const now = new Date();
  const next = new Date(now);
  next.setHours(REMINDER_HOUR, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next.getTime() - now.getTime();
  // setTimeout caps at ~24.8 days; we're well under that.
  scheduledTimer = setTimeout(async () => {
    if (getDailyReminderEnabled() && Notification.permission === "granted") {
      await fireDailyReminder();
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
