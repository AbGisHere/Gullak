import { describe, expect, it } from "vitest";
import { type AiEnv, availableModels, resolveProviderOrder } from "./index";

const keys: AiEnv = { GOOGLE_GENERATIVE_AI_API_KEY: "test-google", GROQ_API_KEY: "test-groq" };

describe("provider eligibility", () => {
  it.each(["", " ", "\t\n"])("skips blank credentials (%j) instead of attempting a provider", (blank) => {
    expect(resolveProviderOrder({ GOOGLE_GENERATIVE_AI_API_KEY: blank, GROQ_API_KEY: blank })).toEqual([]);
  });

  it("skips a whitespace-only primary key while retaining the configured fallback", () => {
    expect(resolveProviderOrder({ ...keys, GOOGLE_GENERATIVE_AI_API_KEY: "\t " })).toEqual(["groq"]);
  });

  it("skips a whitespace-only fallback key while retaining the configured primary", () => {
    expect(resolveProviderOrder({ ...keys, GROQ_API_KEY: "\n " })).toEqual(["google"]);
  });

  it("tries a provider once, preserving the first configured position", () => {
    expect(resolveProviderOrder({ ...keys, AI_PROVIDER_ORDER: "groq, google, groq,google" })).toEqual([
      "groq",
      "google",
    ]);
  });

  it("deduplicates the default primary without adding providers that lack credentials", () => {
    expect(
      resolveProviderOrder({ GOOGLE_GENERATIVE_AI_API_KEY: "test-google", AI_PROVIDER_ORDER: "google,groq,google" }),
    ).toEqual(["google"]);
  });

  it.each(["", "unknown", "Google,GROQ", " ,unknown, "])(
    "does not silently enable default providers for an explicit unsupported order (%j)",
    (AI_PROVIDER_ORDER) => {
      expect(resolveProviderOrder({ ...keys, AI_PROVIDER_ORDER })).toEqual([]);
    },
  );

  it("ignores unknown tokens and whitespace without changing supported order", () => {
    expect(resolveProviderOrder({ ...keys, AI_PROVIDER_ORDER: " unknown, groq, ,google " })).toEqual([
      "groq",
      "google",
    ]);
  });

  it("keeps the default Gemini then Groq order", () => {
    expect(resolveProviderOrder(keys)).toEqual(["google", "groq"]);
  });

  it("does not mutate frozen caller configuration or rewrite nonblank credentials", () => {
    const env = Object.freeze({ ...keys, AI_PROVIDER_ORDER: "groq,groq", GROQ_API_KEY: " test-groq " });
    expect(resolveProviderOrder(env)).toEqual(["groq"]);
    expect(env.GROQ_API_KEY).toBe(" test-groq ");
    expect(env.AI_PROVIDER_ORDER).toBe("groq,groq");
  });
});

describe("availableModels eligibility integration (no network calls)", () => {
  it("constructs one candidate per eligible provider in the requested order", () => {
    const models = availableModels({ ...keys, AI_PROVIDER_ORDER: "groq,google,groq" });
    expect(models.map(({ id }) => id)).toEqual(["groq", "google"]);
  });

  it("returns no model candidates for whitespace-only credentials", () => {
    expect(availableModels({ GOOGLE_GENERATIVE_AI_API_KEY: "\t ", GROQ_API_KEY: "\n " })).toEqual([]);
  });
});
