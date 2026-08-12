import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/products";

// Prevent Next.js from caching AI availability or chat responses.
export const dynamic = "force-dynamic";
// Use Node.js because this route makes server-side network requests.
export const runtime = "nodejs";

// Default Ollama address used when AI_BASE_URL is not set.
const defaultAiBaseUrl = "http://localhost:11434";
// Default Ollama model used when AI_MODEL is not set.
const defaultAiModel = "qwen2.5-coder:7b";
// Default provider. Set AI_PROVIDER to override this value.
const defaultAiProvider = "ollama";
// Maximum number of characters accepted in one visitor message.
const maxMessageLength = 1000;
// Number of recent messages retained for conversational context.
const maxHistoryMessages = 10;
// Safe, reusable error shown without exposing provider details.
const assistantUnavailableMessage =
  "Breeze Assist is unavailable right now. Please try again once the assistant is available.";

// A validated message that can be sent to the AI provider.
type AiAssistMessage = {
  role: "assistant" | "system" | "user";
  content: string;
};

// AI backends supported by this route.
type AiProvider =
  | "cloudflare-workers-ai"
  | "ollama"
  | "openai-compatible";

// Normalized server-only settings read from environment variables.
type AiConfig = {
  apiKey?: string;
  baseUrl: string;
  model: string;
  provider: AiProvider;
};

// The Ollama chat response fields needed by this route.
type OllamaChatResponse = {
  message?: {
    content?: unknown;
  };
};

// The Ollama model-list response fields used by the availability check.
type OllamaTagsResponse = {
  models?: Array<{
    model?: unknown;
    name?: unknown;
  }>;
};

// The OpenAI-compatible chat response fields needed by this route.
type OpenAiCompatibleChatResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

// The OpenAI-compatible model-list response fields used by the availability check.
type OpenAiCompatibleModelsResponse = {
  data?: Array<{
    id?: unknown;
  }>;
};

// The Cloudflare model-search response fields used by the availability check.
type CloudflareModelsResponse = {
  result?: unknown;
  success?: unknown;
};

/**
 * Converts active products into a size-limited text catalog for the model prompt.
 * Supplying this context helps keep recommendations grounded in real store data.
 */
function getCatalogContext(products: Awaited<ReturnType<typeof getProducts>>) {
  // Build one compact, readable summary for each of the first 50 products.
  const productSummaries = products.slice(0, 50).map((product) => {
    // Use a clear fallback when a product has no tags.
    const tags = product.tags.length > 0 ? product.tags.join(", ") : "None";

    return [
      `Name: ${product.name}`,
      `Category: ${product.category}`,
      `Format: ${product.format}`,
      `Price: ${product.price}`,
      `Tags: ${tags}`,
      `Description: ${product.description}`,
    ].join("\n");
  });

  // Separate products and cap the context so the prompt cannot grow without bound.
  return productSummaries.join("\n\n---\n\n").slice(0, 12000);
}

/** Reads, validates, and normalizes the configured AI provider settings. */
function getAiConfig(): AiConfig | null {
  // Read the requested provider and normalize it for reliable comparisons.
  const configuredProvider = (
    process.env.AI_PROVIDER ?? defaultAiProvider
  )
    .trim()
    .toLowerCase();
  // Map accepted aliases to the provider names used internally by this route.
  const provider =
    configuredProvider === "openai" || configuredProvider === "openai-compatible"
      ? "openai-compatible"
      : configuredProvider === "cloudflare-workers-ai"
        ? "cloudflare-workers-ai"
      : configuredProvider === "ollama"
        ? "ollama"
        : null;

  if (!provider) {
    // Stop early when the provider is not one this route supports.
    return null;
  }

  // Prefer generic settings, while preserving legacy OLLAMA_* settings for Ollama.
  const baseUrl = (
    process.env.AI_BASE_URL ??
    (provider === "ollama" ? process.env.OLLAMA_BASE_URL : undefined) ??
    (provider === "ollama" ? defaultAiBaseUrl : undefined)
  )?.trim();
  // Select the model from configuration, or Ollama's default when applicable.
  const model = (
    process.env.AI_MODEL ??
    (provider === "ollama" ? process.env.OLLAMA_MODEL : undefined) ??
    (provider === "ollama" ? defaultAiModel : undefined)
  )?.trim();

  if (!baseUrl || !model) {
    // Both settings are required before a provider can be contacted.
    return null;
  }

  return {
    // This key is intentionally server-only; never expose it as NEXT_PUBLIC_*.
    apiKey: process.env.AI_API_KEY?.trim() || undefined,
    // Remove a trailing slash so endpoint URLs below are always well-formed.
    baseUrl: baseUrl.replace(/\/$/, ""),
    model,
    provider,
  };
}

