import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const defaultAiBaseUrl = "http://localhost:11434";
const defaultAiModel = "qwen2.5-coder:7b";
const defaultAiProvider = "ollama";
const maxMessageLength = 1000;
const maxHistoryMessages = 10;
const assistantUnavailableMessage =
  "Breeze Assist is unavailable right now. Please try again once the local AI service is running.";

type AiAssistMessage = {
  role: "assistant" | "system" | "user";
  content: string;
};

type AiProvider = "ollama" | "openai-compatible";

type AiConfig = {
  apiKey?: string;
  baseUrl: string;
  model: string;
  provider: AiProvider;
};

type OllamaChatResponse = {
  message?: {
    content?: unknown;
  };
};

type OllamaTagsResponse = {
  models?: Array<{
    model?: unknown;
    name?: unknown;
  }>;
};

type OpenAiCompatibleChatResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

type OpenAiCompatibleModelsResponse = {
  data?: Array<{
    id?: unknown;
  }>;
};

function getCatalogContext(products: Awaited<ReturnType<typeof getProducts>>) {
  const productSummaries = products.slice(0, 50).map((product) => {
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

  return productSummaries.join("\n\n---\n\n").slice(0, 12000);
}

function getAiConfig(): AiConfig | null {
  const configuredProvider = (
    process.env.AI_PROVIDER ?? defaultAiProvider
  )
    .trim()
    .toLowerCase();
  const provider =
    configuredProvider === "openai" || configuredProvider === "openai-compatible"
      ? "openai-compatible"
      : configuredProvider === "ollama"
        ? "ollama"
        : null;

  if (!provider) {
    return null;
  }

  const baseUrl = (
    process.env.AI_BASE_URL ??
    (provider === "ollama" ? process.env.OLLAMA_BASE_URL : undefined) ??
    (provider === "ollama" ? defaultAiBaseUrl : undefined)
  )?.trim();
  const model = (
    process.env.AI_MODEL ??
    (provider === "ollama" ? process.env.OLLAMA_MODEL : undefined) ??
    (provider === "ollama" ? defaultAiModel : undefined)
  )?.trim();

  if (!baseUrl || !model) {
    return null;
  }

  return {
    apiKey: process.env.AI_API_KEY?.trim() || undefined,
    baseUrl: baseUrl.replace(/\/$/, ""),
    model,
    provider,
  };
}

function getOpenAiCompatibleHeaders(config: AiConfig) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`;
  }

  return headers;
}

function unavailableAssistantResponse() {
  return NextResponse.json(
    {
      code: "ai_unavailable",
      error: assistantUnavailableMessage,
    },
    { status: 503 },
  );
}

function getConversationHistory(value: unknown): AiAssistMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
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
        return [];
      }

      const content = item.content.trim().slice(0, maxMessageLength);

      return content ? [{ role: item.role, content }] : [];
    });
}

async function isAiAvailable(config: AiConfig) {
  if (config.provider === "ollama") {
    const response = await fetch(`${config.baseUrl}/api/tags`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      return false;
    }

    const result = (await response.json()) as OllamaTagsResponse;

    return Boolean(
      result.models?.some(
        (model) => model.name === config.model || model.model === config.model,
      ),
    );
  }

  const response = await fetch(`${config.baseUrl}/models`, {
    cache: "no-store",
    headers: getOpenAiCompatibleHeaders(config),
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as OpenAiCompatibleModelsResponse;

  return Boolean(result.data?.some((model) => model.id === config.model));
}

async function requestAssistantMessage(
  config: AiConfig,
  messages: AiAssistMessage[],
) {
  if (config.provider === "ollama") {
    const response = await fetch(`${config.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.model,
        keep_alive: "30m",
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 250,
        },
        messages,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(120_000),
    });

    if (!response.ok) {
      console.error("AI assist Ollama request failed", { status: response.status });
      return null;
    }

    const result = (await response.json()) as OllamaChatResponse;

    return typeof result.message?.content === "string"
      ? result.message.content.trim()
      : null;
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: getOpenAiCompatibleHeaders(config),
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.3,
      max_tokens: 250,
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

  const result = (await response.json()) as OpenAiCompatibleChatResponse;

  return typeof result.choices?.[0]?.message?.content === "string"
    ? result.choices[0].message.content.trim()
    : null;
}

export async function GET() {
  try {
    const config = getAiConfig();

    if (!config || !(await isAiAvailable(config))) {
      return unavailableAssistantResponse();
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    console.error("AI assist availability check failed", error);

    return unavailableAssistantResponse();
  }
}

export async function POST(request: NextRequest) {
  let payload: { history?: unknown; message?: unknown };

  try {
    payload = (await request.json()) as { history?: unknown; message?: unknown };
  } catch {
    return NextResponse.json({ error: "A message is required." }, { status: 400 });
  }

  const message = typeof payload.message === "string" ? payload.message.trim() : "";

  if (!message || message.length > maxMessageLength) {
    return NextResponse.json(
      { error: "Enter a message of up to 1,000 characters." },
      { status: 400 },
    );
  }

  const conversationHistory = getConversationHistory(payload.history);

  let products: Awaited<ReturnType<typeof getProducts>>;

  try {
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
    const config = getAiConfig();

    if (!config) {
      console.error("AI assist has an unsupported or incomplete configuration.");

      return unavailableAssistantResponse();
    }

    const assistantMessage = await requestAssistantMessage(config, [
      {
        role: "system",
        content: `You are Breeze Assist, a concise and helpful shopping assistant for Locale Breeze Store. Answer only from the active product catalog below. Do not invent products, prices, policies, stock levels, discounts, or delivery information. If the catalog does not answer a question, say so plainly. When recommending a product, include its exact name and listed price. Do not take actions, make changes, or request personal data. Keep the answer to four short sentences or a short bullet list.\n\nACTIVE PRODUCT CATALOG\n${getCatalogContext(products)}`,
      },
      ...conversationHistory,
      { role: "user", content: message },
    ]);

    if (!assistantMessage) {
      console.error("AI assist provider returned an empty message.");

      return unavailableAssistantResponse();
    }

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("AI assist request failed", error);

    return unavailableAssistantResponse();
  }
}
