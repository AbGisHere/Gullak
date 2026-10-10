import type { GradeGroup, InstrumentKind, UnlockRule } from "@gullak/types";

export type TopicProgress = ReadonlyMap<string, { bestQuizScore: number }>;

export function isTopicCompleted(rule: UnlockRule, progress: TopicProgress): boolean {
  const best = progress.get(rule.topicId)?.bestQuizScore;
  return best !== undefined && best >= rule.passMark;
}

function completedIds(rules: readonly UnlockRule[], progress: TopicProgress): Set<string> {
  return new Set(rules.filter((r) => isTopicCompleted(r, progress)).map((r) => r.topicId));
}

/** A topic is open when every prerequisite topic is completed. */
export function isTopicOpen(rule: UnlockRule, rules: readonly UnlockRule[], progress: TopicProgress): boolean {
  const done = completedIds(rules, progress);
  return rule.requiresTopicIds.every((id) => done.has(id));
}

/** Topics taught to this grade group, in graph order. */
export function topicsForGrade(rules: readonly UnlockRule[], gradeGroup: GradeGroup): UnlockRule[] {
  return rules.filter((r) => r.gradeGroups.includes(gradeGroup));
}

/** Topics a learner in this grade group can start now: open and not yet completed. */
export function availableTopics(
  rules: readonly UnlockRule[],
  progress: TopicProgress,
  gradeGroup: GradeGroup,
): UnlockRule[] {
  const done = completedIds(rules, progress);
  return topicsForGrade(rules, gradeGroup).filter(
    (r) => !done.has(r.topicId) && r.requiresTopicIds.every((id) => done.has(id)),
  );
}

/** Instruments the learner may use in the paper portfolio. */
export function unlockedInstruments(rules: readonly UnlockRule[], progress: TopicProgress): Set<InstrumentKind> {
  const out = new Set<InstrumentKind>();
  for (const rule of rules) {
    if (isTopicCompleted(rule, progress)) for (const kind of rule.unlocksInstruments) out.add(kind);
  }
  return out;
}

/** Activities and Practice episodes the learner has unlocked by completing topics. */
export function unlockedActivityIds(rules: readonly UnlockRule[], progress: TopicProgress): Set<string> {
  const out = new Set<string>();
  for (const rule of rules) {
    if (isTopicCompleted(rule, progress)) for (const id of rule.unlocksActivityIds) out.add(id);
  }
  return out;
}
