import { TopicProgress } from "@gullak/types";
import { z } from "zod";

/**
 * Learner-facing progress numbers (XP, level, streak) derived only from recorded evidence:
 * passed quizzes and completed activities. Nothing here is a mastery model or an unlock rule;
 * quiz pass marks stay the only unlock rule. Replaying the same activity never earns XP twice.
 */
export const XP_PER_TOPIC_PASSED = 50;
export const XP_PER_ACTIVITY = 10;
export const XP_PER_LEVEL = 100;

export interface ActivityEvidence {
  id: string;
  xp?: number;
}

export interface ProgressEvidence {
  /** Topics whose quiz was passed at least once. */
  passedTopicIds: readonly string[];
  /** Completed activities (lessons, sorts, missions). `xp` is the authored reward, else XP_PER_ACTIVITY. */
  activities: readonly ActivityEvidence[];
  /** ISO timestamps of every recorded learning action; used for the day streak. */
  evidenceAt: readonly string[];
}

export interface ProgressSummary {
  xp: number;
  level: number;
  /** XP earned inside the current level, 0 to XP_PER_LEVEL - 1. */
  xpIntoLevel: number;
  /** Consecutive calendar days with learning, ending today or yesterday. */
  streakDays: number;
  /** Distinct calendar days with any recorded learning. */
  activeDays: number;
  topicsPassed: number;
  activitiesCompleted: number;
  hasProgress: boolean;
}

export const emptyEvidence: ProgressEvidence = { passedTopicIds: [], activities: [], evidenceAt: [] };

/** Local calendar day key (YYYY-MM-DD) for a timestamp, or null when it is not a valid date. */
export function localDayKey(value: string | Date): string | null {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Counts distinct days, never actions: five quizzes on one day is a one-day streak.
 * A streak that reached yesterday still counts today, so missing "today so far" never reads as a loss.
 */
export function streakDays(evidenceAt: readonly string[], now: Date = new Date()): number {
  const days = new Set(evidenceAt.map((value) => localDayKey(value)).filter((key): key is string => key !== null));
  if (days.size === 0) return 0;
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(localDayKey(cursor) ?? "")) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (days.has(localDayKey(cursor) ?? "")) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function summarizeProgress(evidence: ProgressEvidence, now: Date = new Date()): ProgressSummary {
  const topicsPassed = new Set(evidence.passedTopicIds).size;
  // Each activity id earns once, at the highest valid reward recorded for it.
  const activityXp = new Map<string, number>();
  for (const activity of evidence.activities) {
    const reward =
      activity.xp !== undefined && Number.isSafeInteger(activity.xp) && activity.xp >= 0
        ? activity.xp
        : XP_PER_ACTIVITY;
    activityXp.set(activity.id, Math.max(activityXp.get(activity.id) ?? 0, reward));
  }
  const activitiesCompleted = activityXp.size;
  let xp = topicsPassed * XP_PER_TOPIC_PASSED;
  for (const reward of activityXp.values()) xp += reward;
  const activeDays = new Set(
    evidence.evidenceAt.map((value) => localDayKey(value)).filter((key): key is string => key !== null),
  ).size;
  return {
    xp,
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    xpIntoLevel: xp % XP_PER_LEVEL,
    streakDays: streakDays(evidence.evidenceAt, now),
    activeDays,
    topicsPassed,
    activitiesCompleted,
    hasProgress: xp > 0 || activeDays > 0,
  };
}

/** Evidence from the learner state the app stores on this device. */
export function evidenceFromLocal(state: {
  passedTopics: readonly string[];
  quizAttempts: readonly { at: string }[];
  activities: readonly { id: string; at: string; xp?: number | undefined }[];
}): ProgressEvidence {
  return {
    passedTopicIds: state.passedTopics,
    activities: state.activities.map(({ id, xp }) => (xp === undefined ? { id } : { id, xp })),
    evidenceAt: [...state.quizAttempts.map((attempt) => attempt.at), ...state.activities.map((a) => a.at)],
  };
}

/** Response body of GET /api/progress (the `data` envelope from the route handler). */
export const ProgressResponse = z.object({ data: z.object({ progress: z.array(TopicProgress) }) });

/** Evidence from the signed-in learner's server progress rows. */
export function evidenceFromServer(progress: readonly TopicProgress[]): ProgressEvidence {
  return {
    passedTopicIds: progress.filter((row) => row.status === "completed").map((row) => row.topicId),
    activities: [],
    evidenceAt: progress.map((row) => row.completedAt ?? row.updatedAt),
  };
}

/** Union of two evidence sets; duplicates are harmless because summaries count distinct ids and days. */
export function mergeEvidence(a: ProgressEvidence, b: ProgressEvidence): ProgressEvidence {
  return {
    passedTopicIds: [...new Set([...a.passedTopicIds, ...b.passedTopicIds])],
    activities: [...a.activities, ...b.activities],
    evidenceAt: [...a.evidenceAt, ...b.evidenceAt],
  };
}

/** A world counts as complete only when every topic it holds for this learner's grade is passed. */
export function completedWorldIds(
  worlds: readonly { id: string; topicIds: readonly string[] }[],
  passedTopicIds: readonly string[],
  eligibleTopicIds: readonly string[],
): string[] {
  const passed = new Set(passedTopicIds);
  const eligible = new Set(eligibleTopicIds);
  return worlds
    .filter((world) => {
      const topics = world.topicIds.filter((id) => eligible.has(id));
      return topics.length > 0 && topics.every((id) => passed.has(id));
    })
    .map((world) => world.id);
}
