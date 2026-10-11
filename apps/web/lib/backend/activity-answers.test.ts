import { Activity, LearningRun } from "@gullak/types";
import { describe, expect, it, vi } from "vitest";
import type { DataAccess } from "../data/transactions";

vi.mock("server-only", () => ({}));
vi.mock("./learning", () => ({ loadLearningDefinition: vi.fn() }));

import { answerActivity } from "./activity-answers";
import { loadLearningDefinition } from "./learning";

const id = "11111111-1111-4111-8111-111111111111";
const hash = "a".repeat(64);
const run = LearningRun.parse({
  id,
  learnerId: id,
  kind: "activity",
  contentId: "fixture",
  locale: "en",
  contentHash: hash,
  status: "in-progress",
  revision: 0,
  bookmark: null,
  createdAt: "2026-10-11T00:00:00Z",
  updatedAt: "2026-10-11T00:00:00Z",
});
const sort = Activity.parse({
  id: "fixture",
  locale: "en",
  title: "Fixture",
  topicIds: ["money-basics"],
  kind: "spot-sort",
  prompt: "Sort",
  categories: [
    { id: "need", label: "Need" },
    { id: "want", label: "Want" },
  ],
  items: [{ id: "rice", text: "Rice", correctCategoryId: "need", explanation: "Food", conceptId: "saving" }],
});
const story = Activity.parse({
  id: "fixture",
  locale: "en",
  title: "Fixture",
  topicIds: ["money-basics"],
  kind: "story",
  startNodeId: "start",
  nodes: [
    {
      id: "start",
      text: "Start",
      choices: [
        { id: "stop", text: "Stop", nextNodeId: "end", consequence: "Safe", verdict: "safe", cashDeltaPaise: -100 },
      ],
    },
    { id: "end", text: "Ending", choices: [] },
  ],
});
function db() {
  return {
    run: vi.fn(async () => run),
    activityState: vi.fn(async () => ({
      answeredIds: [] as string[],
      currentNodeId: null as string | null,
      cached: null as unknown,
    })),
    answerActivity: vi.fn(async () => ({})),
  };
}
describe("server activity grading", () => {
  it("returns the saved retry without loading changed content or writing again", async () => {
    const data = db();
    const cached = {
      run: { ...run, revision: 1, status: "completed", completedAt: "2026-10-11T00:00:00Z" },
      result: { itemId: "rice", correct: false, correctCategoryId: "need", explanation: "Food" },
      progress: { answered: 1, total: 1 },
      completed: true,
    };
    data.activityState.mockResolvedValue({ answeredIds: ["rice"], currentNodeId: null, cached });
    vi.mocked(loadLearningDefinition).mockClear();
    expect(
      await answerActivity(
        data as unknown as DataAccess,
        id,
        {
          expectedRevision: 0,
          itemId: "rice",
          categoryId: "want",
        },
        id,
      ),
    ).toEqual(cached);
    expect(loadLearningDefinition).not.toHaveBeenCalled();
    expect(data.answerActivity).not.toHaveBeenCalled();
  });
  it("rejects cached evidence owned by another learner", async () => {
    const data = db();
    data.activityState.mockResolvedValue({
      answeredIds: [],
      currentNodeId: null,
      cached: {
        run: { ...run, learnerId: "22222222-2222-4222-8222-222222222222" },
        result: { itemId: "rice", correct: true, correctCategoryId: "need", explanation: "Food" },
        progress: { answered: 1, total: 1 },
        completed: true,
      },
    });
    await expect(
      answerActivity(
        data as unknown as DataAccess,
        id,
        {
          expectedRevision: 0,
          itemId: "rice",
          categoryId: "need",
        },
        id,
      ),
    ).rejects.toMatchObject({ code: "ownership_mismatch" });
    expect(data.answerActivity).not.toHaveBeenCalled();
  });
  it("reveals only the answered item's authoritative feedback", async () => {
    const data = db();
    vi.mocked(loadLearningDefinition).mockResolvedValue({ definition: sort, hash });
    await answerActivity(
      data as unknown as DataAccess,
      id,
      { expectedRevision: 0, itemId: "rice", categoryId: "want" },
      id,
    );
    expect(data.answerActivity).toHaveBeenCalledWith(
      id,
      id,
      expect.anything(),
      hash,
      { itemOrNodeId: "rice", choiceOrCategoryId: "want", correct: false, verdict: null, conceptId: "saving" },
      { kind: "spot-sort", total: 1 },
      { itemId: "rice", correct: false, correctCategoryId: "need", explanation: "Food" },
    );
  });
  it("rejects changed content, stale revisions and repeated items before writes", async () => {
    const data = db();
    const input = { expectedRevision: 0, itemId: "rice", categoryId: "need" };
    vi.mocked(loadLearningDefinition).mockResolvedValue({ definition: sort, hash: "b".repeat(64) });
    await expect(answerActivity(data as unknown as DataAccess, id, input, id)).rejects.toMatchObject({
      code: "content_changed",
    });
    vi.mocked(loadLearningDefinition).mockResolvedValue({ definition: sort, hash });
    await expect(
      answerActivity(data as unknown as DataAccess, id, { ...input, expectedRevision: 2 }, id),
    ).rejects.toMatchObject({ code: "revision_conflict" });
    data.activityState.mockResolvedValue({ answeredIds: ["rice"], currentNodeId: null, cached: null });
    await expect(answerActivity(data as unknown as DataAccess, id, input, id)).rejects.toMatchObject({
      code: "already_answered",
    });
    expect(data.answerActivity).not.toHaveBeenCalled();
  });
  it("preserves authored story consequences and rejects jumping to another node", async () => {
    const data = db();
    vi.mocked(loadLearningDefinition).mockResolvedValue({ definition: story, hash });
    await expect(
      answerActivity(data as unknown as DataAccess, id, { expectedRevision: 0, nodeId: "end", choiceId: "stop" }, id),
    ).rejects.toMatchObject({ status: 422, code: "invalid_choice" });
    await answerActivity(
      data as unknown as DataAccess,
      id,
      { expectedRevision: 0, nodeId: "start", choiceId: "stop" },
      id,
    );
    expect(data.answerActivity).toHaveBeenCalledWith(
      id,
      id,
      expect.anything(),
      hash,
      expect.objectContaining({ correct: null, verdict: "safe" }),
      { kind: "story", currentNodeId: "start", nextNodeId: "end", ending: true },
      {
        nodeId: "start",
        choiceId: "stop",
        verdict: "safe",
        consequence: "Safe",
        cashDeltaPaise: -100,
        nextNodeId: "end",
      },
    );
  });
});
