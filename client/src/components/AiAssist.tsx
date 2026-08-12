"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  BotMessageSquare,
  LoaderCircle,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type AssistantAvailability = "available" | "checking" | "unavailable";

const initialMessage: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I can help you explore the current product catalog and find a good fit.",
};

const suggestions = [
  "What are your featured products?",
  "Help me find a digital product.",
  "What would make a good gift?",
];

const assistantUnavailableMessage =
  "Breeze Assist is unavailable right now. Please try again once the assistant is available.";

function isAiAssistResponse(value: unknown): value is { message: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  );
}

function isAiAssistErrorResponse(value: unknown): value is { error: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  );
}

function isAiAssistAvailabilityResponse(
  value: unknown,
): value is { available: boolean } {
  return (
    typeof value === "object" &&
    value !== null &&
    "available" in value &&
    typeof value.available === "boolean"
  );
}

export default function AiAssist() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [availability, setAvailability] =
    useState<AssistantAvailability>("checking");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasShownUnavailableMessage = useRef(false);

  const checkAvailability = useCallback(async () => {
    setAvailability("checking");

    try {
      const response = await fetch("/api/ai-assist", { cache: "no-store" });
      const body: unknown = await response.json().catch(() => null);
      const isAvailable =
        response.ok &&
        isAiAssistAvailabilityResponse(body) &&
        body.available;

      setAvailability(isAvailable ? "available" : "unavailable");

      if (!isAvailable && !hasShownUnavailableMessage.current) {
        hasShownUnavailableMessage.current = true;
        setMessages((current) => [
          ...current,
          { role: "assistant", content: assistantUnavailableMessage },
        ]);
      }

      if (isAvailable) {
        hasShownUnavailableMessage.current = false;
      }
    } catch {
      setAvailability("unavailable");

      if (!hasShownUnavailableMessage.current) {
        hasShownUnavailableMessage.current = true;
        setMessages((current) => [
          ...current,
          { role: "assistant", content: assistantUnavailableMessage },
        ]);
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void checkAvailability();
  }, [checkAvailability, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  async function sendMessage(message: string) {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending || availability === "unavailable") {
      return;
    }

    setMessages((current) => [
      ...current,
      { role: "user", content: trimmedMessage },
    ]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages.slice(1).slice(-10),
          message: trimmedMessage,
        }),
      });
      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          isAiAssistErrorResponse(body)
            ? body.error
            : assistantUnavailableMessage,
        );
      }

      if (!isAiAssistResponse(body)) {
        throw new Error("Breeze Assist returned an invalid response. Please try again.");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: body.message },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error instanceof Error ? error.message : assistantUnavailableMessage,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleNewChat() {
    setMessages([initialMessage]);
    setInput("");
    hasShownUnavailableMessage.current = false;
    void checkAvailability();
  }

  return (
    <aside className="fixed bottom-4 right-4 z-[70]" aria-label="AI shopping assistant">
      {isOpen ? (
        <section className="flex h-[min(34rem,calc(100svh-2rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-blue-400/25 bg-slate-950 shadow-2xl shadow-black/50 ring-1 ring-white/10">
          <header className="flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-white">Breeze Assist</h2>
                <p className="text-xs text-slate-400">
                  {availability === "available"
                    ? "Catalog assistant"
                    : availability === "checking"
                      ? "Checking if your assistant is available..."
                      : "Assistant unavailable"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                aria-label="Start a new chat"
                className="inline-flex size-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                disabled={isSending || availability === "checking"}
                onClick={handleNewChat}
                type="button"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
              </button>
              <button
                aria-label="Close AI assistant"
                className="inline-flex size-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            role="log"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2.5 text-sm leading-5 ${
                    message.role === "user"
                      ? "rounded-br-md bg-blue-600 text-white"
                      : "rounded-bl-md border border-white/10 bg-white/[0.06] text-slate-200"
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}
            {isSending ? (
              <div className="flex justify-start">
                <span className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-slate-400">
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  Thinking
                </span>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          {availability === "available" && messages.length === 1 ? (
            <div className="flex flex-wrap gap-2 border-t border-white/10 px-4 py-3">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-left text-xs font-medium text-slate-300 transition hover:border-blue-400/40 hover:bg-blue-400/10 hover:text-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  disabled={isSending}
                  onClick={() => void sendMessage(suggestion)}
                  type="button"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}

          <form className="border-t border-white/10 p-3" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="ai-assist-message">
              Ask Breeze Assist about products
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 focus-within:border-blue-400/70 focus-within:ring-2 focus-within:ring-blue-400/15">
              <input
                ref={inputRef}
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                disabled={isSending || availability !== "available"}
                id="ai-assist-message"
                maxLength={1000}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about products..."
                value={input}
              />
              <button
                aria-label="Send message"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:bg-slate-700"
                disabled={
                  !input.trim() ||
                  isSending ||
                  availability !== "available"
                }
                type="submit"
              >
                <Send className="size-4" aria-hidden="true" />
              </button>
            </div>
          </form>
        </section>
      ) : (
        <button
          aria-label="Open AI assistant"
          className="group inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/50 transition hover:-translate-y-0.5 hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          onClick={() => setIsOpen(true)}
          type="button"
        >
          <BotMessageSquare className="size-5" aria-hidden="true" />
          <span>Ask Breeze</span>
        </button>
      )}
    </aside>
  );
}
