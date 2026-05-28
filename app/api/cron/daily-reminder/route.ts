import { NextRequest, NextResponse } from "next/server";
import { broadcast } from "@/lib/server/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Vercel Cron Job target. Runs daily at 13:00 UTC (= 8 AM US Eastern winter,
 * 9 AM EDT in summer). Configure the schedule in vercel.json.
 *
 * Security: Vercel automatically attaches an Authorization header containing
 * the CRON_SECRET env var when invoking this. We reject anything that doesn't
 * match so the route isn't a public broadcast button.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  try {
    const result = await broadcast({
      title: "Time to run",
      body: pickReminderLine(),
      url: "/",
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[cron/daily-reminder]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

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
