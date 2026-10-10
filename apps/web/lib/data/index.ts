import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type LearnerRepository, memoryLearners, supabaseLearners } from "./learners";
import { memoryPortfolios, type PortfolioRepository, supabasePortfolios } from "./portfolios";
import { memoryProgress, type ProgressRepository, supabaseProgress } from "./progress";

/**
 * The one data-access layer. Route handlers and server components call
 * `getDataAccess()`; nothing else imports a database client.
 */
export interface DataAccess {
  learners: LearnerRepository;
  progress: ProgressRepository;
  portfolios: PortfolioRepository;
}

// Local dev without Supabase only: module state is not shared between server
// instances, so production always has Supabase configured.
let memory: DataAccess | undefined;

/** Per-request repositories backed by Supabase, or in-memory ones when Supabase isn't configured. */
export async function getDataAccess(): Promise<DataAccess> {
  const db = await createSupabaseServerClient();
  if (db) return { learners: supabaseLearners(db), progress: supabaseProgress(db), portfolios: supabasePortfolios(db) };
  memory ??= { learners: memoryLearners(), progress: memoryProgress(), portfolios: memoryPortfolios() };
  return memory;
}

export type { LearnerRepository, PortfolioRepository, ProgressRepository };
