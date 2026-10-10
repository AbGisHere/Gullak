import type { Holding, Portfolio } from "@gullak/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export interface PortfolioRepository {
  /** The learner's play-money portfolio with its holdings, or null before onboarding. */
  get(learnerId: string): Promise<Portfolio | null>;
  /** Created at onboarding with `starting-capital.json` cash. */
  create(learnerId: string, startingCashPaise: number): Promise<Portfolio>;
  /** Moves play cash into a holding. Fails if cash would go below zero. */
  open(learnerId: string, holding: Holding, costPaise: number): Promise<Portfolio>;
}

// TODO(R3): implement following learners.ts.
// - A portfolio is one `portfolios` row plus its `holdings` rows: read with
//   `.select("*, holdings(*)")` and map to `Portfolio` (isVirtual is always true).
// - A holding row keeps id, type, kind, instrument_id and opened_at as columns and
//   the rest in `details`; validate the merged object with `Holding`.
// - `open` must update cash and insert the holding together: write a Postgres
//   function (next migration) and call it with `db.rpc`, so a failure can't
//   leave cash spent without the holding.
export function supabasePortfolios(_db: SupabaseClient<Database>): PortfolioRepository {
  const todo = (): never => {
    throw new Error("TODO(R3): PortfolioRepository is not implemented yet");
  };
  return { get: todo, create: todo, open: todo };
}

export function memoryPortfolios(): PortfolioRepository {
  const todo = (): never => {
    throw new Error("TODO(R3): PortfolioRepository is not implemented yet");
  };
  return { get: todo, create: todo, open: todo };
}
