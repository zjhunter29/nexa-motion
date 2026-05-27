"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, RotateCcw, Mic } from "lucide-react";
import { useNexaStore } from "@/lib/store";
import { SUGGESTED_PROMPTS } from "@/lib/ai-mock";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ChatInterface() {
  const messages = useNexaStore((s) => s.chatMessages);
  const pushMessage = useNexaStore((s) => s.pushMessage);
  const resetChat = useNexaStore((s) => s.resetChat);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTo({
        top: scrollerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length, busy]);

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || busy) return;

    const userMsg: ChatMessage = {
      id: makeId(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };
    pushMessage(userMsg);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      const reply: ChatMessage = {
        id: makeId(),
        role: "assistant",
        content:
          data.reply ?? "I'm having trouble thinking right now. Try again?",
        createdAt: Date.now(),
      };
      pushMessage(reply);
    } catch (err) {
      console.error(err);
      pushMessage({
        id: makeId(),
        role: "assistant",
        content: "Network hiccup — please try again.",
        createdAt: Date.now(),
      });
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const showWelcome = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] safe-top">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-text-muted font-medium">
            Powered by AI
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            Nexa Coach
          </h1>
        </div>
        {messages.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={resetChat}
            className="glass-pill h-9 w-9 rounded-full inline-flex items-center justify-center text-text-secondary hover:text-white"
            aria-label="Reset conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollerRef}
        className="flex-1 overflow-y-auto px-5 space-y-3 no-scrollbar pb-2"
      >
        {showWelcome ? (
          <WelcomeState onPick={sendMessage} />
        ) : (
          <>
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <Bubble key={m.id} message={m} />
              ))}
            </AnimatePresence>
            {busy && <TypingIndicator />}
          </>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-4 pt-3"
        style={{ paddingBottom: "max(7rem, env(safe-area-inset-bottom))" }}
      >
        <div className="glass-panel-strong rounded-3xl p-2 flex items-end gap-2">
          <button
            type="button"
            className="h-10 w-10 shrink-0 rounded-full glass-pill inline-flex items-center justify-center text-text-secondary"
            aria-label="Voice input"
          >
            <Mic className="h-4 w-4" />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about running..."
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-[15px] text-white placeholder-text-muted px-1 py-2.5 max-h-32"
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            disabled={!input.trim() || busy}
            type="submit"
            className={cn(
              "h-10 w-10 shrink-0 rounded-full inline-flex items-center justify-center transition-all",
              input.trim() && !busy
                ? "bg-gradient-to-br from-accent-purple to-accent-blue text-white shadow-glow-purple"
                : "glass-pill text-text-muted",
            )}
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
      </form>
    </div>
  );
}

function WelcomeState({ onPick }: { onPick: (s: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-4"
    >
      <div className="glass-panel rounded-3xl p-6 mb-4">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-accent-purple/30 to-accent-blue/20 border border-white/10 mb-3">
          <Sparkles className="h-5 w-5 text-accent-purple-bright" />
        </div>
        <h2 className="text-xl font-semibold text-white">
          Your AI running coach
        </h2>
        <p className="mt-1.5 text-[14px] text-text-secondary text-balance">
          Ask about training, recovery, fueling, pacing, injuries — anything
          that helps you run smarter.
        </p>
      </div>

      <p className="px-1 text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold mb-2">
        Try asking
      </p>
      <div className="space-y-2">
        {SUGGESTED_PROMPTS.map((p, i) => (
          <motion.button
            key={p}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPick(p)}
            className="w-full text-left glass-pill rounded-2xl px-4 py-3 text-[14px] text-white hover:bg-white/10 transition-colors"
          >
            {p}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-3xl px-4 py-3 text-[14.5px] leading-relaxed",
          isUser
            ? "bg-gradient-to-br from-accent-purple/90 to-accent-blue/90 text-white rounded-br-md shadow-glow-purple"
            : "glass-panel rounded-bl-md text-text-primary",
        )}
      >
        <div className="whitespace-pre-wrap text-balance">{message.content}</div>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-start"
    >
      <div className="glass-panel rounded-3xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-text-secondary"
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1.1,
              delay: i * 0.18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
