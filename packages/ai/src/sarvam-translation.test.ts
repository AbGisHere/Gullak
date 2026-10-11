import { describe, expect, it, vi } from "vitest";
import * as ai from "./index";

const input = { text: "All money here is virtual practice money.", targetLocale: "hi" };
const success = () =>
  new Response(
    JSON.stringify({
      request_id: "req-1",
      translated_text: "यहाँ का पैसा अभ्यास के लिए है।",
      source_language_code: "en-IN",
    }),
    { status: 200 },
  );

describe("Sarvam plain-text draft translation", () => {
  it("uses the documented HTTPS endpoint, header, model and locale without exposing the key", async () => {
    const fetcher = vi.fn<typeof fetch>(async (url, init) => {
      expect(url).toBe("https://api.sarvam.ai/translate");
      expect(init?.method).toBe("POST");
      expect(new Headers(init?.headers).get("api-subscription-key")).toBe("private-test-key");
      expect(JSON.parse(String(init?.body))).toEqual({
        input: input.text,
        source_language_code: "en-IN",
        target_language_code: "hi-IN",
        model: "mayura:v1",
        mode: "classic-colloquial",
        output_script: "spoken-form-in-native",
        numerals_format: "international",
      });
      expect(init?.redirect).toBe("error");
      return success();
    });
    const result = await ai.createSarvamTranslator({ apiKey: "private-test-key", fetch: fetcher })(input);
    expect(result).toMatchObject({
      kind: "translated",
      status: "draft",
      targetLocale: "hi",
      text: "यहाँ का पैसा अभ्यास के लिए है।",
      sourceText: input.text,
    });
    expect(JSON.stringify(result)).not.toContain("private-test-key");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("falls back to explicitly English source text without a configured key", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const result = await ai.createSarvamTranslator({ apiKey: "  ", fetch: fetcher })(input);
    expect(result).toEqual({ kind: "fallback", reason: "missing-key", locale: "en", text: input.text });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each([401, 402, 403, 429, 500])("never retries HTTP %s or leaks the provider body", async (status) => {
    const fetcher = vi.fn<typeof fetch>(async () => new Response("private-test-key echoed", { status }));
    const result = await ai.createSarvamTranslator({ apiKey: "private-test-key", fetch: fetcher })(input);
    expect(result.kind).toBe("fallback");
    expect(JSON.stringify(result)).not.toContain("private-test-key");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it.each(["", "   ", "a".repeat(5001), "You should buy this stock."])(
    "rejects unsafe or malformed provider output %#",
    async (translated_text) => {
      const fetcher = vi.fn<typeof fetch>(
        async () => new Response(JSON.stringify({ translated_text, source_language_code: "en-IN" })),
      );
      expect(await ai.createSarvamTranslator({ apiKey: "key", fetch: fetcher })(input)).toMatchObject({
        kind: "fallback",
        reason: "invalid-response",
        locale: "en",
      });
    },
  );
  it.each(["", " ", "a".repeat(1001), "Hello {name}", "<b>Hello</b>", "You should buy this stock."])(
    "rejects invalid authored source before spending %#",
    async (text) => {
      const fetcher = vi.fn<typeof fetch>();
      await expect(ai.createSarvamTranslator({ apiKey: "key", fetch: fetcher })({ ...input, text })).rejects.toThrow();
      expect(fetcher).not.toHaveBeenCalled();
    },
  );
  it("counts Unicode characters, supports Telugu and snapshots input before awaiting", async () => {
    const value = { text: "😀".repeat(1000), targetLocale: "te" };
    const fetcher = vi.fn<typeof fetch>(async (_url, init) => {
      expect(JSON.parse(String(init?.body)).target_language_code).toBe("te-IN");
      return new Response(JSON.stringify({ translated_text: "అభ్యాసం", source_language_code: "en-IN" }));
    });
    const pending = ai.createSarvamTranslator({ apiKey: "key", fetch: fetcher })(value);
    value.targetLocale = "hi";
    expect(await pending).toMatchObject({ kind: "translated", targetLocale: "te" });
  });
  it("times out and aborts a hanging fetch without retrying", async () => {
    vi.useFakeTimers();
    try {
      const fetcher = vi.fn<typeof fetch>(
        async (_url, init) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => reject(new Error("private-test-key")), { once: true });
          }),
      );
      const pending = ai.createSarvamTranslator({ apiKey: "key", fetch: fetcher, timeoutMs: 1000 })(input);
      await vi.advanceTimersByTimeAsync(1000);
      expect(await pending).toMatchObject({ kind: "fallback", reason: "timeout", locale: "en" });
      expect(fetcher).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
  it("keeps cache keys deterministic and separates source bytes and locales", async () => {
    const a = await ai.translationCacheKey(input);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
    expect(await ai.translationCacheKey(input)).toBe(a);
    expect(await ai.translationCacheKey({ ...input, targetLocale: "te" })).not.toBe(a);
    expect(await ai.translationCacheKey({ ...input, text: `${input.text} ` })).not.toBe(a);
  });
  it("rejects browser use before invoking the network", () => {
    vi.stubGlobal("window", {});
    try {
      expect(() => ai.createSarvamTranslator({ apiKey: "private-test-key" })).toThrow(/server-only/);
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it.each([
    { translated_text: "English only", source_language_code: "en-IN" },
    { translated_text: "हिन्दी", source_language_code: "fr-FR" },
    { translated_text: "<script>हिन्दी</script>", source_language_code: "en-IN" },
  ])("rejects wrong-language or markup responses %#", async (body) => {
    const fetcher = vi.fn<typeof fetch>(async () => new Response(JSON.stringify(body)));
    expect(await ai.createSarvamTranslator({ apiKey: "key", fetch: fetcher })(input)).toMatchObject({
      kind: "fallback",
      reason: "invalid-response",
    });
  });
  it("bounds response bytes before parsing JSON", async () => {
    const fetcher = vi.fn<typeof fetch>(async () => new Response("x".repeat(65537)));
    expect(await ai.createSarvamTranslator({ apiKey: "key", fetch: fetcher })(input)).toMatchObject({
      kind: "fallback",
      reason: "invalid-response",
    });
  });
  it("times out the response body as well as connection establishment", async () => {
    vi.useFakeTimers();
    try {
      const fetcher = vi.fn<typeof fetch>(async () => new Response(new ReadableStream<Uint8Array>()));
      const pending = ai.createSarvamTranslator({ apiKey: "key", fetch: fetcher, timeoutMs: 1000 })(input);
      await vi.advanceTimersByTimeAsync(1000);
      expect(await pending).toMatchObject({ kind: "fallback", reason: "timeout" });
    } finally {
      vi.useRealTimers();
    }
  });
});
