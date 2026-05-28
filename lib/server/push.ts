/**
 * Server-side Web Push helpers. Used by /api/push/* routes and the
 * /api/cron/daily-reminder Vercel Cron Job.
 *
 * Subscriptions live in Vercel KV (provisioned in the Vercel dashboard;
 * automatically injects KV_REST_API_URL + KV_REST_API_TOKEN env vars).
 */
import webpush from "web-push";
import { kv } from "@vercel/kv";

const KEY_PREFIX = "push:sub:";

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
      "Missing VAPID env vars. Run `npm run vapid` and set NEXT_PUBLIC_VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY in Vercel.",
    );
  }
  webpush.setVapidDetails(contact, pub, priv);
  configured = true;
}

/** Stable key derived from endpoint — collision-safe enough for our use. */
function keyFor(endpoint: string): string {
  let hash = 0;
  for (let i = 0; i < endpoint.length; i++) {
    hash = (hash * 31 + endpoint.charCodeAt(i)) | 0;
  }
  return `${KEY_PREFIX}${(hash >>> 0).toString(36)}`;
}

export async function saveSubscription(sub: StoredSubscription) {
  await kv.set(keyFor(sub.endpoint), sub);
}

export async function deleteSubscription(endpoint: string) {
  await kv.del(keyFor(endpoint));
}

export async function listSubscriptions(): Promise<StoredSubscription[]> {
  // kv.keys uses Redis SCAN under the hood — safe up to large fleets.
  const keys = await kv.keys(`${KEY_PREFIX}*`);
  if (keys.length === 0) return [];
  // mget returns the values in the same order as the keys, with `null` for
  // any that have been deleted between scan and read.
  const values = await kv.mget<StoredSubscription[]>(...keys);
  return values.filter((v): v is StoredSubscription => !!v);
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
