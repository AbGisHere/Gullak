import type { TopicProgress } from "@gullak/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export interface ProgressRepository {
  /** Every topic record for one learner (the ladder derives locked/open from these). */
  list(learnerId: string): Promise<TopicProgress[]>;
  /** Record a quiz attempt; keeps the best score and marks completion on a pass. */
  save(progress: TopicProgress): Promise<TopicProgress>;
}

// TODO(R3): implement following learners.ts: progressFromRow / progressToRow
// (camelCase to/from snake_case, validated with TopicProgress), then the Supabase and
// memory repositories, with tests beside them like learners.test.ts.
export function supabaseProgress(_db: SupabaseClient<Database>): ProgressRepository {
  const todo = (): never => {
    throw new Error("TODO(R3): ProgressRepository is not implemented yet");
  };
  return { list: todo, save: todo };
}

export function memoryProgress(): ProgressRepository {
  const todo = (): never => {
    throw new Error("TODO(R3): ProgressRepository is not implemented yet");
  };
  return { list: todo, save: todo };
}
