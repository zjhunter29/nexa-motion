import type { Config } from "@netlify/functions";
import { broadcast } from "../../lib/server/push";

/**
 * Netlify Scheduled Function — fires once a day at 13:00 UTC.
 * That maps to 08:00 in US/Eastern (winter) / 09:00 EDT (summer).
 * Adjust the cron string for your timezone.
 *
 * Note: Netlify enforces a minimum schedule of 1 minute. Cron is in UTC.
 */
export default async () => {
  try {
    const result = await broadcast({
      title: "Time to run",
      body: pickReminderLine(),
      url: "/",
    });
    return new Response(
      JSON.stringify({ ok: true, ...result }),
      { headers: { "content-type": "application/json" } },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[daily-reminder]", message);
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
};

const LINES = [
  "Today's session is waiting. Lace up.",
  "Easy miles still count. Get out there.",
  "Future-you will thank present-you for this run.",
  "Even 20 minutes moves the needle.",
  "Your plan is ready when you are.",
  "Step out the door — the rest is just showing up.",
];

function pickReminderLine() {
  return LINES[Math.floor(Math.random() * LINES.length)];
}

export const config: Config = {
  schedule: "0 13 * * *",
};
