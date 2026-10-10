import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

/**
 * Provider-agnostic model selection. Order of preference comes from
 * AI_PROVIDER_ORDER (default "google,groq"); a provider is used only if its
 * key is set. Returns null when no key is configured, and callers then fall
 * back to answering from topic content (no LLM).
 */
export type ProviderId = "google" | "groq";

export type AiEnv = Partial<
  Record<
    "AI_PROVIDER_ORDER" | "GOOGLE_GENERATIVE_AI_API_KEY" | "GROQ_API_KEY" | "AI_GOOGLE_MODEL" | "AI_GROQ_MODEL",
    string
  >
>;

const DEFAULT_MODELS: Record<ProviderId, string> = {
  google: "gemini-flash-latest",
  groq: "llama-3.3-70b-versatile",
};

export function resolveProviderOrder(env: AiEnv): ProviderId[] {
  const order = (env.AI_PROVIDER_ORDER ?? "google,groq")
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is ProviderId => s === "google" || s === "groq");
  return order.filter((id) => (id === "google" ? env.GOOGLE_GENERATIVE_AI_API_KEY : env.GROQ_API_KEY));
}

export function createModel(id: ProviderId, env: AiEnv): LanguageModel {
  switch (id) {
    case "google":
      return createGoogleGenerativeAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY })(
        env.AI_GOOGLE_MODEL ?? DEFAULT_MODELS.google,
      );
    case "groq":
      return createGroq({ apiKey: env.GROQ_API_KEY })(env.AI_GROQ_MODEL ?? DEFAULT_MODELS.groq);
  }
}

/** Ordered list of models to try; empty means "no LLM, use content fallback". */
export function availableModels(env: AiEnv): Array<{ id: ProviderId; model: LanguageModel }> {
  return resolveProviderOrder(env).map((id) => ({ id, model: createModel(id, env) }));
}
