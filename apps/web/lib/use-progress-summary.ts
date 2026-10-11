"use client";

import { allUnlockRules, topicWorlds } from "@gullak/content";
import type { GradeGroup } from "@gullak/types";
import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured } from "./env";
import {
  completedWorldIds,
  emptyEvidence,
  evidenceFromLocal,
  evidenceFromServer,
  mergeEvidence,
  type ProgressEvidence,
  ProgressResponse,
  type ProgressSummary,
  summarizeProgress,
} from "./progress-summary";
import { useLearnerState } from "./use-learner-state";

export interface LearnerProgress extends ProgressSummary {
  /** World slugs whose grade-eligible topics are all passed. */
  completedWorlds: string[];
}

/**
 * One source for every progress number the home app shows. It reads the learner state stored on this
 * device (the same state /learn uses) and, when a Supabase session exists, merges GET /api/progress.
 * Without a backend, or when the request fails, local evidence alone is shown; nothing is invented.
 */
export function useLearnerProgress(gradeGroup: GradeGroup): LearnerProgress {
  const state = useLearnerState();
  const [server, setServer] = useState<ProgressEvidence>(emptyEvidence);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const controller = new AbortController();
    fetch("/api/progress", { credentials: "same-origin", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const parsed = ProgressResponse.safeParse(await response.json());
        if (parsed.success) setServer(evidenceFromServer(parsed.data.data.progress));
      })
      .catch(() => {
        // Offline or signed out: keep the on-device progress.
      });
    return () => controller.abort();
  }, []);

  return useMemo(() => {
    const evidence = mergeEvidence(evidenceFromLocal(state), server);
    const eligible = allUnlockRules.filter((rule) => rule.gradeGroups.includes(gradeGroup)).map((r) => r.topicId);
    return {
      ...summarizeProgress(evidence),
      completedWorlds: completedWorldIds(topicWorlds, evidence.passedTopicIds, eligible),
    };
  }, [state, server, gradeGroup]);
}
