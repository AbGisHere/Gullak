import { describe, expect, it } from "vitest";
import {
  completedWorldIds,
  emptyEvidence,
  evidenceFromLocal,
  evidenceFromServer,
  localDayKey,
  mergeEvidence,
  ProgressResponse,
  streakDays,
  summarizeProgress,
  XP_PER_ACTIVITY,
  XP_PER_LEVEL,
  XP_PER_TOPIC_PASSED,
} from "./progress-summary";

// Local-time instants keep the tests independent of the machine's time zone.
const at = (day: number, hour = 10) => new Date(2026, 9, day, hour).toISOString();
const now = new Date(2026, 9, 11, 18);

describe("summarizeProgress", () => {
  it("gives a brand-new learner honest zeros", () => {
    expect(summarizeProgress(emptyEvidence, now)).toEqual({
      xp: 0,
      level: 1,
      xpIntoLevel: 0,
      streakDays: 0,
      activeDays: 0,
      topicsPassed: 0,
      activitiesCompleted: 0,
      hasProgress: false,
    });
  });

  it("derives XP and level from distinct passes and activities only", () => {
    const summary = summarizeProgress(
      {
        passedTopicIds: ["money-basics", "needs-vs-wants", "money-basics"],
        activities: [{ id: "lesson:money-basics" }, { id: "lesson:money-basics" }, { id: "coin-shop" }],
        evidenceAt: [at(11)],
      },
      now,
    );
    const xp = 2 * XP_PER_TOPIC_PASSED + 2 * XP_PER_ACTIVITY;
    expect(summary.xp).toBe(xp);
    expect(summary.level).toBe(Math.floor(xp / XP_PER_LEVEL) + 1);
    expect(summary.xpIntoLevel).toBe(xp % XP_PER_LEVEL);
    expect(summary.topicsPassed).toBe(2);
    expect(summary.activitiesCompleted).toBe(2);
    expect(summary.hasProgress).toBe(true);
  });

  it("uses an authored activity reward once and ignores invalid rewards", () => {
    const summary = summarizeProgress(
      {
        passedTopicIds: [],
        activities: [
          { id: "mission", xp: 35 },
          { id: "mission", xp: 35 },
          { id: "broken", xp: -5 },
          { id: "fractional", xp: 1.5 },
        ],
        evidenceAt: [],
      },
      now,
    );
    expect(summary.xp).toBe(35 + 2 * XP_PER_ACTIVITY);
    expect(summary.activitiesCompleted).toBe(3);
  });

  it("counts a failed attempt as activity but not as XP", () => {
    const summary = summarizeProgress({ passedTopicIds: [], activities: [], evidenceAt: [at(11)] }, now);
    expect(summary.xp).toBe(0);
    expect(summary.streakDays).toBe(1);
    expect(summary.hasProgress).toBe(true);
  });
});

describe("streakDays", () => {
  it("counts distinct days, not actions", () => {
    expect(streakDays([at(11, 8), at(11, 9), at(11, 20)], now)).toBe(1);
  });

  it("counts consecutive days ending today", () => {
    expect(streakDays([at(9), at(10), at(11)], now)).toBe(3);
  });

  it("keeps a streak that reached yesterday", () => {
    expect(streakDays([at(9), at(10)], now)).toBe(2);
  });

  it("resets after a missed day and ignores gaps further back", () => {
    expect(streakDays([at(7), at(8)], now)).toBe(0);
    expect(streakDays([at(5), at(6), at(10), at(11)], now)).toBe(2);
  });

  it("ignores invalid timestamps", () => {
    expect(streakDays(["not-a-date", ""], now)).toBe(0);
    expect(localDayKey("nope")).toBeNull();
  });

  it("crosses month boundaries", () => {
    const first = new Date(2026, 10, 1, 12);
    expect(streakDays([new Date(2026, 9, 31, 12).toISOString(), first.toISOString()], first)).toBe(2);
  });
});

describe("evidence sources", () => {
  it("reads quiz attempts and activities from local state", () => {
    const evidence = evidenceFromLocal({
      passedTopics: ["money-basics"],
      quizAttempts: [{ at: at(10) }],
      activities: [{ id: "coin-shop", at: at(11) }],
    });
    expect(evidence).toEqual({
      passedTopicIds: ["money-basics"],
      activities: [{ id: "coin-shop" }],
      evidenceAt: [at(10), at(11)],
    });
  });

  it("reads completed server rows and merges without double counting", () => {
    const learnerId = "d7983cf9-97bd-4af8-817a-1936f32d8626";
    const parsed = ProgressResponse.parse({
      data: {
        progress: [
          { learnerId, topicId: "money-basics", status: "completed", completedAt: at(10), updatedAt: at(10) },
          { learnerId, topicId: "needs-vs-wants", status: "in-progress", updatedAt: at(11) },
        ],
      },
    });
    const server = evidenceFromServer(parsed.data.progress);
    expect(server.passedTopicIds).toEqual(["money-basics"]);
    const merged = mergeEvidence(
      { passedTopicIds: ["money-basics"], activities: [{ id: "coin-shop" }], evidenceAt: [at(11)] },
      server,
    );
    const summary = summarizeProgress(merged, now);
    expect(summary.topicsPassed).toBe(1);
    expect(summary.streakDays).toBe(2);
  });

  it("rejects a malformed server response", () => {
    expect(ProgressResponse.safeParse({ error: { code: "authentication_required" } }).success).toBe(false);
  });
});

describe("completedWorldIds", () => {
  const worlds = [
    { id: "candy-economy", topicIds: ["money-basics", "needs-vs-wants", "opportunity-cost"] },
    { id: "finance-tycoon", topicIds: [] },
  ];

  it("needs every grade-eligible topic passed", () => {
    const eligible = ["money-basics", "needs-vs-wants"];
    expect(completedWorldIds(worlds, ["money-basics"], eligible)).toEqual([]);
    expect(completedWorldIds(worlds, ["money-basics", "needs-vs-wants"], eligible)).toEqual(["candy-economy"]);
  });

  it("never completes a world with no eligible topics", () => {
    expect(completedWorldIds(worlds, [], [])).toEqual([]);
  });
});
