import { replayQuizFixture } from "@gullak/engine";
import { MlFixtureInput, type MlFixtureResult } from "@gullak/types";
import { z } from "zod";

/** Injected fixture adapter only. Not wired to routes, Supabase, auth or persistence. */
export function runMlFixture(input: unknown, expectedLearnerId: unknown): MlFixtureResult {
  const expectedId = z.uuid().parse(expectedLearnerId);
  const fixture = MlFixtureInput.parse(input);
  if (fixture.learnerId.toLowerCase() !== expectedId.toLowerCase()) throw new Error("fixture learner mismatch");
  return replayQuizFixture(fixture);
}
