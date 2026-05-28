import { NextResponse } from "next/server";
import { broadcast } from "@/lib/server/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/push/test — immediately broadcasts a test notification to every
 * registered subscription. Used by the "Push notifications" toggle to
 * confirm the pipeline works end-to-end.
 */
export async function POST() {
  try {
    const result = await broadcast({
      title: "Notifications on",
      body: "We'll let you know when it's time to run.",
      url: "/",
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
