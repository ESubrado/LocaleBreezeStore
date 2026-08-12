// This component uses browser state, effects, and fetch, so it must run on the client.
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

// A message displayed in the assistant conversation.
type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

// The three states shown while checking whether the configured assistant can respond.
type AssistantAvailability = "available" | "checking" | "unavailable";

// The welcome message used whenever a conversation is created or reset.
const initialMessage: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I can help you explore the current product catalog and find a good fit.",
};

// Starter questions shown only after the assistant is confirmed available.
const suggestions = [
  "What are your featured products?",
  "Help me find a digital product.",
  "What would make a good gift?",
];

// Friendly fallback shown when the API or configured model cannot be reached.
const assistantUnavailableMessage =
  "Breeze Assist is unavailable right now. Please try again once the assistant is available.";

/** Confirms a successful chat API response contains a text message. */
function isAiAssistResponse(value: unknown): value is { message: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  );
}

/** Confirms an error API response contains visitor-safe error text. */
function isAiAssistErrorResponse(value: unknown): value is { error: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  );
}

/** Confirms the health API response includes an availability flag. */
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

/** Renders the site-wide, bottom-right product-shopping assistant. */
export default function AiAssist() {
  // Controls whether the compact chat window or its launcher is visible.
  const [isOpen, setIsOpen] = useState(false);
  // Stores the visible conversation, beginning with the welcome message.
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  // Stores the current text in the visitor's message input.
  const [input, setInput] = useState("");
  // Prevents duplicate sends while an assistant response is in progress.
  const [isSending, setIsSending] = useState(false);
  // Drives the status text and enables chat only when a model is ready.
  const [availability, setAvailability] =
    useState<AssistantAvailability>("checking");
  // Lets the window focus the input as soon as it opens.
  const inputRef = useRef<HTMLInputElement>(null);
  // Marks the bottom of the conversation for automatic scrolling.
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Avoids adding the same unavailable message every time a check fails.
  const hasShownUnavailableMessage = useRef(false);

  /** Checks the server health endpoint and updates the chat's ready state. */
  const checkAvailability = useCallback(async () => {
    setAvailability("checking");

    try {
      // GET is the lightweight health check exposed by the API route.
      const response = await fetch("/api/ai-assist", { cache: "no-store" });
      // Keep untrusted JSON unknown until the response shape is checked.
      const body: unknown = await response.json().catch(() => null);
      // A model is ready only when the API succeeds and explicitly returns available: true.
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
        // A later failure should be allowed to display one new helpful message.
        hasShownUnavailableMessage.current = false;
      }
    } catch {
      // Treat network and JSON errors the same as an unavailable assistant.
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

  // Focus the message field when the visitor opens the chat window.
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Recheck the provider whenever the chat opens, including after it has been closed.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void checkAvailability();
  }, [checkAvailability, isOpen]);

  // Keep the newest user message, response, or loading indicator in view.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  /** Sends one visitor message to the chat API and appends its response to the conversation. */
  async function sendMessage(message: string) {
    // Remove accidental leading/trailing whitespace before validating the message.
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending || availability === "unavailable") {
      // Do not send blank, duplicate, or known-unavailable requests.
      return;
    }

    setMessages((current) => [
      ...current,
      { role: "user", content: trimmedMessage },
    ]);
    setInput("");
    setIsSending(true);

    try {
      // Send recent history only; the server applies further validation and limits.
      const response = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages.slice(1).slice(-10),
          message: trimmedMessage,
        }),
      });
      // Keep the response untrusted until it passes a type guard.
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

      // Append the validated assistant reply after the visitor's message.
      setMessages((current) => [
        ...current,
        { role: "assistant", content: body.message },
      ]);
    } catch (error) {
      // Show a polite error in the conversation rather than leaving the visitor without feedback.
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error instanceof Error ? error.message : assistantUnavailableMessage,
        },
      ]);
    } finally {
      // Re-enable the input and controls after either success or failure.
      setIsSending(false);
    }
  }

  /** Handles the form submit event and delegates to the shared send function. */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  /** Starts a fresh conversation and immediately checks whether the assistant is ready. */
  function handleNewChat() {
    setMessages([initialMessage]);
    setInput("");
    hasShownUnavailableMessage.current = false;
    void checkAvailability();
  }

  return (
    // Keep the assistant above page content and fixed in the bottom-right corner site-wide.
    <aside className="fixed bottom-4 right-4 z-[70]" aria-label="AI shopping assistant">
      {isOpen ? (
        <section className="flex h-[min(34rem,calc(100svh-2rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-blue-400/25 bg-slate-950 shadow-2xl shadow-black/50 ring-1 ring-white/10">
          {/* Header includes the availability state plus reset and close controls. */}
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

          {/* Announce new messages to assistive technology and allow the log to scroll. */}
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

          {/* Show quick questions only for a fresh chat with a verified ready assistant. */}
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

          {/* The input stays disabled until the availability check succeeds. */}
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
        // Compact launcher that remains available on every page.
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
