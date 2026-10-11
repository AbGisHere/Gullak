import { allUnlockRules } from "@gullak/content";
import { Activity, type LearnerProfile, type LearningRun } from "@gullak/types";
import { describe, expect, it, vi } from "vitest";
import type { DataAccess, LearnerState } from "../data/transactions";
import { loadLearningDefinition, requireLearningOpen, saveLearningBookmark } from "./learning";

vi.mock("server-only", () => ({}));

const id = "11111111-1111-4111-8111-111111111111";
const at = "2026-10-11T00:00:00Z";
function state(gradeGroup: LearnerProfile["gradeGroup"], topics: string[] = []): LearnerState {
  return {
    profile: { id, gradeGroup, experience: "none", locale: "en", preferredFormats: ["transcript"], createdAt: at },
    portfolio: {
      id,
      learnerId: id,
      isVirtual: true,
      startingCashPaise: 1,
      cashPaise: 1,
      createdAt: at,
      updatedAt: at,
      holdings: [],
    },
    progress: topics.map((topicId) => ({ topicId, bestQuizScore: 1, passed: true, lessonViewedAt: at, updatedAt: at })),
  };
}
describe("learning content and gates", () => {
  it("rejects unknown bookmark IDs before persistence and saves valid IDs", async () => {
    const { hash } = await loadLearningDefinition("activity", "needs-or-wants", "en");
    const run: LearningRun = {
      id,
      learnerId: id,
      kind: "activity",
      contentId: "needs-or-wants",
      locale: "en",
      contentHash: hash,
      status: "in-progress",
      revision: 0,
      bookmark: null,
      createdAt: at,
      updatedAt: at,
    };
    const db: DataAccess = {
      mission: vi.fn(),
      activityState: vi.fn(),
      answerActivity: vi.fn(),
      state: vi.fn(async () => state("grade-8-10", ["money-basics", "needs-vs-wants"])),
      run: vi.fn(async () => run),
      runs: vi.fn(),
      startRun: vi.fn(),
      bookmark: vi.fn(async () => run),
      onboard: vi.fn(),
      lesson: vi.fn(),
      quiz: vi.fn(),
      invest: vi.fn(),
      aggregate: vi.fn(),
    };
    await expect(
      saveLearningBookmark(db, id, id, { expectedRevision: 0, bookmark: { kind: "item", itemId: "unknown" } }),
    ).rejects.toMatchObject({ status: 400, code: "invalid_learning_bookmark" });
    expect(db.bookmark).not.toHaveBeenCalled();
    await saveLearningBookmark(db, id, id, { expectedRevision: 0, bookmark: { kind: "item", itemId: "rice-and-dal" } });
    expect(db.bookmark).toHaveBeenCalledWith(id, id, expect.objectContaining({ expectedRevision: 0 }), hash);
    db.run = vi.fn(async () => ({ ...run, contentHash: "b".repeat(64) }));
    await expect(
      saveLearningBookmark(db, id, id, { expectedRevision: 0, bookmark: { kind: "item", itemId: "rice-and-dal" } }),
    ).rejects.toMatchObject({ status: 409, code: "content_changed" });
  });
  it("validates all existing activities/episode and hashes their exact content", async () => {
    for (const [kind, contentId] of [
      ["activity", "needs-or-wants"],
      ["activity", "the-doubling-scheme"],
      ["episode", "march-2020-hospital-bill"],
    ] as const) {
      const loaded = await loadLearningDefinition(kind, contentId, "en");
      expect(loaded.definition.id).toBe(contentId);
      expect(loaded.hash).toMatch(/^[a-f0-9]{64}$/);
    }
  });
  it("rejects traversal and missing translations", async () => {
    await expect(loadLearningDefinition("activity", "../escape", "en")).rejects.toThrow();
    await expect(loadLearningDefinition("activity", "needs-or-wants", "hi")).rejects.toMatchObject({
      code: "learning_content_unavailable",
    });
  });
  it("requires completed topics before starting an activity", async () => {
    const { definition } = await loadLearningDefinition("activity", "needs-or-wants", "en");
    expect(() => requireLearningOpen(state("grade-8-10"), definition)).toThrow("topic_locked");
    const completed = state("grade-8-10", ["money-basics", "needs-vs-wants"]);
    expect(requireLearningOpen(completed, definition)).toContain("needs-vs-wants");
  });
  it("rejects out-of-grade episodes even if forged fixture scores say completed", async () => {
    const { definition } = await loadLearningDefinition("episode", "march-2020-hospital-bill", "en");
    expect(() =>
      requireLearningOpen(
        state(
          "grade-6-7",
          allUnlockRules.map((r) => r.topicId),
        ),
        definition,
      ),
    ).toThrow("topic_locked");
  });
  it("does not implicitly unlock content absent from the graph", () => {
    const activity = Activity.parse({
      id: "unconfigured",
      kind: "spot-sort",
      locale: "en",
      title: "Draft",
      topicIds: ["money-basics"],
      prompt: "Sort",
      categories: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      items: [{ id: "one", text: "One", correctCategoryId: "a", explanation: "A" }],
    });
    expect(() => requireLearningOpen(state("grade-8-10", ["money-basics"]), activity)).toThrow("learning_gate_missing");
  });
});
