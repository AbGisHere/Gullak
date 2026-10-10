import { describe, expect, it } from "vitest";
import { OnboardingRequest } from "./api";
import { GradeGroup, LearningFormat } from "./common";

describe("grade-group onboarding", () => {
  it.each(GradeGroup.options)("accepts %s and defaults to mixed formats", (gradeGroup) => {
    const result = OnboardingRequest.parse({ gradeGroup, experience: "none", locale: "en" });
    expect(result.preferredFormats).toEqual(LearningFormat.options);
  });
  it("rejects legacy age bands, unknown grades and empty format preferences", () => {
    for (const input of [
      { ageBand: "teen" },
      { gradeGroup: "college" },
      { gradeGroup: "grade-8-10", preferredFormats: [] },
    ]) {
      expect(OnboardingRequest.safeParse({ experience: "none", locale: "en", ...input }).success).toBe(false);
    }
  });
});
