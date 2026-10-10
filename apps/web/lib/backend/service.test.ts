import { resolve } from "node:path";
import { startingCapital } from "@gullak/content";
import { loadTopic } from "@gullak/content/server";
import { startingCash } from "@gullak/engine";
import { LearnerProfile, OnboardingRequest, Portfolio, type Topic } from "@gullak/types";
import { describe, expect, it, vi } from "vitest";
import type { DataAccess, LearnerState } from "../data/transactions";
import { createBackendService, publicLesson } from "./service";

const id = "11111111-1111-4111-8111-111111111111";
const at = "2026-10-10T10:00:00Z";
const state: LearnerState = {
  profile: LearnerProfile.parse({
    id,
    gradeGroup: "grade-8-10",
    experience: "none",
    locale: "en",
    preferredFormats: ["transcript"],
    createdAt: at,
  }),
  portfolio: Portfolio.parse({
    id,
    learnerId: id,
    isVirtual: true,
    startingCashPaise: 1000000,
    cashPaise: 1000000,
    holdings: [],
    createdAt: at,
    updatedAt: at,
  }),
  // Prerequisites of the bank-accounts-upi fixture in the topic graph.
  progress: ["money-basics", "saving-habit"].map((topicId) => ({
    topicId,
    bestQuizScore: 1,
    passed: true,
    lessonViewedAt: at,
    updatedAt: at,
  })),
};
function database(): DataAccess {
  return {
    state: vi.fn(async () => state),
    onboard: vi.fn(async (p) => p),
    lesson: vi.fn(async () => undefined),
    quiz: vi.fn(async (topicId, _key, _request, score, passMark) => ({ topicId, score, passed: score >= passMark })),
    invest: vi.fn(async (_key, _input, holding) => holding),
    aggregate: vi.fn(async () => ({ learnerCount: 0, topics: [] })),
  };
}
const topic: Topic = {
  meta: {
    id: "bank-accounts-upi",
    pillar: "save-and-manage",
    instrument: "savings",
    concepts: [{ id: "saving", label: "Saving" }],
    estimatedMinutes: 2,
  },
  content: {
    topicId: "bank-accounts-upi",
    locale: "en",
    title: "Savings",
    summary: "Draft",
    variants: [
      { id: "read", format: "transcript", markdown: "Lesson", conceptIds: [] },
      {
        id: "check",
        format: "quiz",
        conceptIds: [],
        questions: [
          {
            id: "one",
            conceptId: "saving",
            prompt: "Q",
            options: [
              { id: "a", text: "A" },
              { id: "b", text: "B" },
            ],
            correctOptionId: "a",
            explanation: "A is correct",
          },
        ],
      },
    ],
  },
};
describe("backend orchestration", () => {
  it("recognises the actual onboarding default as mixed mode", () => {
    const input = OnboardingRequest.parse({ gradeGroup: "grade-8-10", experience: "none", locale: "en" });
    expect(
      publicLesson(topic, { ...state, profile: { ...state.profile, preferredFormats: input.preferredFormats } }),
    ).toMatchObject({
      formatSelection: { status: "selected", variantId: "read", reason: "mixed-format" },
    });
  });
  it.each(["money-basics", "saving-habit", "bank-accounts-upi", "fixed-deposit"])(
    "selects a real loaded draft and keeps its quiz private: %s",
    async (topicId) => {
      const loaded = await loadTopic(resolve(process.cwd(), "../../packages/content/topics"), topicId, "en");
      const ready = {
        ...state,
        profile: { ...state.profile, preferredFormats: ["audio" as const] },
        progress: [
          ...state.progress,
          { topicId: "bank-accounts-upi", bestQuizScore: 1, passed: true, lessonViewedAt: at, updatedAt: at },
        ],
      };
      const response = publicLesson(loaded, ready);
      expect(response.formatSelection).toEqual({
        status: "selected",
        variantId: "read",
        format: "transcript",
        reason: "fallback-format",
      });
      for (const variant of response.content.variants) {
        if (variant.format === "quiz") {
          for (const question of variant.questions) {
            expect(question).not.toHaveProperty("correctOptionId");
            expect(question).not.toHaveProperty("explanation");
          }
        }
      }
    },
  );
  it("includes a preference-based recommendation without exposing assessment answers", () => {
    expect(publicLesson(topic, state)).toMatchObject({
      formatSelection: { status: "selected", variantId: "read", format: "transcript", reason: "preferred-format" },
    });
  });
  it("never recommends a restricted variant or an assessment as the initial lesson", () => {
    const restricted: Topic = {
      ...topic,
      content: {
        ...topic.content,
        variants: topic.content.variants.map((v) =>
          v.format === "transcript" ? { ...v, audience: ["grade-11-12"] } : v,
        ),
      },
    };
    expect(publicLesson(restricted, state)).toMatchObject({
      formatSelection: { status: "unavailable", reason: "no-eligible-variant" },
    });
  });
  it("uses config starting cash and verified identity", async () => {
    const db = database();
    const service = createBackendService(db, id, () => at);
    await service.onboard({
      gradeGroup: "grade-6-7",
      experience: "none",
      locale: "en",
      preferredFormats: ["transcript"],
    });
    expect(db.onboard).toHaveBeenCalledWith(
      expect.objectContaining({ id, gradeGroup: "grade-6-7" }),
      startingCash(startingCapital, "grade-6-7", "none"),
    );
  });
  it("rejects unsupported locales", async () => {
    const db = database();
    await expect(
      createBackendService(db, id).onboard({
        gradeGroup: "grade-6-7",
        experience: "none",
        locale: "fr",
        preferredFormats: ["transcript"],
      }),
    ).rejects.toMatchObject({ status: 400 });
    expect(db.onboard).not.toHaveBeenCalled();
  });
  it("never exposes quiz answers or explanations before grading", () => {
    const lesson = JSON.stringify(publicLesson(topic, state));
    expect(lesson).not.toContain("correctOptionId");
    expect(lesson).not.toContain("A is correct");
  });
  it("grades on the server and persists the calculated score", async () => {
    const db = database();
    const input = { variantId: "check", answers: [{ questionId: "one", optionId: "b" }] };
    expect(await createBackendService(db, id).quiz(topic, input, id)).toMatchObject({ score: 0, passed: false });
    expect(db.quiz).toHaveBeenCalledWith("bank-accounts-upi", id, input, 0, 0.6, ["saving-habit"]);
  });
  it("blocks FD lessons until savings is completed", async () => {
    const fd = { ...topic, meta: { ...topic.meta, id: "fixed-deposit" } };
    await expect(createBackendService(database(), id).lesson(fd, "read")).rejects.toMatchObject({ status: 403 });
  });
  it("keeps topics closed to grade groups they aren't taught to", () => {
    const junior = { ...state, profile: { ...state.profile, gradeGroup: "grade-6-7" as const } };
    expect(() => publicLesson(topic, junior)).toThrow(expect.objectContaining({ status: 403 }));
  });
  it("does not accept a quiz as proof of lesson viewing", async () => {
    const db = database();
    await expect(createBackendService(db, id).lesson(topic, "check")).rejects.toMatchObject({ status: 400 });
    expect(db.lesson).not.toHaveBeenCalled();
  });
  it("labels goal assumptions and uses the existing inverse function", () => {
    expect(
      createBackendService(database(), id).goal({ targetPaise: 9000000, months: 24, assumedAnnualRatePercent: 0 }),
    ).toMatchObject({ isVirtual: true, monthlyPaise: 375000, assumptions: { isProjection: true } });
  });
});