/** Creates JSON and optional Bearer-token headers for compatible providers. */
function getOpenAiCompatibleHeaders(config: AiConfig) {
  // Every compatible chat endpoint below receives a JSON body.
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (config.apiKey) {
    // Cloudflare and most compatible APIs authenticate with a Bearer token.
    headers.Authorization = `Bearer ${config.apiKey}`;
  }

  return headers;
}

/**
 * Derives Cloudflare's account-level model-search URL from its AI-compatible base URL.
 * A null return means the configured URL does not follow Cloudflare's expected format.
 */
function getCloudflareModelSearchUrl(baseUrl: string) {
  // Capture the account API prefix before the required /ai/v1 suffix.
  const accountApiBaseUrl = baseUrl.match(/^(.*\/accounts\/[^/]+)\/ai\/v1$/);

  return accountApiBaseUrl
    ? `${accountApiBaseUrl[1]}/ai/models/search`
    : null;
}

/** Returns the safe 503 response shared by configuration, connection, and provider failures. */
function unavailableAssistantResponse() {
  return NextResponse.json(
    {
      code: "ai_unavailable",
      error: assistantUnavailableMessage,
    },
    { status: 503 },
  );
}

/**
 * Validates browser-supplied history and returns only short visitor/assistant messages.
 * System messages are excluded so a visitor cannot replace catalog instructions.
 */
function getConversationHistory(value: unknown): AiAssistMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    // Preserve the most recent part of the conversation only.
    .slice(-maxHistoryMessages)
    .flatMap((item): AiAssistMessage[] => {
      if (
        typeof item !== "object" ||
        item === null ||
        !("role" in item) ||
        !("content" in item) ||
        (item.role !== "assistant" && item.role !== "user") ||
        typeof item.content !== "string"
      ) {
        // Ignore malformed entries instead of failing the whole request.
        return [];
      }

      // Trim and size-limit each valid history message before adding it to the prompt.
      const content = item.content.trim().slice(0, maxMessageLength);

      return content ? [{ role: item.role, content }] : [];
    });
}

/**
 * Checks whether the configured provider can be reached and exposes the selected model.
 * The AI assist window uses this before allowing the visitor to start a conversation.
 */
