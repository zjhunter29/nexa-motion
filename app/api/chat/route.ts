import { NextRequest, NextResponse } from "next/server";
import { mockReply } from "@/lib/ai-mock";

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are Nexa, the in-app AI running coach for Nexa Motion.
- You ONLY answer questions about running, training, racing, recovery, nutrition for runners, gear, and form.
- If asked about anything off-topic, politely redirect to running.
- Be concise, warm, and specific. Use bullet points for plans.
- Reference physiology when useful, but always practical.
- Default to imperial units unless asked otherwise.`;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { messages?: IncomingMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const messages = body.messages ?? [];
  const lastUser = [...messages]
    .reverse()
    .find((m) => m.role === "user");

  if (!lastUser) {
    return NextResponse.json(
      { reply: "Ask me anything about your running." },
      { status: 200 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  // Fallback to mock when no API key configured.
  if (!apiKey) {
    const reply = mockReply(lastUser.content);
    // Simulate latency for realistic UX
    await new Promise((r) => setTimeout(r, 350));
    return NextResponse.json({ reply, source: "mock" });
  }

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 600,
      temperature: 0.6,
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ??
      mockReply(lastUser.content);

    return NextResponse.json({ reply, source: "openai" });
  } catch (err) {
    console.error("[/api/chat] OpenAI error", err);
    const reply = mockReply(lastUser.content);
    return NextResponse.json({ reply, source: "fallback" });
  }
}
