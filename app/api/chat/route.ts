import { NextRequest, NextResponse } from "next/server";
import { mockReply } from "@/lib/ai-mock";

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

// Stable, frozen system prompt — see `shared/prompt-caching.md`.
// We add cache_control on this so repeat chats reuse the cached prefix.
// (Below the cacheable minimum for short prompts, but harmless — once the
// prompt grows past ~4K tokens the cache kicks in automatically.)
const SYSTEM_PROMPT = `You are Nexa, the in-app AI running coach for Nexa Motion.

About you:
- You ONLY answer questions about running, training, racing, recovery, nutrition for runners, gear, and form.
- If asked anything off-topic, politely redirect to running.
- Be concise, warm, and specific. Use bullet points for plans, prose for advice.
- Reference physiology when useful, but always stay practical.
- Default to imperial units (miles, °F) unless the user asks otherwise.

Tone & safety:
- Encouraging but honest. No false praise.
- No medical diagnoses. If a user describes injury symptoms, suggest the 24-hour rule and refer them to a sports doctor when pain is sharp or worsening.`;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { messages?: IncomingMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = body.messages ?? [];
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return NextResponse.json({ reply: "Ask me anything about your running." });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Priority: Anthropic → OpenAI → curated mock.
  if (anthropicKey) {
    try {
      return await callAnthropic(anthropicKey, messages);
    } catch (err) {
      console.error("[/api/chat] Anthropic error — falling back", err);
    }
  }

  if (openaiKey) {
    try {
      return await callOpenAI(openaiKey, messages);
    } catch (err) {
      console.error("[/api/chat] OpenAI error — falling back to mock", err);
    }
  }

  // Final fallback — curated reply with a slight think delay.
  await new Promise((r) => setTimeout(r, 350));
  return NextResponse.json({
    reply: mockReply(lastUser.content),
    source: "mock",
  });
}

async function callAnthropic(apiKey: string, messages: IncomingMessage[]) {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-7";

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    // Adaptive thinking — Claude decides per-message when reasoning helps.
    // Cheap pacing questions stay fast; "design me a marathon plan" gets depth.
    thinking: { type: "adaptive" },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  // Extract text content blocks (skip thinking blocks).
  let reply = "";
  for (const block of response.content) {
    if (block.type === "text") {
      reply += block.text;
    }
  }
  reply = reply.trim();
  if (!reply) {
    throw new Error("Empty reply from Anthropic");
  }

  return NextResponse.json({
    reply,
    source: "anthropic",
    model: response.model,
    usage: {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      cache_read: response.usage.cache_read_input_tokens ?? 0,
      cache_write: response.usage.cache_creation_input_tokens ?? 0,
    },
  });
}

async function callOpenAI(apiKey: string, messages: IncomingMessage[]) {
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

  const reply = completion.choices[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error("Empty reply from OpenAI");
  }

  return NextResponse.json({
    reply,
    source: "openai",
    model: completion.model,
  });
}
