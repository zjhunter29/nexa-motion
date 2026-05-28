/**
 * Server-side Web Push helpers. Used by /api/push/* routes and the Netlify
 * Scheduled Function that fires the daily reminder.
 *
 * Subscriptions live in Netlify Blobs (a built-in KV store, no setup
 * required — works the moment NEXT_PUBLIC_VAPID_PUBLIC_KEY +
 * VAPID_PRIVATE_KEY + VAPID_CONTACT are set as env vars).
 */
import webpush from "web-push";
import { getStore, type Store } from "@netlify/blobs";

const STORE_NAME = "push-subscriptions";

export interface StoredSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  /** Unix ms. Updated on every (re)subscribe. */
  subscribedAt: number;
}

let configured = false;
function configureVapid() {
  if (configured) return;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const contact = process.env.VAPID_CONTACT ?? "mailto:admin@nexa-motion.app";
  if (!pub || !priv) {
    throw new Error(
      "Missing VAPID env vars. Run `npm run vapid` and set NEXT_PUBLIC_VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY in Netlify.",
    );
  }
  webpush.setVapidDetails(contact, pub, priv);
  configured = true;
}

function store(): Store {
  // `getStore("name")` requires Netlify runtime context. Works in
  // Netlify Functions (scheduled + on-demand) and the Next.js runtime
  // on Netlify automatically.
  return getStore(STORE_NAME);
}

/** Stable key derived from endpoint — safer than using the full URL. */
function keyFor(endpoint: string): string {
  let hash = 0;
  for (let i = 0; i < endpoint.length; i++) {
    hash = (hash * 31 + endpoint.charCodeAt(i)) | 0;
  }
  return `sub-${(hash >>> 0).toString(36)}`;
}

export async function saveSubscription(sub: StoredSubscription) {
  const key = keyFor(sub.endpoint);
  await store().setJSON(key, sub);
}

export async function deleteSubscription(endpoint: string) {
  const key = keyFor(endpoint);
  await store().delete(key);
}

export async function listSubscriptions(): Promise<StoredSubscription[]> {
  const s = store();
  const { blobs } = await s.list();
  const items = await Promise.all(
    blobs.map(async (b) => (await s.get(b.key, { type: "json" })) as StoredSubscription | null),
  );
  return items.filter((x): x is StoredSubscription => !!x);
}

export async function sendPush(
  sub: StoredSubscription,
  payload: { title: string; body: string; url?: string },
): Promise<{ ok: boolean; gone?: boolean; error?: string }> {
  configureVapid();
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: sub.keys,
      },
      JSON.stringify(payload),
    );
    return { ok: true };
  } catch (err: unknown) {
    const e = err as { statusCode?: number; body?: string; message?: string };
    // 404/410 means the subscription is gone (user revoked). Caller should
    // delete it.
    if (e?.statusCode === 404 || e?.statusCode === 410) {
      return { ok: false, gone: true, error: e.body ?? e.message };
    }
    return { ok: false, error: e?.message ?? "push failed" };
  }
}

export async function broadcast(payload: {
  title: string;
  body: string;
  url?: string;
}): Promise<{ sent: number; pruned: number; failed: number }> {
  configureVapid();
  const subs = await listSubscriptions();
  let sent = 0;
  let pruned = 0;
  let failed = 0;
  await Promise.all(
    subs.map(async (s) => {
      const result = await sendPush(s, payload);
      if (result.ok) sent++;
      else if (result.gone) {
        await deleteSubscription(s.endpoint);
        pruned++;
      } else {
        failed++;
      }
    }),
  );
  return { sent, pruned, failed };
}
