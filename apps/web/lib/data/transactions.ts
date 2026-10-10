import "server-only";
import { CohortAggregate, DepositHolding, LearnerProfile, Portfolio, ProgressRecord, QuizResult } from "@gullak/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { ApiError, databaseError } from "../backend/errors";
import type { Database, Json } from "./database.types";

export const LearnerState = z.object({
  profile: LearnerProfile,
  portfolio: Portfolio,
  progress: ProgressRecord.array(),
});
export type LearnerState = z.infer<typeof LearnerState>;
function validatedResult<T>(schema: z.ZodType<T>, data: unknown): T {
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new ApiError(503, "database_response_invalid");
  return parsed.data;
}

/** All app database operations pass through this layer. User client enforces RLS; admin performs validated writes. */
export function createDataAccess(user: SupabaseClient<Database>, admin: SupabaseClient<Database>, learnerId: string) {
  return {
    async state(): Promise<LearnerState> {
      const { data, error } = await user.rpc("learner_state", {});
      if (error) databaseError(error);
      if (!data) throw new ApiError(409, "onboarding_required");
      const legacy = z.object({ profile: z.object({ gradeGroup: z.null().optional() }) }).safeParse(data);
      if (legacy.success) throw new ApiError(409, "grade_group_required");
      const state = validatedResult(LearnerState, data);
      if (state.profile.id !== learnerId || state.portfolio.learnerId !== learnerId)
        throw new ApiError(403, "ownership_mismatch");
      return state;
    },
    async onboard(profile: LearnerProfile, cashPaise: number) {
      const { data, error } = await admin.rpc("onboard_learner", {
        p_learner: learnerId,
        p_profile: profile as Json,
        p_cash: cashPaise,
      });
      if (error) databaseError(error);
      return validatedResult(LearnerProfile, data);
    },
    async lesson(topicId: string) {
      const { error } = await admin.rpc("record_lesson", { p_learner: learnerId, p_topic: topicId });
      if (error) databaseError(error);
    },
    async quiz(topicId: string, key: string, request: Json, score: number, passMark: number, requires: string[]) {
      const { data, error } = await admin.rpc("record_quiz", {
        p_learner: learnerId,
        p_topic: topicId,
        p_key: key,
        p_request: request,
        p_score: score,
        p_pass_mark: passMark,
        p_requires: requires,
      });
      if (error) databaseError(error);
      return validatedResult(QuizResult, data);
    },
    async invest(key: string, request: Json, holding: DepositHolding, requires: string[]) {
      const { data, error } = await admin.rpc("invest_fd", {
        p_learner: learnerId,
        p_key: key,
        p_request: request,
        p_holding: holding as Json,
        p_requires: requires,
      });
      if (error) databaseError(error);
      return validatedResult(DepositHolding, data);
    },
    async aggregate(cohortId: string) {
      const { data, error } = await admin.rpc("facilitator_progress", { p_facilitator: learnerId, p_cohort: cohortId });
      if (error) databaseError(error);
      return validatedResult(CohortAggregate, data);
    },
  };
}
export type DataAccess = ReturnType<typeof createDataAccess>;
