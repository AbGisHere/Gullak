import { z } from "zod";
import { checkLearnerQuestion, checkModelOutput } from "./guardrails";

export const SARVAM_TRANSLATION_VERSION = "gullak-sarvam-text-v1";
export const SARVAM_TRANSLATION_MODEL = "mayura:v1";
export const TranslationInput = z
  .object({
    text: z
      .string()
      .min(1)
      .max(2000)
      .refine(
        (text) => text.trim().length > 0 && [...text].length <= 1000 && !/[{}<>\uD800-\uDFFF]/u.test(text),
        "plain text only, at most 1000 Unicode characters; no ICU or markup",
      )
      .refine(
        (text) => checkLearnerQuestion(text).allowed && checkModelOutput(text).allowed,
        "educational source only",
      ),
    targetLocale: z.enum(["hi", "te"]),
  })
  .strict();
export type TranslationInput = z.infer<typeof TranslationInput>;
export const TranslationDraft = z
  .object({
    kind: z.literal("translated"),
    status: z.literal("draft"),
    version: z.literal(SARVAM_TRANSLATION_VERSION),
    model: z.literal(SARVAM_TRANSLATION_MODEL),
    sourceText: TranslationInput.shape.text,
    targetLocale: TranslationInput.shape.targetLocale,
    text: z
      .string()
      .min(1)
      .max(10000)
      .refine(
        (text) =>
          text.trim().length > 0 && [...text].length <= 5000 && !/[{}<>]/u.test(text) && checkModelOutput(text).allowed,
        "invalid translation draft",
      ),
  })
  .strict()
  .refine(
    (draft) => (draft.targetLocale === "hi" ? /[\u0900-\u097f]/u : /[\u0c00-\u0c7f]/u).test(draft.text),
    "target script missing",
  );
export type TranslationDraft = z.infer<typeof TranslationDraft>;
export type TranslationFailure =
  | "missing-key"
  | "timeout"
  | "network-error"
  | "unauthorized"
  | "credits-exhausted"
  | "rate-limited"
  | "provider-error"
  | "invalid-response";
export type TranslationResult =
  | TranslationDraft
  | { kind: "fallback"; reason: TranslationFailure; locale: "en"; text: string };

/** Stable authoring-cache identity; changing source, language or translation settings invalidates it. */
export async function translationCacheKey(input: unknown): Promise<string> {
  const request = TranslationInput.parse(input);
  const bytes = new TextEncoder().encode(
    JSON.stringify({
      version: SARVAM_TRANSLATION_VERSION,
      model: SARVAM_TRANSLATION_MODEL,
      mode: "classic-colloquial",
      output_script: "spoken-form-in-native",
      numerals_format: "international",
      sourceLocale: "en",
      ...request,
    }),
  );
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function boundedJson(response: Response, signal: AbortSignal): Promise<unknown> {
  if (!response.body) throw new Error("invalid-response");
  const reader = response.body.getReader();
  const cancel = () => {
    void reader.cancel().catch(() => {});
  };
  signal.addEventListener("abort", cancel, { once: true });
  const parts: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      if (signal.aborted) throw new Error("timeout");
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 65536) {
        cancel();
        throw new Error("invalid-response");
      }
      parts.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const part of parts) {
      bytes.set(part, offset);
      offset += part.byteLength;
    }
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } finally {
    signal.removeEventListener("abort", cancel);
    reader.releaseLock();
  }
}

/** Server/authoring use only. One call, no retries; caller owns reviewed publication and persistent budget. */
export function createSarvamTranslator(options: { apiKey?: string; fetch?: typeof fetch; timeoutMs?: number }) {
  if ("window" in globalThis) throw new Error("Sarvam translation is server-only");
  const apiKey = options.apiKey?.trim() ?? "";
  const timeoutMs = z
    .number()
    .int()
    .min(1000)
    .max(10000)
    .parse(options.timeoutMs ?? 8000);
  const fetcher = options.fetch ?? fetch;
  return async (input: unknown): Promise<TranslationResult> => {
    const request = TranslationInput.parse(input);
    const fallback = (reason: TranslationFailure): TranslationResult => ({
      kind: "fallback",
      reason,
      locale: "en",
      text: request.text,
    });
    if (!apiKey) return fallback("missing-key");
    if (request.text.includes(apiKey)) throw new Error("invalid authored source");
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<TranslationResult>((resolve) => {
      timer = setTimeout(() => {
        controller.abort();
        resolve(fallback("timeout"));
      }, timeoutMs);
    });
    const work = async (): Promise<TranslationResult> => {
      let response: Response;
      try {
        response = await fetcher("https://api.sarvam.ai/translate", {
          method: "POST",
          redirect: "error",
          signal: controller.signal,
          headers: { "content-type": "application/json", "api-subscription-key": apiKey },
          body: JSON.stringify({
            input: request.text,
            source_language_code: "en-IN",
            target_language_code: `${request.targetLocale}-IN`,
            model: SARVAM_TRANSLATION_MODEL,
            mode: "classic-colloquial",
            output_script: "spoken-form-in-native",
            numerals_format: "international",
          }),
        });
      } catch {
        return fallback(controller.signal.aborted ? "timeout" : "network-error");
      }
      if (!response.ok) {
        void response.body?.cancel().catch(() => {});
        return fallback(
          response.status === 401 || response.status === 403
            ? "unauthorized"
            : response.status === 402
              ? "credits-exhausted"
              : response.status === 429
                ? "rate-limited"
                : "provider-error",
        );
      }
      try {
        const data = z
          .object({ translated_text: z.string(), source_language_code: z.literal("en-IN") })
          .parse(await boundedJson(response, controller.signal));
        if (data.translated_text.includes(apiKey)) return fallback("invalid-response");
        return TranslationDraft.parse({
          kind: "translated",
          status: "draft",
          version: SARVAM_TRANSLATION_VERSION,
          model: SARVAM_TRANSLATION_MODEL,
          sourceText: request.text,
          targetLocale: request.targetLocale,
          text: data.translated_text,
        });
      } catch {
        return fallback(controller.signal.aborted ? "timeout" : "invalid-response");
      }
    };
    try {
      return await Promise.race([work(), timeout]);
    } finally {
      if (timer !== undefined) clearTimeout(timer);
    }
  };
}
