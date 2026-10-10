import { Goal, LearnerProfile } from "@gullak/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables, TablesInsert } from "./database.types";

/**
 * Worked example of the data-access pattern (AGENTS.md › Scalability rules):
 * a repository interface, pure row ↔ schema mappers validated by Zod both
 * ways, and one implementation per store. Copy this shape for progress and
 * portfolios. Components never import a DB client; they call a repository.
 */
export interface LearnerRepository {
  get(id: string): Promise<LearnerProfile | null>;
  /** Insert or update the whole profile (onboarding writes it in one go). */
  save(profile: LearnerProfile): Promise<LearnerProfile>;
}

export function learnerFromRow(row: Tables<"learners">): LearnerProfile {
  return LearnerProfile.parse({
    id: row.id,
    displayName: row.display_name ?? undefined,
    gradeGroup: row.grade_group,
    experience: row.experience,
    locale: row.locale,
    preferredFormats: row.preferred_formats,
    goal: row.goal === null ? undefined : Goal.parse(row.goal),
    cohortId: row.cohort_id ?? undefined,
    createdAt: row.created_at,
  });
}

export function learnerToRow(profile: LearnerProfile): TablesInsert<"learners"> {
  const p = LearnerProfile.parse(profile);
  return {
    id: p.id,
    display_name: p.displayName ?? null,
    grade_group: p.gradeGroup,
    experience: p.experience,
    locale: p.locale,
    preferred_formats: p.preferredFormats,
    goal: p.goal ?? null,
    cohort_id: p.cohortId ?? null,
    created_at: p.createdAt,
  };
}

export function supabaseLearners(db: SupabaseClient<Database>): LearnerRepository {
  return {
    async get(id) {
      const { data, error } = await db.from("learners").select("*").eq("id", id).maybeSingle();
      if (error) throw new Error(`learners.get failed: ${error.message}`, { cause: error });
      return data ? learnerFromRow(data) : null;
    },
    async save(profile) {
      const { data, error } = await db.from("learners").upsert(learnerToRow(profile)).select("*").single();
      if (error) throw new Error(`learners.save failed: ${error.message}`, { cause: error });
      return learnerFromRow(data);
    },
  };
}

/** In-memory store for tests and local dev without Supabase. Not for production (server code is stateless). */
export function memoryLearners(rows = new Map<string, Tables<"learners">>()): LearnerRepository {
  return {
    async get(id) {
      const row = rows.get(id);
      return row ? learnerFromRow(row) : null;
    },
    async save(profile) {
      const row = learnerToRow(profile);
      const stored: Tables<"learners"> = {
        age_band: null,
        grade_group: null,
        display_name: null,
        goal: null,
        cohort_id: null,
        created_at: new Date().toISOString(),
        ...row,
      };
      rows.set(stored.id, stored);
      return learnerFromRow(stored);
    },
  };
}
