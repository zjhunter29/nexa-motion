import { NextRequest, NextResponse } from "next/server";
import { saveSubscription } from "@/lib/server/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface IncomingSub {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
}

export async function POST(req: NextRequest) {
  let body: IncomingSub;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return NextResponse.json(
      { error: "missing endpoint/keys" },
      { status: 400 },
    );
  }
  try {
    await saveSubscription({
      endpoint: body.endpoint,
      keys: { p256dh: body.keys.p256dh, auth: body.keys.auth },
      subscribedAt: Date.now(),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[push/subscribe]", err);
    return NextResponse.json(
      { error: "failed to save subscription" },
      { status: 500 },
    );
  }
}
