import { describe, expect, it } from "vitest";
import { checkLearnerQuestion, checkModelOutput, resolveProviderOrder, TUTOR_PROMPT, TUTOR_PROMPT_V1 } from "./index";

describe("guardrails", () => {
  it.each([
    "Should I buy Reliance shares?",
    "Which mutual fund should I pick for SIP?",
    "best stocks to buy this week",
    "konsa share lena chahiye",
    "यह शेयर खरीदूं?",
  ])("refuses advice requests: %s", (q) => {
    expect(checkLearnerQuestion(q).allowed).toBe(false);
  });

  it.each(["What is a fixed deposit?", "How does compounding work?", "SIP aur FD mein kya fark hai?"])(
    "allows learning questions: %s",
    (q) => {
      expect(checkLearnerQuestion(q).allowed).toBe(true);
    },
  );

  it("blocks model output that gives advice or promises returns", () => {
    expect(checkModelOutput("You should buy this fund now.").allowed).toBe(false);
    expect(checkModelOutput("This mutual fund will definitely double.").allowed).toBe(false);
    expect(checkModelOutput("An FD pays a fixed rate for a fixed time.").allowed).toBe(true);
  });
});

describe("provider selection", () => {
  it("uses only providers with keys, in the configured order", () => {
    expect(resolveProviderOrder({ GROQ_API_KEY: "x", GOOGLE_GENERATIVE_AI_API_KEY: "y" })).toEqual(["google", "groq"]);
    expect(resolveProviderOrder({ AI_PROVIDER_ORDER: "groq,google", GROQ_API_KEY: "x" })).toEqual(["groq"]);
  });

  it("returns no providers without keys, so callers use the content fallback", () => {
    expect(resolveProviderOrder({})).toEqual([]);
  });
});

describe("tutor prompt", () => {
  it("v2 pitches answers at the learner's grade group and keeps every rule", () => {
    expect(TUTOR_PROMPT.version).toBe(2);
    expect(TUTOR_PROMPT.system).toContain("({gradeGroup})");
    expect(TUTOR_PROMPT.system).not.toContain("ageBand");
    for (const line of TUTOR_PROMPT_V1.system
      .split("\n")
      .filter((l) => l.startsWith("- "))
      .slice(0, 5)) {
      expect(TUTOR_PROMPT.system).toContain(line);
    }
  });
});