async function isAiAvailable(config: AiConfig) {
  if (config.provider === "ollama") {
    // Ollama lists locally installed models through its tags endpoint.
    const response = await fetch(`${config.baseUrl}/api/tags`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      // A failing endpoint is not ready for chat.
      return false;
    }

    // Look for the configured model under either supported Ollama name field.
    const result = (await response.json()) as OllamaTagsResponse;

    return Boolean(
      result.models?.some(
        (model) => model.name === config.model || model.model === config.model,
      ),
    );
  }

  if (config.provider === "cloudflare-workers-ai") {
    // Cloudflare uses a separate account-level endpoint to search models.
    const modelSearchUrl = getCloudflareModelSearchUrl(config.baseUrl);

    if (!modelSearchUrl) {
      // The Cloudflare base URL was not in the expected account API format.
      return false;
    }

    const response = await fetch(
      `${modelSearchUrl}?search=${encodeURIComponent(config.model)}`,
      {
        cache: "no-store",
        headers: getOpenAiCompatibleHeaders(config),
        signal: AbortSignal.timeout(5_000),
      },
    );

    if (!response.ok) {
      return false;
    }

    // Confirm Cloudflare reported success and included the selected model in its results.
    const result = (await response.json()) as CloudflareModelsResponse;

    return (
      result.success === true &&
      JSON.stringify(result.result ?? []).includes(config.model)
    );
  }

  // Generic OpenAI-compatible providers normally expose models at /models.
  const response = await fetch(`${config.baseUrl}/models`, {
    cache: "no-store",
    headers: getOpenAiCompatibleHeaders(config),
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    return false;
  }

  // The configured model must be present in the returned model list.
  const result = (await response.json()) as OpenAiCompatibleModelsResponse;

  return Boolean(result.data?.some((model) => model.id === config.model));
}

/**
 * Sends a prepared conversation to the configured provider and returns its text reply.
 * A null response keeps provider errors out of the visitor-facing chat window.
 */
async function requestAssistantMessage(
  config: AiConfig,
  messages: AiAssistMessage[],
) {
  if (config.provider === "ollama") {
    // Ollama uses its own non-streaming chat endpoint and option names.
    const response = await fetch(`${config.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.model,
        keep_alive: "30m",
        stream: false,
        options: {
          // Lower temperature prioritizes factual, catalog-grounded answers.
          temperature: 0.3,
          // Bound Ollama's response length to keep answers concise.
          num_predict: 250,
        },
        messages,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(120_000),
    });

    if (!response.ok) {
      // Log provider details only on the server; the visitor gets a polite generic message.
      console.error("AI assist Ollama request failed", { status: response.status });
      return null;
    }

    // Read the text content from Ollama's response shape.
    const result = (await response.json()) as OllamaChatResponse;

    return typeof result.message?.content === "string"
      ? result.message.content.trim()
      : null;
  }

  // Cloudflare Workers AI and generic providers use the OpenAI chat-completions format.
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: getOpenAiCompatibleHeaders(config),
    body: JSON.stringify({
      model: config.model,
      messages,
      // Lower temperature prioritizes factual, catalog-grounded answers.
      temperature: 0.3,
      // Leave room for providers that reason before composing a short answer.
      max_tokens: 800,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    console.error("AI assist OpenAI-compatible request failed", {
      status: response.status,
    });
    return null;
  }

  // Read the first completion choice from an OpenAI-compatible response.
  const result = (await response.json()) as OpenAiCompatibleChatResponse;

  return typeof result.choices?.[0]?.message?.content === "string"
    ? result.choices[0].message.content.trim()
    : null;
}

/**
 * Health endpoint for the AI assist window.
 * It returns 200 only when a configured model is currently available.
 */
export async function GET() {
  try {
    // Load the latest server environment settings for this dynamic request.
    const config = getAiConfig();

    if (!config || !(await isAiAvailable(config))) {
      return unavailableAssistantResponse();
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    // Keep connection and authentication details out of the browser response.
    console.error("AI assist availability check failed", error);

    return unavailableAssistantResponse();
  }
}

/**
 * Chat endpoint: validate the visitor input, add live catalog context, and return one reply.
 */
export async function POST(request: NextRequest) {
  // Keep request fields untrusted until they have been checked below.
  let payload: { history?: unknown; message?: unknown };

  try {
    // Parse the JSON body sent by the AI assist component.
    payload = (await request.json()) as { history?: unknown; message?: unknown };
  } catch {
    return NextResponse.json({ error: "A message is required." }, { status: 400 });
  }

  // Normalize the latest visitor message before enforcing its size limit.
  const message = typeof payload.message === "string" ? payload.message.trim() : "";

  if (!message || message.length > maxMessageLength) {
    return NextResponse.json(
      { error: "Enter a message of up to 1,000 characters." },
      { status: 400 },
    );
  }

  // Sanitize prior conversation entries instead of trusting browser-provided history.
  const conversationHistory = getConversationHistory(payload.history);

  // Holds the live product data that grounds the assistant's recommendation.
  let products: Awaited<ReturnType<typeof getProducts>>;

  try {
    // Load active products from the server-side catalog source.
    products = await getProducts();
  } catch (error) {
    console.error("AI assist catalog lookup failed", error);

    return NextResponse.json(
      {
        code: "catalog_unavailable",
        error: "I can't access the store catalog right now. Please try again soon.",
      },
      { status: 503 },
    );
  }

  try {
    // Read the current provider configuration after the catalog is confirmed available.
    const config = getAiConfig();

    if (!config) {
      console.error("AI assist has an unsupported or incomplete configuration.");

      return unavailableAssistantResponse();
    }

    // Put fixed catalog rules first, then safe history, then the latest visitor question.
    const assistantMessage = await requestAssistantMessage(config, [
      {
        role: "system",
        // This prompt defines the assistant's tone and prevents unsupported claims.
        content: `You are Breeze Assist, the warm, approachable shopping assistant for Locale Breeze Store. Help visitors feel welcome while answering clearly and directly. Use a friendly, natural tone: acknowledge the shopper's goal, offer a helpful recommendation when the catalog supports one, and use gentle phrases such as "I'd be happy to help" or "A good option is" when they fit. Do not overdo greetings, emojis, sales pressure, or generic filler.

Answer only from the active product catalog below. Do not invent products, prices, policies, stock levels, discounts, or delivery information. If the catalog does not answer a question, say so kindly: "I don't have that detail in the catalog yet." When recommending a product, include its exact name and listed price, plus one catalog-backed reason it suits the request. Do not take actions, make changes, or request personal data. Do not provide extended private reasoning; give the shopper-facing answer directly. Keep replies to four short sentences or a short bullet list.\n\nACTIVE PRODUCT CATALOG\n${getCatalogContext(products)}`,
      },
      ...conversationHistory,
      { role: "user", content: message },
    ]);

    if (!assistantMessage) {
      console.error("AI assist provider returned an empty message.");

      return unavailableAssistantResponse();
    }

    // Return only the visitor-facing response to the client.
    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    // Handle provider/network failures without leaking implementation details.
    console.error("AI assist request failed", error);

    return unavailableAssistantResponse();
  }
}
